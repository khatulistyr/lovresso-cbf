import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sqlite3
import re

def load_data():
    conn = sqlite3.connect('lovresso_db.db')
    df = pd.read_sql_query("SELECT * FROM item", conn)
    df['item_features'] = df['item_description'] + ' ' + df['item_tags']
    conn.close()
    return df

def preprocess_query(query):
    # Convert wildcard to regex
    query = query.replace('*', '.*').replace('?', '.')
    return query

def boolean_search(df, query):
    query = query.replace(" AND ", " & ").replace(" OR ", " | ").replace(" NOT ", " ~")
    df['score'] = df['item_features'].str.contains(query, case=False, regex=True).astype(int)
    df['score_type'] = 'Boolean'
    df['score'] = df['score'].apply(lambda x: 0 if x > 0 else x)  # Set score to 0 for Boolean results
    return df[df['score'] == 0]

def phrasing_search(df, query):
    df['score'] = df['item_features'].str.contains(rf'\b{re.escape(query)}\b', case=False, regex=True).astype(int)
    df['score_type'] = 'Phrasing'
    df['score'] = df['score'].apply(lambda x: 0 if x > 0 else x)  # Set score to 0 for Phrasing results
    return df[df['score'] == 0]

def wildcard_search(df, query):
    regex_query = preprocess_query(query)
    df['score'] = df['item_features'].str.contains(regex_query, case=False, regex=True).astype(int)
    df['score_type'] = 'Wildcard'
    df['score'] = df['score'].apply(lambda x: 0 if x > 0 else x)  # Set score to 0 for Wildcard results
    return df[df['score'] == 0]

def search_items(query, df, top_n=10):
    df['item_features'] = df['item_name'] + ' ' + df['item_description'] + ' ' + df['item_tags'].fillna('')
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['item_features'])

    query_vec = vectorizer.transform([query])
    cosine_similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    df['score'] = cosine_similarities
    df['score_type'] = 'CBF / TF-IDF'

    # Start with CBF search results
    search_results_df = df[df['score'] > 0].sort_values(by='score', ascending=False)
    
    # If not enough results, fallback to similar category matches
    if len(search_results_df) < top_n:
        top_category = search_results_df.iloc[0]['category_id'] if not search_results_df.empty else None
        if top_category:
            same_category_df = df[(df['category_id'] == top_category) & (df['score'] <= 0)].copy()
            same_category_df['score'] = 0
            same_category_df['score_type'] = 'Kategori Similar'
            search_results_df = pd.concat([search_results_df, same_category_df])

    # Fallback to Boolean, Phrasing, or Wildcard searches if necessary
    if len(search_results_df) < top_n:
        boolean_results = boolean_search(df, query)
        search_results_df = pd.concat([search_results_df, boolean_results])
        
    if len(search_results_df) < top_n:
        phrasing_results = phrasing_search(df, query)
        search_results_df = pd.concat([search_results_df, phrasing_results])

    if len(search_results_df) < top_n:
        wildcard_results = wildcard_search(df, query)
        search_results_df = pd.concat([search_results_df, wildcard_results])

    # Drop duplicates and limit to top_n results
    search_results_df = search_results_df.drop_duplicates(subset=['item_name']).head(top_n)
    
    return search_results_df.to_dict(orient='records')
