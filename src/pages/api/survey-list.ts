import type { APIRoute } from 'astro';
import pg from 'pg';

export const prerender = false;

const { Pool } = pg;

export const GET: APIRoute = async () => {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '';

  const pool = new Pool({
    connectionString: connectionString.replace('sslmode=require', ''),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const result = await pool.query(`
      SELECT * FROM survey_responses ORDER BY created_at DESC LIMIT 20
    `);

    await pool.end();

    return new Response(JSON.stringify({
      success: true,
      count: result.rows.length,
      responses: result.rows
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database query error:', error);
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
