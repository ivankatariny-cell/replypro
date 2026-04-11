# ReplyPro — Pre-Launch Master Plan

Generated from full codebase audit. Every task below is a complete, self-contained prompt you can paste directly into Kiro or any AI agent.

# ReplyPro — Pre-Launch Master Plan

> Full codebase audit completed. Every task below is a **complete, self-contained prompt** you can paste directly into Kiro (or any AI agent) to execute. Tasks are ordered by priority. Complete all CRITICAL tasks before launch.

---

## HOW TO USE THIS FILE

Each task block contains:
- **Priority** — CRITICAL / HIGH / MEDIUM / NICE-TO-HAVE
- **Category** — Security / Bug / UX / Design / Legal / Performance / Feature
- **Effort** — estimated time
- **The Prompt** — paste this directly into Kiro chat to execute the task

---

## SECTION 1 — CRITICAL SECURITY FIXES

---

### TASK-001 — Rotate & Sanitize .env.local.example

**Priority:** CRITICAL  
**Category:** Security  
**Effort:** 5 min  

**Context:**  
The file `.env.local.example` currently contains real, live credentials including a Supabase service role key (full DB admin access), a Groq API key, a Stripe secret key, and a Resend API key. This file is committed to git and is typically public. All credentials must be rotated immediately and replaced with safe placeholder values.

**The Prompt:**
```
You are a security engineer. The file .env.local.example in this project contains real API credentials that were accidentally committed. 

Your task:
1. Replace ALL real credential values in .env.local.example with safe placeholder strings in the format YOUR_VALUE_HERE
2. Keep all variable names and comments intact
3. Add a comment block at the top of the file explaining what each variable is for and where to get it
4. Do NOT touch .env.local (the real file)

The variables to sanitize are:
- NEXT_PUBLIC_SUPABASE_URL → https://your-project-ref.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY → your-supabase-anon-key
- SUPABASE_SERVICE_ROLE_KEY → your-supabase-service-role-key
- GROQ_API_KEY → your-groq-api-key
- STRIPE_SECRET_KEY → sk_test_your-stripe-secret-key
- STRIPE_PUBLISHABLE_KEY → pk_test_your-stripe-publishable-key
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → pk_test_your-stripe-publishable-key
- STRIPE_WEBHOOK_SECRET → whsec_your-webhook-secret
- STRIPE_PRICE_ID → price_your-price-id
- RESEND_API_KEY → re_your-resend-api-key
- RESEND_FROM_EMAIL → noreply@yourdomain.com
- UPSTASH_REDIS_REST_URL → https://your-upstash-url.upstash.io
- UPSTASH_REDIS_REST_TOKEN → your-upstash-token
- NEXT_PUBLIC_APP_URL → https://yourdomain.com

After replacing, add a top-of-file comment block with setup instructions for each service.
```

---

### TASK-002 — Fix Trial Generation Race Condition

**Priority:** CRITICAL  
**Category:** Bug / Security  
**Effort:** 15 min  

**Context:**  
In `app/api/generate/route.ts`, the trial generation counter is read, then incremented in a separate UPDATE call. Under concurrent requests (user double-clicks, network retry), a user can exceed their 10-generation trial limit. The fix requires an atomic DB-level increment with a conditional check.

**The Prompt:**
```
You are a backend engineer fixing a race condition in app/api/generate/route.ts.

The current code:
1. Reads sub.trial_generations_used from the database
2. Checks if it's >= trial_generations_limit
3. Later does a separate UPDATE to increment trial_generations_used by 1

This is a race condition — concurrent requests can both pass the check before either increments.

Your task: Replace the two-step read+update pattern with a single atomic Supabase RPC call or a conditional UPDATE that only succeeds if the count is still below the limit.

Specifically:
1. In the Supabase migration file (supabase/migration.sql), add a new SQL function:

CREATE OR REPLACE FUNCTION increment_trial_usage(p_user_id uuid)
RETURNS TABLE(success boolean, generations_used integer, generations_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used integer;
  v_limit integer;
  v_status text;
BEGIN
  SELECT trial_generations_used, trial_generations_limit, status
  INTO v_used, v_limit, v_status
  FROM rp_subscriptions
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_status != 'trial' OR v_used >= v_limit THEN
    RETURN QUERY SELECT false, v_used, v_limit;
    RETURN;
  END IF;
  
  UPDATE rp_subscriptions
  SET trial_generations_used = trial_generations_used + 1
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT true, v_used + 1, v_limit;
END;
$$;

2. In app/api/generate/route.ts, replace the separate read-then-update pattern for trial users with a call to this RPC function using serviceClient.rpc('increment_trial_usage', { p_user_id: user.id })

3. Handle the case where the RPC returns success: false (trial exhausted) with a 402 response

4. Remove the old separate UPDATE call at the bottom of the route for trial users since the RPC now handles it atomically

Keep all existing error handling and email notification logic intact.
```

---

### TASK-003 — Add Security Headers (CSP + HSTS)

**Priority:** CRITICAL  
**Category:** Security  
**Effort:** 20 min  

**Context:**  
`next.config.mjs` has basic security headers (X-Frame-Options, X-Content-Type-Options) but is missing Content-Security-Policy, Strict-Transport-Security, and a proper Permissions-Policy. These are required for production and for passing security scanners.

**The Prompt:**
```
You are a security engineer. Update next.config.mjs to add production-grade security headers.

Current file has: X-DNS-Prefetch-Control, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

Add the following headers to the existing headers() array:

1. Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
   (HTTPS enforcement, 2 year max-age)

2. Content-Security-Policy with these directives:
   - default-src 'self'
   - script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com
   - style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
   - font-src 'self' https://fonts.gstatic.com
   - img-src 'self' data: blob: https:
   - connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api.stripe.com https://api.resend.com https://*.upstash.io
   - frame-src https://js.stripe.com https://hooks.stripe.com
   - object-src 'none'
   - base-uri 'self'
   - form-action 'self'
   Note: 'unsafe-inline' and 'unsafe-eval' are needed for Next.js. This is acceptable.

3. Update X-Frame-Options to DENY (not SAMEORIGIN, since we don't embed ourselves in iframes)

4. Update Permissions-Policy to also include: payment=(), usb=(), bluetooth=()

Keep the existing headers and just add/update. Make sure the CSP is a single string value (no line breaks in the header value).

Also add a comment above the headers explaining what each one does.
```

---

### TASK-004 — Fix Rate Limiter Crash on Missing Upstash Env Vars

**Priority:** CRITICAL  
**Category:** Bug  
**Effort:** 10 min  

**Context:**  
`lib/utils/rate-limit.ts` initializes `Redis.fromEnv()` at module load time. If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are not set (they are placeholder values in the example file), the entire generate API route will crash on every request with an unhandled error, not a graceful 429.

**The Prompt:**
```
You are a backend engineer. Fix lib/utils/rate-limit.ts to handle missing Upstash environment variables gracefully.

Current problem: Redis.fromEnv() is called at module initialization. If UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN are missing or placeholder values, every call to rateLimit() will throw an unhandled error, crashing the generate endpoint.

Your fix:
1. Wrap the Redis and Ratelimit initialization in a try-catch or lazy initialization pattern
2. If the env vars are missing or invalid (check for 'your-' prefix or empty string), the rateLimit() function should return { success: true, remaining: 999 } as a fallback (effectively disabling rate limiting rather than crashing)
3. Log a warning to console when falling back: console.warn('[rate-limit] Upstash not configured, rate limiting disabled')
4. Keep the existing sliding window logic when Upstash IS properly configured

The function signature and return type should remain identical: Promise<{ success: boolean; remaining: number }>

Also update the rate limit from 30 requests per 60 seconds to 10 requests per 60 seconds — 30 is too generous for an AI generation endpoint that costs money per call.
```

---

---

## SECTION 2 — HIGH PRIORITY BUG FIXES

---

### TASK-005 — Fix GenerateResponse Type Mismatch

**Priority:** HIGH  
**Category:** Bug / TypeScript  
**Effort:** 10 min  

**Context:**  
`types/index.ts` defines `GenerateResponse` with an `id: string` field. The actual API response built in `app/api/generate/route.ts` never includes `id`. This TypeScript mismatch will cause runtime issues if any component tries to access `response.id`.

**The Prompt:**
```
You are a TypeScript engineer. Fix a type mismatch between the API response and the TypeScript interface.

In types/index.ts, the GenerateResponse interface has an `id: string` field.
In app/api/generate/route.ts, the response object built at the end of the POST handler does NOT include an `id` field.

Your task:
1. Remove the `id: string` field from the GenerateResponse interface in types/index.ts since the API never returns it
2. Check all files that use GenerateResponse (app/(dashboard)/dashboard/page.tsx, hooks/useGenerations.ts, components/dashboard/ReplyGrid.tsx, components/dashboard/ReplyCard.tsx) and ensure none of them reference .id on a GenerateResponse object
3. If any component does reference .id on a GenerateResponse, remove that reference

Do not change the GenerationRow type (from the DB schema) — that one correctly has an id field. Only change the GenerateResponse API response type.
```

