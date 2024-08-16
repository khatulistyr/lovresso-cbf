import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend_items(item_name, df, top_n=4):
    df['combined'] = df['name'] + ' ' + df['description'] + ' ' + df['tags'].fillna('')
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['combined'])

    try:
        item_idx = df[df['name'] == item_name].index[0]
    except IndexError:
        return []

    cosine_similarities = cosine_similarity(tfidf_matrix[item_idx], tfidf_matrix).flatten()
    df['score'] = cosine_similarities
    df['score_type'] = 'cbf'

    # Filter out the item itself
    recommended_df = df[(df['score'] > 0) & (df.index != item_idx)].sort_values(by='score', ascending=False)

    if len(recommended_df) < top_n:
        same_category_df = df[(df['category'] == df.loc[item_idx, 'category']) & (df.index != item_idx)].copy()
        same_category_df['score'] = 0
        same_category_df['score_type'] = 'similar category'
        recommended_df = pd.concat([recommended_df, same_category_df]).drop_duplicates(subset=['name']).head(top_n)

    return recommended_df.head(top_n).to_dict(orient='records')

