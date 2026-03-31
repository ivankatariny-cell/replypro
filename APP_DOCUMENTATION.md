# ReplyPro — Full Application Documentation

## Overview

ReplyPro is an AI-powered reply assistant and mini-CRM built specifically for real estate agents in Croatia (and English-speaking markets). Agents paste a client message, optionally select a client and property for context, choose a template, and the app generates 3 reply variations in different tones (Professional, Friendly, Direct) within seconds. The app supports Croatian and English with automatic language detection.

**Domain:** `replypro.hr`
**Default language:** Croatian (`hr`)
**Pricing:** Free trial (10 generations) → Pro plan (€29/month, unlimited)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript 5 |
| UI | React 18, Tailwind CSS 3.4, tailwindcss-animate |
| Component Library | Custom UI components (shadcn-style: Button, Card, Input, Label, Textarea, Badge, Skeleton, Toast) |
| Icons | Lucide React |
| Animations | Framer Motion (motion package v12) |
| State Management | Zustand 5 |
| Forms | React Hook Form 7 + Zod 3 validation |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database | Supabase (PostgreSQL) |
| AI | Groq SDK (Llama 3.3 70B Versatile model) |
| Payments | Stripe (subscriptions via Checkout) |
| Email | Resend |
| Theming | next-themes (dark/light/system) |
| Fonts | Inter via next/font/google (zero FOUT) |
| Styling Utilities | clsx, tailwind-merge, class-variance-authority |

---

## Project Structure

```
app/
├── (auth)/              # Auth route group (login, signup)
├── (dashboard)/         # Protected dashboard route group
│   ├── dashboard/       # Main generation page (stats, templates, client/property selectors)
│   ├── clients/         # Client contact book (mini-CRM)
│   ├── properties/      # Property catalog
│   ├── favorites/       # Saved reply library
│   ├── history/         # Past generations
│   ├── settings/        # Profile settings
│   ├── billing/         # Subscription management
│   └── onboarding/      # First-time profile setup
├── (marketing)/         # Public landing page
├── api/
│   ├── generate/        # AI reply generation (context-aware)
│   ├── stripe/
│   │   ├── checkout/    # Create Stripe Checkout session
│   │   ├── sync/        # Sync subscription status from Stripe
│   │   └── webhook/     # Stripe webhook handler
│   └── user/
│       └── profile/     # Get user profile
├── layout.tsx           # Root layout (Inter font, ThemeProvider, ToastProvider)
└── globals.css          # CSS variables, animations, dark mode

components/
├── auth/                # LoginForm, SignupForm
├── billing/             # PricingCard
├── dashboard/           # MessageInput, GenerateButton, ReplyCard, ReplyGrid,
│                        # TrialBanner, StatsCards, TemplateSelector,
│                        # ClientSelector, PropertySelector
├── history/             # HistoryList, HistoryItem
├── layout/              # Sidebar, Navbar, MobileNav, LanguageSwitcher, ThemeToggle
├── onboarding/          # OnboardingForm
└── ui/                  # badge, button, card, input, label, skeleton, textarea, toast

hooks/
├── useUser.ts           # Supabase auth user state
├── useProfile.ts        # Fetch & cache user profile
├── useSubscription.ts   # Fetch & cache subscription
├── useGenerations.ts    # Fetch & cache generation history
├── useClients.ts        # Fetch & cache client list
├── useProperties.ts     # Fetch & cache property list
├── useTemplates.ts      # Fetch & cache templates (system + user)
├── useFavorites.ts      # Fetch & cache saved favorites
└── useTranslation.ts    # i18n hook (hr/en)

lib/
├── groq/client.ts       # Groq SDK wrapper
├── prompts/real-estate.ts # System prompt builder
├── stripe/client.ts     # Stripe SDK singleton
├── resend/client.ts     # Resend SDK singleton
├── resend/emails.ts     # Email templates
├── supabase/client.ts   # Browser Supabase client
├── supabase/server.ts   # Server Supabase client
├── supabase/middleware.ts # Auth session refresh + route protection
└── utils/
    ├── cn.ts            # clsx + tailwind-merge
    ├── language-detect.ts # Croatian/English detection
    ├── rate-limit.ts    # In-memory rate limiter
    └── sanitize.ts      # HTML stripping + truncation

store/
└── app-store.ts         # Zustand store (language, profile, subscription,
                         # generations, clients, properties, templates, favorites)

locales/
├── hr.json              # Croatian translations (~150+ keys)
└── en.json              # English translations (~150+ keys)

types/
└── index.ts             # TypeScript interfaces (UserProfile, Generation,
                         # Subscription, Client, Property, Template, Favorite, API types)
```

