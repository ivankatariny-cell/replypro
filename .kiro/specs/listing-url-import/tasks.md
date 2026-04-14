# Implementation Plan: Listing URL Import

## Overview

Implement a URL-based auto-fill capability for the Properties page. The work is ordered: types → i18n → API route → UI component → page integration, so each step compiles cleanly before the next builds on it.

## Tasks

- [x] 1. Add `ImportResult` interface to `types/index.ts`
  - Add the `ImportResult` interface after the existing `ApiError` interface
  - Fields: `title: string`, `address`, `city`, `description` as `string | null`, `price`, `sqm`, `rooms` as `number | null`, `property_type` as the existing `PropertyType` union
  - _Requirements: 3.1, 4.2_

- [x] 2. Add i18n keys to both locale files
  - [x] 2.1 Add `import_url_*` keys under `"properties"` in `locales/en.json`
    - Keys: `import_url_label`, `import_url_placeholder`, `import_url_btn`, `import_url_importing`, `import_url_success`, `import_url_invalid`, `import_url_error_scrape`, `import_url_error_extract`, `import_url_error_rate`, `import_url_error_generic`
    - Use exact English values from the design document
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 2.2 Add the same keys under `"properties"` in `locales/hr.json`
    - Use exact Croatian values from the design document
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. Implement `POST /api/properties/import` route
  - Create `app/api/properties/import/route.ts`
  - [x] 3.1 Auth + rate-limit guard
    - Use `createServerSupabaseClient` and check `auth.getUser()` — return `401 UNAUTHORIZED` if no session
    - Call `rateLimit(user.id)` from `lib/utils/rate-limit.ts` — return `429 RATE_LIMITED` if exceeded
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 3.2 URL validation
    - Parse request body, validate `url` is a string parseable by `new URL()` with `http:` or `https:` protocol
    - Return `400 INVALID_URL` if validation fails
    - _Requirements: 2.1_
  - [x] 3.3 Jina AI fetch with timeout
    - Fetch `https://r.jina.ai/${url}` using `AbortController` with a 15 s timeout
    - Return `504 SCRAPE_TIMEOUT` if aborted; return `502 SCRAPE_FAILED` for any 4xx/5xx Jina response
    - Do not log or store the returned markdown
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 3.4 Groq structured extraction with timeout
    - Call Groq directly (not `generateReplies`) with `response_format: { type: 'json_object' }` and a 30 s `AbortController` timeout
    - Prompt must request all 8 fields with the exact `property_type` enum and numeric/null rules from the design
    - Return `504 EXTRACTION_TIMEOUT` if aborted
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8_
  - [x] 3.5 Parse and validate extraction result
    - `JSON.parse` the Groq response — return `422 EXTRACTION_FAILED` if it throws
    - Check for non-empty `title` field — return `422 EXTRACTION_INCOMPLETE` if missing
    - Return `200` with the `ImportResult` JSON on success
    - _Requirements: 3.6, 3.7_

- [x] 4. Checkpoint — verify API route compiles and auth/rate-limit paths work
  - Ensure all TypeScript types resolve, ask the user if questions arise.

- [x] 5. Implement `UrlImporter` client component
  - Create `components/properties/UrlImporter.tsx`
  - [x] 5.1 Render URL input and import button
    - Controlled `<input type="url">` with label using `t('properties.import_url_label')` and placeholder `t('properties.import_url_placeholder')`
    - Button labelled `t('properties.import_url_btn')` / `t('properties.import_url_importing')` during loading
    - Match existing form field styling (same `Input`, `Label` components, `rounded-lg`, `border`, `bg-background`)
    - _Requirements: 1.1_
  - [x] 5.2 Client-side URL validation and button enable/disable logic
    - Enable import button only when input starts with `http://` or `https://`
    - Show inline `t('properties.import_url_invalid')` message when input is non-empty but invalid
    - Do not call the API when the field is empty or invalid
    - _Requirements: 1.2, 6.6_
  - [x] 5.3 Loading state and form-submit guard
    - Set `loading = true` and disable button on click; restore on response (success or error)
    - Accept `formSubmitting?: boolean` prop — disable import button while parent form is submitting
    - _Requirements: 1.3, 1.4, 6.5_
  - [x] 5.4 Success path: call callbacks and show toast
    - On `200` response, call `onImport(result)` then `onExpandForm?.()` then `toast(t('properties.import_url_success'), 'success')`
    - _Requirements: 4.1, 4.4, 4.5_
  - [x] 5.5 Error path: map error codes to i18n toast messages
    - Implement `getErrorMessage(code, t)` switch matching the design's client-side error mapping
    - Show error toast, re-enable button, clear loading state
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Integrate `UrlImporter` into the Properties page
  - Modify `app/(dashboard)/properties/page.tsx`
  - Import `UrlImporter` and `ImportResult`
  - Place `<UrlImporter>` inside the add-form card, above `<PropertyFormFields>`, only when `showForm` is true
  - Wire `onImport` callback to `setForm` using the null-coalescing mapping from the design (`result.price ? String(result.price) : ''`, etc.)
  - Wire `onExpandForm` to `() => setShowForm(true)`
  - Pass `formSubmitting={saving}` prop
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

