#!/usr/bin/env python3
"""
Migration script to add encrypted_password column to accounts table
Run this once after deploying the new code
"""

from app import app, db
from sqlalchemy import text

def add_password_column():
    with app.app_context():
        try:
            # Add encrypted_password column
            db.session.execute(text(
                'ALTER TABLE accounts ADD COLUMN encrypted_password TEXT'
            ))
            db.session.commit()
            print("✅ Successfully added encrypted_password column to accounts table")
        except Exception as e:
            if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
                print("ℹ️  Column already exists, skipping migration")
            else:
                print(f"❌ Error: {e}")
                db.session.rollback()

if __name__ == '__main__':
    print("🔄 Running migration...")
    add_password_column()
    print("✅ Migration complete!")
