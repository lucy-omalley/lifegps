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

-- Self-Discovery Modules (LifeGPS v2)
CREATE TABLE IF NOT EXISTS palm_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  left_hand_image_url TEXT,
  right_hand_image_url TEXT,
  extracted_features_json JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  strengths_json JSONB DEFAULT '[]'::jsonb,
  blind_spots_json JSONB DEFAULT '[]'::jsonb,
  career_insights_json JSONB DEFAULT '[]'::jsonb,
  relationship_insights_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS face_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  face_image_url TEXT,
  extracted_features_json JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  confidence_insights_json JSONB DEFAULT '[]'::jsonb,
  communication_insights_json JSONB DEFAULT '[]'::jsonb,
  leadership_insights_json JSONB DEFAULT '[]'::jsonb,
  stress_pattern_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS numerology_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  birth_date DATE NOT NULL,
  life_path_number INT,
  expression_number INT,
  soul_number INT,
  personal_year_number INT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  spread_type TEXT NOT NULL,
  cards_json JSONB DEFAULT '[]'::jsonb,
  ai_interpretation TEXT,
  action_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS unified_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_modules_json JSONB DEFAULT '[]'::jsonb,
  palm_weight NUMERIC(5,4),
  face_weight NUMERIC(5,4),
  numerology_weight NUMERIC(5,4),
  tarot_weight NUMERIC(5,4),
  quiz_weight NUMERIC(5,4),
  unified_summary TEXT,
  top_strengths_json JSONB DEFAULT '[]'::jsonb,
  blind_spots_json JSONB DEFAULT '[]'::jsonb,
  career_direction_json JSONB DEFAULT '[]'::jsonb,
  relationship_style_json JSONB DEFAULT '[]'::jsonb,
  money_style_json JSONB DEFAULT '[]'::jsonb,
  growth_recommendations_json JSONB DEFAULT '[]'::jsonb,
  blueprint_confidence_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discovery_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  completed_modules JSONB DEFAULT '[]'::jsonb,
  free_module_used BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE palm_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerology_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own palm readings" ON palm_readings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own face readings" ON face_readings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own numerology readings" ON numerology_readings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tarot readings" ON tarot_readings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own unified profiles" ON unified_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own discovery progress" ON discovery_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_palm_readings_user_id ON palm_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_face_readings_user_id ON face_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_numerology_readings_user_id ON numerology_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_readings_user_id ON tarot_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_user_id ON unified_profiles(user_id);
