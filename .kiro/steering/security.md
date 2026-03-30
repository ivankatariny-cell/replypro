---
inclusion: auto
---

# ReplyPro Security Rules

## API Keys — NEVER expose server-side keys to the client
- `GROQ_API_KEY` — server only (API routes)
- `STRIPE_SECRET_KEY` — server only (API routes)
- `SUPABASE_SERVICE_ROLE_KEY` — server only (API routes)
- `RESEND_API_KEY` — server only (API routes)
- `STRIPE_WEBHOOK_SECRET` — server only (webhook route)
- Only `NEXT_PUBLIC_*` vars are allowed in client components

## Authentication
- Always use `supabase.auth.getUser()` (NOT `getSession()`) in API routes
- Every API route must check auth before processing
- Use service role client only for webhook/admin operations
- Never trust client-side user data — always verify server-side

## Input Validation
- All user input must be sanitized (strip HTML, trim whitespace)
- Message input: max 2000 characters
- Profile fields: full_name max 100, agency_name max 200, city max 100
- Always validate request body with Zod or manual checks

## Stripe Webhooks
- Always verify webhook signature with `STRIPE_WEBHOOK_SECRET`
- Use raw body (`req.text()`) for signature verification — never parsed JSON
- Use service role Supabase client in webhooks (bypasses RLS)
- Handle events idempotently (safe to receive same event twice)

## Rate Limiting
- `/api/generate` — max 30 requests per minute per user
- Return 429 with Retry-After header when exceeded

## Database (Supabase)
- RLS enabled on ALL tables
- Users can only read/write their own data
- Service role bypasses RLS — use only in API routes, never client-side
- Never expose `service_role` key in any `NEXT_PUBLIC_` variable

## Headers (configured in next.config.mjs)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Code Rules
- No `console.log` with sensitive data (messages, keys, emails) in production
- No `any` type in TypeScript
- All async actions must have error handling
- Never store raw API keys in code — always use environment variables
