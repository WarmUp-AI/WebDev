import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-this')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

def generate_token(user_id, email, role):
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(' ')[1]
            except:
                return jsonify({'error': 'Invalid token format'}), 401
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        data = decode_token(token)
        if not data:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(data, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(' ')[1]
            except:
                return jsonify({'error': 'Invalid token format'}), 401
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        data = decode_token(token)
        if not data or data.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(data, *args, **kwargs)
    return decorated