---

### TASK-006 — Add Error Handling to All Data Hooks

**Priority:** HIGH  
**Category:** Bug / UX  
**Effort:** 30 min  

**Context:**  
All hooks (`useProfile`, `useSubscription`, `useGenerations`, `useClients`, `useProperties`, `useTemplates`, `useFavorites`) fetch data on mount but silently swallow errors. If a fetch fails, the user sees an empty state with no explanation. They also return no loading state, so components can't show skeletons while data loads.

**The Prompt:**
```
You are a React engineer. Improve all data-fetching hooks in the hooks/ directory to add proper error handling and loading states.

The hooks to update are:
- hooks/useProfile.ts
- hooks/useSubscription.ts  
- hooks/useGenerations.ts
- hooks/useClients.ts
- hooks/useProperties.ts
- hooks/useTemplates.ts
- hooks/useFavorites.ts

For EACH hook, make these changes:
1. Add a `loading` boolean state, initialized to true, set to false after the fetch completes (success or error)
2. Add an `error` string | null state, initialized to null, set to the error message if the fetch fails
3. In the .then() chain, add a .catch() or handle the Supabase error object ({ data, error }) — if error exists, set the error state
4. Return { loading, error } alongside the existing data return

Example pattern for useProfile:
- Before: return { profile }
- After: return { profile, loading, error }

Keep the Zustand store integration exactly as-is. Only add the local loading/error states to the hook return values.

Do not change the hook function signatures or the useEffect dependencies.

After updating the hooks, update StatsCards.tsx to use the loading state from useGenerations and useClients to show Skeleton components while data loads instead of showing 0.
```

---

### TASK-007 — Fix Delete Account — Missing Stripe Cancellation

**Priority:** HIGH  
**Category:** Bug  
**Effort:** 20 min  

**Context:**  
`app/api/user/delete/route.ts` deletes the Supabase auth user but does NOT cancel the user's Stripe subscription first. If a Pro user deletes their account, they will continue to be charged monthly with no way to stop it from the app side.

**The Prompt:**
```
You are a backend engineer. Fix the account deletion flow in app/api/user/delete/route.ts.

Current problem: The DELETE handler deletes the Supabase auth user but never cancels the Stripe subscription. Pro users who delete their account will keep getting charged.

Your fix — before calling serviceRole.auth.admin.deleteUser(user.id), add these steps:

1. Query rp_subscriptions for the user's stripe_subscription_id and status
2. If status is 'active' or 'past_due' AND stripe_subscription_id exists:
   a. Import getStripe from @/lib/stripe/client
   b. Call getStripe().subscriptions.cancel(stripe_subscription_id)
   c. Wrap in try-catch — if Stripe cancellation fails, log the error but DO NOT block account deletion (the user should still be able to delete their account)
3. Then proceed with the existing Supabase user deletion

Also add a step to delete or anonymize the user's data from rp_subscriptions before deleting the auth user, since the CASCADE delete on auth.users should handle it, but explicitly confirm the subscription row is cleaned up.

Keep the existing error handling structure. The response format should remain { success: true } on success.
```

---

### TASK-008 — Fix Middleware Silent Passthrough on Missing Env Vars

**Priority:** HIGH  
**Category:** Security / Bug  
**Effort:** 10 min  

**Context:**  
`lib/supabase/middleware.ts` has `if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next()` — this means a misconfigured deployment silently exposes ALL protected dashboard routes to unauthenticated users.

**The Prompt:**
```
You are a security engineer. Fix the silent passthrough in lib/supabase/middleware.ts.

Current code: if (!supabaseUrl || !supabaseAnonKey) { return NextResponse.next() }

This is dangerous — if env vars are missing in production, all protected routes become publicly accessible.

Your fix:
1. Replace the silent passthrough with a proper error response
2. If env vars are missing AND the request is for a protected route (isDashboardRoute), return a NextResponse with status 503 and a JSON body: { error: 'Service temporarily unavailable', code: 'CONFIG_ERROR' }
3. If env vars are missing AND the request is for a public route, allow it through (return NextResponse.next()) — the marketing pages should still work
4. Add a console.error('[middleware] Missing Supabase env vars') log when this condition is hit

The isDashboardRoute check logic is already in the file — reuse it.
```

---

### TASK-009 — Add Forgot Password Flow

**Priority:** HIGH  
**Category:** Feature / UX  
**Effort:** 45 min  

**Context:**  
There is no "Forgot Password" link on the login page. Users who forget their password have no recovery path. This is a launch blocker — users will churn immediately if they can't recover access.

**The Prompt:**
```
You are a full-stack Next.js engineer. Add a complete forgot password flow to ReplyPro.

The app uses Supabase Auth. Supabase has built-in password reset via supabase.auth.resetPasswordForEmail().

Tasks:

1. Add a "Forgot password?" link to components/auth/LoginForm.tsx below the password field, linking to /forgot-password

2. Create app/(auth)/forgot-password/page.tsx — a simple page that renders a ForgotPasswordForm component

3. Create components/auth/ForgotPasswordForm.tsx with:
   - Email input field with react-hook-form + zod validation (z.string().email())
   - Submit button that calls supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })
   - Success state: show a message "Check your email for a reset link" with a back to login link
   - Error state: show the error message
   - Same visual style as LoginForm.tsx (same card layout, same button style)

4. Create app/(auth)/reset-password/page.tsx — handles the redirect from the email link

5. Create components/auth/ResetPasswordForm.tsx with:
   - New password input + confirm password input
   - Zod schema: password min 8 chars, passwords must match
   - On submit: call supabase.auth.updateUser({ password: newPassword })
   - On success: redirect to /dashboard
   - Same visual style as other auth forms

6. Add translation keys to both locales/en.json and locales/hr.json:
   - "auth.forgot_password": "Forgot password?" / "Zaboravili ste lozinku?"
   - "auth.forgot_title": "Reset your password" / "Resetirajte lozinku"
   - "auth.forgot_desc": "Enter your email and we'll send a reset link" / "Unesite email i poslat ćemo vam link"
   - "auth.forgot_submit": "Send reset link" / "Pošalji link"
   - "auth.forgot_sent": "Check your email for a reset link" / "Provjerite email za link za reset"
   - "auth.reset_title": "Set new password" / "Postavite novu lozinku"
   - "auth.reset_new": "New password" / "Nova lozinka"
   - "auth.reset_confirm": "Confirm password" / "Potvrdi lozinku"
   - "auth.reset_submit": "Update password" / "Ažuriraj lozinku"
   - "auth.passwords_no_match": "Passwords do not match" / "Lozinke se ne podudaraju"

Use the same auth layout (app/(auth)/layout.tsx) for both new pages.
```

---

---

## SECTION 3 — UX & DESIGN IMPROVEMENTS

---

### TASK-010 — Add Error Boundaries to Dashboard

**Priority:** HIGH  
**Category:** UX / Reliability  
**Effort:** 20 min  

**Context:**  
There are no React error boundaries anywhere in the app. If any dashboard component throws (e.g., a hook returns unexpected data), the entire dashboard goes blank with a white screen. Users will think the app is broken.

**The Prompt:**
```
You are a React engineer. Add error boundaries to the ReplyPro dashboard.

Tasks:

1. Create components/ui/error-boundary.tsx — a reusable React class component ErrorBoundary with:
   - State: { hasError: boolean, error: Error | null }
   - static getDerivedStateFromError(error): sets hasError: true, error
   - componentDidCatch: console.error the error
   - render: if hasError, show a fallback UI card with:
     - A warning icon (use Lucide AlertTriangle)
     - Title: "Something went wrong"
     - Description: "This section failed to load. Try refreshing the page."
     - A "Refresh" button that calls window.location.reload()
     - Styled consistently with the rest of the app (rounded-2xl border bg-card p-6)
   - Accept a `fallback` prop (ReactNode) to allow custom fallback UI
   - Accept a `children` prop

2. Wrap the following sections in app/(dashboard)/dashboard/page.tsx with <ErrorBoundary>:
   - <StatsCards /> 
   - <TrialBanner />
   - The entire generator card div
   - The ReplyGrid section

3. Wrap the entire children in app/(dashboard)/layout.tsx with a top-level <ErrorBoundary> as a catch-all

4. Export ErrorBoundary from components/ui/error-boundary.tsx

Keep the error boundary as a client component ('use client' at the top).
```

---

### TASK-011 — Improve Auth Pages Design (Split Layout)

**Priority:** HIGH  
**Category:** Design / UX  
**Effort:** 45 min  

