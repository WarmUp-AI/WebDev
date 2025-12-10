from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
import os
from cryptography.fernet import Fernet

db = SQLAlchemy()

# Password encryption for Instagram credentials
def get_cipher():
    """Get Fernet cipher for encrypting Instagram passwords"""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        # Generate a key if none exists (for development)
        key = Fernet.generate_key().decode()
        print(f"WARNING: No ENCRYPTION_KEY set. Generated temporary key: {key}")
        print("Add this to your environment variables!")
    else:
        key = key.encode() if isinstance(key, str) else key
    return Fernet(key)

def encrypt_password(password):
    """Encrypt Instagram password"""
    if not password:
        return None
    cipher = get_cipher()
    return cipher.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password):
    """Decrypt Instagram password"""
    if not encrypted_password:
        return None
    cipher = get_cipher()
    return cipher.decrypt(encrypted_password.encode()).decode()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='client')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    orders = db.relationship('Order', backref='user', lazy=True)
    accounts = db.relationship('Account', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'is_admin': self.role == 'admin',
            'created_at': self.created_at.isoformat()
        }


class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stripe_session_id = db.Column(db.String(255), unique=True)
    stripe_payment_id = db.Column(db.String(255))
    plan = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'plan': self.plan,
            'amount': self.amount / 100,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }


class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    username = db.Column(db.String(100), nullable=False)
    encrypted_password = db.Column(db.Text)  # Encrypted Instagram password
    niche = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')
    current_day = db.Column(db.Integer, default=0)
    progress_percentage = db.Column(db.Integer, default=0)
    reels_viewed = db.Column(db.Integer, default=0)
    accounts_followed = db.Column(db.Integer, default=0)
    comments_left = db.Column(db.Integer, default=0)
    proxy_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'niche': self.niche,
            'status': self.status,
            'current_day': self.current_day,
            'progress_percentage': self.progress_percentage,
            'reels_viewed': self.reels_viewed,
            'accounts_followed': self.accounts_followed,
            'comments_left': self.comments_left,
            'created_at': self.created_at.isoformat(),
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
