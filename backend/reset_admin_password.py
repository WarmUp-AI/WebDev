#!/usr/bin/env python3
"""
Reset admin password for Warmup.ai backend
Usage: python reset_admin_password.py
"""

from models import db, User
from flask import Flask
import os
import getpass

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///warmup.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def reset_admin_password():
    with app.app_context():
        admin = User.query.filter_by(email='admin@warmup.ai').first()
        
        if not admin:
            print("❌ Admin user not found. Creating one...")
            admin = User(email='admin@warmup.ai', role='admin')
            db.session.add(admin)
        
        print(f"\n🔐 Resetting password for: {admin.email}")
        print("(Leave blank to use default: admin123)")
        
        new_password = getpass.getpass("Enter new password: ").strip()
        
        if not new_password:
            new_password = 'admin123'
            print("Using default password: admin123")
        
        admin.set_password(new_password)
        db.session.commit()
        
        print(f"\n✅ Password reset successful!")
        print(f"Email: {admin.email}")
        print(f"Password: {new_password}")
        print(f"\nYou can now login at: https://warm-up.me/admin-login")

if __name__ == '__main__':
    reset_admin_password()
