from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# Load protected numbers from JSON file
def load_protected_numbers():
    try:
        with open('protected.json', 'r') as f:
            data = json.load(f)
            return data.get('protected_numbers', [])
    except FileNotFoundError:
        return ["8053226707"]  # Default protected number

@app.route('/api/bomb', methods=['POST'])
def bomb_number():
    data = request.get_json()
    phone_number = data.get('number')
    
    if not phone_number:
        return jsonify({'error': 'Phone number is required'}), 400
    
    # Check if number is protected
    protected_numbers = load_protected_numbers()
    if phone_number in protected_numbers:
        return jsonify({'error': 'Protected number', 'status': 'blocked'}), 403
    
    try:
        # Make request to the actual bomber API
        response = requests.get(f'https://bomber-api-j4tnx.onrender.com/num={phone_number}')
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'message': 'API call successful',
                'status_code': response.status_code
            })
        else:
            return jsonify({
                'success': False,
                'message': 'API call failed',
                'status_code': response.status_code
            }), 500
            
    except requests.RequestException as e:
        return jsonify({
            'success': False,
            'message': f'Network error: {str(e)}'
        }), 500

@app.route('/api/protected-numbers', methods=['GET'])
def get_protected_numbers():
    protected_numbers = load_protected_numbers()
    return jsonify({'protected_numbers': protected_numbers})

@app.route('/api/protected-numbers', methods=['POST'])
def add_protected_number():
    data = request.get_json()
    number = data.get('number')
    
    if not number:
        return jsonify({'error': 'Number is required'}), 400
    
    protected_numbers = load_protected_numbers()
    
    if number not in protected_numbers:
        protected_numbers.append(number)
        
        # Save back to file
        with open('protected.json', 'w') as f:
            json.dump({'protected_numbers': protected_numbers}, f, indent=4)
    
    return jsonify({'protected_numbers': protected_numbers})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
