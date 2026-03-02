import type { APIRoute } from 'astro';
import pg from 'pg';

export const prerender = false;

const { Pool } = pg;

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour window
    return true;
  }

  if (entry.count >= 10) return false; // 10 submissions per hour
  entry.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { email, first_name, company, role, source, scenario_name, cohort_count, arr_goal, asp, true_cpl, campaign_profiles } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Connect to database
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    if (!connectionString) {
      console.error('No database connection string found');
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calculator_leads (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        email TEXT NOT NULL,
        first_name TEXT,
        company TEXT,
        role TEXT,
        source TEXT DEFAULT 'funnel_calculator',
        calculator_metadata JSONB
      )
    `);

    // Insert lead
    await pool.query(
      `INSERT INTO calculator_leads (email, first_name, company, role, source, calculator_metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        email,
        first_name || null,
        company || null,
        role || null,
        source || 'funnel_calculator',
        JSON.stringify({
          scenario_name,
          cohort_count,
          arr_goal,
          asp,
          true_cpl,
          campaign_profiles,
        }),
      ]
    );

    await pool.end();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Lead capture error:', error);
    // Return success even on error so PDF still generates
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
