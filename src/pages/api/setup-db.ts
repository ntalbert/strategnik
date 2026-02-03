import type { APIRoute } from 'astro';
import { sql } from '@vercel/postgres';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    await sql`
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
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_path ON survey_responses(path)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at)`;

    return new Response(JSON.stringify({
      success: true,
      message: 'Database table created successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
