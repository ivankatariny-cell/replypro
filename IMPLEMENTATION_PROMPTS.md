# ReplyPro — Implementation Prompts
> Copy each prompt block exactly as written into your AI coding assistant (Kiro, Cursor, Claude, etc.).
> Each prompt is self-contained — it includes role, full context, exact files, and acceptance criteria.
> Execute in order within each phase. Do not skip Phase 1.

---

## PHASE 1 — SHIP IT (Critical fixes before any marketing)

---

### PROMPT 1.1 — Remove build error suppression

```
You are a senior Next.js engineer working on ReplyPro, a B2B SaaS AI reply generator for Croatian real estate agents built on Next.js 14, Supabase, Groq, Stripe, and Tailwind CSS.

TASK: Remove TypeScript and ESLint build suppression from next.config.mjs, then fix every error that surfaces.

CONTEXT:
- File: next.config.mjs
- Currently contains: typescript: { ignoreBuildErrors: true } and eslint: { ignoreDuringBuilds: true }
- These silently ship broken code to production. We need to know what is actually broken.

STEPS:
1. Open next.config.mjs
2. Remove the entire `typescript` block: typescript: { ignoreBuildErrors: true }
3. Remove the entire `eslint` block: eslint: { ignoreDuringBuilds: true }
4. Run: npm run build
5. For every TypeScript error that surfaces, fix it with the minimal correct change — do not change logic, only fix types
6. Run: npm run lint
7. Fix every ESLint error — do not disable rules, fix the actual issue
8. Run npm run build again until it exits 0 with no errors

CONSTRAINTS:
- Do not change any business logic while fixing type errors
- Do not add `// @ts-ignore` or `// eslint-disable` comments
- If a type error requires a schema change, flag it as a comment instead of silently casting

ACCEPTANCE CRITERIA:
- npm run build exits 0
- npm run lint exits 0
- next.config.mjs no longer contains ignoreBuildErrors or ignoreDuringBuilds
```

---

### PROMPT 1.2 — Wire payment confirmation emails to Stripe webhook

```
You are a senior full-stack engineer working on ReplyPro. You are implementing transactional email triggers for Stripe payment events.

TASK: Wire sendPaymentSuccessEmail and sendPaymentFailedEmail into the Stripe webhook handler.

CONTEXT:
- File to modify: app/api/stripe/webhook/route.ts
- Email functions already exist in: lib/resend/emails.ts
  - sendPaymentSuccessEmail(email: string, lang: 'hr' | 'en'): Promise<void>
  - sendPaymentFailedEmail(email: string, lang: 'hr' | 'en'): Promise<void>
- Database tables involved:
  - rp_subscriptions: has user_id, stripe_customer_id, stripe_subscription_id
  - profiles: has id (= user_id), language ('hr' | 'en')
- Supabase service role client is already available as: createServiceRoleClient() from @/lib/supabase/server
- auth.users table has email column, accessible via serviceClient.auth.admin.getUserById(userId)

CURRENT STATE of webhook handler:
- checkout.session.completed: updates rp_subscriptions status to 'active' — NO email sent
- invoice.payment_failed: updates rp_subscriptions status to 'past_due' — NO email sent
- Other events: invoice.payment_succeeded, customer.subscription.deleted, customer.subscription.updated

IMPLEMENTATION:

For checkout.session.completed:
1. After the existing supabase update call succeeds
2. Get userId from (obj.metadata as Record<string, string>)?.user_id
3. Fetch user email: const { data: authUser } = await supabase.auth.admin.getUserById(userId)
4. Fetch language: const { data: profileData } = await supabase.from('profiles').select('language').eq('id', userId).single()
5. Call: await sendPaymentSuccessEmail(authUser.user.email!, profileData?.language ?? 'hr')
6. Wrap in try/catch — email failure must NOT cause the webhook to return 500 (Stripe would retry)

For invoice.payment_failed:
1. After the existing supabase update call
2. Get stripe_subscription_id from obj.subscription
3. Fetch user_id: const { data: sub } = await supabase.from('rp_subscriptions').select('user_id').eq('stripe_subscription_id', subId).single()
4. Fetch email and language same as above
5. Call: await sendPaymentFailedEmail(email, lang)
6. Same try/catch pattern

CONSTRAINTS:
- Email errors must be caught and logged with console.error but must NOT propagate to the webhook response
- The webhook must still return { received: true } even if email sending fails
- Do not change the existing subscription update logic
- Import sendPaymentSuccessEmail and sendPaymentFailedEmail at the top of the file

ACCEPTANCE CRITERIA:
- A test Stripe checkout completion triggers a payment success email within 60 seconds
- A test payment failure triggers a payment failed email
- If Resend is down, the webhook still returns 200 and Stripe does not retry
```

---

### PROMPT 1.3 — Fix trial-low email trigger threshold

```
You are a senior full-stack engineer working on ReplyPro.

TASK: Fix a mismatch between the trial-low email subject line and the actual trigger condition.

CONTEXT:
- File: app/api/generate/route.ts
- The trial-low email subject (in lib/resend/emails.ts) says: "Imate još 3 besplatne generacije" (You have 3 free generations left)
- But the trigger condition currently fires when generationsRemaining === 1 (only 1 left)
- This means the email arrives too late to be useful as an upgrade nudge

CURRENT CODE (find this block near the bottom of the POST handler):
  if (generationsRemaining === 1) {
    // ... sendTrialLowEmail call
  }

FIX:
Change the condition from:
  if (generationsRemaining === 1)
To:
  if (generationsRemaining === 3)

That is the only change needed in this file.

