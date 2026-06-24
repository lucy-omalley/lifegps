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

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Life blueprints table
CREATE TABLE IF NOT EXISTS life_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  future_self_summary TEXT,
  current_state_analysis TEXT,
  dream_life_vision TEXT,
  gap_analysis TEXT,
  five_year_roadmap JSONB,
  twelve_month_plan JSONB,
  ninety_day_action_plan JSONB,
  weekly_priorities JSONB,
  daily_habits JSONB,
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

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own assessments" ON assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own blueprints" ON life_blueprints
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own checkins" ON weekly_checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_life_blueprints_user_id ON life_blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_user_id ON weekly_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
