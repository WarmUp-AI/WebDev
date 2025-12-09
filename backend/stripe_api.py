import stripe
import os

print(f"Stripe module: {stripe}")
print(f"Stripe version: {getattr(stripe, '__version__', 'Unknown')}")
print(f"Stripe.checkout: {getattr(stripe, 'checkout', 'NOT FOUND')}")
print(f"Dir stripe: {dir(stripe)[:10]}...")  # First 10 attributes

stripe_key = os.getenv('STRIPE_SECRET_KEY')
print(f"Stripe key loaded: {stripe_key[:20]}..." if stripe_key else "No Stripe key found!")

stripe.api_key = stripe_key

PRICES = {
    'one_time': os.getenv('PRICE_ONE_TIME'),
    'starter': os.getenv('PRICE_STARTER'),
    'growth': os.getenv('PRICE_GROWTH')
}

def create_checkout_session(plan, user_email, success_url, cancel_url):
    price_id = PRICES.get(plan)
    if not price_id:
        raise ValueError(f"Invalid plan: {plan}")
    
    print(f"Creating checkout session for plan: {plan}")
    print(f"Price ID: {price_id}")
    print(f"User email: {user_email}")
    
    mode = 'payment' if plan == 'one_time' else 'subscription'
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode=mode,
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user_email,
            metadata={'plan': plan}
        )
        print(f"✅ Checkout session created: {session.id}")
        return session
    except Exception as e:
        print(f"❌ Stripe error: {str(e)}")
        raise

def get_session(session_id):
    return stripe.checkout.Session.retrieve(session_id)

def create_portal_session(customer_id, return_url):
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url
    )
    return session

def verify_webhook_signature(payload, sig_header):
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        return event
    except:
        return None
