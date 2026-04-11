# ReplyPro — Full Project Audit

> Analyzed: April 7, 2026  
> Stack: Next.js 14 · Supabase · Groq (LLaMA 3.3 70B) · Stripe · Resend · Zustand · Framer Motion · Tailwind CSS

---

## 1. What Is This Project?

ReplyPro is a **B2B SaaS tool for real estate agents** in the Croatian/Balkan market. The core value proposition: paste a client message, get 3 AI-generated reply variants (Professional / Friendly / Direct) in seconds, in Croatian or English.

It's a full-stack product with:
- AI reply generation via Groq (LLaMA 3.3 70B)
- Mini-CRM (clients + properties)
- Saved favorites / history
- Freemium model: 10 free generations → €29/month Pro
- Bilingual UI (HR/EN) with auto language detection in AI output
- Dark/light mode

Target user: solo real estate agent or small agency in Croatia/Bosnia/Serbia who communicates with clients via WhatsApp/Viber and wants to reply faster and more professionally.

---

## 2. Overall Ratings

| Category | Score | Notes |
|---|---|---|
| Concept / Product | 8.5/10 | Clear niche, real pain point, solid execution |
| Code Quality | 7/10 | Clean patterns, some rough edges |
| Security | 5.5/10 | Several critical issues (see §4) |
| Performance | 6.5/10 | Good architecture, some avoidable re-fetches |
| UI/UX | 8/10 | Polished, consistent, good animations |
| Animations | 8.5/10 | Framer Motion used well, not overdone |
| Database Design | 8/10 | Solid RLS, good schema |
| API Design | 7/10 | Functional, some gaps |
| Scalability | 6/10 | In-memory rate limiter is the main blocker |
| Overall | 7/10 | Solid MVP, production-ready with fixes |

---

## 3. Architecture Overview

```
app/
├── (marketing)/     → Landing page (public)
├── (auth)/          → Login / Signup
├── (dashboard)/     → Protected app shell
│   ├── dashboard/   → AI generator (main feature)
│   ├── clients/     → Mini-CRM
│   ├── properties/  → Property catalog
│   ├── history/     → Generation history
│   ├── favorites/   → Saved replies
│   ├── billing/     → Stripe subscription
│   └── settings/    → Profile management
└── api/
    ├── generate/    → Core AI endpoint
    ├── stripe/      → checkout, webhook, sync
    └── user/        → profile GET

State: Zustand global store (all entities)
Auth: Supabase SSR with middleware route protection
DB: Supabase Postgres with full RLS
AI: Groq API (llama-3.3-70b-versatile)
Payments: Stripe Checkout + webhooks
Email: Resend (welcome, trial alerts, payment)
```

---

## 4. Security Analysis

### CRITICAL — Exposed Real Credentials in .env.local.example

This is the most serious issue in the entire project.

The `.env.local.example` file contains **real, live credentials**:

```
NEXT_PUBLIC_SUPABASE_URL=https://pnrbgvwxcjsgrjrtofuq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  (real JWT)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...      (real JWT — FULL DB ACCESS)
GROQ_API_KEY=gsk_LSL4lZ6...               (real key)
STRIPE_SECRET_KEY=sk_test_51TGk3a...      (real Stripe secret)
STRIPE_PUBLISHABLE_KEY=pk_test_51TGk3a... (real key)
RESEND_API_KEY=re_xdcftrdG...             (real key)
```

