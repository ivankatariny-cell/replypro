# ReplyPro — Project Master Documentation

> Last updated: April 2026 | Stack: Next.js 14 · Supabase · Groq · Stripe · Resend · Upstash

---

## 1. Product Overview

ReplyPro is a **B2B SaaS AI reply generator** built specifically for Croatian real estate agents. The core value proposition: paste a client message, get 3 AI-generated replies (Professional / Friendly / Direct) in under 5 seconds, in Croatian or English.

**Target market:** Real estate agents in Croatia (primary), Bosnia & Herzegovina, Serbia (secondary via language support).

**Business model:** Freemium — 10 free trial generations, then €29/month Pro subscription via Stripe.

**Live domain:** https://replypro.hr

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.35 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS + tailwindcss-animate | ^3.4 |
| Animations | Motion (Framer Motion v12) | ^12.38 |
| Database | Supabase (PostgreSQL) | ^2.45 |
| Auth | Supabase Auth (email/password) | — |
| AI | Groq — llama-3.3-70b-versatile | ^0.8 |
| Payments | Stripe | ^17 |
| Email | Resend | ^4 |
| Rate Limiting | Upstash Redis (sliding window) | ^2 |
| State | Zustand | ^5 |
| Forms | React Hook Form + Zod | ^7 / ^3 |
| Icons | Lucide React | ^0.460 |
| Testing | Vitest + Testing Library | ^3 |
| Deployment | Vercel (implied by Next.js config) | — |

---

## 3. Repository Structure

