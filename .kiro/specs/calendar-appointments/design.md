# Design Document: Calendar & Appointments

## Overview

The Calendar & Appointments feature adds scheduling capabilities to ReplyPro. It introduces three new Supabase tables (`rp_appointments`, `rp_availability_rules`, `rp_availability_exceptions`), a new `/calendar` dashboard page, two new hooks (`useAppointments`, `useAvailability`), a pure date/time detection utility (`lib/utils/datetime-detect.ts`), and an availability context injection into the existing `/api/generate` pipeline.

The feature is scoped entirely to the authenticated agent — all data is user-scoped via Supabase RLS. The AI reply generator gains awareness of the agent's schedule only when a client message contains a date or time reference, preserving existing behavior for all other messages.

---

## Architecture

```mermaid
flowchart TD
    subgraph Client
        CP[CalendarPage /calendar]
        DW[Dashboard UpcomingWidget]
        CP --> HA[useAppointments hook]
        CP --> HV[useAvailability hook]
        DW --> HA
    end

    subgraph Supabase
        TA[(rp_appointments)]
        TR[(rp_availability_rules)]
        TE[(rp_availability_exceptions)]
    end

    subgraph API
        GEN[/api/generate]
        DTD[datetime-detect.ts]
        ACB[buildAvailabilityContext]
        GEN --> DTD
        DTD -- date/time found --> ACB
        ACB --> TA
        ACB --> TR
        ACB --> TE
        ACB --> GEN
    end

    HA --> TA
    HV --> TR
    HV --> TE
```

**Data flow for AI generation with availability:**

1. Client sends a message to `/api/generate`
2. `containsDateOrTime(message)` is called — pure function, no I/O
3. If `false` → existing pipeline runs unchanged
4. If `true` → `buildAvailabilityContext(userId, message)` queries the three calendar tables and returns a structured string
5. The string is appended to the system prompt before the Groq call

---

## Components and Interfaces

### New Page

**`app/(dashboard)/calendar/page.tsx`**
- Client component following the same pattern as `clients/page.tsx`
- State: `view: 'month' | 'week'`, `selectedDate: Date`, `showForm: boolean`, `editingAppointment: Appointment | null`
- Uses `useAppointments()` and `useAvailability()` hooks
- Renders `<MonthGrid>` or `<WeekGrid>` based on view state
- Renders `<AppointmentForm>` in a slide-down panel (same pattern as client add form)
- Renders `<AvailabilityPanel>` as a collapsible side section

### New Components

**`components/calendar/MonthGrid.tsx`**
- Props: `appointments: Appointment[]`, `exceptions: AvailabilityException[]`, `currentMonth: Date`, `onDayClick: (date: Date) => void`, `onAppointmentClick: (a: Appointment) => void`
- Renders a 7-column grid of day cells for the current month
- Each cell shows appointment count badge or truncated titles

**`components/calendar/WeekGrid.tsx`**
- Props: `appointments: Appointment[]`, `weekStart: Date`, `onAppointmentClick: (a: Appointment) => void`
- Renders 7 columns × hourly rows from 07:00–22:00
- Appointments positioned by start/end time

**`components/calendar/AppointmentForm.tsx`**
- Props: `initial?: Appointment`, `onSave: (data: AppointmentFormData) => void`, `onCancel: () => void`, `saving: boolean`
- Fields: title (required), description, date (required), start_time (required), end_time (required), client_id (optional select), property_id (optional select)
- Client-side validation: end_time > start_time

**`components/calendar/AppointmentCard.tsx`**
- Props: `appointment: Appointment`, `clientName?: string`, `propertyTitle?: string`, `onClick: () => void`
- Compact card showing title, time range, optional client/property badges

**`components/calendar/AvailabilityPanel.tsx`**
- Props: `rules: AvailabilityRule[]`, `exceptions: AvailabilityException[]`, `onSaveRule: (rule) => void`, `onAddException: (exc) => void`, `onDeleteException: (id) => void`
- 7-row table for weekday rules (start_time, end_time, is_available toggle)
- Exception list with date picker and delete button

**`components/dashboard/UpcomingAppointments.tsx`**
- Props: none (uses `useAppointments` internally)
- Shows next 3 appointments sorted by `start_at` ascending
- Each row: title, formatted date, start time, optional client name
- Empty state with link to `/calendar`
- Skeleton loaders while loading

