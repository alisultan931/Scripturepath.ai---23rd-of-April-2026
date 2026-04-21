-- ============================================================
-- ScripturePath — Credits & Subscriptions Migration
-- Run this entire file in Supabase → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  credits               INTEGER     NOT NULL DEFAULT 5,
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  subscription_status   TEXT,
  subscription_plan     TEXT,
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. STUDIES TABLE
CREATE TABLE IF NOT EXISTS public.studies (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title        TEXT,
  scripture_ref TEXT,
  study_data   JSONB       NOT NULL,
  depth        TEXT        DEFAULT 'normal',
  credits_used INTEGER     DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own studies"
  ON public.studies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own studies"
  ON public.studies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. AUTO-CREATE PROFILE ON SIGNUP (gives new users 5 credits)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (NEW.id, 5)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. ATOMIC CREDIT DEDUCTION (called by generate-study API)
--    Returns new credit balance, or -1 if insufficient credits.
CREATE OR REPLACE FUNCTION public.deduct_credits(user_uuid UUID, amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = user_uuid
  FOR UPDATE;

  IF current_credits IS NULL OR current_credits < amount THEN
    RETURN -1;
  END IF;

  UPDATE public.profiles
  SET credits = credits - amount
  WHERE id = user_uuid;

  RETURN current_credits - amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. BACKFILL: create profiles for any existing users who signed up before this migration
INSERT INTO public.profiles (id, credits)
SELECT id, 5 FROM auth.users
ON CONFLICT (id) DO NOTHING;