```
replypro/
├── app/
│   ├── (auth)/              # Auth route group — no sidebar
│   │   ├── login/           # LoginForm component
│   │   ├── signup/          # SignupForm component
│   │   ├── forgot-password/ # ForgotPasswordForm
│   │   ├── reset-password/  # ResetPasswordForm
│   │   └── layout.tsx       # Centered auth layout
│   ├── (dashboard)/         # Protected route group — sidebar + mobile nav
│   │   ├── dashboard/       # Main AI generator page
│   │   ├── clients/         # Client CRM page
│   │   ├── properties/      # Property catalog page
│   │   ├── favorites/       # Saved replies page
│   │   ├── calendar/        # Appointment calendar page
│   │   ├── history/         # Generation history page
│   │   ├── billing/         # Subscription management page
│   │   ├── settings/        # Profile + account settings page
│   │   ├── onboarding/      # First-time setup page
│   │   └── layout.tsx       # Dashboard shell (Sidebar + MobileNav)
│   ├── (marketing)/         # Public marketing pages
│   │   ├── page.tsx         # Landing page (695 lines, full animated)
│   │   ├── privacy/         # Privacy policy (EN)
│   │   ├── privatnost/      # Privacy policy (HR)
│   │   ├── terms/           # Terms of service (EN)
│   │   ├── uvjeti/          # Terms of service (HR)
│   │   └── layout.tsx       # Marketing layout (Navbar)
│   ├── api/
│   │   ├── generate/        # POST — AI reply generation (core endpoint)
│   │   ├── stripe/
│   │   │   ├── checkout/    # POST — create Stripe checkout session
│   │   │   ├── portal/      # POST — create Stripe billing portal session
│   │   │   ├── sync/        # POST — sync Stripe payment status to DB
│   │   │   └── webhook/     # POST — handle Stripe webhook events
│   │   └── user/
│   │       ├── profile/     # GET — fetch user profile
│   │       ├── delete/      # DELETE — delete account + cancel Stripe sub
│   │       └── export/      # GET — GDPR data export (JSON download)
│   ├── layout.tsx           # Root layout (ThemeProvider, ToastProvider, CookieBanner)
│   ├── globals.css          # CSS variables, utility classes, animations
│   ├── opengraph-image.tsx  # OG image generation
│   ├── robots.ts            # robots.txt
│   └── sitemap.ts           # sitemap.xml
├── components/
│   ├── auth/                # LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm
│   ├── billing/             # PricingCard
│   ├── calendar/            # AppointmentCard, AppointmentForm, AvailabilityPanel, DayView, MonthGrid, WeekGrid
│   ├── dashboard/           # BookingPrompt, ClientSelector, GenerateButton, MessageInput,
│   │                        # PropertySelector, ReplyCard, ReplyGrid, StatsCards,
│   │                        # TemplateSelector, TrialBanner, UpcomingAppointments
│   ├── history/             # HistoryItem, HistoryList
│   ├── layout/              # Navbar, Sidebar, MobileNav, ThemeToggle, LanguageSwitcher
│   ├── onboarding/          # OnboardingForm (2-step wizard)
│   └── ui/                  # badge, button, card, confirm-dialog, cookie-banner,
│                            # error-boundary, input, label, skeleton, textarea, toast
├── hooks/
│   ├── useUser.ts           # Supabase auth user state
│   ├── useProfile.ts        # profiles table + Zustand sync
│   ├── useSubscription.ts   # rp_subscriptions table + Zustand sync
│   ├── useGenerations.ts    # rp_generations table + Zustand sync
│   ├── useClients.ts        # rp_clients table + Zustand sync
│   ├── useProperties.ts     # rp_properties table + Zustand sync
│   ├── useTemplates.ts      # rp_templates table + Zustand sync
│   ├── useFavorites.ts      # rp_favorites table + Zustand sync
│   ├── useAppointments.ts   # rp_appointments table + Zustand sync (with refetch)
│   ├── useAvailability.ts   # rp_availability_rules + rp_availability_exceptions
│   ├── useTranslation.ts    # i18n via Zustand language state + JSON locales
│   └── useKeyboardShortcuts.ts # Global keyboard shortcut handler
├── lib/
│   ├── groq/client.ts       # Groq SDK wrapper — generateReplies()
│   ├── prompts/real-estate.ts # buildSystemPrompt() + buildAvailabilityContext()
│   ├── stripe/client.ts     # Stripe SDK singleton
│   ├── resend/
│   │   ├── client.ts        # Resend SDK singleton
│   │   └── emails.ts        # Welcome, trial-low, trial-expired, payment emails
│   ├── calendar/
│   │   ├── availability.ts  # fetchAvailabilityContext() — checks agent schedule
│   │   └── extract-booking.ts # extractBooking() — parses date/time from messages
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   ├── server.ts        # Server Supabase client + service role client
│   │   └── middleware.ts    # Session refresh middleware
│   └── utils/
│       ├── cn.ts            # clsx + tailwind-merge
│       ├── datetime-detect.ts # containsDateOrTime() — 30+ regex patterns
│       ├── language-detect.ts # detectLanguage() — Croatian word frequency
│       ├── rate-limit.ts    # Upstash sliding window (10 req/60s per user)
│       └── sanitize.ts      # stripHtml(), sanitizeMessage(), sanitizeProfileField()
├── store/
│   └── app-store.ts         # Zustand store — all client-side state
├── locales/
│   ├── en.json              # English translations (~200 keys)
│   └── hr.json              # Croatian translations (~200 keys)
├── types/
│   ├── index.ts             # Re-exports + API request/response types
│   └── supabase.ts          # Auto-generated DB types (Database schema)
├── middleware.ts             # Next.js middleware — session refresh on protected routes
├── next.config.mjs          # Security headers (CSP, HSTS, X-Frame-Options, etc.)
├── tailwind.config.ts        # Design tokens, animations, custom utilities
└── .env.local.example        # All required environment variables documented

---

## 4. Database Schema (Supabase PostgreSQL)

All tables use Row Level Security (RLS). All user data is scoped to `auth.uid()`.

### 4.1 `profiles`
Stores agent profile data. Created automatically on signup via `handle_new_user` trigger.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, FK → auth.users.id |
| full_name | text | nullable |
| agency_name | text | nullable |
| city | text | nullable |
| preferred_tone | text | 'formal' / 'mixed' / 'casual', default 'mixed' |
| language | text | 'hr' / 'en', default 'hr' |
| onboarding_completed | boolean | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto-updated via trigger |

**Trigger:** `rp_profiles_updated` → `rp_update_updated_at()` on UPDATE

### 4.2 `rp_subscriptions`
One row per user. Created automatically on signup via `handle_new_user` trigger.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | UNIQUE, FK → auth.users.id |
| stripe_customer_id | text | nullable, UNIQUE |
| stripe_subscription_id | text | nullable, UNIQUE |
| status | text | 'trial' / 'active' / 'past_due' / 'cancelled', default 'trial' |
| trial_generations_used | int | default 0 |
| trial_generations_limit | int | default 10 |
| current_period_end | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto-updated via trigger |

**RLS:** Users can SELECT own row. Service role has full access (for webhook updates).
**Trigger:** `rp_subs_updated` → `rp_update_updated_at()` on UPDATE

### 4.3 `rp_generations`
Every AI generation is stored here. 29 rows currently in production.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| original_message | text | The client message that was pasted |
| reply_professional | text | AI-generated professional reply |
| reply_friendly | text | AI-generated friendly reply |
| reply_direct | text | AI-generated direct reply |
| detected_language | text | 'hr' / 'en', default 'hr' |
| client_id | uuid | nullable, FK → rp_clients.id |
| created_at | timestamptz | default now() |

**RLS:** Users can SELECT and INSERT own rows. No UPDATE/DELETE (immutable history).

### 4.4 `rp_clients`
CRM client book. 0 rows currently (fresh DB).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| full_name | text | required |
| phone | text | nullable |
| email | text | nullable |
| notes | text | nullable |
| tags | text[] | default '{}' |
| status | text | 'new'/'contacted'/'viewing'/'negotiation'/'closed'/'lost', default 'new' |
| property_interest | text | nullable — free text description |
| city | text | nullable |
| budget_min | int | nullable |
| budget_max | int | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto-updated via trigger |

**Trigger:** `rp_clients_updated` → `moddatetime('updated_at')` on UPDATE

### 4.5 `rp_properties`
Property catalog. 2 rows currently.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| title | text | required |
| address | text | nullable |
| city | text | nullable |
| price | int | nullable, in EUR |
| sqm | int | nullable |
| rooms | int | nullable |
| description | text | nullable |
| property_type | text | 'apartment'/'house'/'land'/'commercial'/'other', default 'apartment' |
| status | text | 'active'/'sold'/'reserved'/'inactive', default 'active' |
| created_at | timestamptz | default now() |

### 4.6 `rp_templates`
Prompt templates for common real estate scenarios. 15 system templates seeded.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | nullable — null for system templates |
| category | text | 'first_contact'/'follow_up'/'viewing'/'price'/'closing'/'rejection'/'custom' |
| name_hr | text | Croatian display name |
| name_en | text | English display name |
| prompt_context | text | Context injected into AI system prompt |
| is_system | boolean | default false — system templates visible to all users |
| created_at | timestamptz | default now() |

**RLS:** Users can view own + system templates. Can only modify/delete non-system templates.

### 4.7 `rp_favorites`
Saved reply snippets. 0 rows currently.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| generation_id | uuid | nullable, FK → rp_generations.id |
| tone | text | 'professional'/'friendly'/'direct' |
| content | text | The saved reply text |
| label | text | nullable — custom label |
| created_at | timestamptz | default now() |

**Note:** No UPDATE RLS policy — favorites are immutable once saved.

### 4.8 `rp_appointments`
Calendar appointments. 2 rows currently.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| title | text | required |
| description | text | nullable |
| start_at | timestamptz | required |
| end_at | timestamptz | required |
| client_id | uuid | nullable, FK → rp_clients.id |
| property_id | uuid | nullable, FK → rp_properties.id |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto-updated via trigger |

**Trigger:** `rp_appointments_updated` → `moddatetime('updated_at')` on UPDATE

### 4.9 `rp_availability_rules`
Weekly recurring availability schedule. 1 row currently.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| day_of_week | int | 0=Sun, 1=Mon … 6=Sat. CHECK: 0–6 |
| start_time | time | e.g. '09:00' |
| end_time | time | e.g. '17:00' |
| is_available | boolean | default true |

### 4.10 `rp_availability_exceptions`
One-off date overrides (holidays, sick days, etc.). 0 rows currently.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| exception_date | date | The specific date |
| is_available | boolean | default false |
| reason | text | nullable |

---

## 5. Database Functions & Triggers

### `handle_new_user()` — TRIGGER on auth.users INSERT
Automatically creates a `profiles` row and an `rp_subscriptions` row (status='trial') when a new user signs up. Uses `ON CONFLICT DO NOTHING` for idempotency.

### `increment_trial_usage(p_user_id uuid)` — SECURITY DEFINER function
Atomically increments `trial_generations_used` using `FOR UPDATE` row lock to prevent race conditions. Returns `(success, generations_used, generations_limit)`. Called from `/api/generate` after successful AI generation.

**Security advisory:** Missing `SET search_path = ''` — should be fixed to prevent search_path injection.

### `rp_update_updated_at()` — TRIGGER function
Sets `NEW.updated_at = now()` on UPDATE. Used by `profiles`, `rp_subscriptions`.

### `moddatetime('updated_at')` — Supabase built-in
Used by `rp_clients` and `rp_appointments` triggers.

---

## 6. RLS Policies Summary

Every table has RLS enabled. Pattern is consistent across all tables:

- **SELECT:** `auth.uid() = user_id` (or `auth.uid() = id` for profiles)
- **INSERT:** No `WITH CHECK` on most tables (user_id set server-side)
- **UPDATE:** `auth.uid() = user_id`
- **DELETE:** `auth.uid() = user_id`

Special cases:
- `rp_subscriptions`: Only SELECT for users. Service role has ALL access (for Stripe webhook updates).
- `rp_templates`: SELECT allows `is_system = true` rows. UPDATE/DELETE restricted to `is_system = false`.
- `rp_favorites`: No UPDATE policy (immutable).
- `rp_generations`: No UPDATE or DELETE policy (immutable history).
- `profiles` INSERT: No `WITH CHECK` — relies on trigger creating the row.


---

## 7. API Routes

### `POST /api/generate`
The core endpoint. Full flow:

1. Authenticate user via Supabase session
2. Rate limit check via Upstash Redis (10 req/60s per user)
3. Fetch subscription — reject if cancelled or trial exhausted
4. Require `onboarding_completed = true`
5. Sanitize input message (strip HTML, max 2000 chars)
6. Optionally fetch client context (name, city, interest, budget, notes)
7. Optionally fetch property context (title, address, city, price, sqm, rooms, description)
8. Optionally sanitize template context
9. If message contains date/time reference → `fetchAvailabilityContext()` + `extractBooking()`
10. Build system prompt via `buildSystemPrompt()`
11. Call Groq API (llama-3.3-70b-versatile, 30s timeout, JSON mode)
12. Insert generation row to `rp_generations`
13. If trial → call `increment_trial_usage()` RPC (atomic, FOR UPDATE lock)
14. Send trial-low email at 1 generation remaining
15. Send trial-expired email when limit hit
16. Return `GenerateResponse`

**Request body:**
```typescript
{
  message: string           // required, max 2000 chars after sanitization
  client_id?: string        // optional UUID
  property_id?: string      // optional UUID
  template_context?: string // optional, sanitized server-side
  quick_reply?: boolean     // reserved, not yet used
}
```

**Response:**
```typescript
{
  professional: string
  friendly: string
  direct: string
  detected_language: 'hr' | 'en'
  generations_remaining: number | null  // null for active subscribers
  suggestedBooking?: SuggestedBooking | null
  availabilityConflict?: boolean
}
```

**Error codes:** `AUTH_REQUIRED`, `RATE_LIMITED`, `RETRY`, `SUBSCRIPTION_CANCELLED`, `TRIAL_EXPIRED`, `ONBOARDING_REQUIRED`, `INVALID_INPUT`, `GENERATION_FAILED`, `AI_TIMEOUT`

---

### `POST /api/stripe/checkout`
Creates a Stripe Checkout session for the Pro plan. Redirects to Stripe-hosted payment page. On success, redirects to `/dashboard?success=true`.

### `POST /api/stripe/portal`
Creates a Stripe Billing Portal session for managing/cancelling subscription. Requires `stripe_customer_id` in DB.

### `POST /api/stripe/sync`
Manual sync endpoint. Checks Stripe for completed checkout sessions by email, then by customer ID. Updates subscription status to 'active' if paid. Called on `/dashboard?success=true` load and from the Billing page "Already paid?" button.

### `POST /api/stripe/webhook`
Handles Stripe webhook events:
- `checkout.session.completed` → set status='active', store customer/subscription IDs
- `invoice.payment_succeeded` → update `current_period_end`, set status='active'
- `invoice.payment_failed` → set status='past_due'
- `customer.subscription.deleted` → set status='cancelled'
- `customer.subscription.updated` → update period end + status

Signature verified via `STRIPE_WEBHOOK_SECRET`. Returns 500 on handler failure so Stripe retries.

---

### `GET /api/user/profile`
Returns the authenticated user's profile row.

### `DELETE /api/user/delete`
Full account deletion flow:
1. Fetch subscription to check for active Stripe subscription
2. Cancel Stripe subscription if active/past_due
3. Delete `rp_subscriptions` row
4. Delete auth user via `admin.deleteUser()`

### `GET /api/user/export`
GDPR Article 20 data portability export. Returns JSON file with all user data: profile, subscription, generations, clients, properties, templates, favorites. Filename: `replypro-data-export-YYYY-MM-DD.json`.

---

## 8. Core Features — Detailed

### 8.1 AI Reply Generation (Dashboard)

The main feature. Located at `/dashboard`.

**UI components involved:**
- `MessageInput` — textarea for client message
- `ClientSelector` — dropdown to optionally link a client
- `PropertySelector` — dropdown to optionally link a property
- `TemplateSelector` — collapsible panel with 15+ templates grouped by category
- `GenerateButton` — submit button with loading state
- `ReplyGrid` — 3-column grid of reply cards
- `ReplyCard` — individual reply with copy, edit, and favorite actions
- `BookingPrompt` — smart card that appears when a date/time is detected in the message

**Keyboard shortcuts:**
- `Cmd/Ctrl + Enter` — generate replies
- `Cmd/Ctrl + 1/2/3` — copy professional/friendly/direct reply

**Template categories:** first_contact, follow_up, viewing, price, closing, rejection, custom

**Booking detection flow:**
1. `containsDateOrTime()` checks message for 30+ date/time patterns (Croatian + English)
2. If detected → `fetchAvailabilityContext()` queries agent's schedule
3. `extractBooking()` parses the specific date/time from the message
4. After generation, `BookingPrompt` appears with pre-filled appointment details
5. User can edit title, date, time and save directly to calendar
6. Conflict warning shown if the slot overlaps existing appointments

### 8.2 Client CRM (`/clients`)

Full CRUD for client management.

**Fields:** full_name, phone, email, city, property_interest, budget_min, budget_max, notes, status, tags

**Status pipeline:** new → contacted → viewing → negotiation → closed / lost

**Features:**
- Search by name or city
- Filter by status
- Inline status change via dropdown
- Delete with confirmation dialog
- Client linked to generations and appointments

### 8.3 Property Catalog (`/properties`)

Full CRUD for property management.

**Fields:** title, address, city, price (EUR), sqm, rooms, description, property_type, status

**Property types:** apartment, house, land, commercial, other

**Status:** active, sold, reserved, inactive

**AI integration:** When a property is selected in the dashboard, its details (title, address, city, price, sqm, rooms, description) are injected into the AI system prompt as context.

### 8.4 Calendar (`/calendar`)

Full appointment management with 3 views.

**Views:**
- Month grid — shows appointment dots per day, click day to drill down
- Week grid — 7-column layout with appointment cards
- Day view — detailed hourly view for a specific day

**Appointment fields:** title, description, date, start_time, end_time, client_id (optional), property_id (optional)

**Availability system:**
- Weekly rules: set working hours per day of week
- Exceptions: mark specific dates as unavailable (holidays, etc.)
- AI integration: when generating replies, the agent's availability is checked and injected into the prompt so the AI can suggest appropriate meeting times

**Smart booking from AI:** After generating a reply that mentions a date/time, a `BookingPrompt` card appears allowing one-click appointment creation.

### 8.5 Generation History (`/history`)

Displays all past generations in reverse chronological order, grouped by date.

**Features:**
- Search by original message content
- Filter by language (All / HR / EN)
- Expandable items showing all 3 reply variants
- Copy individual replies
- Save to favorites from history

### 8.6 Favorites (`/favorites`)

Saved reply snippets for quick reuse.

**Features:**
- Grid layout (3 columns on desktop)
- Tone badge (Professional / Friendly / Direct)
- Copy to clipboard
- Delete with confirmation
- Linked back to original generation

### 8.7 Billing (`/billing`)

Subscription management page.

**States:**
- Trial: shows usage progress bar + upgrade CTA
- Active: shows Pro badge + manage subscription button (Stripe portal)
- Past due: shows payment issue warning
- Cancelled: shows resubscribe option

**Sync button:** "Already paid?" — manually syncs Stripe payment status for edge cases where webhook was missed.

### 8.8 Settings (`/settings`)

**Sections:**
1. Agent Profile — full_name, agency_name, city, preferred_tone, language
2. Account info — member since, total generations, active clients, plan
3. Export data — GDPR-compliant JSON export
4. Danger zone — account deletion (requires email confirmation)

### 8.9 Onboarding (`/onboarding`)

2-step wizard for new users:
1. Profile setup (name, agency, city, tone preference)
2. Demo generation with sample message — shows AI output with their actual profile

Dashboard layout redirects to `/onboarding` if `onboarding_completed = false`.

---

## 9. State Management (Zustand)

Single store at `store/app-store.ts`. All data hooks write to this store on load.

**Store slices:**
```
language: 'hr' | 'en'          — persisted to localStorage as 'rp-lang'
profile: UserProfile | null
subscription: Subscription | null
generations: Generation[]       — last 50, newest first
clients: Client[]               — all, sorted by updated_at desc
properties: Property[]          — all, sorted by created_at desc
templates: Template[]           — system + user, sorted by is_system desc, category
favorites: Favorite[]           — all, sorted by created_at desc
appointments: Appointment[]     — all, sorted by start_at asc
```

**Mutation methods:** addX, updateX, removeX for all collections. Optimistic updates — DB write happens in component, store updated on success.

---

## 10. i18n (Internationalization)

**Languages:** Croatian (hr) — default, English (en)

**Implementation:** Custom `useTranslation` hook backed by Zustand `language` state. Translations loaded from `locales/hr.json` and `locales/en.json` (~200 keys each). Key lookup is dot-notation (e.g. `t('dashboard.welcome')`).

**Language switching:** `LanguageSwitcher` component in Sidebar and MobileNav. Language preference saved to `profiles.language` in DB and `localStorage`.

**AI language detection:** The AI prompt instructs the model to detect the client message language and respond in the same language. Croatian/Bosnian/Serbian keywords trigger 'hr' detection.

**Translation key namespaces:** nav, landing, dashboard, stats, onboarding, history, settings, billing, clients, properties, favorites, confirm_dialog, auth, cookie, calendar, errors

---

## 11. Authentication Flow

**Provider:** Supabase Auth (email/password)

**Signup flow:**
1. User fills SignupForm
2. Supabase creates auth.users row
3. `handle_new_user` trigger fires → creates `profiles` + `rp_subscriptions` rows
4. Welcome email sent via Resend
5. Redirect to `/onboarding`

**Login flow:**
1. User fills LoginForm
2. Supabase session created
3. Middleware refreshes session on every protected route request
4. Dashboard layout checks `onboarding_completed` → redirects if false

**Password reset:**
1. ForgotPasswordForm → Supabase sends reset email
2. User clicks link → ResetPasswordForm
3. Supabase updates password

**Session management:** `lib/supabase/middleware.ts` calls `updateSession()` on every request matching the middleware matcher. Middleware matcher covers all dashboard routes + auth routes.

**Protected routes (middleware matcher):**
`/dashboard/*`, `/history/*`, `/settings/*`, `/billing/*`, `/onboarding/*`, `/clients/*`, `/properties/*`, `/favorites/*`, `/login`, `/signup`

---

## 12. AI System (Groq)

**Model:** `llama-3.3-70b-versatile`
**Temperature:** 0.8
**Max tokens:** 2000
**Response format:** JSON object (enforced via `response_format: { type: 'json_object' }`)
**Timeout:** 30 seconds (AbortController)

**System prompt structure:**
```
[Agent identity: name, agency, city, tone preference]
[Task: write 3 reply versions]
[3 tone definitions: Professional / Friendly / Direct]
[How a real agent writes: natural language rules]
[What not to invent: use brackets for unknowns]
[Language detection rules]
[JSON output format]
[Optional: client context]
[Optional: property context]
[Optional: template context]
[Optional: availability context]
```

**JSON output schema:**
```json
{
  "professional": "...",
  "friendly": "...",
  "direct": "...",
  "detected_language": "hr" | "en"
}
```

---

## 13. Email System (Resend)

All emails use a shared HTML template with ReplyPro branding (teal #0F766E).

**Triggered emails:**

| Email | Trigger | Languages |
|---|---|---|
| Welcome | Signup (called from SignupForm) | HR / EN |
| Trial Low | 1 generation remaining (called from /api/generate) | HR / EN |
| Trial Expired | Trial limit hit (called from /api/generate) | HR / EN |
| Payment Success | (function exists, not yet wired to webhook) | HR / EN |
| Payment Failed | (function exists, not yet wired to webhook) | HR / EN |

**Note:** `sendPaymentSuccessEmail` and `sendPaymentFailedEmail` exist in `lib/resend/emails.ts` but are not currently called from the Stripe webhook handler. This is a gap.

---

## 14. Rate Limiting (Upstash Redis)

**Algorithm:** Sliding window
**Limit:** 10 requests per 60 seconds per user ID
**Scope:** `/api/generate` only
**Fallback:** If Upstash is not configured or fails, rate limiting is disabled (allows all requests) — graceful degradation.
**Error response:** HTTP 429 with `Retry-After: 60` header

---

## 15. Security

### HTTP Security Headers (next.config.mjs)
- `X-DNS-Prefetch-Control: on`
- `X-Frame-Options: DENY` — clickjacking protection
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — 2 year HSTS
- `Content-Security-Policy` — restricts scripts to self + Stripe, connects to Supabase/Groq/Stripe/Resend/Upstash

### Input Sanitization
- `sanitizeMessage()` — strips HTML tags, truncates to 2000 chars
- `sanitizeProfileField()` — strips HTML, configurable max length
- Template context sanitized server-side before injection into AI prompt

### Prompt Injection Prevention
- Template context is sanitized via `sanitizeMessage()` before being appended to the AI prompt
- Client/property context is fetched server-side from DB (not from user input)

### Data Isolation
- All DB queries include `.eq('user_id', user.id)` or `.eq('id', user.id)`
- RLS policies enforce this at the database level as a second layer

### Stripe Webhook Security
- Signature verified via `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- Returns 400 on invalid signature

### GDPR Compliance
- Cookie banner (essential cookies only, no tracking)
- Data export endpoint (Article 20 — right to data portability)
- Account deletion endpoint (Article 17 — right to erasure)
- Privacy policy pages in HR and EN
- Terms of service pages in HR and EN

### Known Security Advisories
1. `increment_trial_usage` function missing `SET search_path = ''` — low risk but should be fixed
2. Leaked password protection disabled in Supabase Auth — should enable HaveIBeenPwned check

---

## 16. Design System

**Primary color:** Teal — `hsl(164, 72%, 32%)` light / `hsl(164, 72%, 42%)` dark
**Font:** Inter (Google Fonts, latin + latin-ext subsets)
**Border radius:** 0.75rem base (--radius)
**Theme:** Light/dark mode via `next-themes` with `class` strategy

**Custom CSS utilities:**
- `.glass` / `.glass-strong` — glassmorphism cards
- `.gradient-text` — teal gradient text
- `.mesh-bg` — radial gradient background
- `.shimmer-hover` — shimmer effect on hover
- `.nav-active` — sidebar active item with left border accent
- `.glow-primary` / `.glow-primary-sm` — box shadow glow effects
- `.float` / `.float-delayed` / `.float-slow` — floating animations
- `.safe-area-bottom` — iOS safe area padding

**Animation library:** Motion (Framer Motion v12) — used extensively for page transitions, hover effects, staggered list animations, and the mobile nav drawer.

**Skeleton loading:** Custom `Skeleton` component used on all data-dependent views.

**Toast notifications:** Custom `ToastProvider` + `useToast` hook. 4 variants: default, success, error, info.

---

## 17. Mobile Experience

**Navigation:** Bottom tab bar (`MobileNav`) with 5 tabs:
- Dashboard, History, Generate (center FAB), Clients, More (drawer)

**More drawer:** Properties, Favorites, Calendar, Settings, Billing + Language/Theme toggles

**Center FAB behavior:**
- On dashboard: scrolls to message input and focuses it
- On other pages: navigates to `/dashboard?focus=input`
- Subtle pulse animation when not on dashboard

**Haptic feedback:** `navigator.vibrate(10)` on tab press (where supported)

**iOS safe area:** `.safe-area-bottom` utility handles home indicator inset

**Responsive breakpoints:** 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)

---

## 18. Environment Variables

| Variable | Required | Description |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Yes | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Supabase anon/public key |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Supabase service role key (server-only) |
| GROQ_API_KEY | Yes | Groq API key for AI generation |
| STRIPE_SECRET_KEY | Yes | Stripe secret key (server-only) |
| STRIPE_PUBLISHABLE_KEY | Yes | Stripe publishable key |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Yes | Stripe publishable key (client-side) |
| STRIPE_WEBHOOK_SECRET | Yes | Stripe webhook signing secret |
| STRIPE_PRICE_ID | Yes | Stripe price ID for Pro plan (€29/mo) |
| RESEND_API_KEY | Yes | Resend API key for emails |
| RESEND_FROM_EMAIL | Yes | Verified sender email address |
| UPSTASH_REDIS_REST_URL | Optional | Upstash Redis URL (rate limiting) |
| UPSTASH_REDIS_REST_TOKEN | Optional | Upstash Redis token (rate limiting) |
| NEXT_PUBLIC_APP_URL | Yes | Production domain (https://replypro.hr) |

---

## 19. Data Flow — Complete Generation Cycle

```
User types message
    ↓
[Client] DashboardPage.handleGenerate()
    ↓
POST /api/generate
    ↓
[Server] Auth check → Rate limit → Subscription check → Onboarding check
    ↓
[Server] Sanitize message
    ↓
[Server] Fetch client context (if client_id provided)
[Server] Fetch property context (if property_id provided)
[Server] Sanitize template context (if provided)
    ↓
[Server] containsDateOrTime(message)?
    YES → fetchAvailabilityContext() + extractBooking()
    NO  → skip
    ↓
[Server] buildSystemPrompt() + assemble enriched prompt
    ↓
[Server] Groq API call (llama-3.3-70b-versatile, JSON mode, 30s timeout)
    ↓
[Server] Insert to rp_generations
    ↓
[Server] If trial → increment_trial_usage() RPC (atomic)
    ↓
[Server] Send email if trial low/expired
    ↓
[Client] Receive GenerateResponse
    ↓
[Client] Update Zustand store (addGeneration, update subscription count)
    ↓
[Client] Render ReplyGrid (3 cards)
    ↓
[Client] If suggestedBooking → render BookingPrompt
    ↓
User copies reply / saves to favorites / creates appointment
```

---

## 20. Known Issues & Gaps

1. **Payment emails not wired:** `sendPaymentSuccessEmail` and `sendPaymentFailedEmail` exist but are not called from the Stripe webhook handler.

2. **`increment_trial_usage` search_path:** Missing `SET search_path = ''` — security advisory from Supabase.

3. **Leaked password protection:** Supabase Auth HaveIBeenPwned check is disabled.

4. **`profiles` INSERT RLS:** No `WITH CHECK` clause — relies on trigger. If trigger fails, a user could insert a profile for another user ID (low risk since trigger is reliable).

5. **`rp_favorites` no UPDATE policy:** Intentional (immutable), but label editing is not possible.

6. **`rp_generations` no DELETE policy:** Intentional (immutable history), but users cannot delete individual generations.

7. **`useUser` hook creates new Supabase client on every render:** Should be memoized or use a singleton.

8. **No pagination on generations:** `useGenerations` fetches last 50 only. History page shows all loaded generations — no infinite scroll.

9. **`appendGenerations` in store:** Defined but not used anywhere — dead code.

10. **`quick_reply` field in GenerateRequest:** Defined in types but not implemented in the API route.

11. **`rls_auto_enable` function:** Listed in DB functions but not documented — likely a migration helper.

12. **Calendar `?date=` query param:** `BookingPrompt` links to `/calendar?date=${savedDate}` but the calendar page doesn't read this param to auto-navigate to that date.

13. **`typescript: { ignoreBuildErrors: true }` in next.config.mjs:** Build errors are silenced — should be removed before production hardening.

14. **`eslint: { ignoreDuringBuilds: true }` in next.config.mjs:** ESLint errors silenced during builds.

---

## 21. Production Checklist

- [ ] Fix `increment_trial_usage` search_path security advisory
- [ ] Enable Supabase Auth leaked password protection
- [ ] Wire `sendPaymentSuccessEmail` / `sendPaymentFailedEmail` to Stripe webhook
- [ ] Remove `typescript.ignoreBuildErrors` from next.config.mjs
- [ ] Remove `eslint.ignoreDuringBuilds` from next.config.mjs
- [ ] Add `WITH CHECK` to `profiles` INSERT RLS policy
- [ ] Implement calendar `?date=` param navigation
- [ ] Add pagination to generation history (cursor-based)
- [ ] Set up Stripe webhook endpoint in Stripe dashboard pointing to `/api/stripe/webhook`
- [ ] Configure Upstash Redis for rate limiting
- [ ] Verify Resend domain is verified for `RESEND_FROM_EMAIL`
- [ ] Set `NEXT_PUBLIC_APP_URL` to `https://replypro.hr` in production env
- [ ] Test Stripe webhook signature verification end-to-end
- [ ] Verify `handle_new_user` trigger fires correctly on signup

---

## 22. Live Data Snapshot (April 2026)

| Table | Row Count |
|---|---|
| profiles | 5 |
| rp_subscriptions | 5 |
| rp_generations | 29 |
| rp_clients | 0 |
| rp_properties | 2 |
| rp_templates | 15 (system) |
| rp_favorites | 0 |
| rp_appointments | 2 |
| rp_availability_rules | 1 |
| rp_availability_exceptions | 0 |

5 registered users, 29 total AI generations, 2 properties, 2 appointments, 1 availability rule configured.