**Context:**  
The auth layout (`app/(auth)/layout.tsx`) currently just centers the form. Login and signup pages for SaaS products convert better with a split layout: form on the left, value proposition / visual on the right. The current design is functional but plain.

**The Prompt:**
```
You are a senior UI/UX engineer. Redesign the auth layout for ReplyPro to use a modern split-panel design.

Update app/(auth)/layout.tsx to implement a two-column layout:

LEFT PANEL (form side, ~45% width on desktop, full width on mobile):
- White/card background
- Vertically centered content
- Logo at top left
- The form content (children) in the center
- "© 2026 ReplyPro" footer at bottom

RIGHT PANEL (visual side, ~55% width, hidden on mobile):
- Primary color gradient background: from hsl(164 72% 28%) to hsl(174 64% 38%)
- Large ReplyPro logo/wordmark centered
- 3 feature bullets with check icons:
  • "Generate 3 reply tones in 5 seconds"
  • "Croatian & English auto-detection"  
  • "Client & property context-aware AI"
- A mock chat UI card showing a client message and 3 reply tone badges (Professional, Friendly, Direct) — static, no interactivity needed, just visual
- Subtle animated floating dots (use CSS animation, not Framer Motion, to keep it lightweight)
- All text in white/white-80

The split should use CSS grid: `grid-cols-1 lg:grid-cols-[45%_55%]`

On mobile (< lg), only show the left panel (form side). The right panel is hidden.

Keep the existing form components (LoginForm, SignupForm) completely unchanged — only update the layout wrapper.

Use Tailwind CSS only. No new dependencies.
```

---

### TASK-012 — Add Loading Skeletons to All Dashboard Pages

**Priority:** HIGH  
**Category:** UX / Design  
**Effort:** 30 min  

**Context:**  
Dashboard pages (clients, properties, favorites, history) show empty states immediately while data loads, then snap to content. This looks broken. Skeleton loaders should show while hooks are fetching.

**The Prompt:**
```
You are a React/UX engineer. Add skeleton loading states to all dashboard list pages.

The hooks now return { loading } (after TASK-006 is complete). Use this to show skeletons.

For each page, implement the following pattern:

1. app/(dashboard)/clients/page.tsx:
   - While loading: show 4 skeleton cards using the existing Skeleton component from components/ui/skeleton.tsx
   - Each skeleton card should match the approximate height/layout of a real client card
   - Use: <Skeleton className="h-24 w-full rounded-2xl" />

2. app/(dashboard)/properties/page.tsx:
   - While loading: show 4 skeleton cards matching property card dimensions
   - Use: <Skeleton className="h-28 w-full rounded-2xl" />

3. app/(dashboard)/favorites/page.tsx:
   - While loading: show 3 skeleton cards matching favorite card dimensions

4. app/(dashboard)/history/page.tsx:
   - While loading: show 5 skeleton rows matching history item dimensions
   - Use: <Skeleton className="h-16 w-full rounded-xl" />

5. app/(dashboard)/dashboard/page.tsx — StatsCards:
   - Already handled in TASK-006, but verify the 3 stat cards show skeletons while loading

For all pages, wrap the skeleton grid in the same container/grid as the real content so the layout does not shift when content loads.

Import Skeleton from @/components/ui/skeleton in each page file.
```

---

### TASK-013 — Redesign Landing Page Hero Section

**Priority:** HIGH  
**Category:** Design / Conversion  
**Effort:** 60 min  

**Context:**  
The landing page hero is good but the social proof numbers (500+ agents, 50k+ replies, 4.9★) are hardcoded placeholder values that are not real. For launch, these should either be removed or replaced with honest claims. Also, the hero needs a stronger visual hierarchy and a more compelling sub-headline.

**The Prompt:**
```
You are a senior conversion-focused UI engineer and copywriter. Improve the hero section of app/(marketing)/page.tsx.

Changes to make:

1. SOCIAL PROOF STRIP — Replace the fake stats with honest launch claims:
   - Remove "500+ agenata" and "50k+ odgovora" (these are fake)
   - Replace with: "10 besplatnih generacija" / "10 free generations", "Bez kreditne kartice" / "No credit card", "Podrška za HR i EN" / "Croatian & English"
   - Keep the same visual strip design, just update the content

2. HERO HEADLINE — Update the translation keys in both locales:
   - en.json landing.headline: "Reply to clients in 5 seconds. Not 5 minutes."  (keep this, it's good)
   - hr.json landing.headline: "Odgovarajte klijentima za 5 sekundi. Ne 5 minuta." (keep this)
   - en.json landing.subheadline: "ReplyPro generates 3 perfect replies for every client message — Professional, Friendly, or Direct. Built for Croatian real estate agents."
   - hr.json landing.subheadline: "ReplyPro generira 3 savršena odgovora za svaku poruku klijenta — Profesionalno, Prijateljski ili Direktno. Napravljeno za agente nekretnina."

3. HERO CTA AREA — Add a "No credit card required" trust signal directly under the CTA buttons (already exists as landing.no_card key — verify it's visible and prominent)

4. HERO ILLUSTRATION — The animated chat mockup is good. Add one small improvement: add a subtle "Powered by Llama 3.3" badge in the bottom-right corner of the illustration card (small, muted text, just for credibility)

5. FAQ SECTION — The FAQ section is cut off in the code (truncated). Verify all 4 FAQ items render correctly. If any are missing, add them back using the existing translation keys: faq_1 through faq_4.

6. FINAL CTA SECTION — After the FAQ, add a final CTA section (if not already present):
   - Dark background (bg-primary/5 border-t)
   - Headline from landing.final_cta_title translation key
   - Subtext from landing.final_cta_desc
   - Single large CTA button linking to /signup
   - Centered layout, max-w-2xl

7. FOOTER — Add a minimal footer below the final CTA:
   - Copyright: "© 2026 ReplyPro. Sva prava pridržana."
   - Links: Terms of Service (/terms), Privacy Policy (/privacy), Contact (mailto:info@replypro.hr)
   - Language switcher (reuse the LanguageSwitcher component)
   - Centered, small text, muted color

Keep all existing animations and Framer Motion usage intact.
```

---

### TASK-014 — Add Confirmation Dialog for Destructive Actions

**Priority:** HIGH  
**Category:** UX / Safety  
**Effort:** 30 min  

**Context:**  
Deleting clients, properties, and favorites has no confirmation step. Users can accidentally delete data with no undo. The settings page has a delete account flow but it's buried. Need a reusable confirmation dialog component.

**The Prompt:**
```
You are a React UI engineer. Create a reusable confirmation dialog component and apply it to all destructive actions in ReplyPro.

1. Create components/ui/confirm-dialog.tsx:
   - A modal dialog component using CSS (no external dialog library needed)
   - Props: { open: boolean, onClose: () => void, onConfirm: () => void, title: string, description: string, confirmLabel?: string, confirmVariant?: 'destructive' | 'default', loading?: boolean }
   - Renders a centered overlay (fixed inset-0 bg-black/50 backdrop-blur-sm z-50)
   - Dialog card: max-w-sm, rounded-2xl, border, bg-card, p-6, shadow-xl
   - Title in font-semibold, description in text-sm text-muted-foreground
   - Two buttons: Cancel (outline variant) and Confirm (destructive variant by default)
   - Closes on overlay click or Cancel
   - Traps focus (add tabIndex and onKeyDown for Escape key)
   - Animated with Framer Motion: scale from 0.95 to 1, opacity 0 to 1

2. Apply ConfirmDialog to app/(dashboard)/clients/page.tsx:
   - Replace the current inline delete confirmation (if any) with the ConfirmDialog
   - Title: "Delete client?" / "Obrisati klijenta?"
   - Description: "This will permanently delete [client name] and all associated data." / "Ovo će trajno obrisati [ime klijenta] i sve povezane podatke."

3. Apply ConfirmDialog to app/(dashboard)/properties/page.tsx:
   - Title: "Delete property?" / "Obrisati nekretninu?"
   - Description: "This will permanently delete [property title]." / "Ovo će trajno obrisati [naziv nekretnine]."

4. Apply ConfirmDialog to app/(dashboard)/favorites/page.tsx:
   - Title: "Remove from favorites?" / "Ukloniti iz favorita?"
   - Description: "This reply will be removed from your saved favorites." / "Ovaj odgovor bit će uklonjen iz vaših favorita."

Add the necessary translation keys to both locale files for the dialog labels.
```

---

### TASK-015 — Improve Mobile Navigation UX

**Priority:** HIGH  
**Category:** UX / Mobile  
**Effort:** 30 min  

**Context:**  
The mobile bottom nav exists but the "More" drawer pattern needs polish. The center Generate tab should navigate to /dashboard and auto-focus the message input. Also, the active state on mobile nav items needs to be more visible.

