-- ReplyPro Full Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  agency_name text,
  city text,
  preferred_tone text DEFAULT 'mixed' CHECK (preferred_tone IN ('formal', 'mixed', 'casual')),
  language text DEFAULT 'hr' CHECK (language IN ('hr', 'en')),
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER rp_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rp_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled')),
  trial_generations_used integer NOT NULL DEFAULT 0,
  trial_generations_limit integer NOT NULL DEFAULT 10,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rp_sub_stripe ON rp_subscriptions(stripe_customer_id);

ALTER TABLE rp_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON rp_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON rp_subscriptions FOR ALL USING (auth.role() = 'service_role');

CREATE TRIGGER rp_subs_updated BEFORE UPDATE ON rp_subscriptions
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ============================================
-- CLIENTS TABLE (Mini-CRM)
-- ============================================
CREATE TABLE IF NOT EXISTS rp_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  notes text,
  tags text[] DEFAULT '{}',
  status text DEFAULT 'new' CHECK (status IN ('new','contacted','viewing','negotiation','closed','lost')),
  property_interest text,
  city text,
  budget_min integer,
  budget_max integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rp_clients_user ON rp_clients(user_id);
CREATE INDEX idx_rp_clients_status ON rp_clients(user_id, status);

ALTER TABLE rp_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own clients" ON rp_clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON rp_clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON rp_clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON rp_clients FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER rp_clients_updated BEFORE UPDATE ON rp_clients
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rp_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  address text,
  city text,
  price integer,
  sqm integer,
  rooms integer,
  description text,
  property_type text DEFAULT 'apartment' CHECK (property_type IN ('apartment','house','land','commercial','other')),
  status text DEFAULT 'active' CHECK (status IN ('active','sold','reserved','inactive')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rp_properties_user ON rp_properties(user_id);

ALTER TABLE rp_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own properties" ON rp_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON rp_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON rp_properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON rp_properties FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('first_contact','follow_up','viewing','price','closing','rejection','custom')),
  name_hr text NOT NULL,
  name_en text NOT NULL,
  prompt_context text NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rp_templates_user ON rp_templates(user_id);

ALTER TABLE rp_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own and system templates" ON rp_templates FOR SELECT USING (auth.uid() = user_id OR is_system = true);
CREATE POLICY "Users can insert own templates" ON rp_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON rp_templates FOR UPDATE USING (auth.uid() = user_id AND is_system = false);
CREATE POLICY "Users can delete own templates" ON rp_templates FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rp_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id uuid REFERENCES rp_generations(id) ON DELETE SET NULL,
  tone text NOT NULL CHECK (tone IN ('professional','friendly','direct')),
  content text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rp_favorites_user ON rp_favorites(user_id);

ALTER TABLE rp_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON rp_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON rp_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON rp_favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- GENERATIONS TABLE (add client_id)
-- ============================================
CREATE TABLE IF NOT EXISTS rp_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_message text NOT NULL,
  reply_professional text NOT NULL,
  reply_friendly text NOT NULL,
  reply_direct text NOT NULL,
  detected_language text NOT NULL DEFAULT 'hr' CHECK (detected_language IN ('hr', 'en')),
  client_id uuid REFERENCES rp_clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rp_gen_user ON rp_generations(user_id);
CREATE INDEX idx_rp_gen_created ON rp_generations(created_at DESC);

ALTER TABLE rp_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own generations" ON rp_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations" ON rp_generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE + SUBSCRIPTION ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.rp_subscriptions (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
