from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
import sqlite3
import pandas as pd
import os
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash
# from flask_jwt_extended import create_access_token
from recommend import recommend_items
from search import search_items, load_data
from auth import auth_bp, db, login_manager
import secrets
import json

import base64
import requests

app = Flask(__name__)
CORS(app=app, resources={r"*": {"origins": "*"}}, support_credentials=True)
# CORS(app)

app.config['SECRET_KEY'] = secrets.token_hex(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lovresso_db.db'

db.init_app(app)
login_manager.init_app(app)
app.register_blueprint(auth_bp)

# Directory for uploaded files
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# from flask import Flask, request, jsonify
# import sqlite3
# from werkzeug.security import check_password_hash
# import jwt
# import datetime

# @app.route('/auth/login', methods=['POST'])
# @cross_origin()
# def login():
#     data = request.json
#     username = data.get('username')
#     password = data.get('password')

#     # Connect to the database
#     conn = sqlite3.connect('lovresso_db.db')
#     cursor = conn.cursor()

#     # Fetch the user from the database
#     cursor.execute("SELECT user_name, user_password FROM user WHERE user_name = ?", (username,))
#     user = cursor.fetchone()

#     # Close the database connection
#     conn.close()

#     if user and check_password_hash(user[1], password):
#         # Create JWT token
#         payload = {
#             'username': user[0],
#             'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
#         }
#         token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
#         return jsonify({'token': token}), 200
#     else:
#         return jsonify({'error': 'Invalid username or password'}), 401

def create_tables():
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()

    # Create the order table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS `order` (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_price REAL
        )
    ''')

    # Create the order_item table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS `order_item` (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            item_id INTEGER,
            quantity INTEGER,
            item_price REAL,
            FOREIGN KEY(order_id) REFERENCES `order`(order_id),
            FOREIGN KEY(item_id) REFERENCES item(item_id)
        )
    ''')

    conn.commit()
    conn.close()

create_tables()


@app.route('/auth/login', methods=['POST'])
@cross_origin()
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == 'adminpassword':
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/recommend', methods=['POST'])
@cross_origin()
def recommend():
    data = request.json
    item_name = data.get('item_name')
    df = load_data()
    recommended = recommend_items(item_name, df)
    return jsonify(recommended)

@app.route('/api/search', methods=['POST'])
@cross_origin()
def search():
    data = request.get_json()
    query = data.get('query', '')
    df = load_data()
    search_results = search_items(query, df)
    return jsonify(search_results)

@app.route('/api/items', methods=['POST'])
@cross_origin()
def add_item():
    data = request.json
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO item (item_name, category_id, item_price, item_description, item_tags, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        (data['item_name'], data['category_id'], data['item_price'], data['item_description'], data['item_tags'], data.get('image_url', ''))
    )
    conn.commit()
    item_id = cursor.lastrowid
    conn.close()
    return jsonify({'item_id': item_id, **data})

@app.route('/api/categories', methods=['GET'])
@cross_origin()
def get_categories():
    conn = sqlite3.connect('lovresso_db.db')
    df = pd.read_sql_query("SELECT * FROM category", conn)
    conn.close()
    categories = df.to_dict(orient='records')
    return jsonify(categories)

@app.route('/api/categories', methods=['POST'])
@cross_origin()
def add_category():
    data = request.json
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO category (category_name) VALUES (?)", (data['category_name'],))
    conn.commit()
    category_id = cursor.lastrowid
    conn.close()
    return jsonify({'category_id': category_id, **data})

