import sqlite3
from werkzeug.security import generate_password_hash

def create_user_table():
    # Connect to the database (will create it if it doesn't exist)
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()

    # Create the User table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user (
        user_name TEXT NOT NULL UNIQUE,
        user_password TEXT NOT NULL
    )
    ''')

    # Optional: Add an initial admin user
    username = 'admin'  # Replace with desired username
    password = 'adminpassword'  # Replace with desired password

    # Hash the password
    hashed_password = generate_password_hash(password)

    # Insert the user into the table if not already exists
    cursor.execute('''
    INSERT OR IGNORE INTO user (user_name, user_password)
    VALUES (?, ?)
    ''', (username, hashed_password))

    conn.commit()
    conn.close()

    print(f"Admin user '{username}' created successfully.")

if __name__ == '__main__':
    create_user_table()
