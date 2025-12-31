#!/usr/bin/env python3
"""
Add email column to accounts table
Run this once after updating the code
"""

from app import app, db
from sqlalchemy import text, inspect

with app.app_context():
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('accounts')]
    
    if 'email' not in columns:
        try:
            print("Adding email column to accounts table...")
            db.session.execute(text('ALTER TABLE accounts ADD COLUMN email VARCHAR(120)'))
            db.session.commit()
            print("✅ Email column added successfully!")
        except Exception as e:
            print(f"❌ Error: {e}")
            db.session.rollback()
    else:
        print("✅ Email column already exists")
