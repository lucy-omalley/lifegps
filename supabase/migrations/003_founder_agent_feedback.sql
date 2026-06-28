-- Founder Agent: blueprint feedback + recalculation tracking
-- Run after schema.sql if upgrading an existing project

CREATE TABLE IF NOT EXISTS blueprint_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES life_blueprints(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  section_ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  reflection TEXT,
  missing_context TEXT,
  unrealistic_parts TEXT,
  willingness_to_pay TEXT CHECK (willingness_to_pay IN ('yes', 'maybe', 'no')),
  is_recalculation BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS parent_blueprint_id UUID REFERENCES life_blueprints(id) ON DELETE SET NULL;
ALTER TABLE life_blueprints ADD COLUMN IF NOT EXISTS recalculation_count INT NOT NULL DEFAULT 0;

ALTER TABLE blueprint_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own blueprint feedback" ON blueprint_feedback
  FOR ALL USING (auth.uid() = user_id);

-- TODO: Add admin/service-role policy for founder dashboard aggregations before production

CREATE INDEX IF NOT EXISTS idx_blueprint_feedback_blueprint_id ON blueprint_feedback(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_feedback_created_at ON blueprint_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_life_blueprints_parent ON life_blueprints(parent_blueprint_id);
