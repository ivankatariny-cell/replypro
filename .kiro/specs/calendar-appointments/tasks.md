# Tasks: Calendar & Appointments

## Task List

- [x] 1. Database schema & types
  - [x] 1.1 Append `rp_appointments`, `rp_availability_rules`, `rp_availability_exceptions` DDL (with RLS policies, indexes, moddatetime triggers, and cascade deletes) to `supabase/migration.sql`
  - [x] 1.2 Add `AppointmentRow`, `AvailabilityRuleRow`, `AvailabilityExceptionRow` table definitions to `types/supabase.ts`
  - [x] 1.3 Export `Appointment`, `AvailabilityRule`, `AvailabilityException` type aliases from `types/index.ts`

- [x] 2. Zustand store slices
  - [x] 2.1 Add `appointments`, `setAppointments`, `addAppointment`, `updateAppointment`, `removeAppointment` slices to `store/app-store.ts`

- [x] 3. Data hooks
  - [x] 3.1 Create `hooks/useAppointments.ts` — fetches `rp_appointments` for current user ordered by `start_at` asc, mirrors `useClients` pattern with Zustand store
  - [x] 3.2 Create `hooks/useAvailability.ts` — fetches `rp_availability_rules` and `rp_availability_exceptions` for current user

- [x] 4. Date/time detection utility
  - [x] 4.1 Create `lib/utils/datetime-detect.ts` — pure `containsDateOrTime(message: string): boolean` function with Croatian and English regex patterns

- [x] 5. Availability context builder
  - [x] 5.1 Add `buildAvailabilityContext(params)` function to `lib/prompts/real-estate.ts` — returns structured human-readable string from availability data
  - [x] 5.2 Add `fetchAvailabilityContext(userId, message, supabaseClient)` server-side helper (can live in `app/api/generate/route.ts` or a new `lib/calendar/availability.ts`) — queries the three calendar tables and returns the context string

- [x] 6. Generate API route — availability injection
  - [x] 6.1 Import `containsDateOrTime` in `app/api/generate/route.ts`
  - [x] 6.2 Add availability check branch: if `containsDateOrTime(message)` is true, call `fetchAvailabilityContext` and append result to `enrichedPrompt`
  - [x] 6.3 Ensure the branch is skipped (no DB queries) when no date/time is detected

- [x] 7. Calendar UI components
  - [x] 7.1 Create `components/calendar/AppointmentCard.tsx` — compact card with title, time range, optional client/property badges
  - [x] 7.2 Create `components/calendar/AppointmentForm.tsx` — form with title, description, date, start_time, end_time, client select, property select; client-side validation (end > start)
  - [x] 7.3 Create `components/calendar/MonthGrid.tsx` — 7-column monthly grid, day cells with appointment count/titles, exception blocked-out styling
  - [x] 7.4 Create `components/calendar/WeekGrid.tsx` — 7-column weekly grid with hourly rows 07:00–22:00, appointments positioned by time
  - [x] 7.5 Create `components/calendar/AvailabilityPanel.tsx` — 7-row weekday rules table + exception list with date picker and delete

- [x] 8. Calendar page
  - [x] 8.1 Create `app/(dashboard)/calendar/page.tsx` — client component with month/week view toggle, appointment CRUD (create/edit/delete via Supabase + store), availability panel, skeleton loaders, error state with retry

- [x] 9. Dashboard upcoming appointments widget
  - [x] 9.1 Create `components/dashboard/UpcomingAppointments.tsx` — shows next 3 appointments sorted by `start_at` asc, empty state with link to `/calendar`, skeleton loaders
  - [x] 9.2 Add `<UpcomingAppointments />` to `app/(dashboard)/dashboard/page.tsx` below `<StatsCards />`

- [x] 10. Navigation
  - [x] 10.1 Add Calendar nav item (with `CalendarDays` icon from lucide-react) to `navItems` array in `components/layout/Sidebar.tsx`
  - [x] 10.2 Add Calendar nav item to `components/layout/MobileNav.tsx` (if it exists and has a nav list)

- [x] 11. Localisation
  - [x] 11.1 Add `nav.calendar` key and all `calendar.*` keys to `locales/en.json`
  - [x] 11.2 Add `nav.calendar` key and all `calendar.*` keys to `locales/hr.json`

- [x] 12. Unit & property-based tests
  - [x] 12.1 Write unit tests for `containsDateOrTime` — positive and negative examples for Croatian and English patterns
  - [x] 12.2 Write property tests for `containsDateOrTime` (Properties 12 & 13) using fast-check — positive pattern generators and negative word generators, min 100 iterations each
  - [x] 12.3 Write unit tests for `buildAvailabilityContext` — free slot, conflicted with alternatives, conflicted with 0 alternatives
  - [x] 12.4 Write property tests for `buildAvailabilityContext` (Properties 10 & 11) — free slot arb and conflicted slot arb with variable alternatives
  - [x] 12.5 Write property tests for appointment validation (Properties 1 & 2) — valid creation round-trip and invalid time range rejection
  - [x] 12.6 Write property tests for availability rule round-trip (Property 6) and slot blocking logic (Properties 7, 8, 9)
  - [x] 12.7 Write property tests for upcoming appointments selector (Properties 14 & 15) — sorting, limiting to 3, required fields in render
  - [x] 12.8 Write property tests for appointment card rendering (Properties 3, 4, 5) — edit pre-population, deletion, linked entity names