---

## Database Schema (Supabase / PostgreSQL)

### Tables

#### `profiles`
Stores real estate agent profile data. Auto-created on signup via trigger.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | uuid | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| full_name | text | null | — |
| agency_name | text | null | — |
| city | text | null | — |
| preferred_tone | text | 'mixed' | CHECK: formal, mixed, casual |
| language | text | 'hr' | CHECK: hr, en |
| onboarding_completed | boolean | false | — |
| created_at | timestamptz | now() | — |
| updated_at | timestamptz | now() | Auto-updated via trigger |

#### `rp_generations`
Stores every AI-generated reply set, optionally linked to a client.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | — | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| original_message | text | — | NOT NULL |
| reply_professional | text | — | NOT NULL |
| reply_friendly | text | — | NOT NULL |
| reply_direct | text | — | NOT NULL |
| detected_language | text | 'hr' | NOT NULL, CHECK: hr, en |
| client_id | uuid | null | FK → rp_clients(id) ON DELETE SET NULL |
| created_at | timestamptz | now() | NOT NULL |

#### `rp_subscriptions`
Tracks user subscription/trial status. Auto-created on signup via trigger.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | — | NOT NULL, UNIQUE, FK → auth.users(id) ON DELETE CASCADE |
| stripe_customer_id | text | null | UNIQUE |
| stripe_subscription_id | text | null | UNIQUE |
| status | text | 'trial' | NOT NULL, CHECK: trial, active, past_due, cancelled |
| trial_generations_used | integer | 0 | NOT NULL |
| trial_generations_limit | integer | 10 | NOT NULL |
| current_period_end | timestamptz | null | — |
| created_at | timestamptz | now() | NOT NULL |
| updated_at | timestamptz | now() | NOT NULL, auto-updated via trigger |

#### `rp_clients` (NEW — Mini-CRM)
Stores client contacts with status pipeline and budget tracking.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | — | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| full_name | text | — | NOT NULL |
| phone | text | null | — |
| email | text | null | — |
| notes | text | null | — |
| tags | text[] | '{}' | — |
| status | text | 'new' | CHECK: new, contacted, viewing, negotiation, closed, lost |
| property_interest | text | null | — |
| city | text | null | — |
| budget_min | integer | null | — |
| budget_max | integer | null | — |
| created_at | timestamptz | now() | — |
| updated_at | timestamptz | now() | Auto-updated via trigger |

#### `rp_properties` (NEW — Property Catalog)
Stores property listings that can be attached to AI generations.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | — | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| title | text | — | NOT NULL |
| address | text | null | — |
| city | text | null | — |
| price | integer | null | — |
| sqm | integer | null | — |
| rooms | integer | null | — |
| description | text | null | — |
| property_type | text | 'apartment' | CHECK: apartment, house, land, commercial, other |
| status | text | 'active' | CHECK: active, sold, reserved, inactive |
| created_at | timestamptz | now() | — |

