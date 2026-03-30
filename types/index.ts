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

export interface GenerateRequest {
  message: string
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