**The Prompt:**
```
You are a mobile UX engineer. Improve the MobileNav component in components/layout/MobileNav.tsx.

Improvements to make:

1. CENTER TAB (Generate):
   - When tapped, navigate to /dashboard?focus=input (this already works via useSearchParams in dashboard/page.tsx)
   - Add a subtle pulse animation to the center button when the user is NOT on the dashboard (to draw attention)
   - The center button should be elevated with a shadow: shadow-lg shadow-primary/30

2. ACTIVE STATE:
   - Current active items just change color. Add a small dot indicator below the active tab icon
   - Use: a 4px wide, 4px tall rounded-full bg-primary dot centered below the icon
   - Animate it in with scale from 0 to 1 using Framer Motion

3. MORE DRAWER:
   - The drawer should have a drag handle at the top (a 32px wide, 4px tall rounded-full bg-muted-foreground/30 bar, centered)
   - Add a subtle backdrop blur to the overlay: backdrop-blur-sm
   - Drawer items should have hover states: hover:bg-accent rounded-lg transition

4. SAFE AREA:
   - Ensure the bottom nav respects iOS safe area: add pb-safe or padding-bottom: env(safe-area-inset-bottom) to the nav container
   - The existing .safe-area-bottom utility class in globals.css handles this — apply it to the nav wrapper

5. HAPTIC FEEDBACK (web):
   - On tab press, call navigator.vibrate?.(10) for subtle haptic feedback on Android
   - Wrap in try-catch since not all browsers support it

Keep all existing navigation logic and routing intact.
```

---

---

## SECTION 4 — DESIGN POLISH & VISUAL UPGRADES

---

### TASK-016 — Add Open Graph & SEO Meta Tags

**Priority:** HIGH  
**Category:** SEO / Marketing  
**Effort:** 30 min  

**Context:**  
`app/layout.tsx` has no Open Graph meta tags. When someone shares replypro.hr on WhatsApp, LinkedIn, or Twitter, it will show a blank preview. This kills social sharing effectiveness at launch.

**The Prompt:**
```
You are a Next.js SEO engineer. Add comprehensive metadata to the ReplyPro app.

1. Update app/layout.tsx to add a full metadata export:

export const metadata: Metadata = {
  metadataBase: new URL('https://replypro.hr'),
  title: {
    default: 'ReplyPro — AI odgovori za agente nekretnina',
    template: '%s | ReplyPro',
  },
  description: 'ReplyPro generira 3 savršena odgovora za svaku poruku klijenta za 5 sekundi. Napravljeno za agente nekretnina u Hrvatskoj.',
  keywords: ['AI asistent nekretnine', 'odgovori klijentima', 'agent nekretnina alat', 'real estate AI Croatia', 'ReplyPro'],
  authors: [{ name: 'ReplyPro' }],
  creator: 'ReplyPro',
  openGraph: {
    type: 'website',
    locale: 'hr_HR',
    alternateLocale: 'en_US',
    url: 'https://replypro.hr',
    siteName: 'ReplyPro',
    title: 'ReplyPro — AI odgovori za agente nekretnina',
    description: 'Generirajte 3 savršena odgovora za svaku poruku klijenta za 5 sekundi.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ReplyPro — AI Reply Assistant' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReplyPro — AI odgovori za agente nekretnina',
    description: 'Generirajte 3 savršena odgovora za svaku poruku klijenta za 5 sekundi.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

2. Update app/(marketing)/page.tsx to add page-specific metadata:
export const metadata: Metadata = {
  title: 'ReplyPro — Odgovarajte klijentima za 5 sekundi',
  description: '10 besplatnih generacija. Bez kreditne kartice. AI asistent za agente nekretnina.',
}

3. Create a placeholder OG image instruction: Add a comment in app/layout.tsx noting that /public/og-image.png (1200x630px) needs to be created. The image should show the ReplyPro logo, the headline "Reply to clients in 5 seconds", and the 3 tone badges on a dark teal background.

4. Add canonical URL to the marketing layout (app/(marketing)/layout.tsx):
import { Metadata } from 'next'
export const metadata: Metadata = { alternates: { canonical: 'https://replypro.hr' } }

5. Add a robots.txt file at app/robots.ts:
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/', '/onboarding'] },
    sitemap: 'https://replypro.hr/sitemap.xml',
  }
}

6. Add a sitemap at app/sitemap.ts:
export default function sitemap() {
  return [
    { url: 'https://replypro.hr', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://replypro.hr/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://replypro.hr/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://replypro.hr/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://replypro.hr/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
```

---

### TASK-017 — Add Toast Notification Improvements

**Priority:** MEDIUM  
**Category:** UX / Design  
**Effort:** 20 min  

**Context:**  
The current toast system works but toasts appear without icons, have no dismiss button, and don't stack properly when multiple fire in sequence. Also, the toast for "Copied!" is too generic — it should show which tone was copied.

**The Prompt:**
```
You are a React UI engineer. Improve the toast notification system in components/ui/toast.tsx.

Current issues:
1. No icons on toasts (success/error/info look identical except color)
2. No dismiss (X) button on toasts
3. "Copied!" toast doesn't say which tone was copied

Improvements:

1. Add icons to each toast variant:
   - success: CheckCircle2 from lucide-react (text-green-500)
   - error: XCircle from lucide-react (text-red-500)
   - info: Info from lucide-react (text-blue-500)
   - default (no variant): MessageSquare from lucide-react

2. Add a dismiss button (X icon) to each toast that calls the dismiss function

3. Update the toast animation: slide in from the right (translateX from 100% to 0) instead of just fading in

4. In components/dashboard/ReplyCard.tsx, update the copy toast to include the tone name:
   - Change: toast(t('dashboard.copied'))
   - To: toast(`${t(`dashboard.tone_${tone}`)} — ${t('dashboard.copied')}`)

5. Add a max of 3 simultaneous toasts — if a 4th fires, dismiss the oldest one first

Keep the existing useToast hook API identical. Only update the visual component and the stacking logic.
```

---

### TASK-018 — Add Keyboard Shortcuts

**Priority:** MEDIUM  
**Category:** UX / Power Users  
**Effort:** 25 min  

**Context:**  
Power users (agents who use the app dozens of times per day) would benefit from keyboard shortcuts. The most valuable ones are: generate (Cmd+Enter), copy professional (Cmd+1), copy friendly (Cmd+2), copy direct (Cmd+3).

**The Prompt:**
```
You are a React UX engineer. Add keyboard shortcuts to the ReplyPro dashboard.

Create a custom hook hooks/useKeyboardShortcuts.ts that:
- Accepts a map of shortcut definitions: { key: string, meta?: boolean, ctrl?: boolean, handler: () => void, description: string }[]
- Attaches a keydown event listener on mount, removes it on unmount
- Calls the matching handler when the key combination is pressed
- Ignores shortcuts when focus is inside an input, textarea, or contenteditable element (check document.activeElement.tagName)

In app/(dashboard)/dashboard/page.tsx, add these shortcuts:
1. Cmd/Ctrl + Enter → trigger handleGenerate (same as clicking the Generate button)
2. Cmd/Ctrl + 1 → copy the professional reply to clipboard (if replies exist)
3. Cmd/Ctrl + 2 → copy the friendly reply to clipboard (if replies exist)
4. Cmd/Ctrl + 3 → copy the direct reply to clipboard (if replies exist)

Add a small keyboard shortcut hint below the Generate button:
- Text: "⌘ Enter to generate" (or "Ctrl+Enter" on Windows — detect via navigator.platform)
- Style: text-xs text-muted-foreground
- Only show on desktop (hidden on mobile)

Add a keyboard shortcut legend somewhere accessible (e.g., a small "?" button in the dashboard header that shows a popover with all shortcuts listed).
```

---

### TASK-019 — Improve Empty States Design

**Priority:** MEDIUM  
**Category:** Design / UX  
**Effort:** 30 min  

**Context:**  
Empty states for clients, properties, favorites, and history are plain text. Good empty states guide users to take action and make the app feel polished.