#### `rp_templates` (NEW — Smart Templates)
Pre-built and custom reply templates. System templates have user_id = NULL.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | null | FK → auth.users(id) ON DELETE CASCADE |
| category | text | — | NOT NULL, CHECK: first_contact, follow_up, viewing, price, closing, rejection, custom |
| name_hr | text | — | NOT NULL |
| name_en | text | — | NOT NULL |
| prompt_context | text | — | NOT NULL |
| is_system | boolean | false | — |
| created_at | timestamptz | now() | — |

15 system templates are pre-seeded across 6 categories.

#### `rp_favorites` (NEW — Saved Replies)
Stores starred/saved reply content for quick reuse.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | — | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| generation_id | uuid | null | FK → rp_generations(id) ON DELETE SET NULL |
| tone | text | — | NOT NULL, CHECK: professional, friendly, direct |
| content | text | — | NOT NULL |
| label | text | null | — |
| created_at | timestamptz | now() | — |

### Row Level Security (RLS)

All tables have RLS enabled with user-scoped policies.

| Table | Policies |
|-------|----------|
| profiles | SELECT/INSERT/UPDATE own row |
| rp_generations | SELECT/INSERT own rows |
| rp_subscriptions | SELECT own row, ALL for service_role |
| rp_clients | SELECT/INSERT/UPDATE/DELETE own rows |
| rp_properties | SELECT/INSERT/UPDATE/DELETE own rows |
| rp_templates | SELECT own + system templates, INSERT/UPDATE/DELETE own non-system |
| rp_favorites | SELECT/INSERT/DELETE own rows |

---

## Features

### 1. AI Reply Generation (Core Feature — Enhanced)
- User pastes a client message (max 2000 chars, HTML-stripped)
- Optionally selects a client from the contact book → AI gets client context
- Optionally selects a property → AI weaves property details into replies
- Optionally applies a template → AI uses template context for tone/situation
- API calls Groq (Llama 3.3 70B) with enriched system prompt
- Returns 3 reply variations: Professional, Friendly, Direct
- Automatically detects Croatian or English
- Replies personalized with agent's name, agency, city, preferred tone, client data, and property details

### 2. Smart Templates (NEW)
- 15 pre-built system templates across 6 categories:
  - First Contact (3): Thanks for inquiry, I have something, Available for viewing
  - Follow-up (3): After viewing, Still interested?, New property
  - Viewing (2): Confirm appointment, Reschedule
  - Price (3): Price is firm, Can check with owner, Alternative in budget
  - Closing (2): Documents needed, Congratulations
  - Rejection (2): Unfortunately sold, Nothing available
- One-click template selection on dashboard
- Template context injected into AI prompt for situation-aware replies
- Users can create custom templates (future)

### 3. Client Contact Book — Mini-CRM (NEW)
- Add/edit/delete client contacts
- Fields: name, phone, email, city, property interest, budget range, notes
- Status pipeline: New → Contacted → Viewing → Negotiation → Closed / Lost
- Search by name or city
- Filter by status
- Client selector on dashboard — links generations to clients
- AI uses client data for context-aware reply generation

### 4. Property Catalog (NEW)
- Add/edit/delete property listings
- Fields: title, type, address, city, price, sqm, rooms, description
- Property types: apartment, house, land, commercial, other
- Status: active, sold, reserved, inactive
- Property selector on dashboard — AI weaves property details into replies
- Grid display with price, location, and specs

### 5. Favorites / Saved Replies (NEW)
- Star any generated reply to save it
- Dedicated /favorites page with grid view
- Copy saved replies with one click
- Delete favorites
- Tone badge on each saved reply
- Creates value accumulation — library grows over time

### 6. Reply Cards (Enhanced)
- Each reply displayed in a card with tone badge (color-coded)
- Copy to clipboard with visual feedback
- Inline editing — modify replies before copying
- Star/favorite button on every card
- Framer Motion slide-in animation (staggered by tone)
- Placeholder note reminds agents to fill in specifics