**Impact:**
- `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL Row Level Security. Anyone with this key has full read/write/delete access to every user's data.
- `STRIPE_SECRET_KEY` allows creating charges, refunds, reading customer data.
- `GROQ_API_KEY` allows unlimited AI usage billed to your account.
- `RESEND_API_KEY` allows sending emails from your domain.

**If this file is in git history, all keys must be rotated immediately regardless of whether .gitignore covers it now.**

Action: Rotate all keys. Replace `.env.local.example` with placeholder values like `your_key_here`.

---

### HIGH — In-Memory Rate Limiter (Not Production-Safe)

```typescript
// lib/utils/rate-limit.ts
const rateMap = new Map<string, { count: number; resetTime: number }>()
```

This rate limiter lives in Node.js process memory. Problems:
1. **Resets on every cold start / serverless invocation** — in Vercel/serverless environments, each function invocation may be a fresh process. The map is empty every time, making the rate limit completely ineffective.
2. **Not shared across instances** — if you have 2+ server instances, each has its own map. A user can hit 30 req/min × N instances.
3. **Memory leak risk** — the map grows indefinitely if `resetTime` entries are never cleaned up (no eviction logic).

Fix: Use Redis (Upstash) or Supabase-based rate limiting.

---

### HIGH — Webhook Error Silently Swallowed

```typescript
// app/api/stripe/webhook/route.ts
} catch {
  // Log but don't fail — Stripe will retry
}
```

The catch block has no logging at all. If a webhook handler throws (e.g., DB error during subscription update), it silently succeeds (returns 200), Stripe won't retry, and the subscription state will be wrong. This can cause users to pay but not get Pro access.

Fix: At minimum `console.error(err)`. Better: use a proper logger or Sentry.

---

### MEDIUM — No Input Validation on Client/Property Budget Fields

In `clients/page.tsx`, budget fields are parsed with `parseInt()` but there's no max value check:

```typescript
budget_min: form.budget_min ? parseInt(form.budget_min) : null,
budget_max: form.budget_max ? parseInt(form.budget_max) : null,
```

A user could submit `budget_min: 999999999999` which would store fine but could cause display issues. More importantly, the `property_id` and `client_id` passed to `/api/generate` are not validated to belong to the current user — the API fetches them with the user's Supabase client (which has RLS), so this is actually safe, but it's worth noting the implicit reliance on RLS for authorization here.

---

### MEDIUM — Stripe Sync Endpoint Trusts Email for Payment Lookup

```typescript
// app/api/stripe/sync/route.ts
const sessions = await getStripe().checkout.sessions.list({
  customer_email: user.email!,
  ...
})
```

If a user changes their email in Supabase auth after paying, the sync will fail to find their payment. Also, `user.email!` uses a non-null assertion — if email is somehow null (OAuth users without email), this throws.

---

### MEDIUM — Missing CSRF Protection on State-Mutating API Routes

The API routes (`/api/generate`, `/api/stripe/checkout`, `/api/stripe/sync`) rely solely on Supabase session cookies for auth. Next.js doesn't add CSRF tokens by default. While Supabase's cookie-based auth has some CSRF resistance (SameSite cookies), it's not explicitly enforced.

---

### LOW — TypeScript Errors Ignored in Build

```javascript
// next.config.mjs
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
},
```

This means broken TypeScript can ship to production silently. There are several `as unknown as X` casts and `as any` usages in the codebase that would surface as real type errors if this was enabled.

---

### LOW — Sanitization is Minimal

```typescript
export function sanitizeMessage(input: string): string {
  return stripHtml(input).slice(0, 2000).trim()
}
```

`stripHtml` only removes HTML tags via regex — it doesn't handle encoded entities (`&lt;script&gt;`), unicode tricks, or prompt injection attempts. Since the message goes directly into an LLM prompt, a malicious user could craft a message to override the system prompt (prompt injection). The system prompt is well-structured but there's no explicit injection guard.

---

### LOW — No Rate Limiting on Auth Endpoints

The `/api/generate` endpoint has rate limiting, but the Supabase auth endpoints (login, signup) are not rate-limited at the application level. Supabase has its own limits, but brute-force protection depends entirely on Supabase's defaults.

---

## 5. API & Rate Limits

### /api/generate
- Rate limit: 30 requests / 60 seconds per user
- Enforced by: in-memory Map (not reliable in serverless — see §4)
- Trial limit: 10 generations total (enforced in DB via `trial_generations_used`)
- The DB-level trial limit is reliable; the per-minute rate limit is not

### Groq API
- Model: `llama-3.3-70b-versatile`
- `max_tokens: 2000`, `temperature: 0.8`
- No retry logic — if Groq fails, the user gets a 500 error
- No timeout set on the Groq call — could hang indefinitely

### Stripe
- Webhook signature verification: ✅ correct
- Checkout session: uses `customer_email` (not `customer` ID) — can create duplicate Stripe customers if user pays twice
- No idempotency keys on Stripe API calls

### Supabase
- Generations fetched with `.limit(50)` — history is capped at 50 items in the store
- No pagination implemented anywhere
- All data fetched on mount with no caching layer

---

## 6. Code Quality

### What's Good

**Consistent patterns** — every hook follows the same shape: get user → fetch from Supabase → set in Zustand store. Easy to understand and extend.

**Type system** — `types/index.ts` is clean and comprehensive. All entities are well-typed.

**Zod validation** — forms use `react-hook-form` + `zod` schemas. Good.

**Component decomposition** — dashboard is broken into focused components (MessageInput, GenerateButton, ReplyGrid, ReplyCard, etc.). Clean.

**CSS architecture** — CSS variables for theming, Tailwind for utilities, custom utilities in `@layer utilities`. Well organized.

**Database schema** — RLS on every table, proper foreign keys, indexes on user_id columns, `moddatetime` triggers for `updated_at`. Solid.

**Supabase client separation** — browser client, server client, and service role client are properly separated. Service role is only used server-side.

---

### What Needs Work

**`as unknown as X` casts everywhere** — every hook does `data as unknown as Type`. This defeats TypeScript's purpose. The fix is to generate Supabase types with `supabase gen types typescript`.

```typescript
// Every hook looks like this:
if (data) setClients(data as unknown as Client[])
```

**Zustand store is a god object** — all app state (profile, subscription, clients, properties, templates, favorites, generations) lives in one flat store. Fine for now, but will become hard to manage as the app grows.

**`useUser` creates a new Supabase client on every render** — the `createClient()` call inside `useEffect` is fine, but `onAuthStateChange` subscription is set up without the client being memoized. Multiple components calling `useUser()` each create their own auth listener.

**No error boundaries** — if a component throws, the entire dashboard crashes. No `<ErrorBoundary>` anywhere.

**`data as any` in ReplyCard** — `addFavorite(data as any)` is a type escape hatch that could hide bugs.

**Missing loading states in hooks** — hooks like `useClients`, `useProperties` don't expose a `loading` state. Components can't show skeletons while data loads.

**`crypto.randomUUID()` for optimistic generation ID** — the generation added to the store gets a client-generated UUID, but the actual DB record has a different UUID. If you ever need to reference the generation (e.g., for favorites), the IDs won't match.

```typescript
// dashboard/page.tsx — this ID is fake
addGeneration({
  id: crypto.randomUUID(), // ← not the real DB id
  ...
})
```

**Stripe checkout route doesn't pass `req` to `createServerSupabaseClient`** — the server Supabase client in `checkout/route.ts` uses `cookies()` from `next/headers`, which should work in Route Handlers, but the pattern is inconsistent with other routes.

---

## 7. Performance

### Good
- Zustand store acts as a client-side cache — data is fetched once per session
- `motion/react` animations use GPU-composited properties (opacity, transform) — no layout thrashing
- `prefers-reduced-motion` is respected in CSS
- Lazy loading via `Suspense` on the dashboard page
- Passive scroll listener in Navbar

### Issues

**Multiple `useUser()` calls create multiple auth listeners** — `useUser` is called in Sidebar, MobileNav, and multiple page components. Each call sets up its own `onAuthStateChange` subscription. This means N subscriptions for N components using `useUser`. Should be lifted to a context provider.

**No data caching / stale-while-revalidate** — every page mount triggers a fresh Supabase fetch. If you navigate away and back, data is re-fetched. No SWR or React Query.

**Landing page is a client component** — `app/(marketing)/page.tsx` has `'use client'` at the top. The entire landing page (687 lines) is client-rendered. This hurts SEO and initial load time. Static sections (hero text, features, pricing) should be server-rendered.

**Framer Motion bundle** — `motion/react` is imported in many components. The bundle is ~30KB gzipped. Consider lazy-loading animation wrappers for below-the-fold content.

**No image optimization** — no `next/image` usage anywhere. The landing page uses no images currently, but if any are added they won't be optimized.

**Groq call has no timeout** — a slow Groq response blocks the request indefinitely. Should add `AbortController` with a timeout (e.g., 30s).

---

## 8. UI/UX Analysis

### Design System
- Color: Teal/green primary (`hsl(164 72% 32%)`) — appropriate for a professional tool
- Typography: Inter for both heading and body — clean but slightly monotonous
- Radius: 0.75rem base, scales up to 2xl/3xl for cards — modern, consistent
- Dark mode: Well implemented with proper contrast ratios
- Spacing: Consistent 4/6/8 unit grid

### What Works Well
- The floating navbar on the landing page is polished
- Trial banner with progress bar is a great UX pattern
- Reply cards with copy/edit/favorite actions are intuitive
- Mobile nav with center FAB button is a solid pattern
- Shimmer hover effect on cards adds depth without being distracting
- Animated number counters and staggered list animations feel premium
- The ROI calculator on the landing page is a strong conversion tool

### Issues

**Mobile nav has a duplicate dashboard link** — `mainTabs` has two entries pointing to `/dashboard` (one is the center FAB). The center button should probably open the generator directly, not just navigate to `/dashboard` again.

```typescript
const mainTabs = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.history', href: '/history', icon: History },
  { key: 'nav.dashboard', href: '/dashboard', icon: Sparkles, isCenter: true }, // duplicate
  ...
]
```

**No empty state for history search** — when search returns no results, the empty state says the same thing as "no history at all". The copy is different (`t('history.no_results')` vs `t('history.empty')`) but the visual is identical.

**Settings page has no language switcher** — language is stored in the profile but the settings form doesn't include a language field. Users can only change language via the sidebar toggle, which isn't obvious.

**No confirmation dialog for destructive actions** — deleting a client or property happens immediately on button click with no "are you sure?" prompt. Easy to accidentally delete data.

**Onboarding page is just a wrapper** — `app/(dashboard)/onboarding/page.tsx` is literally one line. The `OnboardingForm` component does all the work. Fine, but the onboarding flow doesn't redirect to dashboard after completion — that logic must be inside `OnboardingForm` (not visible in this audit but worth verifying).

**Landing page social proof numbers are hardcoded** — "500+ agenata", "50k+ odgovora", "4.9★" are static strings. If this is a new product, these numbers are misleading.

**Terms of Service and Privacy Policy links are `href="#"`** — placeholder links in the signup form. These need real pages before launch.

---

## 9. Animations

Overall: well-executed. Using Framer Motion's `motion/react` package (v12).

### Good Patterns
- `FadeUp` and `FadeIn` wrapper components with `useInView` — clean reusable pattern
- `AnimatePresence` for mount/unmount transitions (reply cards, mobile menu, toast)
- Spring physics for hover interactions (`type: 'spring', stiffness: 300-400`)
- Staggered list animations with `delay: i * 0.08` — feels natural
- `useScroll` + `useTransform` for hero parallax — subtle and effective
- Magnetic button effect on landing CTAs — nice touch
- `prefers-reduced-motion` respected in CSS (all animations disabled)

### Issues
- **Infinite animations on landing page** — 6 floating dots, 2 animated orbs, a pulsing badge, and a blinking cursor all animate simultaneously. On lower-end devices this could cause jank. These should be paused when not in viewport.
- **`animate={{ opacity: [0.7, 1, 0.7] }}` with `repeat: Infinity`** on the pain section text — a continuously pulsing paragraph is distracting and potentially problematic for users with vestibular disorders (even with reduced-motion CSS, JS animations bypass it unless you check `window.matchMedia`).
- **No `will-change` hints** — for elements that animate frequently, `will-change: transform` would help the browser optimize compositing.

---

## 10. Database & Schema

### Good
- Full RLS on all tables
- `ON DELETE CASCADE` on user references — clean data when user is deleted
- `moddatetime` trigger for `updated_at` — automatic, reliable
- Indexes on `user_id` for all tables — correct
- Composite index `(user_id, status)` on clients — good for filtered queries
- `handle_new_user()` trigger auto-creates profile + subscription on signup — prevents orphaned users
- `UNIQUE` constraint on `stripe_customer_id` and `stripe_subscription_id`

### Issues

**`rp_favorites` references `rp_generations` but `rp_generations` is defined after it in the migration** — the SQL will fail if run in order because `rp_favorites` has `REFERENCES rp_generations(id)` but `rp_generations` table doesn't exist yet at that point in the file. The tables need to be reordered.

**No `updated_at` trigger on `rp_subscriptions`** — wait, there is one (`rp_subs_updated`). But there's no trigger on `rp_properties` or `rp_generations`. Minor.

**`rp_subscriptions` RLS policy for service role** — `CREATE POLICY "Service role full access" ON rp_subscriptions FOR ALL USING (auth.role() = 'service_role')` — this is correct but `auth.role()` in RLS context returns the JWT role. The service role key bypasses RLS entirely anyway, so this policy is redundant but harmless.

**No soft delete** — clients and properties are hard-deleted. If a generation references a deleted client, `client_id` becomes NULL (via `ON DELETE SET NULL`). History loses context. Consider soft delete with `deleted_at` column.

**`trial_generations_limit` is stored per-row** — currently hardcoded to 10 in the DB default. If you want to change the trial limit, you'd need to update all existing rows. Better to have it as a config constant.

---

## 11. What Can Be Reverse Engineered

Since this is a web app, a determined user can discover:

**From the client bundle:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — these are intentionally public, but someone could use them to query your Supabase directly (RLS protects data, but they can see table names and attempt queries)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — public by design
- `NEXT_PUBLIC_APP_URL` — obvious
- All API route paths (`/api/generate`, `/api/stripe/checkout`, etc.)
- The Groq model name (`llama-3.3-70b-versatile`) from network requests
- The system prompt structure — if someone calls `/api/generate` with a crafted message, the AI response reveals the prompt's structure

**From network inspection:**
- Supabase table names (`rp_clients`, `rp_generations`, `rp_subscriptions`, etc.) — visible in XHR requests from the browser Supabase client
- Column names — visible in query responses
- The exact trial limit (10 generations)
- The price ID format

**What's protected:**
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never in client bundle
- `STRIPE_SECRET_KEY` — server-only
- `GROQ_API_KEY` — server-only
- `STRIPE_WEBHOOK_SECRET` — server-only

**Potential abuse vectors:**
- Someone could call `/api/generate` in a loop (30 req/min per user) — but they need a valid account and the trial limit stops free abuse
- The Supabase anon key + table names could be used to attempt unauthorized queries — RLS should block this, but it's worth auditing RLS policies
- Prompt injection via the message field — the sanitizer strips HTML but doesn't guard against LLM instruction injection

---

## 12. Missing Features / Gaps

- No password reset flow
- No email verification enforcement (user can use app without verifying email)
- No account deletion
- Terms of Service / Privacy Policy pages don't exist
- No pagination (history, clients, properties all load everything)
- No search on properties page
- No way to edit a client (only delete)
- No way to edit a property (only delete)
- No way to link a generation to a property after the fact
- Resend email functions are defined but never called (no trigger in the codebase that calls `sendWelcomeEmail`, `sendTrialLowEmail`, etc.)
- No admin panel / analytics
- No Stripe customer portal (users can't manage their subscription, update payment method, or cancel)

---

## 13. Priority Fix List

### Do Immediately
1. **Rotate all credentials** in `.env.local.example` — replace with placeholder values. Check git history.
2. **Fix migration SQL order** — move `rp_generations` table definition before `rp_favorites`.
3. **Add error logging to webhook catch block** — silent failures = lost payments.

### Before Production
4. **Replace in-memory rate limiter** with Redis/Upstash or a DB-based solution.
5. **Add Groq call timeout** — `AbortController` with 30s timeout.
6. **Wire up Resend email triggers** — welcome email, trial low warning, trial expired.
7. **Add Stripe customer portal** — users need a way to cancel/update payment.
8. **Fix duplicate dashboard link in mobile nav**.
9. **Add confirmation dialogs** for client/property deletion.
10. **Generate Supabase TypeScript types** — eliminate all `as unknown as X` casts.

### Nice to Have
11. Convert landing page to server component (remove `'use client'`).
12. Lift `useUser` to a React context to avoid multiple auth listeners.
13. Add `loading` state to data hooks.
14. Add error boundaries to dashboard layout.
15. Add pagination to history/clients/properties.
16. Add soft delete for clients and properties.
17. Fix the fake generation ID in optimistic updates.
18. Add `will-change: transform` to frequently animated elements.
19. Pause infinite animations when not in viewport.
20. Add language field to settings form.
