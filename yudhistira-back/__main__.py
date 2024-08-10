import os
from recommend import load_data as load_data_recommend, recommend_items
from search import load_data as load_data_search, search_items
import pandas as pd

def main_menu():
    file_path = 'menu_data.xlsx'
    df = pd.read_excel('menu_data.xlsx')
    df.to_json('./menu_data.json', orient='records', lines=True)
    
    while True:
        print("\nMenu:")
        print("1. Dapatkan rekomendasi item")
        print("2. Search for relevant menu items")
        print("3. Exit")
        choice = input("Enter your choice (1/2/3): ")
        
        if choice == '1':
            df = load_data_recommend(file_path)
            item_name = input("Enter the name of the menu item: ")
            recommended = recommend_items(item_name, df)
            
            if recommended:
                print("\nRecommended Items:")
                for name, features, score in recommended:
                    print(f"- {name} (Similarity Score: {score:.4f})")
                    print(f"  Features: {features}")
            else:
                print("Item not found.")
        
        elif choice == '2':
            df = load_data_search(file_path)
            query = input("Enter your search query: ")
            search_results = search_items(query, df)
            
            if search_results:
                print("\nSearch Results:")
                for name, features, score in search_results:
                    print(f"- {name} (Similarity Score: {score:.4f})")
                    print(f"  Features: {features}")
            else:
                print("No relevant items found.")
        
        elif choice == '3':
            print("Exiting the program.")
            break
        
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main_menu()
