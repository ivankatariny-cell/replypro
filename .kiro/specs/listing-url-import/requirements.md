# Requirements Document

## Introduction

The Listing URL Import feature allows real estate agents using ReplyPro to paste any property listing URL (from Croatian/regional portals like Njuškalo, Crozilla, Index oglasi, or any custom agency website) into the Properties page and have the property add form automatically pre-filled with extracted data. The system fetches the listing via Jina AI reader, passes the markdown content to Groq AI for structured extraction, and populates the form fields so the agent can review and save with minimal manual input.

## Glossary

- **Importer**: The client-side UI component that accepts a listing URL and triggers the import flow.
- **Scrape_API**: The Next.js API route (`/api/properties/import`) responsible for fetching, scraping, and extracting property data.
- **Jina_Reader**: The external service at `https://r.jina.ai/{url}` that converts any web page into clean markdown.
- **Extractor**: The Groq AI call within Scrape_API that performs structured JSON extraction from markdown content.
- **ImportResult**: The structured JSON object returned by Scrape_API containing extracted property fields.
- **Property_Form**: The existing add-property form on the Properties page (`/nekretnine`) that accepts pre-filled field values.
- **Authenticated_User**: A user with a valid Supabase session, as enforced by the existing middleware.

## Requirements

### Requirement 1: URL Input and Import Trigger

**User Story:** As a real estate agent, I want to paste a listing URL and click an import button, so that I can start the automated data extraction without leaving the Properties page.

#### Acceptance Criteria

1. THE Importer SHALL render a URL input field and an "Import from URL" button within the property add form area on the Properties page.
2. WHEN the user pastes or types a value into the URL input field, THE Importer SHALL enable the import button only when the input value is a syntactically valid URL (starts with `http://` or `https://`).
3. WHEN the import button is clicked, THE Importer SHALL display a loading indicator and disable the import button for the duration of the import operation.
4. WHILE the import operation is in progress, THE Importer SHALL prevent the user from submitting the property add form.

---

### Requirement 2: Server-Side Scraping via Jina AI Reader

**User Story:** As a real estate agent, I want the app to fetch listing content from any website, so that I am not limited to specific portals.

#### Acceptance Criteria

1. WHEN Scrape_API receives a valid URL, THE Scrape_API SHALL fetch the URL's content by making an HTTP GET request to `https://r.jina.ai/{url}`.
2. WHEN Jina_Reader returns a successful response, THE Scrape_API SHALL pass the returned markdown content to the Extractor.
3. IF Jina_Reader returns an HTTP error status (4xx or 5xx), THEN THE Scrape_API SHALL return a structured error response with code `SCRAPE_FAILED` and an HTTP 502 status.
4. IF the Jina_Reader request does not complete within 15 seconds, THEN THE Scrape_API SHALL abort the request and return a structured error response with code `SCRAPE_TIMEOUT` and an HTTP 504 status.
5. THE Scrape_API SHALL NOT store or log the raw markdown content returned by Jina_Reader.

---

### Requirement 3: AI-Powered Structured Extraction

**User Story:** As a real estate agent, I want the app to intelligently extract property details from scraped content, so that the form fields are populated accurately without manual parsing.

#### Acceptance Criteria

1. WHEN the Extractor receives markdown content, THE Extractor SHALL send it to Groq AI with a structured extraction prompt requesting a JSON object with fields: `title`, `address`, `city`, `price`, `sqm`, `rooms`, `description`, and `property_type`.
2. THE Extractor SHALL instruct Groq AI to return `property_type` as one of the following values only: `apartment`, `house`, `land`, `commercial`, or `other`.
3. THE Extractor SHALL instruct Groq AI to return `price` as a number in EUR, converting from other currencies where possible, or `null` if not determinable.
4. THE Extractor SHALL instruct Groq AI to return `sqm` as a number representing square meters, or `null` if not determinable.
5. THE Extractor SHALL instruct Groq AI to return `rooms` as a number, or `null` if not determinable.
6. IF Groq AI returns a response that cannot be parsed as valid JSON, THEN THE Extractor SHALL return a structured error response with code `EXTRACTION_FAILED` and an HTTP 422 status.
7. IF Groq AI returns a JSON object missing the required `title` field, THEN THE Extractor SHALL return a structured error response with code `EXTRACTION_INCOMPLETE` and an HTTP 422 status.
8. THE Extractor SHALL set a 30-second timeout on the Groq AI request and return a structured error response with code `EXTRACTION_TIMEOUT` and an HTTP 504 status if exceeded.

---

### Requirement 4: Form Auto-Fill

**User Story:** As a real estate agent, I want the extracted data to automatically populate the add form fields, so that I can review and save the property with minimal typing.

#### Acceptance Criteria

1. WHEN Scrape_API returns a successful ImportResult, THE Importer SHALL populate the Property_Form fields with the corresponding values from ImportResult.
2. THE Importer SHALL map ImportResult fields to Property_Form fields as follows: `title` → title, `address` → address, `city` → city, `price` → price, `sqm` → sqm, `rooms` → rooms, `description` → description, `property_type` → property_type.
3. WHEN a field in ImportResult is `null` or absent, THE Importer SHALL leave the corresponding Property_Form field empty rather than overwriting it with a null or undefined value.
4. WHEN the Property_Form is auto-filled, THE Importer SHALL expand and display the property add form so the user can review the pre-filled values.
5. WHEN the Property_Form is auto-filled, THE Importer SHALL display a success notification indicating that the import completed and the form is ready for review.
6. THE Importer SHALL allow the user to edit any pre-filled field before saving.

---

### Requirement 5: Authentication and Rate Limiting

**User Story:** As a product owner, I want the import endpoint to be protected and rate-limited, so that the service is not abused and costs are controlled.

#### Acceptance Criteria

1. WHEN a request reaches Scrape_API without a valid Supabase session, THE Scrape_API SHALL return an HTTP 401 response with error code `UNAUTHORIZED`.
2. WHEN an Authenticated_User makes more than 10 import requests within a 60-second sliding window, THE Scrape_API SHALL return an HTTP 429 response with error code `RATE_LIMITED`.
3. THE Scrape_API SHALL use the existing `rateLimit` utility from `lib/utils/rate-limit.ts` with the authenticated user's ID as the rate-limit key.

---

### Requirement 6: Error Handling and User Feedback

**User Story:** As a real estate agent, I want clear feedback when an import fails, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. WHEN Scrape_API returns an error response, THE Importer SHALL display a toast notification describing the failure in the user's active language (Croatian or English).
2. WHEN the error code is `SCRAPE_FAILED` or `SCRAPE_TIMEOUT`, THE Importer SHALL display a message indicating the listing URL could not be fetched and suggesting the user check the URL or try again.
3. WHEN the error code is `EXTRACTION_FAILED` or `EXTRACTION_INCOMPLETE`, THE Importer SHALL display a message indicating the property details could not be extracted and suggesting the user fill the form manually.
4. WHEN the error code is `RATE_LIMITED`, THE Importer SHALL display a message indicating the user has made too many requests and should wait before trying again.
5. WHEN any error occurs, THE Importer SHALL re-enable the import button and clear the loading state so the user can retry.
6. IF the URL input field is empty when the import button is activated, THEN THE Importer SHALL display an inline validation message and SHALL NOT submit a request to Scrape_API.