ACCEPTANCE CRITERIA:
- When a trial user has used 7 of 10 generations (3 remaining), the trial-low email fires
- When a trial user has used 9 of 10 (1 remaining), the trial-low email does NOT fire again (it already fired at 3)
- Note: the current code does not deduplicate — it will fire every time remaining hits exactly 3. This is acceptable for now since a user hitting exactly 3 remaining happens once per trial.
```

---

### PROMPT 1.4 — Fix StatsCards label for Pro subscribers

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Fix an incorrect label shown to Pro subscribers in the StatsCards component.

CONTEXT:
- File: components/dashboard/StatsCards.tsx
- The third stat card shows "remaining" generations
- For active subscribers, `remaining` is set to the string '∞'
- The label used is t('dashboard.trial_remaining') which translates to "besplatnih generacija preostalo" (free generations remaining)
- Pro users see "∞ free generations remaining" — this is wrong and confusing

CURRENT CODE (find the stats array definition):
  { label: t('dashboard.trial_remaining'), value: remaining, ... }

FIX:
Change the label for the third stat to be conditional:
  label: subscription?.status === 'active' ? t('dashboard.unlimited') : t('dashboard.trial_remaining')

Translation keys already exist:
- t('dashboard.unlimited') = "Neograničene generacije" (HR) / "Unlimited generations" (EN)
- t('dashboard.trial_remaining') = "besplatnih generacija preostalo" (HR) / "free generations remaining" (EN)

ACCEPTANCE CRITERIA:
- Pro subscribers see "∞ Unlimited generations" (or the HR equivalent)
- Trial users still see "X free generations remaining"
- No other stat cards are changed
```

---

### PROMPT 1.5 — Clear message textarea after generation

```
You are a React engineer working on ReplyPro.

TASK: Clear the message input after a successful AI generation.

CONTEXT:
- File: app/(dashboard)/dashboard/page.tsx
- Component: DashboardContent (the inner component)
- State: const [message, setMessage] = useState('')
- The handleGenerate function sets replies but does NOT clear the message
- This forces users to manually delete the previous message before typing a new one — friction on the core loop

FIND this block inside handleGenerate (after the fetch succeeds):
  const data: GenerateResponse = await res.json()
  setReplies(data)
  setTemplateContext(null)
  setSuggestedBooking(data.suggestedBooking ?? null)

ADD after setReplies(data):
  setMessage('')

That is the only change needed.

ACCEPTANCE CRITERIA:
- After clicking Generate and receiving replies, the message textarea is empty
- The replies are still displayed
- The selectedClient and selectedProperty are NOT cleared (user may want to generate another reply for the same client/property)
```

---

### PROMPT 1.6 — Filter PropertySelector to active properties only

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Filter the PropertySelector dropdown to only show active properties.

CONTEXT:
- File: components/dashboard/PropertySelector.tsx
- This component renders a dropdown of properties for the user to link to a generation
- Currently shows ALL properties including sold, reserved, and inactive
- An agent should never generate a reply about a property they already sold

IMPLEMENTATION:
In the component, the properties list comes from either:
  a) useProperties() hook which returns all properties from the Zustand store, OR
  b) Direct Supabase query

Find where the properties array is used to render options.
Add a filter before rendering:
  const activeProperties = properties.filter(p => p.status === 'active')
Then use activeProperties instead of properties for the dropdown options.

The Property type has: status: 'active' | 'sold' | 'reserved' | 'inactive'

ACCEPTANCE CRITERIA:
- Only properties with status === 'active' appear in the dropdown
- Sold, reserved, and inactive properties are hidden
- If a user has no active properties, the dropdown shows the empty state (same as having no properties)
- The filter is client-side only — no DB query change needed
```

---

### PROMPT 1.7 — Fix calendar date navigation from BookingPrompt

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Make the calendar page navigate to the correct date when opened via the BookingPrompt link.

CONTEXT:
- File: app/(dashboard)/calendar/page.tsx
- After a user saves an appointment via BookingPrompt (components/dashboard/BookingPrompt.tsx), they are shown a link to "/calendar?date=YYYY-MM-DD"
- The calendar page currently ignores the ?date= query parameter entirely
- The user lands on the current month with no indication of where their new appointment is

CURRENT STATE:
- The page uses useState for currentMonth and selectedDay
- It does NOT use useSearchParams() anywhere

IMPLEMENTATION:
1. Add useSearchParams import from 'next/navigation' (already used elsewhere in the dashboard)
2. Wrap the page export in a Suspense boundary (required for useSearchParams in Next.js 14 App Router) — or add 'use client' if not already present
3. Inside the component, read the date param:
   const searchParams = useSearchParams()
   const dateParam = searchParams.get('date') // format: 'YYYY-MM-DD'
4. Add a useEffect that runs once on mount:
   useEffect(() => {
     if (!dateParam) return
     const date = new Date(dateParam + 'T00:00:00')
     if (isNaN(date.getTime())) return
     // Set the month view to show this date
     const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
     setCurrentMonth(monthStart)
     // Navigate to day view for this date
     setSelectedDay(date)
   }, [dateParam])
5. Clean the URL after navigation to avoid re-triggering on back navigation:
   window.history.replaceState({}, '', '/calendar')

CONSTRAINTS:
- The page is already 'use client' — no change needed there
- Do not break the existing view state (month/week toggle, weekStart, etc.)
- The date parsing must handle invalid dates gracefully (isNaN check)

ACCEPTANCE CRITERIA:
- Clicking "Open calendar" in BookingPrompt after saving an appointment navigates to the day view for that date
- The URL is cleaned after navigation (/calendar, no query param)
- Navigating to /calendar without a date param works exactly as before
```

---

### PROMPT 1.8 — Security: fix increment_trial_usage search_path