### New Hooks

**`hooks/useAppointments.ts`**
```typescript
export function useAppointments() {
  // Fetches rp_appointments for current user, ordered by start_at asc
  // Returns: { appointments, loading, error, refetch }
  // Mirrors useClients/useProperties pattern with Zustand store
}
```

**`hooks/useAvailability.ts`**
```typescript
export function useAvailability() {
  // Fetches rp_availability_rules and rp_availability_exceptions for current user
  // Returns: { rules, exceptions, loading, error, refetch }
}
```

### New Utility

**`lib/utils/datetime-detect.ts`**
```typescript
// Pure function — no imports, no side effects
export function containsDateOrTime(message: string): boolean
```

Detects Croatian and English date/time patterns via regex:
- Croatian dates: `15.3.`, `15. ožujka`, `sutra`, `prekosutra`, `idući tjedan`, `idući ponedjeljak`, `u ponedjeljak`, `poslijepodne`, `ujutro`, `navečer`, `u [digit] sati`, `[digit]:00`
- English dates: `March 15`, `15/03`, `tomorrow`, `next Monday`, `next week`, `at 3pm`, `at 10:00`, `[digit]am`, `[digit]pm`
- Numeric patterns shared: `\d{1,2}[.:]\d{2}`, `\d{1,2}[./]\d{1,2}`

### Modified Files

**`lib/prompts/real-estate.ts`** — add `buildAvailabilityContext`:
```typescript
export function buildAvailabilityContext(params: {
  requestedDateTime: string
  isFree: boolean
  alternatives: Array<{ date: string; startTime: string; endTime: string }>
}): string
// Returns structured Croatian/English text injected into the system prompt
```

**`app/api/generate/route.ts`** — add availability check branch:
```typescript
// After fetching profile, before building enrichedPrompt:
let availabilityContext = ''
if (containsDateOrTime(message)) {
  availabilityContext = await fetchAvailabilityContext(user.id, message, serviceClient)
}
// Append availabilityContext to enrichedPrompt
```

**`components/layout/Sidebar.tsx`** — add Calendar nav item with `CalendarDays` icon from lucide-react

**`app/(dashboard)/dashboard/page.tsx`** — add `<UpcomingAppointments />` widget below `<StatsCards />`

**`types/index.ts`** — export new row types: `Appointment`, `AvailabilityRule`, `AvailabilityException`

**`types/supabase.ts`** — add table definitions for the three new tables

**`store/app-store.ts`** — add `appointments`, `setAppointments`, `addAppointment`, `updateAppointment`, `removeAppointment` slices

**`locales/en.json` + `locales/hr.json`** — add `calendar.*` and `nav.calendar` keys

**`supabase/migration.sql`** — append three new table DDL blocks

---

## Data Models

### `rp_appointments`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| user_id | uuid FK → auth.users | ON DELETE CASCADE |
| title | text NOT NULL | |
| description | text | nullable |
| start_at | timestamptz NOT NULL | |
| end_at | timestamptz NOT NULL | CHECK end_at > start_at |
| client_id | uuid FK → rp_clients | ON DELETE SET NULL, nullable |
| property_id | uuid FK → rp_properties | ON DELETE SET NULL, nullable |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now(), moddatetime trigger |

### `rp_availability_rules`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| user_id | uuid FK → auth.users | ON DELETE CASCADE |
| day_of_week | integer NOT NULL | 0=Sunday … 6=Saturday, CHECK 0–6 |
| start_time | time NOT NULL | e.g. `09:00:00` |
| end_time | time NOT NULL | e.g. `18:00:00`, CHECK end_time > start_time |
| is_available | boolean NOT NULL | DEFAULT true |

UNIQUE constraint: `(user_id, day_of_week)` — one rule per weekday per user.

### `rp_availability_exceptions`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| user_id | uuid FK → auth.users | ON DELETE CASCADE |
| exception_date | date NOT NULL | |
| is_available | boolean NOT NULL | DEFAULT false |
| reason | text | nullable |

UNIQUE constraint: `(user_id, exception_date)`.

### TypeScript Types (additions to `types/supabase.ts`)

