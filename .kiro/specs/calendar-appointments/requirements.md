# Requirements Document

## Introduction

The Calendar & Appointments feature adds scheduling capabilities to ReplyPro, a real estate AI reply generation SaaS for Croatian and English-speaking agents. Agents will be able to manage property showings and appointments in a calendar view, define their weekly availability, and have the AI reply generator automatically check availability when a client message requests a specific date or time. When the agent is busy, the AI will suggest alternative available slots and craft replies accordingly. This feature integrates with the existing generate pipeline (`/api/generate`), the client book, and the property catalog.

## Glossary

- **Agent**: The authenticated ReplyPro user (real estate agent) who owns the calendar.
- **Appointment**: A scheduled event (e.g., property showing, client meeting) with a start time, end time, title, and optional links to a client and property.
- **Availability_Rule**: A recurring weekly rule that defines the hours during which the Agent is available (e.g., Monday–Friday 09:00–18:00).
- **Availability_Exception**: A one-off date override that marks the Agent as unavailable (e.g., a holiday or personal day).
- **Calendar**: The Agent's personal view of all appointments and availability, scoped to their user account.
- **Slot**: A specific date-and-time interval that is either free or occupied based on the Agent's appointments and availability rules.
- **Conflict**: A state where a requested Slot overlaps with an existing Appointment or falls outside the Agent's Availability_Rules.
- **AI_Reply_Generator**: The existing system at `/api/generate` that produces professional, friendly, and direct reply variants using Groq.
- **Availability_Context**: A structured summary of the Agent's schedule injected into the AI_Reply_Generator prompt when a client message references a date or time.
- **Calendar_Page**: The new dashboard page at `/calendar` that renders the Agent's appointments and availability.

---

## Requirements

### Requirement 1: Appointment Management

**User Story:** As an Agent, I want to create, view, edit, and delete appointments in a calendar, so that I can track all my property showings and client meetings in one place.

#### Acceptance Criteria

1. THE Calendar_Page SHALL display appointments in a monthly and weekly view, switchable by the Agent.
2. WHEN the Agent submits a valid appointment form with a title, date, start time, and end time, THE Calendar SHALL create the appointment and display it on the correct date.
3. WHEN the Agent submits an appointment form where the end time is not after the start time, THE Calendar SHALL reject the submission and display a validation error message.
4. WHEN the Agent selects an existing appointment, THE Calendar SHALL display an edit form pre-populated with the appointment's current data.
5. WHEN the Agent saves edits to an existing appointment, THE Calendar SHALL update the appointment and reflect the changes immediately in the calendar view.
6. WHEN the Agent deletes an appointment, THE Calendar SHALL remove it from the calendar view after confirmation.
7. WHERE a client is linked to an appointment, THE Calendar SHALL display the client's name on the appointment card.
8. WHERE a property is linked to an appointment, THE Calendar SHALL display the property title on the appointment card.
9. THE Calendar_Page SHALL display appointments only for the authenticated Agent (no cross-user data leakage).

---

### Requirement 2: Availability Configuration

**User Story:** As an Agent, I want to define my weekly working hours and mark specific days as unavailable, so that the AI can accurately reflect my schedule when replying to clients.

#### Acceptance Criteria

1. THE Calendar_Page SHALL provide an availability settings panel where the Agent can define Availability_Rules per day of the week (Monday through Sunday).
2. WHEN the Agent saves an Availability_Rule for a day, THE Calendar SHALL store the rule with the specified start time and end time for that weekday.
3. WHEN the Agent sets a day as unavailable in the Availability_Rule, THE Calendar SHALL treat all Slots on that weekday as occupied.
4. WHEN the Agent creates an Availability_Exception for a specific date, THE Calendar SHALL treat all Slots on that date as occupied regardless of the Availability_Rule for that weekday.
5. THE Calendar_Page SHALL display Availability_Exceptions as blocked-out days in the calendar view.
6. WHEN the Agent deletes an Availability_Exception, THE Calendar SHALL restore the default Availability_Rule for that date.
7. THE Availability_Rule data SHALL be scoped to the authenticated Agent and not visible to other users.

---

### Requirement 3: Availability Check in AI Reply Generation

**User Story:** As an Agent, I want the AI to know my availability when generating replies, so that it can confirm, decline, or suggest alternative times when a client asks about a specific date or time.

#### Acceptance Criteria

1. WHEN the AI_Reply_Generator receives a message that contains a date or time reference, THE AI_Reply_Generator SHALL query the Agent's appointments and Availability_Rules for the referenced period before generating replies.
2. WHEN the referenced Slot is free (no Conflict), THE AI_Reply_Generator SHALL generate replies that confirm availability for that date and time.
3. WHEN the referenced Slot has a Conflict, THE AI_Reply_Generator SHALL generate replies that politely decline the requested time and suggest up to 3 alternative free Slots within the same week.
4. WHEN no free Slots exist in the same week as the requested date, THE AI_Reply_Generator SHALL generate replies that suggest the Agent will follow up with available times.
5. THE AI_Reply_Generator SHALL inject the Availability_Context into the system prompt as structured text, not as raw database records.
6. WHEN the client message contains no date or time reference, THE AI_Reply_Generator SHALL generate replies without querying the calendar, preserving existing behavior.
7. THE Availability_Context injected into the prompt SHALL include: the requested date/time, whether it is free or occupied, and up to 3 suggested alternative Slots if a Conflict exists.