```
You are a Supabase/PostgreSQL engineer working on ReplyPro.

TASK: Fix a security advisory on the increment_trial_usage database function.

CONTEXT:
- Supabase security advisory: "Function public.increment_trial_usage has a role mutable search_path"
- A SECURITY DEFINER function with a mutable search_path can be exploited via search_path injection
- Fix: add SET search_path = '' to the function definition

CURRENT FUNCTION (for reference):
  CREATE OR REPLACE FUNCTION public.increment_trial_usage(p_user_id uuid)
    RETURNS TABLE(success boolean, generations_used integer, generations_limit integer)
    LANGUAGE plpgsql
    SECURITY DEFINER
  AS $function$
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
  $function$

RUN THIS MIGRATION in Supabase SQL editor:
  CREATE OR REPLACE FUNCTION public.increment_trial_usage(p_user_id uuid)
    RETURNS TABLE(success boolean, generations_used integer, generations_limit integer)
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
  AS $function$
  DECLARE
    v_used integer;
    v_limit integer;
    v_status text;
  BEGIN
    SELECT trial_generations_used, trial_generations_limit, status
      INTO v_used, v_limit, v_status
      FROM public.rp_subscriptions
     WHERE user_id = p_user_id
       FOR UPDATE;

    IF v_status != 'trial' OR v_used >= v_limit THEN
      RETURN QUERY SELECT false, v_used, v_limit;
      RETURN;
    END IF;

    UPDATE public.rp_subscriptions
       SET trial_generations_used = trial_generations_used + 1
     WHERE user_id = p_user_id;

    RETURN QUERY SELECT true, v_used + 1, v_limit;
  END;
  $function$;

NOTE: When search_path = '', all table references must be schema-qualified (public.rp_subscriptions). The body above already includes this.

ACCEPTANCE CRITERIA:
- Supabase security advisor no longer flags increment_trial_usage
- The function still works correctly: calling it during a trial generation increments the counter atomically
- Test: generate a reply as a trial user and confirm trial_generations_used increments by 1
```

---

### PROMPT 1.9 — Security: fix profiles INSERT RLS policy

```
You are a Supabase/PostgreSQL engineer working on ReplyPro.

TASK: Add a WITH CHECK clause to the profiles INSERT RLS policy.

CONTEXT:
- Table: profiles
- Current INSERT policy: "Users can insert own profile" — has no WITH CHECK clause
- Without WITH CHECK, an authenticated user could theoretically insert a profile row for a different user's ID
- The handle_new_user trigger creates the row automatically, so direct INSERT is rare, but the policy should be hardened

RUN THIS MIGRATION in Supabase SQL editor:
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

ACCEPTANCE CRITERIA:
- The policy exists with a WITH CHECK clause
- A user cannot insert a profile row with an id different from their own auth.uid()
- The handle_new_user trigger still works (it runs as SECURITY DEFINER, bypasses RLS)
```

---

---

## PHASE 2 — EARN IT (Retention & conversion features)

---

### PROMPT 2.1 — Onboarding demo does not burn a trial generation

```
You are a senior full-stack engineer working on ReplyPro.

TASK: Prevent the onboarding demo generation from consuming one of the user's 10 free trial generations.

CONTEXT:
- File 1: components/onboarding/OnboardingForm.tsx
- File 2: app/api/generate/route.ts
- Problem: OnboardingForm step 2 calls /api/generate with a sample message. This burns 1 of 10 trial generations before the user has used the product for a real client message.
- The user then sees "Vaš prvi odgovor! Imate još 9 besplatnih generacija." — they feel cheated before they start.

IMPLEMENTATION:

Step 1 — Frontend (components/onboarding/OnboardingForm.tsx):
Find the handleDemo function. It calls fetch('/api/generate', { body: JSON.stringify({ message: sampleMessage }) }).
Change the body to include a demo flag:
  body: JSON.stringify({ message: sampleMessage, demo: true })

Step 2 — Backend (app/api/generate/route.ts):
1. Read the demo flag from the request body:
   const isDemo = body.demo === true
2. Add a condition: only skip trial increment if isDemo is true AND trial_generations_used === 0
   This prevents abuse (someone calling the API with demo:true repeatedly)
3. Find the block that calls increment_trial_usage() RPC. Wrap it:
   if (sub.status === 'trial' && !isDemo) {
     // existing increment_trial_usage() RPC call and email logic
   } else if (sub.status === 'trial' && isDemo) {
     generationsRemaining = sub.trial_generations_limit - sub.trial_generations_used
   }
4. The generation is still saved to rp_generations (the demo reply should appear in history)
5. The response still returns generations_remaining correctly

CONSTRAINTS:
- The demo flag only skips the counter increment — the generation is still saved to DB
- If demo:true is sent by a non-onboarding context (e.g. API abuse), the check trial_generations_used === 0 prevents free generations
- Do not add demo to the GenerateRequest type in types/index.ts as a required field — read it as body.demo with a fallback to false

ACCEPTANCE CRITERIA:
- A new user completes onboarding, generates the demo reply, and still has 10 generations remaining
- The demo reply appears in their generation history
- A user who has already used 1+ generations cannot exploit demo:true to skip counting
- Existing non-demo generations are unaffected
```

---

### PROMPT 2.2 — Auto-trigger checkout from TrialBanner

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Make the "Upgrade to Pro" link in TrialBanner auto-trigger the Stripe checkout flow.

CONTEXT:
- File 1: components/dashboard/TrialBanner.tsx
- File 2: app/(dashboard)/billing/page.tsx
- Current behavior: TrialBanner shows "Nadogradite na Pro →" linking to /billing. User lands on billing page and must click "Activate Pro" again. That is one extra click at the highest-intent moment.

IMPLEMENTATION:

Step 1 — TrialBanner (components/dashboard/TrialBanner.tsx):
Find the upgrade link. Currently:
  <Link href="/billing">
Change to:
  <Link href="/billing?checkout=1">

Step 2 — Billing page (app/(dashboard)/billing/page.tsx):
1. Add useSearchParams import from 'next/navigation'
2. Wrap the page in Suspense if not already (required for useSearchParams in Next.js 14)
3. Read the param:
   const searchParams = useSearchParams()
   const autoCheckout = searchParams.get('checkout') === '1'
4. Add a useEffect:
   useEffect(() => {
     if (autoCheckout && !isActiveSubscriber && !loading) {
       handleCheckout()
       window.history.replaceState({}, '', '/billing')
     }
   }, [autoCheckout, isActiveSubscriber, loading])
5. The loading state comes from useSubscription() — wait for it to resolve before auto-triggering