**The Prompt:**
```
You are a UI/UX designer and React engineer. Redesign all empty states in ReplyPro to be engaging and action-oriented.

For each page, create a visually appealing empty state that:
- Has a relevant illustration (use a large Lucide icon in a styled container, not an actual image)
- Has a clear headline explaining what this section is for
- Has a short description (1-2 sentences)
- Has a primary CTA button

1. app/(dashboard)/clients/page.tsx empty state:
   - Icon: Users (h-10 w-10) in a rounded-2xl bg-primary/10 container
   - Headline: "No clients yet" / "Još nema klijenata"
   - Description: "Add your first client to track their interests and link them to AI-generated replies." / "Dodajte prvog klijenta za praćenje interesa i povezivanje s AI odgovorima."
   - CTA: "Add first client" button that opens the add client form

2. app/(dashboard)/properties/page.tsx empty state:
   - Icon: Building2 in bg-info/10
   - Headline: "No properties yet" / "Još nema nekretnina"
   - Description: "Add properties to your catalog and AI will automatically include their details in replies." / "Dodajte nekretnine u katalog i AI će automatski uključiti detalje u odgovore."
   - CTA: "Add first property" button

3. app/(dashboard)/favorites/page.tsx empty state:
   - Icon: Star in bg-warning/10
   - Headline: "No saved replies yet" / "Još nema spremljenih odgovora"
   - Description: "Star any generated reply to save it here for quick reuse." / "Označite zvjezdicom bilo koji generirani odgovor da ga ovdje spremate za brzu ponovnu upotrebu."
   - CTA: "Generate a reply" link to /dashboard

4. app/(dashboard)/history/page.tsx empty state (already exists but improve it):
   - Icon: MessageSquare in bg-primary/10
   - Headline: "No generations yet" / "Još nema generacija"
   - Description: "Your AI-generated replies will appear here after your first generation." / "Vaši AI generirani odgovori pojavit će se ovdje nakon prve generacije."
   - CTA: "Generate first reply" link to /dashboard

Style all empty states consistently: centered, py-20, max-w-sm mx-auto, text-center.
```

---

### TASK-020 — Add Onboarding Redirect Guard

**Priority:** HIGH  
**Category:** UX / Bug  
**Effort:** 15 min  

**Context:**  
If a user signs up but skips onboarding (clicks "Skip"), they can access the dashboard but the generate API will return `ONBOARDING_REQUIRED` error. The middleware doesn't redirect incomplete-onboarding users to /onboarding. This creates a confusing experience.

**The Prompt:**
```
You are a Next.js engineer. Add an onboarding completion guard to the dashboard.

Problem: Users who skip onboarding can access /dashboard but can't generate replies (API returns ONBOARDING_REQUIRED). The middleware doesn't check onboarding status.

Solution — add a client-side guard in app/(dashboard)/layout.tsx:

1. In the DashboardLayout component, use the useProfile hook to get the profile
2. Use the useUser hook to get the user
3. If user exists AND profile exists AND profile.onboarding_completed === false, redirect to /onboarding using useRouter().push('/onboarding')
4. While profile is loading (loading state from TASK-006), show a full-screen loading spinner instead of the dashboard content
5. Only render children when: no user (middleware handles redirect), or profile.onboarding_completed === true

The loading spinner should be:
- Full screen: fixed inset-0 flex items-center justify-center bg-background
- A Loader2 icon from lucide-react with animate-spin class, h-8 w-8 text-primary

This prevents the confusing "generate fails silently" experience for users who skipped onboarding.
```

---

---

## SECTION 5 — LEGAL & COMPLIANCE

---

### TASK-021 — Complete Legal Documents (Fill Placeholders)

**Priority:** CRITICAL  
**Category:** Legal  
**Effort:** 30 min (+ lawyer review)  

**Context:**  
Both `app/(marketing)/privacy/page.tsx` and `app/(marketing)/terms/page.tsx` contain `[Company Name]`, `[Company Address]`, and `[Contact Email]` placeholders. These MUST be filled before launch. Publishing a privacy policy with placeholder text is a GDPR violation.

**The Prompt:**
```
You are a legal document engineer. Update the legal pages in ReplyPro to replace all placeholder values.

In app/(marketing)/privacy/page.tsx and app/(marketing)/terms/page.tsx, replace ALL occurrences of:
- [Company Name] → your actual registered company name (e.g., "ReplyPro d.o.o." or your sole trader name)
- [Company Address] → your actual registered business address in Croatia
- [Contact Email] → privacy@replypro.hr (or your actual contact email)

Also make these improvements to both pages:

1. Update the "Last updated" date to the actual launch date (use today's date or your planned launch date)

2. Remove the yellow disclaimer banner from both pages:
   <div className="mb-10 rounded-lg border border-yellow-200 bg-yellow-50...">
     <strong>Disclaimer:</strong> This is a template legal document...
   </div>
   This disclaimer must be removed before going live — it undermines trust.

3. In privacy/page.tsx, update Section 7 (Cookies) to add a note about the Supabase auth session cookie name and purpose

4. In terms/page.tsx, update Section 3 (Subscription & Billing) to add the specific price: "The Pro plan is currently priced at €29.00 per month (VAT included where applicable)."

5. Add a Croatian language version of both pages:
   - Create app/(marketing)/privatnost/page.tsx (Croatian privacy policy)
   - Create app/(marketing)/uvjeti/page.tsx (Croatian terms of service)
   - These should be full Croatian translations of the English versions
   - Add links to the Croatian versions in the footer

6. Update the footer links in app/(marketing)/page.tsx to point to both language versions based on the current language setting

IMPORTANT: After making these changes, have a qualified Croatian lawyer review both documents before publishing. The disclaimer removal assumes legal review has been completed.
```

---

### TASK-022 — Add Cookie Consent Banner

**Priority:** HIGH  
**Category:** Legal / GDPR  
**Effort:** 45 min  

**Context:**  
GDPR requires informed consent for cookies. Even though ReplyPro only uses essential auth cookies (which don't require consent), a cookie notice is still required to inform users. Without it, you risk AZOP (Croatian DPA) complaints.

**The Prompt:**
```
You are a GDPR compliance engineer and React developer. Add a cookie consent notice to ReplyPro.

Note: ReplyPro only uses ESSENTIAL cookies (Supabase auth session). Essential cookies do not require opt-in consent under GDPR, but you must still INFORM users about them.

Implementation:

1. Create components/ui/cookie-banner.tsx:
   - A fixed bottom banner (fixed bottom-0 left-0 right-0 z-50)
   - Only shown to users who haven't dismissed it (check localStorage key 'rp-cookie-consent')
   - Content (bilingual based on app language):
     HR: "Koristimo samo neophodne kolačiće za autentifikaciju. Bez praćenja, bez oglasa."
     EN: "We only use essential cookies for authentication. No tracking, no ads."
   - Two buttons: "OK, razumijem" / "OK, I understand" (dismisses and sets localStorage) and "Saznaj više" / "Learn more" (links to /privacy#cookies)
   - Style: bg-card border-t shadow-lg px-4 py-3 flex items-center justify-between gap-4
   - Animate in from bottom with Framer Motion (y: 100 → 0)
   - On mobile: stack buttons vertically

2. Add CookieBanner to app/layout.tsx (root layout, outside ThemeProvider but inside body)

3. The banner should NOT show on the /dashboard, /settings, /billing, /history, /clients, /properties, /favorites, /onboarding routes — only on marketing pages (/, /login, /signup, /terms, /privacy)

4. Add the localStorage check with SSR safety: typeof window !== 'undefined' && localStorage.getItem('rp-cookie-consent')

5. Add translation keys to both locale files:
   - "cookie.message": the bilingual message above
   - "cookie.accept": "OK, razumijem" / "OK, I understand"
   - "cookie.learn_more": "Saznaj više" / "Learn more"
```

---

### TASK-023 — Add GDPR Data Export (Full Export)

**Priority:** HIGH  
**Category:** Legal / GDPR  
**Effort:** 30 min  

**Context:**  
The current data export in settings only exports a summary (profile + generation count + client names). GDPR Article 20 requires full data portability — users must be able to export ALL their personal data in a machine-readable format.

**The Prompt:**
```
You are a GDPR compliance engineer. Improve the data export functionality in app/(dashboard)/settings/page.tsx.

Current export: exports profile, generation count, and client names only.

Required: Full GDPR-compliant data export including ALL personal data.

1. Create a new API route app/api/user/export/route.ts (GET method):
   - Authenticate the user (createServerSupabaseClient)
   - Use createServiceRoleClient to fetch ALL user data:
     a. Profile: SELECT * FROM profiles WHERE id = user.id
     b. Subscription: SELECT status, trial_generations_used, trial_generations_limit, current_period_end FROM rp_subscriptions WHERE user_id = user.id (exclude stripe IDs for security)
     c. Generations: SELECT id, original_message, reply_professional, reply_friendly, reply_direct, detected_language, created_at FROM rp_generations WHERE user_id = user.id ORDER BY created_at DESC
     d. Clients: SELECT * FROM rp_clients WHERE user_id = user.id
     e. Properties: SELECT * FROM rp_properties WHERE user_id = user.id
     f. Templates: SELECT * FROM rp_templates WHERE user_id = user.id AND is_system = false
     g. Favorites: SELECT id, tone, content, label, created_at FROM rp_favorites WHERE user_id = user.id
   - Return as JSON with Content-Disposition: attachment; filename="replypro-data-export-{date}.json"
   - Set Content-Type: application/json

2. Update the export button in settings/page.tsx to call this API route instead of the current client-side export:
   - Replace the current handleExport function with a fetch to /api/user/export
   - Trigger download using a blob URL
   - Show loading state while fetching

3. Add a note below the export button:
   HR: "Izvoz uključuje sve vaše osobne podatke u skladu s GDPR-om (čl. 20)."
   EN: "Export includes all your personal data in compliance with GDPR (Art. 20)."
```

---

### TASK-024 — Add Account Deletion Confirmation Flow

**Priority:** HIGH  
**Category:** Legal / UX  
**Effort:** 20 min  

**Context:**  
The settings page has a delete account section but it's not visible in the current code — it may be missing from the rendered page. GDPR requires users to be able to delete their account and data. The flow needs to be complete, visible, and require email confirmation.

**The Prompt:**
```
You are a React engineer. Add a complete account deletion section to app/(dashboard)/settings/page.tsx.

The delete account section should be the LAST section on the settings page (below Export).

1. Add a "Danger Zone" section card:
   - Red/destructive themed header: border-destructive/30 bg-destructive/5
   - Icon: Trash2 from lucide-react in text-destructive
   - Title: "Delete Account" / "Obriši račun" (from settings.delete_title translation key)
   - Description: the settings.delete_warning translation key text

2. Inside the card, add the deletion form:
   - A text input asking user to type their email address to confirm
   - Label: settings.delete_confirm_label
   - Placeholder: settings.delete_confirm_placeholder
   - The delete button is DISABLED until the typed email matches user.email exactly
   - Button: settings.delete_btn (destructive variant, full width)
   - Loading state: settings.deleting

3. On submit:
   - Call DELETE /api/user/delete
   - On success: call supabase.auth.signOut() then router.push('/')
   - On error: show the error message from settings.delete_error

4. Add a warning list before the input (from settings.delete_warning translation key) showing what will be deleted

5. The entire section should be wrapped in a motion.div with a subtle entrance animation

The translation keys already exist in both locale files — use them.
```

---

---

## SECTION 6 — PERFORMANCE & RELIABILITY

---

### TASK-025 — Add Next.js Image Optimization Config

**Priority:** MEDIUM  
**Category:** Performance  
**Effort:** 10 min  

**Context:**  
`next.config.mjs` has no image domain configuration. If any images are added (OG image, user avatars, property photos), they won't be optimized. Also, the config is missing `compress: true` and bundle analyzer setup.

**The Prompt:**
```
You are a Next.js performance engineer. Update next.config.mjs with production optimizations.

Add the following to the nextConfig object:

1. compress: true — enables gzip compression

2. poweredByHeader: false — removes the X-Powered-By: Next.js header (minor security improvement)

3. images configuration:
   images: {
     formats: ['image/avif', 'image/webp'],
     remotePatterns: [
       { protocol: 'https', hostname: '*.supabase.co' },
       { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
     ],
     minimumCacheTTL: 60,
   }

4. experimental: {
     optimizePackageImports: ['lucide-react', 'motion'],
   }
   This reduces bundle size by tree-shaking icon and animation imports.

5. Add a comment explaining each config option.

Keep the existing headers() function intact.
```

---

### TASK-026 — Add Stripe Webhook Secret Validation Guard

**Priority:** HIGH  
**Category:** Reliability / Security  
**Effort:** 10 min  

**Context:**  
`STRIPE_WEBHOOK_SECRET` is empty in the example file. If it's empty in production, `constructEvent` will throw and ALL webhook events will fail silently (Stripe will retry them, but they'll never process). Need a startup check.