- [x] 7. Checkpoint — end-to-end smoke test
  - Ensure all TypeScript diagnostics pass across modified files, ask the user if questions arise.

- [x] 8. Write tests
  - [x] 8.1 Write property test for URL validation (Property 1)
    - **Property 1: URL validation enables/disables the import button**
    - Use fast-check: generate arbitrary strings + valid http/https URLs
    - Assert `isValidUrl(s) === (s.startsWith('http://') || s.startsWith('https://'))`
    - **Validates: Requirements 1.2**
  - [x] 8.2 Write property test for Jina URL construction (Property 2)
    - **Property 2: Jina URL construction**
    - Use fast-check: generate arbitrary valid http/https URL strings
    - Mock `fetch`; assert captured URL === `https://r.jina.ai/${inputUrl}`
    - **Validates: Requirements 2.1**
  - [x] 8.3 Write property test for HTTP error → SCRAPE_FAILED (Property 4)
    - **Property 4: HTTP error codes map to SCRAPE_FAILED / 502**
    - Use fast-check: generate integers in [400, 599]
    - Assert response status 502 and body `{ code: 'SCRAPE_FAILED' }`
    - **Validates: Requirements 2.3**
  - [x] 8.4 Write property test for extraction prompt completeness (Property 5)
    - **Property 5: Extraction prompt completeness**
    - Use fast-check: generate arbitrary markdown strings
    - Assert prompt contains all 8 field names and all 5 `property_type` enum values
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  - [x] 8.5 Write property test for invalid JSON → EXTRACTION_FAILED (Property 6)
    - **Property 6: Invalid JSON from Groq maps to EXTRACTION_FAILED / 422**
    - Use fast-check: generate arbitrary strings filtered to exclude valid JSON
    - Assert response status 422 and body `{ code: 'EXTRACTION_FAILED' }`
    - **Validates: Requirements 3.6**
  - [x] 8.6 Write property test for missing title → EXTRACTION_INCOMPLETE (Property 7)
    - **Property 7: Missing title maps to EXTRACTION_INCOMPLETE / 422**
    - Use fast-check: generate arbitrary objects without a `title` key, serialized to JSON
    - Assert response status 422 and body `{ code: 'EXTRACTION_INCOMPLETE' }`
    - **Validates: Requirements 3.7**
  - [x] 8.7 Write property test for form auto-fill mapping (Property 8)
    - **Property 8: Form auto-fill maps all non-null fields**
    - Use fast-check: generate arbitrary `ImportResult` objects with random null/non-null combinations
    - Assert each form field equals `result[field] ?? ''` after `onImport` fires
    - **Validates: Requirements 4.1, 4.2, 4.3**
  - [x] 8.8 Write property test for error restoring UI state (Property 9)
    - **Property 9: Error response always restores UI to interactive state**
    - Use fast-check: generate arbitrary error response objects (random code, random status)
    - Assert button is enabled and loading is false after any error response
    - **Validates: Requirements 6.1, 6.5**
  - [x] 8.9 Write unit tests for `UrlImporter` component
    - Import button disabled when input is empty
    - Import button disabled during loading
    - Successful import calls `onImport` with correct shape and calls `onExpandForm`
    - Success toast shown after import
    - Error toast shown for each error code variant
    - Form fields remain editable after auto-fill
    - _Requirements: 1.1, 1.2, 1.3, 4.5, 6.1_
  - [x] 8.10 Write unit tests for API route edge cases
    - Returns 401 for unauthenticated requests
    - Returns 504 / `SCRAPE_TIMEOUT` when Jina fetch times out
    - Returns 504 / `EXTRACTION_TIMEOUT` when Groq call times out
    - _Requirements: 5.1, 2.4, 3.8_

- [x] 9. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The Groq call in the API route must use `getGroq()` directly (not `generateReplies`) with a dedicated extraction prompt and `response_format: { type: 'json_object' }`
- The `UrlImporter` component is stateless with respect to the form — it only fires callbacks, keeping it decoupled from `PropertiesPage` state management
- Property tests use fast-check; mock `rateLimit` to avoid Upstash dependency in tests
