BEGIN;
SELECT plan(8);

-- 1. RLS is enabled on survey_responses
SELECT policies_are(
  'public',
  'survey_responses',
  ARRAY['insert_survey', 'select_survey_admin'],
  'survey_responses has exactly the expected RLS policies'
);

-- Seed a row as postgres (superuser bypasses RLS) for read tests
INSERT INTO survey_responses (path, email) VALUES ('gtm', 'test@example.com');

-- ============================================================
-- Tests as anon
-- ============================================================
SET ROLE anon;

-- 2. anon can INSERT
SELECT lives_ok(
  $$INSERT INTO survey_responses (path, email) VALUES ('founder', 'anon@example.com')$$,
  'anon can INSERT into survey_responses'
);

-- 3. anon cannot SELECT
SELECT is_empty(
  $$SELECT * FROM survey_responses$$,
  'anon cannot SELECT from survey_responses'
);

-- 4. anon cannot UPDATE
SELECT throws_ok(
  $$UPDATE survey_responses SET email = 'hacked@example.com' WHERE id = 1$$,
  '42501',
  NULL,
  'anon cannot UPDATE survey_responses'
);

-- 5. anon cannot DELETE
SELECT throws_ok(
  $$DELETE FROM survey_responses WHERE id = 1$$,
  '42501',
  NULL,
  'anon cannot DELETE from survey_responses'
);

-- ============================================================
-- Tests as authenticated
-- ============================================================
RESET ROLE;
SET ROLE authenticated;

-- 6. authenticated can SELECT
SELECT results_ne(
  $$SELECT * FROM survey_responses$$,
  $$SELECT * FROM survey_responses WHERE false$$,
  'authenticated can SELECT from survey_responses'
);

-- 7. authenticated cannot UPDATE
SELECT throws_ok(
  $$UPDATE survey_responses SET email = 'hacked@example.com' WHERE id = 1$$,
  '42501',
  NULL,
  'authenticated cannot UPDATE survey_responses'
);

-- 8. authenticated cannot DELETE
SELECT throws_ok(
  $$DELETE FROM survey_responses WHERE id = 1$$,
  '42501',
  NULL,
  'authenticated cannot DELETE from survey_responses'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