**The Prompt:**
```
You are a backend engineer. Add environment variable validation to prevent silent failures in production.

1. Create lib/utils/env-check.ts:
   - Export a function validateEnv() that checks all required environment variables
   - Required server-side vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID, RESEND_API_KEY
   - For each missing var, collect it in a missingVars array
   - If any are missing, console.error a clear message listing all missing vars
   - Return { valid: boolean, missing: string[] }

2. In app/api/stripe/webhook/route.ts, add an early check:
   - If process.env.STRIPE_WEBHOOK_SECRET is empty or undefined, return a 500 with body: { error: 'Webhook secret not configured' }
   - Log: console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set')
   - This prevents the cryptic "No signatures found matching the expected signature" error

3. In app/api/generate/route.ts, add an early check:
   - If process.env.GROQ_API_KEY is empty or undefined, return a 503 with: { error: 'AI service not configured', code: 'SERVICE_UNAVAILABLE' }

4. In app/api/stripe/checkout/route.ts, add an early check:
   - If process.env.STRIPE_SECRET_KEY or process.env.STRIPE_PRICE_ID is missing, return 503

These checks make misconfiguration immediately obvious instead of causing cryptic runtime errors.
```

---

### TASK-027 — Add Supabase Connection Pooling & Query Optimization

**Priority:** MEDIUM  
**Category:** Performance  
**Effort:** 20 min  

**Context:**  
The generate API route makes 4-6 sequential Supabase queries (subscription, profile, client, property). Some of these can be parallelized with Promise.all to reduce latency.

**The Prompt:**
```
You are a backend performance engineer. Optimize the database queries in app/api/generate/route.ts.

Current flow (sequential):
1. auth.getUser()
2. rateLimit()
3. fetch subscription
4. fetch profile
5. fetch client (if client_id provided)
6. fetch property (if property_id provided)
7. generateReplies()
8. insert generation
9. update trial count

Optimization:
1. After the rate limit check, run steps 3 and 4 in parallel using Promise.all:
   const [subResult, profileResult] = await Promise.all([
     serviceClient.from('rp_subscriptions').select('*').eq('user_id', user.id).single(),
     supabase.from('profiles').select('*').eq('id', user.id).single(),
   ])

2. After subscription and profile checks pass, run client and property fetches in parallel (if both IDs are provided):
   const [clientResult, propertyResult] = await Promise.all([
     body.client_id ? supabase.from('rp_clients').select('*').eq('id', body.client_id).single() : Promise.resolve({ data: null }),
     body.property_id ? supabase.from('rp_properties').select('*').eq('id', body.property_id).single() : Promise.resolve({ data: null }),
   ])

3. After generateReplies() completes, run the generation insert and trial count update in parallel:
   await Promise.all([
     serviceClient.from('rp_generations').insert({...}),
     sub.status === 'trial' ? serviceClient.from('rp_subscriptions').update({...}).eq('user_id', user.id) : Promise.resolve(),
   ])

Keep all existing error handling and business logic intact. Only change the execution order to use Promise.all where safe.

This should reduce average response time by 200-400ms.
```

---

### TASK-028 — Add API Response Caching for Templates

**Priority:** MEDIUM  
**Category:** Performance  
**Effort:** 15 min  

**Context:**  
System templates are the same for all users and never change. Every time a user opens the template selector, it fetches from Supabase. This is wasteful. Templates should be cached.

**The Prompt:**
```
You are a Next.js performance engineer. Add caching for the templates data.

System templates (is_system = true) are identical for all users and change rarely. They should be cached.

1. Create app/api/templates/route.ts (GET method):
   - Use createServiceRoleClient to fetch all system templates: SELECT * FROM rp_templates WHERE is_system = true ORDER BY category, name_hr
   - Add Next.js cache headers: return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
   - Also fetch user-specific templates: SELECT * FROM rp_templates WHERE user_id = user.id AND is_system = false
   - Return both: { system: [...], custom: [...] }

2. Update hooks/useTemplates.ts to fetch from /api/templates instead of directly from Supabase client
   - This allows the system templates to be cached at the CDN/edge level
   - User templates are still fetched fresh each time

3. Add the route to the middleware matcher exclusion (it's an API route so it's already excluded, but verify)

This reduces Supabase reads for templates from N per user session to ~1 per hour globally.
```

---

---

## SECTION 7 — FEATURES FOR LAUNCH

---

### TASK-029 — Add Email Verification Flow

**Priority:** HIGH  
**Category:** Feature / Security  
**Effort:** 30 min  

**Context:**  
Supabase sends a confirmation email on signup, but the app immediately redirects to /onboarding without waiting for email verification. Users with unverified emails can use the app fully. For a paid SaaS, email verification should be enforced before allowing generation.

**The Prompt:**
```
You are a full-stack Next.js engineer. Add email verification enforcement to ReplyPro.

Supabase Auth sends a confirmation email on signup. The user.email_confirmed_at field is null until they click the link.

Tasks:

1. In app/(dashboard)/layout.tsx (after TASK-020 is done), add a check:
   - Use useUser() to get the user
   - If user exists AND user.email_confirmed_at is null, show an "Email not verified" banner instead of the full dashboard
   - The banner should be full-screen: fixed inset-0 flex items-center justify-center bg-background
   - Content: 
     - MailCheck icon (h-12 w-12 text-primary)
     - Title: "Verify your email" / "Potvrdite email"
     - Description: "We sent a confirmation link to {user.email}. Click it to activate your account." / "Poslali smo link za potvrdu na {user.email}. Kliknite ga za aktivaciju računa."
     - "Resend email" button that calls supabase.auth.resend({ type: 'signup', email: user.email })
     - "I already verified" button that calls router.refresh() to re-check
     - Logout link

2. Update SignupForm.tsx to redirect to a /verify-email page instead of /onboarding after signup:
   - Create app/(auth)/verify-email/page.tsx with the same verification UI as above
   - This page is shown to users who just signed up and haven't verified yet

3. Add translation keys:
   - "auth.verify_title": "Verify your email" / "Potvrdite email"
   - "auth.verify_desc": "We sent a confirmation link to your email." / "Poslali smo link za potvrdu na vaš email."
   - "auth.verify_resend": "Resend email" / "Pošalji ponovo"
   - "auth.verify_done": "I already verified" / "Već sam potvrdio"
   - "auth.verify_sent": "Email sent!" / "Email poslan!"

Note: In Supabase dashboard, make sure "Enable email confirmations" is turned ON in Authentication > Settings.
```

