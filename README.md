# ReplyPro — AI Reply Assistant for Real Estate Agents

Paste a client message. Get 3 perfect replies in 5 seconds. Copy and send.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase (Auth + PostgreSQL)
- Groq API (llama-3.1-8b-instant)
- Stripe (subscriptions)
- Resend (transactional email)
- Zustand (state) + React Hook Form + Zod

## Prerequisites

- Node.js 18+
- Supabase project
- Stripe account
- Groq API key
- Resend account

## Local Setup

```bash
git clone <repo-url>
cd replypro
npm install
cp .env.local.example .env.local
# Fill in all env vars in .env.local
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `GROQ_API_KEY` | Groq API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Stripe price ID for Pro plan |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | From email address |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000 for dev) |

## Database

Migrations are applied via Supabase MCP. Tables: `profiles`, `rp_generations`, `rp_subscriptions`.

## Stripe Webhook Setup

1. Install Stripe CLI: `stripe login`
2. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`
4. Events to register: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Set all environment variables
4. Deploy
5. Register Stripe webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
