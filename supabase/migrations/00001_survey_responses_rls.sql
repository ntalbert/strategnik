-- Mirror the survey_responses table from scripts/setup-database.sql
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Submission metadata
  timestamp TEXT,
  path TEXT, -- 'gtm' or 'founder'

  -- GTM Leader fields
  survey_function TEXT,
  title TEXT,
  title_other TEXT,
  stage_start TEXT,
  stage_end TEXT,
  tenure TEXT,
  outcome TEXT,
  stated_reason TEXT,
  real_reason TEXT,
  tooling TEXT,
  measurement TEXT,
  levers TEXT,
  built_inherited TEXT,
  system_change TEXT,
  wish_board TEXT,

  -- Founder fields
  current_stage TEXT,
  company_size TEXT,
  gtm_count TEXT,
  what_changed TEXT,
  measured_against TEXT,
  right_metrics TEXT,
  founder_wish TEXT,
  founder_hindsight TEXT,

  -- Contact fields (both paths)
  email TEXT,
  name TEXT,
  linkedin TEXT
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_path ON survey_responses(path);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);

-- Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT (public survey submissions)
CREATE POLICY insert_survey ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to SELECT (admin reads)
CREATE POLICY select_survey_admin ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);

-- No UPDATE or DELETE policies — denied by default when RLS is enabled
