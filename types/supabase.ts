export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          agency_name: string | null
          city: string | null
          preferred_tone: 'formal' | 'mixed' | 'casual'
          language: 'hr' | 'en'
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          agency_name?: string | null
          city?: string | null
          preferred_tone?: 'formal' | 'mixed' | 'casual'
          language?: 'hr' | 'en'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          agency_name?: string | null
          city?: string | null
          preferred_tone?: 'formal' | 'mixed' | 'casual'
          language?: 'hr' | 'en'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rp_subscriptions: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'trial' | 'active' | 'past_due' | 'cancelled'
          trial_generations_used?: number
          trial_generations_limit?: number
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'trial' | 'active' | 'past_due' | 'cancelled'
          trial_generations_used?: number
          trial_generations_limit?: number
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rp_clients: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          tags?: string[]
          status?: 'new' | 'contacted' | 'viewing' | 'negotiation' | 'closed' | 'lost'
          property_interest?: string | null
          city?: string | null
          budget_min?: number | null
          budget_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          tags?: string[]
          status?: 'new' | 'contacted' | 'viewing' | 'negotiation' | 'closed' | 'lost'
          property_interest?: string | null
          city?: string | null
          budget_min?: number | null
          budget_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rp_properties: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          title: string
          address?: string | null
          city?: string | null
          price?: number | null
          sqm?: number | null
          rooms?: number | null
          description?: string | null
          property_type?: 'apartment' | 'house' | 'land' | 'commercial' | 'other'
          status?: 'active' | 'sold' | 'reserved' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          address?: string | null
          city?: string | null
          price?: number | null
          sqm?: number | null
          rooms?: number | null
          description?: string | null
          property_type?: 'apartment' | 'house' | 'land' | 'commercial' | 'other'
          status?: 'active' | 'sold' | 'reserved' | 'inactive'
          created_at?: string
        }
        Relationships: []
      }
      rp_templates: {
        Row: {
          id: string
          user_id: string | null
          category: 'first_contact' | 'follow_up' | 'viewing' | 'price' | 'closing' | 'rejection' | 'custom'
          name_hr: string
          name_en: string
          prompt_context: string
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          category: 'first_contact' | 'follow_up' | 'viewing' | 'price' | 'closing' | 'rejection' | 'custom'
          name_hr: string
          name_en: string
          prompt_context: string
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          category?: 'first_contact' | 'follow_up' | 'viewing' | 'price' | 'closing' | 'rejection' | 'custom'
          name_hr?: string
          name_en?: string
          prompt_context?: string
          is_system?: boolean
          created_at?: string
        }
        Relationships: []
      }
      rp_generations: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          original_message: string
          reply_professional: string
          reply_friendly: string
          reply_direct: string
          detected_language?: 'hr' | 'en'
          client_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_message?: string
          reply_professional?: string
          reply_friendly?: string
          reply_direct?: string
          detected_language?: 'hr' | 'en'
          client_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      rp_favorites: {
        Row: {
          id: string
          user_id: string
          generation_id: string | null
          tone: 'professional' | 'friendly' | 'direct'
          content: string
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          generation_id?: string | null
          tone: 'professional' | 'friendly' | 'direct'
          content: string
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          generation_id?: string | null
          tone?: 'professional' | 'friendly' | 'direct'
          content?: string
          label?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_trial_usage: {
        Args: { p_user_id: string }
        Returns: { success: boolean; generations_used: number; generations_limit: number }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience row type aliases
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type SubscriptionRow = Database['public']['Tables']['rp_subscriptions']['Row']
export type ClientRow = Database['public']['Tables']['rp_clients']['Row']
export type PropertyRow = Database['public']['Tables']['rp_properties']['Row']
export type TemplateRow = Database['public']['Tables']['rp_templates']['Row']
export type GenerationRow = Database['public']['Tables']['rp_generations']['Row']
export type FavoriteRow = Database['public']['Tables']['rp_favorites']['Row']
