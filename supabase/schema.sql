-- LifeGPS Supabase Schema
-- Run this in your Supabase SQL Editor

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In-progress Compass assessment sessions (one row per user)
CREATE TABLE IF NOT EXISTS compass_sessions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_question INT NOT NULL DEFAULT 0,
  phase TEXT NOT NULL DEFAULT 'intro',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table (completed assessments)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Life blueprints table
CREATE TABLE IF NOT EXISTS life_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  archetype TEXT,
  archetype_summary TEXT,
  compass_score_overview TEXT,
  future_self_summary TEXT,
  current_state_analysis TEXT,
  dream_life_vision TEXT,
  gap_analysis TEXT,
  five_year_roadmap JSONB,
  twelve_month_plan JSONB,
  ninety_day_action_plan JSONB,
  seven_day_starter_plan JSONB,
  weekly_priorities JSONB,
  daily_habits JSONB,
  weekly_check_in_questions JSONB,
  side_business_direction TEXT,
  communication_growth_plan TEXT,
  burnout_recovery_actions TEXT,
  financial_freedom_notes TEXT,
  recommended_first_step TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly check-ins table
CREATE TABLE IF NOT EXISTS weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress TEXT,
  blockers TEXT,
  support_needed TEXT,
  next_priority TEXT,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blueprint_id UUID REFERENCES life_blueprints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed_dates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create public.users row when auth user is created
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

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE compass_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own compass sessions" ON compass_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assessments" ON assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own blueprints" ON life_blueprints
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own checkins" ON weekly_checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compass_sessions_updated_at ON compass_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_life_blueprints_user_id ON life_blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_life_blueprints_created_at ON life_blueprints(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_user_id ON weekly_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
