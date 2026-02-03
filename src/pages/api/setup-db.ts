import type { APIRoute } from 'astro';
import pg from 'pg';

export const prerender = false;

const { Pool } = pg;

export const GET: APIRoute = async () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        timestamp TEXT,
        path TEXT,
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
        current_stage TEXT,
        company_size TEXT,
        gtm_count TEXT,
        what_changed TEXT,
        measured_against TEXT,
        right_metrics TEXT,
        founder_wish TEXT,
        founder_hindsight TEXT,
        email TEXT,
        name TEXT,
        linkedin TEXT
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_responses_path ON survey_responses(path)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at)`);

    await pool.end();

    return new Response(JSON.stringify({
      success: true,
      message: 'Database table created successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database setup error:', error);
    await pool.end();
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
