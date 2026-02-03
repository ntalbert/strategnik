import type { APIRoute } from 'astro';
import { sql } from '@vercel/postgres';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Extract all fields from the survey
    const {
      timestamp,
      path,
      // GTM Leader fields
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
      // Founder fields
      currentStage,
      companySize,
      gtmCount,
      whatChanged,
      measuredAgainst,
      rightMetrics,
      founderWish,
      founderHindsight,
      // Contact fields (both paths)
      email,
      name,
      linkedin,
    } = data;

    // Insert into database
    await sql`
      INSERT INTO survey_responses (
        timestamp,
        path,
        survey_function,
        title,
        title_other,
        stage_start,
        stage_end,
        tenure,
        outcome,
        stated_reason,
        real_reason,
        tooling,
        measurement,
        levers,
        built_inherited,
        system_change,
        wish_board,
        current_stage,
        company_size,
        gtm_count,
        what_changed,
        measured_against,
        right_metrics,
        founder_wish,
        founder_hindsight,
        email,
        name,
        linkedin
      ) VALUES (
        ${timestamp || new Date().toISOString()},
        ${path},
        ${surveyFunction || null},
        ${title || null},
        ${titleOther || null},
        ${stageStart || null},
        ${stageEnd || null},
        ${tenure || null},
        ${outcome || null},
        ${statedReason || null},
        ${realReason || null},
        ${tooling || null},
        ${measurement || null},
        ${levers || null},
        ${builtInherited || null},
        ${systemChange || null},
        ${wishBoard || null},
        ${currentStage || null},
        ${companySize || null},
        ${gtmCount || null},
        ${whatChanged || null},
        ${measuredAgainst || null},
        ${rightMetrics || null},
        ${founderWish || null},
        ${founderHindsight || null},
        ${email || null},
        ${name || null},
        ${linkedin || null}
      )
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Survey submission error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