CONSTRAINTS:
- Only auto-trigger if subscription status is NOT active (don't redirect active subscribers to checkout)
- Clean the URL after triggering (replaceState)
- handleCheckout is already defined in the billing page — do not duplicate it
- The manual "Activate Pro" button must still work for users who navigate to /billing directly

ACCEPTANCE CRITERIA:
- Clicking "Upgrade to Pro" in TrialBanner immediately redirects to Stripe checkout (no intermediate click)
- Navigating to /billing directly still shows the pricing card with the manual button
- Active subscribers navigating to /billing?checkout=1 are NOT redirected to checkout
```

---

### PROMPT 2.3 — Client edit UI

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Add inline edit functionality to the clients list.

CONTEXT:
- File: app/(dashboard)/clients/page.tsx
- The rp_clients table supports UPDATE (RLS policy exists)
- The Zustand store has updateClient(id, data) in store/app-store.ts
- Translation keys already exist: clients.edit, clients.save_changes, clients.updated (in both locales/en.json and locales/hr.json)
- Currently there is NO edit UI — users cannot modify a client after creation

CURRENT CLIENT ROW STRUCTURE:
Each client renders as a flex row with: avatar, name+status+contact info, status dropdown, delete button.

IMPLEMENTATION:
1. Add state: const [editingId, setEditingId] = useState<string | null>(null)
2. Add state: const [editForm, setEditForm] = useState<Partial<typeof form>>({})
3. Add an "Edit" button to each client row (pencil icon from lucide-react: Pencil)
   - On click: setEditingId(client.id) and setEditForm({ full_name: client.full_name, phone: client.phone ?? '', email: client.email ?? '', city: client.city ?? '', property_interest: client.property_interest ?? '', budget_min: String(client.budget_min ?? ''), budget_max: String(client.budget_max ?? ''), notes: client.notes ?? '' })
4. When editingId === client.id, replace the info section with an inline edit form (same fields as the add form)
5. Add a handleUpdate function:
   const handleUpdate = async (id: string) => {
     const supabase = createSupabase()
     const { error } = await supabase.from('rp_clients').update({
       full_name: editForm.full_name?.trim(),
       phone: editForm.phone || null,
       email: editForm.email || null,
       city: editForm.city || null,
       property_interest: editForm.property_interest || null,
       budget_min: editForm.budget_min ? parseInt(editForm.budget_min) : null,
       budget_max: editForm.budget_max ? parseInt(editForm.budget_max) : null,
       notes: editForm.notes || null,
     }).eq('id', id)
     if (!error) {
       updateClientStore(id, { ...editForm, budget_min: editForm.budget_min ? parseInt(editForm.budget_min) : null, budget_max: editForm.budget_max ? parseInt(editForm.budget_max) : null })
       setEditingId(null)
       toast(t('clients.updated'), 'success')
     }
   }
6. Add Save and Cancel buttons in the edit form

CONSTRAINTS:
- The edit form appears inline (not a modal) — expand the row in place
- Only one client can be in edit mode at a time
- Clicking edit on a different client while one is open should close the first and open the new one
- The status dropdown and delete button remain visible even in edit mode

ACCEPTANCE CRITERIA:
- Clicking the edit icon on a client row expands it into an editable form
- Saving updates the client in DB and in the Zustand store
- The updated data is immediately visible without a page refresh
- Cancelling discards changes
- t('clients.updated') toast appears on success
```

---

### PROMPT 2.4 — Property edit UI and status management

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Add inline edit functionality and status management to the properties grid.

CONTEXT:
- File: app/(dashboard)/properties/page.tsx
- The rp_properties table supports UPDATE (RLS policy exists)
- The Zustand store has updateProperty(id, data) in store/app-store.ts
- Translation keys already exist: properties.edit, properties.save_changes, properties.updated
- Currently there is NO edit UI and NO way to change property status (sold, reserved, inactive)
- Agents mark sold properties by deleting them — this destroys history

IMPLEMENTATION:

Part A — Status change:
1. Add a status dropdown to each property card (same pattern as client status dropdown)
2. Status options: active, sold, reserved, inactive
3. Labels (use language-aware):
   HR: { active: 'Aktivno', sold: 'Prodano', reserved: 'Rezervirano', inactive: 'Neaktivno' }
   EN: { active: 'Active', sold: 'Sold', reserved: 'Reserved', inactive: 'Inactive' }
4. Status colors:
   active: green, sold: muted, reserved: amber, inactive: muted-foreground
5. On change:
   const handleStatusChange = async (id: string, status: Property['status']) => {
     const supabase = createClient()
     const { error } = await supabase.from('rp_properties').update({ status }).eq('id', id)
     if (!error) updateProperty(id, { status })
   }

Part B — Edit form:
1. Add state: const [editingId, setEditingId] = useState<string | null>(null)
2. Add an edit button (Pencil icon) to each property card — visible on hover (same pattern as delete button)
3. When editingId === prop.id, replace the card content with an edit form (same fields as the add form)
4. handleUpdate function:
   const handleUpdate = async (id: string) => {
     const supabase = createClient()
     const { error } = await supabase.from('rp_properties').update({
       title: editForm.title.trim(),
       address: editForm.address || null,
       city: editForm.city || null,
       price: editForm.price ? parseInt(editForm.price) : null,
       sqm: editForm.sqm ? parseInt(editForm.sqm) : null,
       rooms: editForm.rooms ? parseInt(editForm.rooms) : null,
       description: editForm.description || null,
       property_type: editForm.property_type,
     }).eq('id', id)
     if (!error) {
       updateProperty(id, { ...editForm, price: editForm.price ? parseInt(editForm.price) : null, sqm: editForm.sqm ? parseInt(editForm.sqm) : null, rooms: editForm.rooms ? parseInt(editForm.rooms) : null })
       setEditingId(null)
       toast(t('properties.updated'), 'success')
     }
   }

CONSTRAINTS:
- Status change is immediate (no edit mode required)
- Edit mode replaces the card content inline
- The delete button remains accessible in edit mode

ACCEPTANCE CRITERIA:
- Status dropdown appears on each property card
- Changing status updates DB and store immediately
- Edit button opens inline edit form
- Saving updates DB and store, closes edit mode
- t('properties.updated') toast appears on success
```

---

### PROMPT 2.5 — Show client name on history items

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Display the linked client name on each history item.

CONTEXT:
- File: components/history/HistoryItem.tsx
- The Generation type has: client_id: string | null (FK to rp_clients)
- The Zustand store has: clients: Client[] (loaded by useClients hook)
- Currently HistoryItem shows the original message and reply tones but NOT which client it was for
- An agent searching for "what did I say to Marko last week" has no way to identify the generation

IMPLEMENTATION:
1. Import useAppStore from @/store/app-store
2. Inside HistoryItem, get the clients list:
   const clients = useAppStore((s) => s.clients)
3. Look up the client name:
   const clientName = gen.client_id ? (clients.find(c => c.id === gen.client_id)?.full_name ?? null) : null
4. If clientName is not null, render a small badge/chip below the original message:
   <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
     <User className="h-3 w-3" />
     {clientName}
   </span>
   (User icon from lucide-react)

CONSTRAINTS:
- No extra DB query — use the Zustand store only
- If the client has been deleted (client_id exists but no matching client in store), show nothing
- The badge should be subtle — not the primary focus of the item

ACCEPTANCE CRITERIA:
- History items linked to a client show the client's full_name
- History items with no client_id show nothing extra
- No additional network requests are made
```

---

### PROMPT 2.6 — Post-generation nudge to add/link client

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: After a generation completes with no client linked, show a subtle nudge to link or add a client.

CONTEXT:
- File: app/(dashboard)/dashboard/page.tsx
- Component: DashboardContent
- State: selectedClient (string | null), replies (GenerateResponse | null)
- Problem: 0 clients have been added across all 5 users. The CRM is the stickiest feature but users never discover it.

IMPLEMENTATION:
In the results section (where replies are shown), after the ReplyGrid, add a conditional:
  {replies && !loading && !selectedClient && (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4 shrink-0" />
        <span>
          {language === 'hr'
            ? 'Povežite ovaj odgovor s klijentom za bolji kontekst sljedeći put'
            : 'Link this reply to a client for better context next time'}
        </span>
      </div>
      <Link
        href="/clients"
        className="shrink-0 text-xs font-medium text-primary hover:underline cursor-pointer"
      >
        {language === 'hr' ? 'Dodaj klijenta →' : 'Add client →'}
      </Link>
    </div>
  )}

Import Users from lucide-react (already imported in the file).
Import Link from next/link (already imported).
Use the language value from useTranslation().

CONSTRAINTS:
- Only show when: replies is not null AND loading is false AND selectedClient is null
- Do not show when a client is already selected
- This is a nudge, not a blocker — it should be visually subtle (dashed border, muted background)
- Do not add this to the translation files — inline strings are fine for this small nudge

ACCEPTANCE CRITERIA:
- After generating a reply with no client selected, the nudge appears below the reply grid
- After generating a reply WITH a client selected, the nudge does not appear
- Clicking "Add client →" navigates to /clients
- The nudge disappears when the user generates a new reply (replies resets to null during loading)
```

---

### PROMPT 2.7 — Generation history pagination

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Add cursor-based pagination to the generation history page.

CONTEXT:
- File 1: hooks/useGenerations.ts — currently fetches .limit(50), newest first
- File 2: app/(dashboard)/history/page.tsx — renders all loaded generations
- File 3: store/app-store.ts — has appendGenerations(g: Generation[]) already defined but unused
- Problem: An active agent generating 10 replies/day hits the 50-item limit in 5 days

IMPLEMENTATION:

Step 1 — Update useGenerations hook (hooks/useGenerations.ts):
1. Add a refetch/loadMore function that accepts an offset:
   const loadMore = async (offset: number) => {
     if (!user) return
     const supabase = createClient()
     const { data, error } = await supabase
       .from('rp_generations')
       .select('*')
       .eq('user_id', user.id)
       .order('created_at', { ascending: false })
       .range(offset, offset + 49)
     if (!error && data) appendGenerations(data)
     return data?.length ?? 0
   }
2. Add hasMore state: const [hasMore, setHasMore] = useState(true)
3. In the initial load, if data.length < 50, setHasMore(false)
4. Return loadMore and hasMore from the hook

Step 2 — Update history page (app/(dashboard)/history/page.tsx):
1. Get loadMore and hasMore from useGenerations()
2. Add state: const [loadingMore, setLoadingMore] = useState(false)
3. Add a "Load more" button at the bottom of the list, shown only when hasMore is true:
   <button
     onClick={async () => {
       setLoadingMore(true)
       const loaded = await loadMore(generations.length)
       if (loaded < 50) setHasMore(false) // hook should handle this but belt-and-suspenders
       setLoadingMore(false)
     }}
     disabled={loadingMore}
     className="w-full rounded-xl border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
   >
     {loadingMore ? 'Loading...' : (language === 'hr' ? 'Učitaj više' : 'Load more')}
   </button>

CONSTRAINTS:
- The initial load of 50 is unchanged
- appendGenerations in the store prepends — change it to append for pagination:
  In store/app-store.ts, appendGenerations: (g) => set((s) => ({ generations: [...s.generations, ...g] }))
  (Currently it does this correctly — verify before changing)
- The search and language filter still apply to all loaded generations (client-side filter)
- Do not implement infinite scroll — a manual "Load more" button is sufficient

ACCEPTANCE CRITERIA:
- Initial load shows 50 most recent generations
- "Load more" button appears when there are more than 50 generations
- Clicking it loads the next 50 and appends them to the list
- When all generations are loaded, the button disappears
- Search and language filter work across all loaded generations
```

---

### PROMPT 2.8 — Password change in Settings

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Add a password change section to the Settings page.

CONTEXT:
- File: app/(dashboard)/settings/page.tsx
- Currently has: Profile, Account info, Export data, Danger zone
- Missing: password change — users who want to change their password must use the "forgot password" flow

IMPLEMENTATION:
Add a new section between "Account" and "Export data":

1. Add state:
   const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
   const [pwLoading, setPwLoading] = useState(false)

2. Add handler:
   const handlePasswordChange = async () => {
     if (pwForm.next !== pwForm.confirm) {
       toast(t('auth.passwords_no_match'), 'error')
       return
     }
     if (pwForm.next.length < 6) {
       toast(language === 'hr' ? 'Lozinka mora imati najmanje 6 znakova.' : 'Password must be at least 6 characters.', 'error')
       return
     }
     setPwLoading(true)
     const supabase = createClient()
     // Verify current password by re-authenticating
     const { error: signInError } = await supabase.auth.signInWithPassword({
       email: user!.email!,
       password: pwForm.current,
     })
     if (signInError) {
       toast(language === 'hr' ? 'Trenutna lozinka nije ispravna.' : 'Current password is incorrect.', 'error')
       setPwLoading(false)
       return
     }
     const { error } = await supabase.auth.updateUser({ password: pwForm.next })
     if (!error) {
       toast(language === 'hr' ? 'Lozinka promijenjena.' : 'Password changed.', 'success')
       setPwForm({ current: '', next: '', confirm: '' })
     } else {
       toast(error.message, 'error')
     }
     setPwLoading(false)
   }

3. Render the section (same card pattern as other sections):
   - Section icon: Lock from lucide-react
   - Title: language === 'hr' ? 'Promjena lozinke' : 'Change password'
   - Three Input fields: Current password, New password, Confirm new password (all type="password")
   - Submit button with loading state

CONSTRAINTS:
- All three fields are required before the button is enabled
- The current password verification happens client-side via signInWithPassword (this is the standard Supabase pattern)
- Do not store the current password anywhere — use it only for the signInWithPassword call
- Clear all three fields on success

ACCEPTANCE CRITERIA:
- The password change section appears in Settings between Account and Export
- Entering wrong current password shows an error toast
- Entering mismatched new passwords shows an error toast
- Successful change shows success toast and clears the form
- The user remains logged in after changing password
```

---

### PROMPT 2.9 — Appointment color coding by type

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Add visual color coding to calendar appointments based on whether they have a property or client linked.

CONTEXT:
- Files: components/calendar/MonthGrid.tsx, components/calendar/WeekGrid.tsx, components/calendar/DayView.tsx
- The Appointment type has: client_id (uuid | null), property_id (uuid | null)
- Currently all appointment cards/dots look identical
- An agent with 5 appointments in a week cannot visually distinguish a property viewing from a general meeting

COLOR SCHEME:
- Has property_id: primary color (teal) — bg-primary/15 border-primary/30 text-primary
- Has client_id only (no property): info color (blue) — bg-info/15 border-info/30 text-info  
- Neither: muted — bg-muted border-border text-muted-foreground

IMPLEMENTATION:
Create a helper function (add it near the top of each file, or in a shared util):
  function getAppointmentColor(appt: Appointment) {
    if (appt.property_id) return { bg: 'bg-primary/15', border: 'border-primary/30', text: 'text-primary', dot: 'bg-primary' }
    if (appt.client_id) return { bg: 'bg-info/15', border: 'border-info/30', text: 'text-info', dot: 'bg-info' }
    return { bg: 'bg-muted/50', border: 'border-border', text: 'text-muted-foreground', dot: 'bg-muted-foreground' }
  }

Apply the color classes to:
- MonthGrid: the appointment dot/chip shown in each day cell
- WeekGrid: the appointment card background and border
- DayView: the appointment card background and border

CONSTRAINTS:
- The color is derived from the appointment data — no new DB queries
- The Appointment objects already have client_id and property_id from the store
- Do not change the appointment card layout — only change color classes

ACCEPTANCE CRITERIA:
- Appointments with a property linked show in teal
- Appointments with only a client linked show in blue
- Appointments with neither show in muted gray
- The color is consistent across month, week, and day views
```

---

---

## PHASE 3 — SCALE IT (Growth & monetization)

---

### PROMPT 3.1 — Implement quick_reply mode

```
You are a senior full-stack engineer working on ReplyPro.

TASK: Implement the quick_reply mode — return only the direct tone reply for faster response on mobile.

CONTEXT:
- File 1: types/index.ts — GenerateRequest already has quick_reply?: boolean (defined but unused)
- File 2: app/api/generate/route.ts — the field is read from body but ignored
- File 3: lib/groq/client.ts — generateReplies() always returns all 3 tones
- Use case: mobile agents who want a single fast reply without choosing a tone

IMPLEMENTATION:

Step 1 — lib/groq/client.ts:
Add an optional quickReply parameter to generateReplies:
  export async function generateReplies(
    systemPrompt: string,
    userMessage: string,
    quickReply = false
  )
If quickReply is true, change the system prompt instruction to request only the direct tone:
  const effectivePrompt = quickReply
    ? systemPrompt + '\n\nQUICK REPLY MODE: Return ONLY the "direct" tone. Set "professional" and "friendly" to empty strings "".'
    : systemPrompt

Step 2 — app/api/generate/route.ts:
1. Read: const isQuickReply = body.quick_reply === true
2. Pass to generateReplies: const aiResult = await generateReplies(enrichedPrompt, message, isQuickReply)
3. If isQuickReply, the response still has all 3 fields but professional and friendly will be empty strings

Step 3 — app/(dashboard)/dashboard/page.tsx:
Add a toggle button near the GenerateButton:
  const [quickReply, setQuickReply] = useState(false)
  <button
    onClick={() => setQuickReply(!quickReply)}
    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${quickReply ? 'bg-primary/10 border-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
  >
    <Zap className="h-3.5 w-3.5" />
    {language === 'hr' ? 'Brzi odgovor' : 'Quick reply'}
  </button>
Include quick_reply in the fetch body: body: JSON.stringify({ ..., quick_reply: quickReply })

Step 4 — ReplyGrid (components/dashboard/ReplyGrid.tsx):
When professional and friendly are empty strings, only render the direct card (full width).

CONSTRAINTS:
- quick_reply mode still saves to rp_generations with empty strings for professional/friendly
- The trial counter still increments for quick_reply generations
- The BookingPrompt still appears if a date is detected

ACCEPTANCE CRITERIA:
- Toggling "Quick reply" and generating returns only the direct tone card
- The direct card renders full-width when it's the only one
- quick_reply: false (default) behavior is completely unchanged
- The toggle state resets to false after page refresh
```

---

### PROMPT 3.2 — Webhook event logging table

```
You are a Supabase/PostgreSQL engineer and Next.js developer working on ReplyPro.

TASK: Add structured logging for Stripe webhook events to gain visibility into payment processing.

CONTEXT:
- File: app/api/stripe/webhook/route.ts
- Currently: webhook events are processed with console.error on failure — zero visibility into success/failure rates
- Risk: a silent webhook failure means a user pays but their subscription is never activated
- This is the highest-risk area of the architecture

STEP 1 — Create the table (run in Supabase SQL editor):
  CREATE TABLE IF NOT EXISTS public.rp_webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text NOT NULL,
    event_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text NOT NULL CHECK (status IN ('processed', 'failed', 'skipped')),
    error_message text,
    created_at timestamptz DEFAULT now()
  );

  -- Index for querying by event_id (idempotency check)
  CREATE UNIQUE INDEX IF NOT EXISTS rp_webhook_events_event_id_idx ON public.rp_webhook_events(event_id);

  -- RLS: only service role can access
  ALTER TABLE public.rp_webhook_events ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Service role only" ON public.rp_webhook_events
    FOR ALL USING (auth.role() = 'service_role');

STEP 2 — Update webhook handler (app/api/stripe/webhook/route.ts):
1. After each switch case completes successfully, insert a log row:
   await supabase.from('rp_webhook_events').insert({
     event_id: event.id,
     event_type: event.type,
     user_id: userId ?? null,
     status: 'processed',
   }).onConflict('event_id').ignore() // idempotency: skip if already processed

2. In the catch block, insert a failed log:
   await supabase.from('rp_webhook_events').insert({
     event_id: event.id,
     event_type: event.type,
     status: 'failed',
     error_message: err instanceof Error ? err.message : String(err),
   }).onConflict('event_id').ignore()

3. For events with no matching case (default), insert status: 'skipped'

CONSTRAINTS:
- The logging insert must NOT throw — wrap in try/catch
- A logging failure must not change the webhook response
- The unique index on event_id provides idempotency (Stripe retries send the same event_id)

ACCEPTANCE CRITERIA:
- Every processed Stripe event has a row in rp_webhook_events
- Failed events have status='failed' with the error message
- Re-delivered events (same event_id) are silently ignored
- The table is only accessible via service role
```

---

### PROMPT 3.3 — Remove dead code and clean up types

```
You are a TypeScript engineer working on ReplyPro.

TASK: Remove dead code and clean up unused type definitions.

CONTEXT:
Files to clean:
1. store/app-store.ts — appendGenerations is defined but was never called (it will be used after Prompt 2.7 pagination is implemented — skip this if 2.7 is done)
2. types/index.ts — quick_reply?: boolean in GenerateRequest was unused (it will be used after Prompt 3.1 — skip if 3.1 is done)

ITEMS TO CLEAN (only if the corresponding feature prompt has NOT been implemented):

Item 1 — If Prompt 2.7 (pagination) has NOT been implemented:
In store/app-store.ts, either:
  a) Remove appendGenerations from the interface and implementation, OR
  b) Add a TODO comment: // Used by pagination — implement Prompt 2.7 before removing
Do NOT remove it if pagination has been implemented.

Item 2 — If Prompt 3.1 (quick_reply) has NOT been implemented:
In types/index.ts, either:
  a) Remove quick_reply?: boolean from GenerateRequest, OR
  b) Add a TODO comment: // Used by quick_reply mode — implement Prompt 3.1 before removing
Do NOT remove it if quick_reply has been implemented.

Item 3 — Always do this:
In app/api/generate/route.ts, find:
  const { data: rpcResult, error: rpcError } = await serviceClient
    .rpc('increment_trial_usage', { p_user_id: user.id })
    .single()
Verify the .single() call is correct for a function that returns a TABLE type. If it causes issues, change to:
  const { data: rpcResults, error: rpcError } = await serviceClient
    .rpc('increment_trial_usage', { p_user_id: user.id })
  const rpcResult = rpcResults?.[0]

ACCEPTANCE CRITERIA:
- No TypeScript errors after cleanup
- No unused exports remain
- The items marked with TODO are clearly flagged for future implementation
```

---

## STANDALONE PROMPTS (can be run any time, no dependencies)

---

### PROMPT S.1 — Enable Supabase leaked password protection

```
This is a Supabase dashboard configuration task, not a code change.

TASK: Enable leaked password protection in Supabase Auth.

STEPS:
1. Go to Supabase Dashboard → your project
2. Navigate to: Authentication → Settings (or Auth → Configuration)
3. Find: "Password Security" section
4. Enable: "Leaked password protection" (checks passwords against HaveIBeenPwned.org)
5. Save

This prevents users from setting passwords that have appeared in known data breaches.

No code changes required. No deployment needed.

VERIFICATION:
- Try signing up with the password "password123" — it should be rejected
- The Supabase security advisor should no longer flag "Leaked Password Protection Disabled"
```

---

### PROMPT S.2 — Add favorites label editing

```
You are a React/TypeScript engineer and Supabase developer working on ReplyPro.

TASK: Allow users to edit the label on saved favorites.

CONTEXT:
- Table: rp_favorites — has a label column (text, nullable)
- File: app/(dashboard)/favorites/page.tsx
- Problem: rp_favorites has NO UPDATE RLS policy — labels can be set on creation but never changed
- The label field exists in the schema but is currently a dead end

STEP 1 — Add UPDATE RLS policy (run in Supabase SQL editor):
  CREATE POLICY "Users can update own favorites"
    ON public.rp_favorites
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

STEP 2 — Add label edit UI (app/(dashboard)/favorites/page.tsx):
1. Add state: const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
2. Add state: const [labelValue, setLabelValue] = useState('')
3. In each favorite card header, add a label display:
   - If fav.label: show the label text with an edit (Pencil) icon
   - If no label: show a faint "+ Add label" button
4. On click, set editingLabelId and labelValue
5. Show an inline input when editingLabelId === fav.id
6. On save:
   const supabase = createClient()
   await supabase.from('rp_favorites').update({ label: labelValue.trim() || null }).eq('id', fav.id)
   // Update local state — add updateFavorite to Zustand store if not present, or refetch
7. On cancel: setEditingLabelId(null)

STEP 3 — Add updateFavorite to Zustand store (store/app-store.ts):
  updateFavorite: (id: string, data: Partial<Favorite>) => void
  // Implementation:
  updateFavorite: (id, data) => set((s) => ({
    favorites: s.favorites.map((f) => (f.id === id ? { ...f, ...data } : f)),
  }))

CONSTRAINTS:
- The label is optional — saving an empty label sets it to null
- The label edit is inline, not a modal
- Only the label is editable — content and tone are immutable

ACCEPTANCE CRITERIA:
- Clicking the label area on a favorite card opens an inline text input
- Saving updates the label in DB and in the Zustand store
- The updated label is immediately visible
- Saving an empty label removes the label (sets to null)
```

---

### PROMPT S.3 — Client detail panel with linked generations

```
You are a React/TypeScript engineer working on ReplyPro.

TASK: Add a collapsible panel to each client row showing all AI generations linked to that client.

CONTEXT:
- File: app/(dashboard)/clients/page.tsx
- The rp_generations table has client_id (FK to rp_clients)
- The Zustand store has generations: Generation[] (loaded by useGenerations hook)
- This is the core CRM value prop: "see everything you've ever said to this client"

IMPLEMENTATION:
1. Add state: const [expandedClientId, setExpandedClientId] = useState<string | null>(null)
2. Add a "History" button to each client row (History icon from lucide-react)
   - On click: toggle expandedClientId
3. When expandedClientId === client.id, render a panel below the client row:
   const clientGenerations = generations.filter(g => g.client_id === client.id)
   
   If clientGenerations.length === 0:
     <p className="text-xs text-muted-foreground px-5 py-3">
       {language === 'hr' ? 'Nema generiranih odgovora za ovog klijenta.' : 'No generated replies for this client yet.'}
     </p>
   
   If clientGenerations.length > 0:
     Render a compact list of generations, newest first:
     - Date (formatted)
     - First 80 chars of original_message (truncated with "...")
     - Three small copy buttons for professional/friendly/direct tones
     - Each copy button calls navigator.clipboard.writeText(gen.reply_X)

4. Import useGenerations hook to ensure generations are loaded:
   const { generations } = useGenerations()

CONSTRAINTS:
- No extra DB queries — use the Zustand store only
- Only one client panel can be expanded at a time
- The panel uses AnimatePresence + motion.div for smooth open/close (same pattern as the add form)
- The copy buttons are small (h-6 w-6) and use the same Copy/Check pattern as ReplyCard

ACCEPTANCE CRITERIA:
- Clicking the History button on a client row expands a panel showing linked generations
- Clicking it again collapses the panel
- Generations are shown newest first
- Copy buttons work for each tone
- Clients with no linked generations show the empty state message
- No additional network requests are made
```

---

## REFERENCE: Exact file paths for all prompts

```
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
    layout.tsx
  (dashboard)/
    dashboard/page.tsx          ← Prompts 1.5, 1.6, 2.6, 3.1
    clients/page.tsx            ← Prompts 2.3, S.3
    properties/page.tsx         ← Prompt 2.4
    favorites/page.tsx          ← Prompt S.2
    calendar/page.tsx           ← Prompt 1.7
    history/page.tsx            ← Prompt 2.7
    billing/page.tsx            ← Prompt 2.2
    settings/page.tsx           ← Prompt 2.8
    onboarding/page.tsx
    layout.tsx
  (marketing)/
    page.tsx
  api/
    generate/route.ts           ← Prompts 1.3, 2.1, 3.1, 3.3
    stripe/
      webhook/route.ts          ← Prompts 1.2, 3.2
      checkout/route.ts
      portal/route.ts
      sync/route.ts
    user/
      profile/route.ts
      delete/route.ts
      export/route.ts
  layout.tsx
  globals.css

components/
  dashboard/
    StatsCards.tsx              ← Prompt 1.4
    TrialBanner.tsx             ← Prompt 2.2
    PropertySelector.tsx        ← Prompt 1.6
    ReplyGrid.tsx               ← Prompt 3.1
    BookingPrompt.tsx
  calendar/
    MonthGrid.tsx               ← Prompt 2.9
    WeekGrid.tsx                ← Prompt 2.9
    DayView.tsx                 ← Prompt 2.9
  history/
    HistoryItem.tsx             ← Prompt 2.5
  billing/
    PricingCard.tsx
  onboarding/
    OnboardingForm.tsx          ← Prompt 2.1

hooks/
  useGenerations.ts             ← Prompt 2.7
  useUser.ts

store/
  app-store.ts                  ← Prompts 2.7, 3.3, S.2

lib/
  groq/client.ts                ← Prompt 3.1
  resend/emails.ts              ← Prompt 1.2
  prompts/real-estate.ts

types/
  index.ts                      ← Prompt 3.3

next.config.mjs                 ← Prompt 1.1

DB functions (Supabase SQL editor):
  increment_trial_usage         ← Prompt 1.8
  profiles INSERT policy        ← Prompt 1.9
  rp_webhook_events table       ← Prompt 3.2
  rp_favorites UPDATE policy    ← Prompt S.2

Supabase Dashboard (no code):
  Auth → Password Security      ← Prompt S.1
```

---

## Execution order

```
WEEK 1 (do these first, in order):
  1.1 → Remove build suppression + fix all errors
  1.8 → Fix increment_trial_usage search_path (DB)
  1.9 → Fix profiles INSERT RLS (DB)
  S.1 → Enable leaked password protection (Dashboard)
  1.2 → Wire payment emails to webhook
  1.3 → Fix trial-low email threshold
  1.4 → Fix StatsCards Pro label
  1.5 → Clear message after generation
  1.6 → Filter PropertySelector to active only
  1.7 → Fix calendar ?date= navigation

WEEK 2-3:
  2.1 → Onboarding demo doesn't burn trial generation
  2.2 → Auto-trigger checkout from TrialBanner
  2.3 → Client edit UI
  2.4 → Property edit + status management
  2.5 → Client name on history items
  2.6 → Post-generation client nudge
  2.7 → History pagination
  2.8 → Password change in Settings
  2.9 → Appointment color coding

WEEK 4-6:
  S.2 → Favorites label editing
  S.3 → Client detail panel with generations
  3.1 → Quick reply mode
  3.2 → Webhook event logging
  3.3 → Dead code cleanup
```