---

### TASK-030 — Add Stripe Annual Plan Option

**Priority:** MEDIUM  
**Category:** Feature / Revenue  
**Effort:** 45 min  

**Context:**  
Currently only monthly billing is available (€29/month). Offering an annual plan (e.g., €249/year = ~€20.75/month, saving ~28%) increases LTV and reduces churn. Annual subscribers are 3-5x less likely to cancel.

**The Prompt:**
```
You are a full-stack engineer. Add an annual billing option to ReplyPro.

Prerequisites: Create a new Stripe Price in your Stripe dashboard for the annual plan (e.g., €249/year) and note the price ID.

1. Add a new environment variable: STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id

2. Update components/billing/PricingCard.tsx:
   - Add a billing period toggle: Monthly / Annual
   - Use local state: const [annual, setAnnual] = useState(false)
   - Toggle UI: a pill-shaped toggle with "Monthly" and "Annual" options
   - When Annual is selected, show: "€249/year" with a "Save 28%" badge in green
   - When Monthly is selected, show: "€29/month"
   - Add a small "Most popular" or "Best value" badge on the Annual option

3. Update app/api/stripe/checkout/route.ts:
   - Accept a body parameter: { annual?: boolean }
   - Use STRIPE_ANNUAL_PRICE_ID when annual is true, STRIPE_PRICE_ID when false
   - Pass the billing period in metadata: metadata: { user_id: user.id, plan: annual ? 'annual' : 'monthly' }

4. Update the checkout call in PricingCard.tsx to pass { annual } in the request body

5. Update the landing page pricing section in app/(marketing)/page.tsx:
   - Add the same monthly/annual toggle to the landing page pricing cards
   - Show the annual savings prominently

6. Add translation keys:
   - "billing.monthly": "Monthly" / "Mjesečno"
   - "billing.annual": "Annual" / "Godišnje"
   - "billing.save_percent": "Save 28%" / "Uštedite 28%"
   - "billing.annual_price": "€249/year" / "249€/godišnje"
   - "billing.annual_desc": "Billed annually" / "Naplaćuje se godišnje"
```

---

### TASK-031 — Add Reply Character Count & WhatsApp Optimization

**Priority:** MEDIUM  
**Category:** Feature / UX  
**Effort:** 20 min  

**Context:**  
Real estate agents primarily use WhatsApp. WhatsApp messages over ~1000 characters look overwhelming. Adding a character count to reply cards helps agents know if a reply is too long before sending.

**The Prompt:**
```
You are a React UX engineer. Add character count and WhatsApp optimization hints to reply cards.

In components/dashboard/ReplyCard.tsx:

1. Add a character count display in the card footer:
   - Show: "{n} chars" in text-xs text-muted-foreground
   - Color coding:
     - Under 300 chars: text-green-600 (perfect for WhatsApp)
     - 300-600 chars: text-muted-foreground (good)
     - Over 600 chars: text-amber-600 (might be long)
     - Over 1000 chars: text-destructive (too long for WhatsApp)
   - Update in real-time as user edits the text

2. Add a WhatsApp quick-send hint for short replies (under 300 chars):
   - Show a small WhatsApp icon (use the SVG path: M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z)
   - Color: #25D366 (WhatsApp green)
   - Tooltip on hover: "Short enough for WhatsApp" / "Dovoljno kratko za WhatsApp"

3. Update the character count in real-time when the user edits the reply in edit mode

4. In the message input (components/dashboard/MessageInput.tsx), also add a character count:
   - Show remaining characters: "{2000 - n} remaining" when over 1500 chars
   - Show in text-xs text-muted-foreground, right-aligned below the textarea
```

---

### TASK-032 — Add "Quick Reply" Mode

**Priority:** MEDIUM  
**Category:** Feature  
**Effort:** 45 min  

