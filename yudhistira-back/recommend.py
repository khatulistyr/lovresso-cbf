import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def load_data(file_path):
    df = pd.read_excel(file_path)
    df['Features'] = df['Description'] + ' ' + df['Tags']
    return df

def recommend_items(item_name, df):
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['Features'])
    
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    idx = df.index[df['Name'] == item_name][0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:4]
    
    recommended = []
    for i, score in sim_scores:
        recommended.append({
            'name': df.iloc[i]['Name'],
            'category': df.iloc[i]['Category'],
            'description': df.iloc[i]['Description'],
            # 'price': df.iloc[i]['Price'],
            'tags': df.iloc[i]['Tags'],
            # 'score': score
        })
    
    return recommended
