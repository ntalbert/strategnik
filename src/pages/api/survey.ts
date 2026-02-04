import type { APIRoute } from 'astro';
import pg from 'pg';

export const prerender = false;

const { Pool } = pg;

// Simple rate limiting (5 submissions per IP per hour)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export const POST: APIRoute = async ({ request }) => {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Too many submissions. Please try again later.'
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || '';

  const pool = new Pool({
    connectionString: connectionString.replace('sslmode=require', ''),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const data = await request.json();

    const {
      timestamp,
      path,
      function: surveyFunction,
      title,
      titleOther,
      stageStart,
      stageEnd,
      tenure,
      outcome,
      statedReason,
      realReason,
      tooling,
      measurement,
      levers,
      builtInherited,
      systemChange,
      wishBoard,
      currentStage,
      companySize,
      gtmCount,
      whatChanged,
      measuredAgainst,
      rightMetrics,
      founderWish,
      founderHindsight,
      email,
      name,
      linkedin,
    } = data;

    await pool.query(`
      INSERT INTO survey_responses (
        timestamp, path, survey_function, title, title_other,
        stage_start, stage_end, tenure, outcome, stated_reason,
        real_reason, tooling, measurement, levers, built_inherited,
        system_change, wish_board, current_stage, company_size, gtm_count,
        what_changed, measured_against, right_metrics, founder_wish,
        founder_hindsight, email, name, linkedin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
    `, [
      timestamp || new Date().toISOString(),
      path,
      surveyFunction || null,
      title || null,
      titleOther || null,
      stageStart || null,
      stageEnd || null,
      tenure || null,
      outcome || null,
      statedReason || null,
      realReason || null,
      tooling || null,
      measurement || null,
      levers || null,
      builtInherited || null,
      systemChange || null,
      wishBoard || null,
      currentStage || null,
      companySize || null,
      gtmCount || null,
      whatChanged || null,
      measuredAgainst || null,
      rightMetrics || null,
      founderWish || null,
      founderHindsight || null,
      email || null,
      name || null,
      linkedin || null
    ]);

    await pool.end();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Survey submission error:', error);
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
