from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import secrets

from models import db, User, Order, Account
from auth import generate_token, token_required, admin_required
import stripe_api

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///warmup.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

with app.app_context():
    db.create_all()
    admin = User.query.filter_by(email='admin@warmup.ai').first()
    if not admin:
        admin = User(email='admin@warmup.ai', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created: admin@warmup.ai / admin123")

# AUTH
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400
    user = User(email=email, role='client')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    token = generate_token(user.id, user.email, user.role)
    return jsonify({'token': token, 'user': user.to_dict()}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = generate_token(user.id, user.email, user.role)
    return jsonify({'token': token, 'user': user.to_dict()}), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    user = User.query.get(current_user['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

# CHECKOUT
@app.route('/api/checkout/create', methods=['POST'])
@token_required
def create_checkout(current_user):
    data = request.json
    plan = data.get('plan')
    if plan not in ['one_time', 'starter', 'growth']:
        return jsonify({'error': 'Invalid plan'}), 400
    user = User.query.get(current_user['user_id'])
    try:
        session = stripe_api.create_checkout_session(
            plan=plan,
            user_email=user.email,
            success_url=f"{os.getenv('FRONTEND_URL')}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.getenv('FRONTEND_URL')}/signup?cancelled=true"
        )
        amounts = {'one_time': 7500, 'starter': 29900, 'growth': 49900}
        order = Order(user_id=user.id, stripe_session_id=session.id, plan=plan, amount=amounts[plan], status='pending')
        db.session.add(order)
        db.session.commit()
        print(f"✅ Order created: {order.id}")
        return jsonify({'session_id': session.id, 'url': session.url}), 200
    except Exception as e:
        print(f"❌ Checkout error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/checkout/create-guest', methods=['POST'])
def create_guest_checkout():
    data = request.json
    plan = data.get('plan')
    user_email = data.get('email')
    if not user_email or plan not in ['one_time', 'starter', 'growth']:
        return jsonify({'error': 'Invalid request'}), 400
    try:
        session = stripe_api.create_checkout_session(
            plan=plan,
            user_email=user_email,
            success_url=f"https://warm-up.me/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"https://warm-up.me/?cancelled=true"
        )
        user = User.query.filter_by(email=user_email).first()
        if not user:
            temp_password = secrets.token_urlsafe(16)
            user = User(email=user_email, role='client')
            user.set_password(temp_password)
            db.session.add(user)
            db.session.commit()
        amounts = {'one_time': 7500, 'starter': 29900, 'growth': 49900}
        order = Order(user_id=user.id, stripe_session_id=session.id, plan=plan, amount=amounts[plan], status='pending')
        db.session.add(order)
        db.session.commit()
        return jsonify({'session_id': session.id, 'url': session.url}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/webhook/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    event = stripe_api.verify_webhook_signature(payload, sig_header)
    if not event:
        return jsonify({'error': 'Invalid signature'}), 400
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order = Order.query.filter_by(stripe_session_id=session['id']).first()
        if order:
            order.status = 'paid'
            order.stripe_payment_id = session.get('payment_intent')
            db.session.commit()
            print(f"✅ Payment successful: Order {order.id}")
    return jsonify({'success': True}), 200

# CLIENT ROUTES
@app.route('/api/accounts', methods=['GET'])
@token_required
def get_user_accounts(current_user):
    accounts = Account.query.filter_by(user_id=current_user['user_id']).all()
    return jsonify([acc.to_dict() for acc in accounts]), 200

@app.route('/api/accounts', methods=['POST'])
@token_required
def create_account(current_user):
    # Check if user has a paid order
    paid_order = Order.query.filter_by(user_id=current_user['user_id'], status='paid').first()
    if not paid_order:
        return jsonify({'error': 'You need a paid order to add Instagram accounts'}), 403
    
    data = request.json
    username = data.get('username')
    niche = data.get('niche')
    
    if not username or not niche:
        return jsonify({'error': 'Username and niche required'}), 400
    
    # Clean username (remove @ if present)
    username = username.replace('@', '').strip()
    
    # Check if account already exists
    existing = Account.query.filter_by(user_id=current_user['user_id'], username=username).first()
    if existing:
        return jsonify({'error': 'This Instagram account is already added'}), 400
    
    account = Account(user_id=current_user['user_id'], username=username, niche=niche, status='pending')
    db.session.add(account)
    db.session.commit()
    return jsonify(account.to_dict()), 201

@app.route('/api/orders', methods=['GET'])
@token_required
def get_user_orders(current_user):
    orders = Order.query.filter_by(user_id=current_user['user_id']).all()
    return jsonify([order.to_dict() for order in orders]), 200

# ADMIN ROUTES
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route('/api/admin/orders', methods=['GET'])
@admin_required
def get_all_orders(current_user):
    orders = Order.query.all()
    result = []
    for order in orders:
        order_dict = order.to_dict()
        order_dict['user_email'] = order.user.email
        result.append(order_dict)
    return jsonify(result), 200

@app.route('/api/admin/accounts', methods=['GET'])
@admin_required
def get_all_accounts(current_user):
    accounts = Account.query.all()
    result = []
    for account in accounts:
        account_dict = account.to_dict()
        account_dict['user_email'] = account.user.email
        result.append(account_dict)
    return jsonify(result), 200

@app.route('/api/admin/accounts/<int:account_id>', methods=['PATCH'])
@admin_required
def update_account_status(current_user, account_id):
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    data = request.json
    if 'status' in data:
        account.status = data['status']
    if 'current_day' in data:
        account.current_day = data['current_day']
    if 'progress_percentage' in data:
        account.progress_percentage = data['progress_percentage']
    if 'proxy_id' in data:
        account.proxy_id = data['proxy_id']
    db.session.commit()
    return jsonify(account.to_dict()), 200

@app.route('/api/admin/accounts', methods=['POST'])
@admin_required
def admin_create_account(current_user):
    data = request.json
    account = Account(
        user_id=data['user_id'],
        username=data['username'],
        niche=data.get('niche', 'general'),
        status=data.get('status', 'pending'),
        current_day=data.get('current_day', 0),
        progress_percentage=data.get('progress_percentage', 0)
    )
    db.session.add(account)
    db.session.commit()
    return jsonify(account.to_dict()), 201

@app.route('/api/admin/accounts/<int:account_id>', methods=['DELETE'])
@admin_required
def delete_account(current_user, account_id):
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    db.session.delete(account)
    db.session.commit()
    return jsonify({'message': 'Account deleted'}), 200

@app.route('/api/admin/orders/<int:order_id>', methods=['PATCH'])
@admin_required
def update_order_status(current_user, order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    data = request.json
    if 'status' in data:
        order.status = data['status']
    db.session.commit()
    return jsonify(order.to_dict()), 200

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats(current_user):
    total_users = User.query.filter_by(role='client').count()
    total_orders = Order.query.count()
    paid_orders = Order.query.filter_by(status='paid').count()
    total_revenue = sum([o.amount for o in Order.query.filter_by(status='paid').all()]) / 100
    active_accounts = Account.query.filter_by(status='warming').count()
    completed_accounts = Account.query.filter_by(status='completed').count()
    return jsonify({
        'total_users': total_users,
        'total_orders': total_orders,
        'paid_orders': paid_orders,
        'total_revenue': total_revenue,
        'active_accounts': active_accounts,
        'completed_accounts': completed_accounts
    }), 200

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete admin users'}), 403
    # Delete associated accounts and orders
    Account.query.filter_by(user_id=user_id).delete()
    Order.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200

@app.route('/api/admin/orders/manual', methods=['POST'])
@admin_required
def create_manual_order(current_user):
    data = request.json
    user_id = data.get('user_id')
    plan = data.get('plan')
    payment_method = data.get('payment_method', 'crypto')
    create_new_user = data.get('create_new_user', False)
    
    # Create new user if requested
    if create_new_user:
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required for new user'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'User already exists'}), 400
        
        new_user = User(email=email, role='client')
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()  # Get the user ID without committing
        user_id = new_user.id
    else:
        # Convert user_id to int if it's a string
        if user_id:
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid user ID'}), 400
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    if plan not in ['one_time', 'starter', 'growth']:
        return jsonify({'error': 'Invalid plan'}), 400
    
    amounts = {'one_time': 7500, 'starter': 29900, 'growth': 49900}
    order = Order(
        user_id=user_id,
        stripe_session_id=f'manual_{payment_method}_{secrets.token_hex(8)}',
        plan=plan,
        amount=amounts[plan],
        status='paid'
    )
    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201

@app.route('/api/admin/change-password', methods=['POST'])
@admin_required
def change_admin_password(current_user):
    data = request.json
    new_password = data.get('new_password')
    
    if not new_password or len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    admin = User.query.get(current_user['user_id'])
    admin.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200

@app.route('/api/admin/users/create-admin', methods=['POST'])
@admin_required
def create_admin_user(current_user):
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400
    
    admin = User(email=email, role='admin')
    admin.set_password(password)
    db.session.add(admin)
    db.session.commit()
    return jsonify(admin.to_dict()), 201

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
