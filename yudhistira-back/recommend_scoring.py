import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem import PorterStemmer
import re
import sqlite3
import sys
from tabulate import tabulate

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

def load_data():
    conn = sqlite3.connect('lovresso_db.db')
    df = pd.read_sql_query("SELECT * FROM item", conn)
    df['item_features'] = df['description'] + ' ' + df['tags']
    conn.close()
    return df

def preprocess_text(text):
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with a single space
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    words = text.split()  # Tokenize by splitting on whitespace
    words = [word for word in words if word not in stopwords]  # Remove stopwords
    words = [stemmer.stem(word) for word in words]  # Apply stemming
    return ' '.join(words)

def calculate_tfidf(df):
    df['combined'] = df['description'] + ' ' + df['tags'].fillna('')
    df['combined'] = df['combined'].apply(preprocess_text)
    
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df['combined'])
    feature_names = vectorizer.get_feature_names_out()
    
    return tfidf_matrix, feature_names

def display_results(item_name, df, tfidf_matrix, query_idx, query_words, export_to_excel=False):
    headers = ["Item Name", "Overall Similarity"] + query_words
    table = []

    query_vector = tfidf_matrix[query_idx]
    similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()

    for idx, row in df.iterrows():
        row_data = [row['name'], similarities[idx].round(5)]
        for word in query_words:
            if word in feature_names:
                word_idx = list(feature_names).index(word)
                row_data.append(tfidf_matrix[idx, word_idx].round(5))
            else:
                row_data.append(0.0)
        table.append(row_data)

    table = sorted(table, key=lambda x: -x[1])  # Sort by similarity score

    if export_to_excel:
        df_results = pd.DataFrame(table, columns=headers)
        output_file = f"{item_name}_results.xlsx"
        df_results.to_excel(output_file, index=False)
        print(f"Results exported to {output_file}")

    else:
        print(f"\nTF-IDF Scores and Overall Similarity for '{item_name}':\n")
        print(tabulate(table, headers, tablefmt="grid"))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python recommend.py <item_name> [--export]")
        sys.exit(1)

    item_name = sys.argv[1]
    export_to_excel = '--export' in sys.argv

    df = load_data()

    # Preprocess the query item's text to get the relevant words
    query_item = df[df['name'] == item_name]
    if query_item.empty:
        print(f"No item found with the name '{item_name}'.")
        sys.exit(1)

    query_text = preprocess_text(query_item['description'].values[0] + ' ' + query_item['tags'].fillna('').values[0])
    query_words = list(set(query_text.split()))  # Unique words in the query item

    tfidf_matrix, feature_names = calculate_tfidf(df)

    query_idx = df[df['name'] == item_name].index[0]
    display_results(item_name, df, tfidf_matrix, query_idx, query_words, export_to_excel)
