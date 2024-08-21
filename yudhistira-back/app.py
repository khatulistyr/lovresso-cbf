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

app = Flask(__name__)
# CORS(app=app, resources={r"*": {"origins": "*"}}, support_credentials=True)
CORS(app)

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
def recommend():
    data = request.json
    item_name = data.get('item_name')
    df = load_data()
    recommended = recommend_items(item_name, df)
    return jsonify(recommended)

@app.route('/api/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query')
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

@app.route('/api/items/<int:item_id>', methods=['PUT'])
@cross_origin()
def update_item(item_id):
    data = request.json
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE item SET item_name=?, category_id=?, item_price=?, item_description=?, item_tags=?, image_url=? WHERE item_id=?",
        (data['item_name'], data['category_id'], data['item_price'], data['item_description'], data['item_tags'], data.get('image_url', ''), item_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'item_id': item_id, **data})

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
# @cross_origin(origin='*')
@cross_origin()
def delete_item(item_id):
    conn = sqlite3.connect('lovresso_db.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM item WHERE item_id=?", (item_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item deleted'})

@app.route('/api/items', methods=['GET'])
# @cross_origin(origin='*')
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


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