### 7. Dashboard (Redesigned)
- Welcome message with agent's first name
- Stats cards: replies this month, active clients, hours saved (animated)
- Trial banner / Pro badge
- Client selector dropdown (optional)
- Property selector dropdown (optional)
- Collapsible template picker
- Template active indicator with clear button
- Message textarea with character count
- Generate button
- Animated reply grid

### 8. Trial & Subscription System
- New users start with 10 free generations (trial)
- Trial banner shows remaining count
- When trial expires, generation blocked with upgrade prompt
- Pro plan: €29/month via Stripe Checkout
- Subscription statuses: trial → active → past_due → cancelled
- All billing UI uses translation keys (no hardcoded strings)

### 9. Dark Mode (NEW)
- Toggle in sidebar, navbar, and mobile nav
- System preference auto-detection
- Smooth theme switching via next-themes
- All components styled for both light and dark modes
- CSS variables for both themes in globals.css

### 10. Mobile Navigation (NEW)
- Bottom tab bar on mobile (hidden on desktop)
- 5 tabs: Dashboard, History, Generate (center, prominent), Clients, More
- Center Generate tab is elevated with primary color
- "More" drawer with: Properties, Favorites, Settings, Billing, Logout
- Language switcher and theme toggle in More drawer

### 11. Landing Page (Redesigned)
- Animated gradient hero with emotional headline
- Pain section: 3 relatable problems for agents
- How it works: 3-step flow with scroll animations
- Example: client message + 3 tone reply cards
- Features grid: 6 cards (tones, language, templates, clients, properties, history)
- ROI Calculator: interactive sliders showing time saved
- Pricing: Free vs Pro with "Most Popular" badge and money-back guarantee
- FAQ: 4 common questions
- Final CTA with urgency messaging
- Floating navbar with scroll-aware blur/shadow
- All sections use FadeUp scroll animation (framer-motion + IntersectionObserver)

### 12. Animations & Micro-interactions
- Reply cards: slide-in from right (staggered 150ms per card)
- Stats cards: fade-up on mount (staggered 100ms)
- Landing page sections: FadeUp on scroll (IntersectionObserver)
- Client/property lists: fade-up on mount (staggered 50ms)
- Form sections: AnimatePresence height animation (expand/collapse)
- Skeleton loaders: CSS gradient shimmer effect
- Navbar: blur + shadow transition on scroll
- Card hover: border-primary/40 + shadow-md transition

### 13. Internationalization (i18n)
- Two languages: Croatian (hr) and English (en)
- ~150+ translation keys per language
- Language switcher in Sidebar, Navbar, and Mobile Nav
- All UI text uses translation keys (zero hardcoded strings)
- Language preference stored in Zustand + localStorage

### 14. Other Features (Unchanged)
- Email notifications (Resend): welcome, trial low, trial expired, payment success/failed
- Rate limiting: 30 req/min per user (in-memory)
- Input sanitization: HTML stripping, 2000 char limit
- Language detection: Croatian word frequency analysis
- Google OAuth login
- Onboarding flow: name, agency, city, preferred tone
- Settings page: edit profile
- History page: expandable generation list with reply cards

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/generate | Yes | Generate 3 AI replies (context-aware: client + property + template) |
| POST | /api/stripe/checkout | Yes | Create Stripe Checkout session |
| POST | /api/stripe/sync | Yes | Manually sync subscription status |
| POST | /api/stripe/webhook | No (Stripe sig) | Handle Stripe webhook events |
| GET | /api/user/profile | Yes | Get current user's profile |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous/public key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (server-only) |
| GROQ_API_KEY | Groq API key for AI generation |
| STRIPE_SECRET_KEY | Stripe secret key (server-only) |
| STRIPE_PUBLISHABLE_KEY | Stripe publishable key |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe publishable key (client-side) |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret |
| STRIPE_PRICE_ID | Stripe Price ID for the Pro subscription |
| RESEND_API_KEY | Resend API key for transactional emails |
| RESEND_FROM_EMAIL | Sender email address |
| NEXT_PUBLIC_APP_URL | App base URL |