```typescript
// rp_appointments Row
export type AppointmentRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  start_at: string        // ISO timestamptz
  end_at: string          // ISO timestamptz
  client_id: string | null
  property_id: string | null
  created_at: string
  updated_at: string
}

// rp_availability_rules Row
export type AvailabilityRuleRow = {
  id: string
  user_id: string
  day_of_week: number     // 0–6
  start_time: string      // "HH:MM:SS"
  end_time: string        // "HH:MM:SS"
  is_available: boolean
}

// rp_availability_exceptions Row
export type AvailabilityExceptionRow = {
  id: string
  user_id: string
  exception_date: string  // "YYYY-MM-DD"
  is_available: boolean
  reason: string | null
}
```

### Availability Context Shape (in-memory, not persisted)

```typescript
interface AvailabilityContext {
  requestedDateTime: string          // human-readable, e.g. "Monday 15 March at 10:00"
  isFree: boolean
  alternatives: Array<{
    date: string                     // "YYYY-MM-DD"
    startTime: string                // "HH:MM"
    endTime: string                  // "HH:MM"
  }>
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property-based testing library:** [fast-check](https://fast-check.io/) (already compatible with the Next.js/TypeScript stack, no additional runtime dependency needed for test files).

**Property reflection:** After reviewing all testable criteria, the following consolidations were made:
- 1.7 and 1.8 (client name / property title on card) are combined into one rendering property (Property 5)
- 3.3 and 3.4 (conflict with alternatives / no alternatives) are combined into one property (Property 8) since 3.4 is the N=0 edge case of 3.3
- 6.2 and 6.3 (date patterns / time patterns) are covered by Property 10 (positive detection) and Property 11 (negative detection)
- 2.3 and 2.4 (rule unavailable / exception overrides rule) are kept separate because they test different precedence logic

---

### Property 1: Valid appointment creation round-trip

*For any* valid appointment (non-empty title, valid date, start_time strictly before end_time), after the appointment is created and the list is re-fetched, the appointment should appear in the list with the same title, date, start_at, and end_at values.

**Validates: Requirements 1.2, 5.1**

---

### Property 2: Invalid time range is always rejected

*For any* appointment form submission where end_time is less than or equal to start_time, the validation function should return an error and the appointment should not be created.

**Validates: Requirements 1.3**

---

### Property 3: Edit form pre-population round-trip

*For any* existing appointment, the data returned by selecting that appointment for editing should exactly match the stored title, description, start_at, end_at, client_id, and property_id.

**Validates: Requirements 1.4**

---

### Property 4: Appointment deletion removes from list

*For any* appointment in the list, after deletion, the appointment's id should not appear in the appointments list.

**Validates: Requirements 1.6**

---

### Property 5: Appointment card renders linked entity names

*For any* appointment with a non-null client_id and/or property_id, the rendered appointment card string should contain the linked client's full_name and/or the linked property's title.

**Validates: Requirements 1.7, 1.8**

---

### Property 6: Availability rule round-trip

*For any* (day_of_week ∈ 0–6, start_time, end_time where start_time < end_time), saving an availability rule and reading it back should return the same day_of_week, start_time, end_time, and is_available values.

**Validates: Requirements 2.2**

---

### Property 7: Unavailable weekday rule blocks all slots on that day

*For any* date whose weekday has an availability rule with is_available = false, the slot availability check function should return false for any time on that date.

**Validates: Requirements 2.3**

---

### Property 8: Exception overrides weekday rule

*For any* date that has an Availability_Exception with is_available = false, the slot availability check function should return false regardless of what the weekday rule says for that day.

**Validates: Requirements 2.4**

---

### Property 9: Exception deletion restores weekday rule behavior

*For any* date with an Availability_Exception, after the exception is deleted, the slot availability check should return the same result as the weekday rule alone (without the exception).

**Validates: Requirements 2.6**

---

### Property 10: Free slot context confirms availability

*For any* slot that has no conflicting appointments and falls within the agent's availability rules, the `buildAvailabilityContext` function should produce a string that indicates the slot is free/available.

**Validates: Requirements 3.2, 3.5, 3.7**

---

### Property 11: Conflicted slot context includes up to 3 alternatives

*For any* conflicted slot and any set of N free alternative slots (N ≥ 0), the `buildAvailabilityContext` function should produce a string that indicates the slot is occupied and includes exactly min(N, 3) alternative slot descriptions.

**Validates: Requirements 3.3, 3.4, 3.7**

---

### Property 12: Date/time detection — positive

*For any* message string that contains at least one known Croatian or English date/time pattern (from the defined pattern set), `containsDateOrTime` should return true.

**Validates: Requirements 6.1, 6.2, 6.3**

---

### Property 13: Date/time detection — negative

*For any* message string composed entirely of words that contain no date or time patterns, `containsDateOrTime` should return false.

**Validates: Requirements 6.4**

---

### Property 14: Upcoming appointments widget shows next 3 sorted

*For any* list of appointments (mix of past and future), the upcoming appointments selector should return exactly the appointments with start_at > now(), sorted ascending by start_at, limited to 3.

**Validates: Requirements 7.1**

---

### Property 15: Widget item renders required fields

*For any* appointment, the rendered widget row should contain the appointment's title, a formatted date string derived from start_at, and a formatted start time string.

**Validates: Requirements 7.4**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Supabase insert fails (appointment) | Toast error, form stays open, no optimistic update |
| Supabase update fails (appointment) | Toast error, revert optimistic update in store |
| Supabase delete fails | Toast error, restore item in store |
| end_time ≤ start_time on form submit | Client-side validation error shown inline, no DB call |
| Calendar data load fails | Error message + retry button (Requirement 4.8) |
| `containsDateOrTime` throws | Catch in generate route, skip availability context, log warning |
| `buildAvailabilityContext` DB query fails | Log error, skip availability context, continue generation |
| No availability rules configured | Treat all slots as available (graceful degradation) |

All error states follow the existing toast pattern (`useToast`) and the existing error boundary (`<ErrorBoundary>`).

---

## Testing Strategy

### Unit Tests (example-based)

- `containsDateOrTime`: specific Croatian and English pattern examples (positive and negative)
- `buildAvailabilityContext`: specific slot scenarios (free, conflicted with 1/2/3 alternatives, conflicted with 0 alternatives)
- `AppointmentForm` validation: specific invalid time range examples
- `UpcomingAppointments` selector: empty list, all past, mixed past/future

### Property-Based Tests (fast-check, minimum 100 iterations each)

Each property test is tagged with:
`// Feature: calendar-appointments, Property N: <property_text>`

