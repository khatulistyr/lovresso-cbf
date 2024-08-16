import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sqlite3

def load_data():
    conn = sqlite3.connect('lovresso_menu.db')
    df = pd.read_sql_query("SELECT * FROM menu_items", conn)
    # df['features'] = df['description'] + ' ' + df['tags']
    df['features'] = df['description'] + ' ' + df['tags']
    conn.close()
    return df

def search_items(query, df, top_n=10):
    df['combined'] = df['name'] + ' ' + df['description'] + ' ' + df['tags'].fillna('')
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['combined'])
    
    query_vec = vectorizer.transform([query])
    cosine_similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    df['score'] = cosine_similarities
    df['score_type'] = 'cbf'
    
    # Filter for positive scores
    search_results_df = df[df['score'] > 0].sort_values(by='score', ascending=False)
    
    # Add fallback results if necessary
    if len(search_results_df) < top_n:
        top_category = search_results_df.iloc[0]['category'] if not search_results_df.empty else None
        if top_category:
            same_category_df = df[(df['category'] == top_category) & (df['score'] <= 0)].copy()
            same_category_df['score'] = 0
            same_category_df['score_type'] = 'similar category'
            search_results_df = pd.concat([search_results_df, same_category_df])
    
    # Drop duplicates and limit to top_n results
    search_results_df = search_results_df.drop_duplicates(subset=['name']).head(top_n)
    
    return search_results_df.to_dict(orient='records')