@app.route('/api/categories/<int:category_id>', methods=['PUT'])
@cross_origin()
def update_category(category_id):
    data = request.json
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()
    cursor.execute("UPDATE category SET category_name = ? WHERE category_id = ?", (data['category_name'], category_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Category updated successfully'})

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@cross_origin()
def delete_category(category_id):
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM category WHERE category_id = ?", (category_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Category deleted'})

@app.route('/api/items/<int:item_id>', methods=['PUT'])
@cross_origin()
def update_item(item_id):
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()

    data = request.json
    cursor.execute('''
        UPDATE item
        SET item_name = ?, category_id = ?, item_description = ?, item_tags = ?, item_price = ?, image_url = ?
        WHERE item_id = ?
    ''', (data['item_name'], data['category_id'], data['item_description'], data['item_tags'], data['item_price'], data['image_url'], item_id))

    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Item updated successfully'})

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
@cross_origin()
def delete_item(item_id):
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM item WHERE item_id=?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item deleted'})

@app.route('/api/items', methods=['GET'])
@cross_origin()
def get_items():
    conn = sqlite3.connect('lovresso_db.db')
    df = pd.read_sql_query("SELECT * FROM item", conn)
    conn.close()
    items = df.to_dict(orient='records')
    return jsonify(items)

@app.route('/api/upload', methods=['POST'])
@cross_origin()
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    return jsonify({'file_url': f'/uploads/{filename}'})

@app.route('/uploads/<filename>')
@cross_origin()
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/orders', methods=['POST'])
@cross_origin()
def create_order():
    data = request.json
    order_items = data.get('items', [])
    
    if not order_items:
        return jsonify({'error': 'No items in the order'}), 400
    
    total_price = sum(item['item_price'] * item['quantity'] for item in order_items)
    
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO `order` (total_price) VALUES (?)
    ''', (total_price,))
    order_id = cursor.lastrowid

    for item in order_items:
        cursor.execute('''
            INSERT INTO order_item (order_id, item_id, quantity, item_price)
            VALUES (?, ?, ?, ?)
        ''', (order_id, item['item_id'], item['quantity'], item['item_price']))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Order created successfully', 'order_id': order_id})

@app.route('/api/orders', methods=['GET'])
@cross_origin()
def get_orders():
    conn = sqlite3.connect('lovresso_db.db')
    query = '''
        SELECT o.order_id, o.order_date, o.total_price, 
               oi.item_id, oi.quantity, oi.item_price
        FROM `order` o
        LEFT JOIN order_item oi ON o.order_id = oi.order_id
    '''
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    grouped_orders = {}
    for index, row in df.iterrows():
        order_id = row['order_id']
        if order_id not in grouped_orders:
            grouped_orders[order_id] = {
                'order_id': order_id,
                'order_date': row['order_date'],
                'total_price': row['total_price'],
                'items': []
            }
        if not pd.isna(row['item_id']):  # Check if item_id is not NaN
            grouped_orders[order_id]['items'].append({
                'item_id': row['item_id'],
                'quantity': row['quantity'],
                'item_price': row['item_price']
            })
    
    orders = list(grouped_orders.values())
    
    return jsonify(orders)

MIDTRANS_SERVER_KEY = 'SB-Mid-server-1U-m4rJaXKXuqVzEj_BQSIRI'
MIDTRANS_CLIENT_KEY = 'SB-Mid-client-RKFDd0g5ryehgdvy'
MIDTRANS_BASE_URL = 'https://api.sandbox.midtrans.com/v2/charge'

@app.route('/api/transaction', methods=['POST'])
@cross_origin()
def create_transaction():
    data = request.json
    order_id = data.get('order_id')
    gross_amount = data.get('gross_amount')

    payload = {
        "payment_type": "gopay",
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": gross_amount,
        },
    }

    headers = {
        'Authorization': f'Basic {base64.b64encode(f"{MIDTRANS_SERVER_KEY}:".encode()).decode()}',
        'Content-Type': 'application/json',
    }

    response = requests.post(MIDTRANS_BASE_URL, json=payload, headers=headers)
    return jsonify(response.json())

@app.route('/api/transaction/status/<order_id>', methods=['GET'])
@cross_origin()
def get_transaction_status(order_id):
    status_url = f'https://api.sandbox.midtrans.com/v2/{order_id}/status'

    headers = {
        'Authorization': f'Basic {base64.b64encode(f"{MIDTRANS_SERVER_KEY}:".encode()).decode()}',
        'Content-Type': 'application/json',
    }

    response = requests.get(status_url, headers=headers)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
