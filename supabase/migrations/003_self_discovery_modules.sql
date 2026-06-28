-- Self-Discovery Modules Migration
-- Run in Supabase SQL Editor for existing installs

-- Palm readings
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

-- Face readings
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

-- Numerology readings
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

-- Tarot readings
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

-- Unified self-discovery profiles
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

-- Discovery progress tracking (free tier gating)
CREATE TABLE IF NOT EXISTS discovery_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  completed_modules JSONB DEFAULT '[]'::jsonb,
  free_module_used BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_palm_readings_user_id ON palm_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_face_readings_user_id ON face_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_numerology_readings_user_id ON numerology_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_readings_user_id ON tarot_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_user_id ON unified_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unified_profiles_user_latest ON unified_profiles(user_id, updated_at DESC);
