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
    text = text.lower()
    text = re.sub(r'\W+', ' ', text)
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stopwords]
    tokens = [stemmer.stem(word) for word in tokens]
    return ' '.join(tokens)

def load_data():
    conn = sqlite3.connect('lovresso_db.db')
    df = pd.read_sql_query("SELECT * FROM item", conn)
    df['item_features'] = df['item_description'] + ' ' + df['item_tags']
    conn.close()
    return df

def preprocess_query(query):
    query = query.replace('*', '.*').replace('?', '.')
    return query

def suggest_query(query, item_names):
    # Break down item names into individual words and include full item names
    item_words = set()
    for name in item_names:
        item_words.update(name.split())
        item_words.add(name.lower())
    
    # Find close matches to the query using individual words and full item names
    matches = get_close_matches(query, item_words, n=1, cutoff=0.0)
    return matches[0] if matches else None

def search_items(query, df, top_n=10):
    df['item_features'] = df['item_name'] + ' ' + df['item_description'] + ' ' + df['item_tags'].fillna('')
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['item_features'])

    # Suggested query based on closest item_name word or full name
    suggested_query = suggest_query(query, df['item_name'].tolist())
    
    # Use suggested query if available, otherwise use original query
    search_query = suggested_query if suggested_query else query

    query_vec = vectorizer.transform([search_query])
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

    search_results_df = search_results_df.drop_duplicates(subset=['item_name']).head(top_n)
    
    # Add suggested_query to each result if available
    search_results = search_results_df.to_dict(orient='records')
    for result in search_results:
        result['suggested_query'] = suggested_query

    return search_results

# Example usage:
# df = load_data()
# results = search_items("coff", df)
# print(results)