**Context:**  
Some agents want to generate a single reply quickly without choosing a tone. A "Quick Reply" mode that generates just the most appropriate single reply (based on the agent's preferred tone setting) would be faster for power users.

**The Prompt:**
```
You are a full-stack engineer. Add a Quick Reply mode to the ReplyPro dashboard.

Quick Reply generates a single reply using the agent's preferred tone setting, skipping the 3-tone output.

Backend changes (app/api/generate/route.ts):
1. Accept a new body parameter: quick_reply?: boolean
2. If quick_reply is true, modify the system prompt to only generate ONE reply (the preferred tone from profile.preferred_tone)
3. Return only the relevant tone in the response: { quick_reply: string, detected_language: string }
4. Still count as 1 generation against the trial limit

Frontend changes (app/(dashboard)/dashboard/page.tsx):
1. Add a toggle below the Generate button: "Quick Reply" / "3 Tones"
   - Use a small segmented control (pill toggle)
   - Default: "3 Tones"
   - Store preference in localStorage key 'rp-quick-reply-mode'

2. When Quick Reply is selected:
   - Change the Generate button label to "Quick Reply"
   - After generation, show a single large reply card (full width) instead of the 3-card grid
   - The card should have a "Copy & Done" button that copies and shows a success state

3. Add translation keys:
   - "dashboard.quick_reply": "Quick Reply" / "Brzi odgovor"
   - "dashboard.three_tones": "3 Tones" / "3 tona"
   - "dashboard.copy_done": "Copy & Done" / "Kopiraj i gotovo"

Keep the existing 3-tone mode completely unchanged.
```

---

---

## SECTION 8 — NICE-TO-HAVE (POST-LAUNCH)

---

### TASK-033 — Add Google Analytics / Plausible

**Priority:** MEDIUM  
**Category:** Analytics  
**Effort:** 20 min  

**The Prompt:**
```
You are a Next.js analytics engineer. Add privacy-friendly analytics to ReplyPro.

Use Plausible Analytics (GDPR-compliant, no cookies, no consent required) instead of Google Analytics.

1. Sign up at plausible.io and add replypro.hr as a site
2. Add the Plausible script to app/layout.tsx:
   <Script defer data-domain="replypro.hr" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
3. Import Script from 'next/script'
4. Add custom event tracking for key actions:
   - Create lib/utils/analytics.ts with a trackEvent(name: string, props?: Record<string, string>) function
   - Track: 'Generate Reply' (with tone count), 'Upgrade Click', 'Trial Expired', 'Copy Reply' (with tone)
   - Call window.plausible?.(name, { props }) — the ?. handles cases where the script hasn't loaded

5. Add trackEvent calls in:
   - app/(dashboard)/dashboard/page.tsx: after successful generation
   - components/billing/PricingCard.tsx: on checkout button click
   - components/dashboard/ReplyCard.tsx: on copy button click

No personal data should be tracked. Only event names and anonymous counts.
```

---

### TASK-034 — Add Intercom / Crisp Live Chat

**Priority:** MEDIUM  
**Category:** Support / Conversion  
**Effort:** 20 min  

**The Prompt:**
```
You are a Next.js engineer. Add Crisp live chat to ReplyPro (free tier, GDPR-compliant).

1. Sign up at crisp.chat (free plan supports 1 website)
2. Get your Website ID from the Crisp dashboard
3. Add NEXT_PUBLIC_CRISP_WEBSITE_ID to .env.local.example
4. Create components/ui/crisp-chat.tsx:
   - A client component that initializes Crisp on mount
   - Only initialize on marketing pages (/, /login, /signup) — not in the dashboard
   - Use useEffect to inject the Crisp script
   - Pre-fill user data when logged in: $crisp.push(['set', 'user:email', [user.email]])
5. Add CrispChat to app/(marketing)/layout.tsx
6. Style the Crisp widget to match the primary color: $crisp.push(['config', 'color:theme', ['#0F766E']])

This gives you a free support chat widget on the landing page to convert hesitant visitors.
```

---

### TASK-035 — Add Referral System

**Priority:** MEDIUM  
**Category:** Feature / Growth  
**Effort:** 90 min  

**The Prompt:**
```
You are a full-stack engineer. Add a simple referral system to ReplyPro.

Schema addition (add to supabase/migration.sql):
CREATE TABLE IF NOT EXISTS rp_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code text NOT NULL UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_rp_referrals_referrer ON rp_referrals(referrer_id);
CREATE INDEX idx_rp_referrals_code ON rp_referrals(referral_code);
ALTER TABLE rp_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON rp_referrals FOR SELECT USING (auth.uid() = referrer_id);

Feature:
1. Auto-generate a referral code for each user on first login (6-char alphanumeric, stored in profiles table — add referral_code text UNIQUE column)
2. Add a "Refer a friend" section to settings/page.tsx:
   - Show the user's referral link: https://replypro.hr/signup?ref={code}
   - Copy link button
   - Show count of successful referrals
   - Reward description: "Give a friend 1 free month. Get 1 free month when they subscribe."
3. In SignupForm.tsx, read the ?ref= query param and store it in localStorage
4. After successful payment (webhook checkout.session.completed), check if the new user has a referral code in their metadata and credit the referrer with 1 free month (add 30 days to current_period_end)
5. Add translation keys for the referral section
```

---

### TASK-036 — Add Dark Mode OG Image

**Priority:** LOW  
**Category:** Design  
**Effort:** 30 min  

**The Prompt:**
```
Create a specification for the ReplyPro Open Graph image (1200x630px) that a designer should produce.

The image should:
- Background: dark teal gradient (#0F766E to #0D9488)
- Top left: ReplyPro logo (white MessageSquare icon + "ReplyPro" wordmark in white)
- Center: Large headline in white: "Reply to clients in 5 seconds"
- Below headline: Three tone badge pills side by side: "Professional" (blue), "Friendly" (green), "Direct" (amber)
- Bottom right: "replypro.hr" in white/70 opacity
- Overall feel: clean, professional, modern

Also create a light mode version for email previews:
- Background: white
- Primary color accents
- Same content layout

Save as /public/og-image.png (dark) and /public/og-image-light.png (light).

Note: This task requires a designer or a tool like Figma/Canva. Alternatively, use Next.js ImageResponse (app/opengraph-image.tsx) to generate it programmatically.
```

---

## SECTION 9 — LAUNCH CHECKLIST

---

### Pre-Launch Verification Checklist

Run through every item below before going live. Check each one manually.

#### Security
- [ ] All credentials in .env.local.example are placeholder values (TASK-001)
- [ ] Real .env.local is in .gitignore and NOT committed to git
- [ ] STRIPE_WEBHOOK_SECRET is set in production environment
- [ ] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in production
- [ ] CSP headers are active (verify at securityheaders.com)
- [ ] HTTPS is enforced (HSTS header active)
- [ ] Supabase RLS is enabled on ALL tables (verify in Supabase dashboard)
- [ ] Service role key is ONLY used server-side (grep for SUPABASE_SERVICE_ROLE_KEY in client components — should be zero results)

#### Legal
- [ ] Privacy Policy has no [placeholder] values
- [ ] Terms of Service has no [placeholder] values
- [ ] Legal documents reviewed by a qualified Croatian lawyer
- [ ] Cookie consent banner is live
- [ ] GDPR data export works (test it)
- [ ] Account deletion works end-to-end (test it — creates Stripe cancellation + deletes user)
- [ ] Contact email (privacy@replypro.hr) is set up and monitored
- [ ] Company is registered in Croatia (OIB/VAT number available)

#### Payments
- [ ] Stripe is in LIVE mode (not test mode) in production
- [ ] Stripe webhook endpoint is registered in Stripe dashboard pointing to https://replypro.hr/api/stripe/webhook
- [ ] Webhook events subscribed: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted, customer.subscription.updated
- [ ] Test a full checkout flow end-to-end in production (use a real card, then refund)
- [ ] Stripe portal works (test manage subscription button)
- [ ] 14-day money-back guarantee process is defined (how will you handle refund requests?)

#### Functionality
- [ ] Signup → Onboarding → Generate flow works end-to-end
- [ ] Trial limit (10 generations) is enforced correctly
- [ ] Trial expired email is sent when limit is reached
- [ ] Forgot password flow works
- [ ] Google OAuth login works
- [ ] Account deletion works
- [ ] Data export works
- [ ] All 5 Stripe webhook events process correctly
- [ ] Rate limiting is active (test by sending 11+ requests quickly)
- [ ] Croatian language is default, English works correctly
- [ ] Dark mode works on all pages

#### Performance
- [ ] Lighthouse score > 85 on mobile (test at pagespeed.web.dev)
- [ ] First Contentful Paint < 2s on mobile
- [ ] No console errors in production
- [ ] No TypeScript errors (run: npx tsc --noEmit)
- [ ] No ESLint errors (run: npm run lint)

#### SEO & Marketing
- [ ] OG image is set and renders correctly (test at opengraph.xyz)
- [ ] robots.txt is accessible at replypro.hr/robots.txt
- [ ] sitemap.xml is accessible at replypro.hr/sitemap.xml
- [ ] Google Search Console is set up and sitemap submitted
- [ ] Domain email (info@replypro.hr, privacy@replypro.hr) is working
- [ ] Social media accounts created (LinkedIn, Instagram for Croatian market)

#### Infrastructure
- [ ] Custom domain (replypro.hr) is pointing to Vercel/hosting
- [ ] SSL certificate is valid and auto-renewing
- [ ] Environment variables are set in production (Vercel dashboard or equivalent)
- [ ] Error monitoring is set up (Sentry or similar — optional but recommended)
- [ ] Database backups are enabled in Supabase (Settings > Database > Backups)

---

## SECTION 10 — EXECUTION ORDER

Execute tasks in this exact order for the safest path to launch:

### Week 1 — Critical Fixes (Must Do Before Anything Else)
1. TASK-001 — Rotate credentials in .env.local.example
2. TASK-002 — Fix trial race condition
3. TASK-003 — Add security headers
4. TASK-004 — Fix rate limiter crash
5. TASK-005 — Fix TypeScript type mismatch
6. TASK-026 — Add env var validation guards

### Week 2 — Core UX & Legal
7. TASK-009 — Add forgot password flow
8. TASK-020 — Add onboarding redirect guard
9. TASK-021 — Complete legal documents (fill placeholders)
10. TASK-022 — Add cookie consent banner
11. TASK-023 — Add GDPR data export
12. TASK-024 — Add account deletion flow

### Week 3 — Quality & Polish
13. TASK-006 — Add error handling to hooks
14. TASK-007 — Fix delete account Stripe cancellation
15. TASK-008 — Fix middleware passthrough
16. TASK-010 — Add error boundaries
17. TASK-012 — Add loading skeletons
18. TASK-014 — Add confirmation dialogs
19. TASK-016 — Add OG/SEO meta tags

### Week 4 — Design & Conversion
20. TASK-011 — Redesign auth pages
21. TASK-013 — Improve landing page
22. TASK-015 — Improve mobile nav
23. TASK-017 — Improve toast notifications
24. TASK-019 — Improve empty states
25. TASK-025 — Next.js performance config

### Week 5 — Features & Launch Prep
26. TASK-027 — Optimize DB queries
27. TASK-029 — Email verification flow
28. TASK-031 — Character count & WhatsApp hints
29. TASK-033 — Add analytics
30. Run full Pre-Launch Checklist

### Post-Launch (First Month)
31. TASK-018 — Keyboard shortcuts
32. TASK-028 — Template caching
33. TASK-030 — Annual billing option
34. TASK-032 — Quick reply mode
35. TASK-034 — Live chat
36. TASK-035 — Referral system

---

## APPENDIX — DESIGN SYSTEM REFERENCE

The app uses a teal-based design system. When building new UI, use these values:

**Primary color:** hsl(164 72% 32%) — teal green  
**Font:** Inter (heading + body)  
**Border radius:** 0.75rem (lg), 1rem (xl), 1.25rem (2xl)  
**Card pattern:** rounded-2xl border bg-card  
**Section header pattern:** px-5 py-3.5 border-b bg-muted/20 with icon in bg-primary/10 rounded-lg  
**Button pattern:** rounded-lg (not rounded-xl) for inline buttons, rounded-xl for standalone CTAs  
**Spacing:** 6 (1.5rem) between major sections, 4 (1rem) between related elements  
**Animation:** Framer Motion for entrance animations, CSS transitions for hover states  
**Icons:** Lucide React only — no emojis as icons  

**Tone badge colors:**  
- Professional: blue-100/blue-700 (light) / blue-900/blue-300 (dark)  
- Friendly: green-100/green-700 (light) / green-900/green-300 (dark)  
- Direct: amber-100/amber-700 (light) / amber-900/amber-300 (dark)  

---

*Generated from full codebase audit — ReplyPro v1.0 Pre-Launch Plan*  
*Total tasks: 36 | Critical: 6 | High: 18 | Medium: 9 | Nice-to-have: 3*
