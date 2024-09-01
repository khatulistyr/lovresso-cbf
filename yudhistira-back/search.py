import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sqlite3
import re
from difflib import get_close_matches
from nltk.tokenize import word_tokenize

# Load stopwords and stemmer
def load_stopwords(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read().strip()
        stopwords_set = eval(content)
    return stopwords_set

stopwords_file = 'stopwords_id.txt'
stopwords = load_stopwords(stopwords_file)

from nltk.stem import PorterStemmer
stemmer = PorterStemmer()

def preprocess_text(text):
    print(f"Original text: {text}")
    text = text.lower()
    text = re.sub(r'\W+', ' ', text)
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stopwords]
    tokens = [stemmer.stem(word) for word in tokens]
    processed_text = ' '.join(tokens)
    print(f"Processed text: {processed_text}")
    return processed_text

def load_data():
    conn = sqlite3.connect('lovresso_db.db')
    df = pd.read_sql_query("SELECT * FROM item", conn)
    df['item_features'] = df['item_name'] + ' ' + df['item_description'] + ' ' + df['item_tags']
    conn.close()
    return df

def preprocess_query(query):
    query = query.replace('*', '.*').replace('?', '.')
    return query

def suggest_query(query, item_features):
    item_words = set()
    for features in item_features:
        item_words.update(features.split())
        item_words.add(features.lower())
    
    item_words_b = set()
    item_words_c = set()
    for word in item_words:
        cleaned_word = word.replace(',', '').lower()
        item_words_b.add(cleaned_word)
        for split_word in cleaned_word.split(' '):
            item_words_c.add(split_word)

    print(f"Item words: {item_words_c}")  # Print the full word list
    
    matches = get_close_matches(query, item_words_c, n=1, cutoff=0)
    print(f"Query: {query}, Matches: {matches}")
    return matches[0] if matches else None

def perform_cbf_search(query, df, vectorizer, tfidf_matrix, top_n=10):
    query_vec = vectorizer.transform([query])
    cosine_similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    df['score'] = cosine_similarities
    df['score_type'] = 'CBF / TF-IDF'

    search_results_df = df[df['score'] > 0].sort_values(by='score', ascending=False)
    
    if len(search_results_df) < top_n:
        top_category = search_results_df.iloc[0]['category_id'] if not search_results_df.empty else None
        if top_category:
            same_category_df = df[(df['category_id'] == top_category) & (df['score'] <= 0)].copy()
            same_category_df['score'] = 0
            same_category_df['score_type'] = 'Kategori Similar'
            search_results_df = pd.concat([search_results_df, same_category_df])

    return search_results_df.drop_duplicates(subset=['item_name']).head(top_n)

def search_items(query, df, top_n=10):
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['item_features'])

    # Perform CBF search
    search_results_df = perform_cbf_search(query, df, vectorizer, tfidf_matrix, top_n)
    
    # If not enough results, use suggested query as a fallback
    df['item_features'] = df['item_name'] + ' ' + df['item_description'] + ' ' + df['item_tags'].fillna('')
    df['item_features_nodesc'] = df['item_name'] + ' ' + df['item_tags'].fillna('')
    print(df['item_features_nodesc'])
    suggested_query = suggest_query(query, df['item_features_nodesc'].tolist())

    # Skip fallback if suggested query is the same as the original query
    if len(search_results_df) < top_n and suggested_query and suggested_query != query:
        fallback_results_df = perform_cbf_search(suggested_query, df, vectorizer, tfidf_matrix, top_n)
        search_results_df = pd.concat([search_results_df, fallback_results_df])

    search_results_df = search_results_df.drop_duplicates(subset=['item_name']).head(top_n)
    
    # Add suggested_query to each result if available
    search_results = search_results_df.to_dict(orient='records')
    for result in search_results:
        result['suggested_query'] = suggested_query if 'suggested_query' in locals() else None

    return search_results

# Example usage:
# df = load_data()
# results = search_items("coff", df)
# print(results)
