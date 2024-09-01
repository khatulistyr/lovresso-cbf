import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
import re
import sqlite3
import sys
from tabulate import tabulate
import nltk

# Download NLTK data (if not already downloaded)
nltk.download('punkt')

# Initialize stemmer
stemmer = PorterStemmer()

# Load stopwords from the stopwords_id.txt file
def load_stopwords(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read().strip()
        stopwords_set = eval(content)
    return stopwords_set

stopwords_file = 'stopwords_id.txt'
stopwords = load_stopwords(stopwords_file)

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

def calculate_tfidf(df):
    df['combined'] = df['item_description'] + ' ' + df['item_tags'].fillna('')
    df['combined'] = df['combined'].apply(preprocess_text)
    
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['combined'])
    feature_names = vectorizer.get_feature_names_out()
    
    return tfidf_matrix, feature_names

def recommend_items(item_name, df, top_n=4):
    df['combined'] = df['item_description'] + ' ' + df['item_tags'].fillna('')
    df['combined'] = df['combined'].apply(preprocess_text)
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['combined'])

    try:
        item_idx = df[df['item_name'] == item_name].index[0]
    except IndexError:
        return []

    cosine_similarities = cosine_similarity(tfidf_matrix[item_idx], tfidf_matrix).flatten()
    df['score'] = cosine_similarities
    df['score_type'] = 'CBF'

    # Filter out the item itself
    recommended_df = df[(df['score'] > 0) & (df.index != item_idx)].sort_values(by='score', ascending=False)

    if len(recommended_df) < top_n:
        same_category_df = df[(df['category_id'] == df.loc[item_idx, 'category_id']) & (df.index != item_idx)].copy()
        same_category_df['score'] = 0
        same_category_df['score_type'] = 'similar category'
        recommended_df = pd.concat([recommended_df, same_category_df]).drop_duplicates(subset=['item_name']).head(top_n)

    return recommended_df.head(top_n).to_dict(orient='records')

def display_results(item_name, df, export_to_excel=False):
    results = recommend_items(item_name, df)
    
    if not results:
        print(f"No item found with the name '{item_name}'.")
        return

    headers = ["Item Name", "Overall Similarity"]
    table = []

    for item in results:
        row = [item['item_name'], item['score']]
        table.append(row)

    if export_to_excel:
        df_results = pd.DataFrame(table, columns=headers)
        output_file = f"{item_name}_results.xlsx"
        df_results.to_excel(output_file, index=False)
        print(f"Results exported to {output_file}")

    else:
        print(f"\nRecommendations for '{item_name}':\n")
        print(tabulate(table, headers, tablefmt="grid"))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python recommend.py <item_name> [--export]")
        sys.exit(1)

    item_name = sys.argv[1]
    export_to_excel = '--export' in sys.argv

    df = load_data()
    display_results(item_name, df, export_to_excel)
