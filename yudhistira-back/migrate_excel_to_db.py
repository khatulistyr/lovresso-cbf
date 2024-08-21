import pandas as pd
import sqlite3

def migrate_excel_to_db(excel_file, db_file):
    df = pd.read_excel(excel_file)
    df.columns = df.columns.str.lower()  # Convert columns to lowercase to avoid case sensitivity issues
    conn = sqlite3.connect(db_file)
    # df.to_sql('item', conn, if_exists='replace', index=False)
    df.to_sql('category', conn, if_exists='replace', index=False)
    conn.close()

if __name__ == '__main__':
    # migrate_excel_to_db('menu_new.xlsx', 'lovresso_db.db')
    migrate_excel_to_db('category_new.xlsx', 'lovresso_db.db')
