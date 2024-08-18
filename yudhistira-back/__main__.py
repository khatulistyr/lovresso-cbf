import os
from recommend import load_data as load_data_recommend, recommend_items
from search import load_data as load_data_search, search_items
import pandas as pd
from tabulate import tabulate
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def display_tfidf_table(tfidf_matrix, feature_names):
    """Display TF-IDF values in a compact table format."""
    table_data = []
    for i in range(tfidf_matrix.shape[0]):
        doc_tfidf = tfidf_matrix[i]
        doc_data = {"Word": [], "TF-IDF": []}
        for j in doc_tfidf.nonzero()[1]:
            doc_data["Word"].append(feature_names[j])
            doc_data["TF-IDF"].append(f"{doc_tfidf[0, j]:.4f}")
        table_data.append(doc_data)

    for idx, doc in enumerate(table_data):
        print(f"\nDocument {idx + 1}:")
        print(tabulate({"Word": doc["Word"], "TF-IDF": doc["TF-IDF"]}, headers="keys", tablefmt="pretty"))

def display_cosine_similarity_table(cosine_similarities, df):
    """Display Cosine Similarity values in a compact table format."""
    table_data = {
        "Item Name": df['name'].tolist(),
        "Cosine Similarity": [f"{score:.4f}" for score in cosine_similarities]
    }
    print("\nCosine Similarity Table:")
    print(tabulate(table_data, headers="keys", tablefmt="pretty"))

def main_menu():
    db_path = 'lovresso_menu.db'

    if not os.path.exists(db_path):
        print(f"Database {db_path} does not exist.")
        return

    while True:
        print("\nMenu:")
        print("1. Dapatkan rekomendasi item")
        print("2. Search for relevant menu items")
        print("3. Exit")
        choice = input("Enter your choice (1/2/3): ")

        if choice == '1':
            df = load_data_recommend()  # Load data from SQLite
            item_name = input("Enter the name of the menu item: ")

            recommended_items_list = recommend_items(item_name, df)

            if recommended_items_list:
                print("\nRecommended Items:")
                for item in recommended_items_list:
                    print(f"\nItem: {item['name']}")
                    print(f"Features: {item['description']}")
                    print(f"Similarity Score: {item['score']:.4f}")
            else:
                print("No recommendations found.")

        elif choice == '2':
            df = load_data_search()  # Load data from SQLite
            query = input("Enter your search query: ")

            df['combined'] = df['name'] + ' ' + df['description'] + ' ' + df['tags'].fillna('')
            vectorizer = TfidfVectorizer()
            tfidf_matrix = vectorizer.fit_transform(df['combined'])
            query_vec = vectorizer.transform([query])
            cosine_similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
            df['score'] = cosine_similarities
            df['score_type'] = 'cbf'
            search_results_df = df[df['score'] > 0].sort_values(by='score', ascending=False).head(10)

            if not search_results_df.empty:
                display_tfidf_table(tfidf_matrix, vectorizer.get_feature_names_out())
                display_cosine_similarity_table(cosine_similarities, df)

                print("\nSearch Results:")
                for idx, row in search_results_df.iterrows():
                    print(f"\nItem: {row['name']}")
                    print(f"Features: {row['description']}")
                    print(f"Similarity Score: {row['score']:.4f}")
            else:
                print("No relevant items found.")

        elif choice == '3':
            print("Exiting the program.")
            break

        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main_menu()
