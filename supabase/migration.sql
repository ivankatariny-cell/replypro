-- ============================================
-- ReplyPro Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Generations table
CREATE TABLE IF NOT EXISTS public.rp_generations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_message text NOT NULL,
  reply_professional text NOT NULL,
  reply_friendly text NOT NULL,
  reply_direct text NOT NULL,
  detected_language text NOT NULL DEFAULT 'hr' CHECK (detected_language IN ('hr', 'en')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.rp_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled')),
  trial_generations_used integer NOT NULL DEFAULT 0,
  trial_generations_limit integer NOT NULL DEFAULT 10,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rp_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rp_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Generations policies
CREATE POLICY "Users can view own generations" ON public.rp_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON public.rp_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.rp_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access subscriptions" ON public.rp_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rp_gen_user ON public.rp_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_rp_gen_created ON public.rp_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rp_sub_stripe ON public.rp_subscriptions(stripe_customer_id);

-- ============================================
-- Triggers
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.rp_update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS rp_profiles_updated ON public.profiles;
CREATE TRIGGER rp_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.rp_update_updated_at();

DROP TRIGGER IF EXISTS rp_subs_updated ON public.rp_subscriptions;
CREATE TRIGGER rp_subs_updated
  BEFORE UPDATE ON public.rp_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.rp_update_updated_at();

-- Auto-create profile + subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.rp_subscriptions (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
