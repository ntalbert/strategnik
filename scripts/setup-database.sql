-- GTM Tenure Survey Database Schema
-- Run this in your Vercel Postgres dashboard or via psql

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

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_survey_responses_path ON survey_responses(path);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);
