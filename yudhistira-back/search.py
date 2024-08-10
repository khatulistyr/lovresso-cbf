import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_data(file_path):
    df = pd.read_excel(file_path)
    df['Features'] = df['Description'] + ' ' + df['Tags']
    return df

def search_items(query, df):
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['Features'])
    
    query_vector = tfidf.transform([query])
    cosine_sim = cosine_similarity(query_vector, tfidf_matrix).flatten()
    
    top_indices = cosine_sim.argsort()[-5:][::-1]
    
    search_results = []
    for idx in top_indices:
        search_results.append({
            'name': df.iloc[idx]['Name'],
            'category': df.iloc[idx]['Category'],
            'description': df.iloc[idx]['Description'],
            # 'price': df.iloc[idx]['Price'],
            'tags': df.iloc[idx]['Tags'],
            # 'score': cosine_sim[idx]
        })
    
    return search_results
