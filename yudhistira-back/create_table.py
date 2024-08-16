import sqlite3
import pandas as pd

def create_table():
    conn = sqlite3.connect('lovresso_menu.db')
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category TEXT,
            description TEXT,
            tags TEXT
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    create_table()
    # load_data()