- **Property 1** — `fc.record({ title: fc.string({ minLength: 1 }), startAt: fc.date(), endAt: fc.date() })` filtered to endAt > startAt
- **Property 2** — `fc.record({ startAt: fc.date(), endAt: fc.date() })` filtered to endAt ≤ startAt
- **Property 3** — `fc.record(appointmentArb)` → save → select → compare fields
- **Property 4** — `fc.array(appointmentArb, { minLength: 1 })` → delete random element → check absence
- **Property 5** — `fc.record({ appointment: appointmentArb, clientName: fc.string(), propertyTitle: fc.string() })`
- **Property 6** — `fc.record({ dayOfWeek: fc.integer({ min: 0, max: 6 }), startTime: timeArb, endTime: timeArb })` filtered to endTime > startTime
- **Property 7** — `fc.record({ date: fc.date(), rule: ruleArb.filter(r => !r.is_available) })`
- **Property 8** — `fc.record({ date: fc.date(), rule: ruleArb, exception: exceptionArb.filter(e => !e.is_available) })`
- **Property 9** — `fc.record({ date: fc.date(), rule: ruleArb, exception: exceptionArb })`
- **Property 10** — `fc.record({ slot: freeSlotArb, rules: fc.array(ruleArb) })`
- **Property 11** — `fc.record({ slot: conflictedSlotArb, alternatives: fc.array(slotArb, { maxLength: 10 }) })`
- **Property 12** — `fc.oneof(croatianDatePatternArb, englishDatePatternArb, timePatternArb)`
- **Property 13** — `fc.array(fc.constantFrom(...nonDateWords), { minLength: 3 }).map(words => words.join(' '))`
- **Property 14** — `fc.array(appointmentArb)` with mix of past/future dates
- **Property 15** — `fc.record(appointmentArb)`

### Integration Tests

- RLS isolation: two users, verify appointments/rules are not cross-visible (Requirements 1.9, 2.7)
- Generate pipeline with date reference: mock Supabase calendar queries, verify availability context is appended to prompt
- Generate pipeline without date reference: verify calendar queries are NOT called

### Smoke Tests

- `/calendar` route renders without error for authenticated user
- `containsDateOrTime` is a pure exported function (no side effects)
- All three new tables exist with correct columns (schema check)
