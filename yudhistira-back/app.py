from flask import Flask, request, jsonify
from flask_cors import CORS
from recommend import load_data as load_data_recommend, recommend_items
from search import load_data as load_data_search, search_items

app = Flask(__name__)
CORS(app=app, resources={r"*": {"origins": "*"}})
# logging.debug('CORS initialised')

file_path = './menu_data_noprice.xlsx'

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    item_name = data.get('item_name')
    df = load_data_recommend(file_path)
    recommended = recommend_items(item_name, df)
    return jsonify(recommended)

@app.route('/api/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query')
    df = load_data_search(file_path)
    search_results = search_items(query, df)
    return jsonify(search_results)

if __name__ == '__main__':
    app.run(debug=True)
