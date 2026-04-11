// Re-export DB row types as the canonical application types.
// These are derived from the generated Database schema in types/supabase.ts
// so they stay in sync with the actual database automatically.
export type {
  ProfileRow as UserProfile,
  SubscriptionRow as Subscription,
  ClientRow as Client,
  PropertyRow as Property,
  TemplateRow as Template,
  GenerationRow as Generation,
  FavoriteRow as Favorite,
  AppointmentRow as Appointment,
  AvailabilityRuleRow as AvailabilityRule,
  AvailabilityExceptionRow as AvailabilityException,
} from '@/types/supabase'

// ── API request / response shapes (not DB rows) ──────────────────────────────

export interface GenerateRequest {
  message: string
  client_id?: string
  property_id?: string
  template_context?: string
  quick_reply?: boolean
}

export interface SuggestedBooking {
  date: string        // YYYY-MM-DD
  startTime: string   // HH:MM
  endTime: string     // HH:MM
  label: string       // human-readable, e.g. "Thursday, 15 May at 10:00"
  suggestedTitle: string
  language: 'hr' | 'en'
}

export interface GenerateResponse {
  professional: string
  friendly: string
  direct: string
  detected_language: 'hr' | 'en'
  generations_remaining: number | null
  suggestedBooking?: SuggestedBooking | null
  /** True when the requested slot conflicts with existing appointments */
  availabilityConflict?: boolean
}

export interface ApiError {
  error: string
  code: string
}

// ── Convenience union types ───────────────────────────────────────────────────
import type { ClientRow, PropertyRow, TemplateRow } from '@/types/supabase'

export type ClientStatus = ClientRow['status']
export type PropertyType = PropertyRow['property_type']
export type TemplateCategory = TemplateRow['category']