---

### Requirement 4: Calendar Page UI

**User Story:** As an Agent, I want a dedicated calendar page in the dashboard, so that I can see all my appointments at a glance and manage my schedule without leaving the app.

#### Acceptance Criteria

1. THE Calendar_Page SHALL be accessible at the route `/calendar` within the authenticated dashboard layout.
2. THE Sidebar SHALL include a navigation link to the Calendar_Page, consistent with existing navigation items (Clients, Properties, Favorites, etc.).
3. THE Calendar_Page SHALL render a monthly grid view by default, with each day cell showing appointment count or appointment titles when space permits.
4. WHEN the Agent switches to weekly view, THE Calendar_Page SHALL render a 7-column grid with hourly time slots from 07:00 to 22:00.
5. THE Calendar_Page SHALL display a "New Appointment" button that opens an appointment creation form.
6. THE Calendar_Page SHALL support both Croatian and English UI text via the existing localization system (`locales/hr.json` and `locales/en.json`).
7. WHILE the calendar data is loading, THE Calendar_Page SHALL display skeleton loaders consistent with the existing skeleton component.
8. IF the calendar data fails to load, THE Calendar_Page SHALL display an error message and a retry button.

---

### Requirement 5: Appointment Data Persistence

**User Story:** As an Agent, I want my appointments and availability settings to be saved to the database, so that my schedule persists across sessions and devices.

#### Acceptance Criteria

1. THE Calendar SHALL persist all appointments in a dedicated `rp_appointments` table in Supabase with Row Level Security enabled, scoped to the owning Agent.
2. THE Calendar SHALL persist Availability_Rules in a dedicated `rp_availability_rules` table in Supabase with Row Level Security enabled, scoped to the owning Agent.
3. THE Calendar SHALL persist Availability_Exceptions in a dedicated `rp_availability_exceptions` table in Supabase with Row Level Security enabled, scoped to the owning Agent.
4. WHEN an Agent's account is deleted, THE Calendar SHALL cascade-delete all associated appointments, Availability_Rules, and Availability_Exceptions.
5. THE `rp_appointments` table SHALL store: id, user_id, title, description, start_at (timestamptz), end_at (timestamptz), client_id (nullable FK), property_id (nullable FK), created_at, updated_at.
6. THE `rp_availability_rules` table SHALL store: id, user_id, day_of_week (0–6), start_time (time), end_time (time), is_available (boolean).
7. THE `rp_availability_exceptions` table SHALL store: id, user_id, exception_date (date), is_available (boolean), reason (nullable text).

---

### Requirement 6: Date/Time Detection in Client Messages

**User Story:** As an Agent, I want the system to automatically detect when a client message mentions a date or time, so that availability checking is triggered only when relevant.

#### Acceptance Criteria

1. THE AI_Reply_Generator SHALL detect date or time references in client messages written in Croatian and English before deciding whether to query the calendar.
2. WHEN a client message contains explicit date patterns (e.g., "15.3.", "March 15", "15/03/2025", "tomorrow", "next Monday", "sutra", "idući tjedan"), THE AI_Reply_Generator SHALL treat the message as containing a date reference.
3. WHEN a client message contains explicit time patterns (e.g., "10:00", "at 3pm", "u 10 sati", "poslijepodne"), THE AI_Reply_Generator SHALL treat the message as containing a time reference.
4. WHEN a client message contains neither a date nor a time reference, THE AI_Reply_Generator SHALL skip the availability check and generate replies using the existing prompt without Availability_Context.
5. THE date/time detection logic SHALL be implemented as a pure utility function that accepts a message string and returns a boolean, enabling independent unit testing.

---

### Requirement 7: Dashboard Integration

**User Story:** As an Agent, I want to see upcoming appointments on the main dashboard, so that I have a quick overview of my schedule without navigating to the calendar page.

#### Acceptance Criteria

1. THE Dashboard SHALL display a "Upcoming Appointments" widget showing the next 3 appointments sorted by start_at ascending.
2. WHEN no upcoming appointments exist, THE Dashboard SHALL display a placeholder message with a link to the Calendar_Page.
3. WHEN an appointment in the widget is clicked, THE Dashboard SHALL navigate the Agent to the Calendar_Page with that appointment's date in view.
4. THE Dashboard widget SHALL show each appointment's title, date, start time, and optionally the linked client name.
5. WHILE the upcoming appointments are loading, THE Dashboard SHALL display skeleton loaders for the widget.
