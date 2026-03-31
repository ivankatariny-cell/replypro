export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  agency_name: string
  city: string
  preferred_tone: 'formal' | 'mixed' | 'casual'
  language: 'hr' | 'en'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  original_message: string
  reply_professional: string
  reply_friendly: string
  reply_direct: string
  detected_language: 'hr' | 'en'
  client_id: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'trial' | 'active' | 'past_due' | 'cancelled'
  trial_generations_used: number
  trial_generations_limit: number
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  full_name: string
  phone: string | null
  email: string | null
  notes: string | null
  tags: string[]
  status: 'new' | 'contacted' | 'viewing' | 'negotiation' | 'closed' | 'lost'
  property_interest: string | null
  city: string | null
  budget_min: number | null
  budget_max: number | null
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  user_id: string
  title: string
  address: string | null
  city: string | null
  price: number | null
  sqm: number | null
  rooms: number | null
  description: string | null
  property_type: 'apartment' | 'house' | 'land' | 'commercial' | 'other'
  status: 'active' | 'sold' | 'reserved' | 'inactive'
  created_at: string
}

export interface Template {
  id: string
  user_id: string | null
  category: 'first_contact' | 'follow_up' | 'viewing' | 'price' | 'closing' | 'rejection' | 'custom'
  name_hr: string
  name_en: string
  prompt_context: string
  is_system: boolean
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  generation_id: string | null
  tone: 'professional' | 'friendly' | 'direct'
  content: string
  label: string | null
  created_at: string
}

export interface GenerateRequest {
  message: string
  client_id?: string
  property_id?: string
  template_context?: string
  quick_reply?: boolean
}

export interface GenerateResponse {
  professional: string
  friendly: string
  direct: string
  detected_language: 'hr' | 'en'
  generations_remaining: number | null
}

export interface ApiError {
  error: string
  code: string
}

export type ClientStatus = Client['status']
export type PropertyType = Property['property_type']
export type TemplateCategory = Template['category']
