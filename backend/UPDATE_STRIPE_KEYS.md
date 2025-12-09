# 🔑 UPDATE YOUR STRIPE KEYS

## Step 1: Get API Keys from Stripe

1. Go to: https://dashboard.stripe.com/apikeys
2. Copy both keys:
   - **Secret key** (starts with `sk_live_...` or `sk_test_...`)
   - **Publishable key** (starts with `pk_live_...` or `pk_test_...`)

## Step 2: Update .env File

Open: `/Users/rory/warmup-ai Beta 1/website/backend/.env`

Replace these lines:
```
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

With your actual keys:
```
STRIPE_SECRET_KEY=sk_live_51abc123...
STRIPE_PUBLISHABLE_KEY=pk_live_51xyz789...
```

## ✅ Your Price IDs are ALREADY configured:
- One-Time: price_1ScCOuGpA3vkbky8dUIWBrcN ✅
- Starter: price_1ScCQlGpA3vkbky8pDhzbdBu ✅
- Growth: price_1ScCRvGpA3vkbky8D4KSKHZi ✅

## 🚀 After updating keys:

You can test locally:
```bash
cd "/Users/rory/warmup-ai Beta 1/website/backend"
pip3 install -r requirements.txt
python3 app.py
```

Then in another terminal:
```bash
cd "/Users/rory/warmup-ai Beta 1/website"
npm run dev
```

Visit: http://localhost:3002
Click a pricing button and test with card: **4242 4242 4242 4242**

---

**Or deploy straight to Railway/Render and test on the live site!**
