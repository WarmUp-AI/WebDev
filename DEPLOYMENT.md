# 🚀 Warmup.ai - Deployment Guide

## Quick Start

### Backend (Railway)
1. Create project on https://railway.app
2. Deploy from GitHub (root directory: `website/backend`)
3. Add environment variables (see backend/.env.example)
4. Add custom domain: `api.warm-up.me`

### Frontend (Vercel)
1. Already auto-deploys from GitHub
2. Update API URLs in src/ files to production

### Stripe
1. Switch to Live mode
2. Create products ($75, $299/mo, $499/mo)
3. Set up webhook to api.warm-up.me/api/webhook/stripe
4. Update Railway with live keys

### DNS
Add CNAME record:
- Name: api
- Value: [Railway CNAME]

## Environment Variables

See `backend/.env.example` for all required variables.

**Important:** 
- Use LIVE Stripe keys in production
- Generate random JWT_SECRET
- Set FRONTEND_URL to https://warm-up.me

## Admin Access

Default credentials (CHANGE IMMEDIATELY):
- Email: admin@warmup.ai
- Password: admin123
- URL: https://warm-up.me/admin/login

## Documentation

- READY_TO_DEPLOY.md - Complete deployment checklist
- COMPLETE_AUTH_ADMIN.md - System architecture
- SIGNUP_SYSTEM_COMPLETE.md - Payment flow details
