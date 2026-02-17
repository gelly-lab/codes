from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# データを読み込む関数
def load_products():
    """JSONファイルから商品データを読み込む"""
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'products.json')
    with open(data_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# ヘルスチェック
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

# 商品一覧取得
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = load_products()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 商品詳細取得
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        products = load_products()
        product = next((p for p in products if p['id'] == product_id), None)
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify(product), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 注文API（ダミー）
@app.route('/api/orders', methods=['POST'])
def create_order():
    """疑似注文作成"""
    try:
        data = request.json
        order = {
            'orderId': '001',
            'email': data.get('email'),
            'items': data.get('items'),
            'totalAmount': data.get('totalAmount'),
            'status': 'completed'
        }
        return jsonify(order), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Flask backend starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
