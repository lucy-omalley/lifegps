-- Migration: Compass persistence + extended blueprint fields
-- Run in Supabase SQL Editor if you already applied an older schema.sql

CREATE TABLE IF NOT EXISTS compass_sessions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_question INT NOT NULL DEFAULT 0,
  phase TEXT NOT NULL DEFAULT 'intro',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_complete BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS archetype TEXT;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS archetype_summary TEXT;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS compass_score_overview TEXT;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS seven_day_starter_plan JSONB;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS weekly_check_in_questions JSONB;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS side_business_direction TEXT;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS communication_growth_plan TEXT;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS burnout_recovery_actions TEXT;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS financial_freedom_notes TEXT;

ALTER TABLE compass_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own compass sessions" ON compass_sessions;
CREATE POLICY "Users can manage own compass sessions" ON compass_sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'anonymous@lifegps.app'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'LifeGPS User')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_compass_sessions_updated_at ON compass_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_life_blueprints_created_at ON life_blueprints(user_id, created_at DESC);
