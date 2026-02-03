#!/usr/bin/env node

/**
 * SEO Optimization Script using Claude API
 *
 * Uses comprehensive SEO Keyword Analyzer prompt to:
 * - Analyze content and classify page type
 * - Identify keyword opportunities (Tier 1, 2, 3)
 * - Generate specific optimization changes
 * - Assess change impact with 10% threshold check
 *
 * Run: npm run optimize:seo
 * Requires: ANTHROPIC_API_KEY environment variable
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const readline = require('readline');

const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AUTO_ACCEPT = process.argv.includes('--yes') || process.argv.includes('-y');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

const SEO_SYSTEM_PROMPT = `# SEO Keyword Analyzer — System Prompt

## Role & Identity

You are an SEO Keyword Analyzer and Page Optimizer. Your job is to analyze a newly published web page, identify the highest-probability keyword opportunities it could rank for, optimize the page for maximum organic traffic potential, and output precise changes to content, meta tags, and technical SEO elements.

You operate as a technical SEO specialist with deep knowledge of Google's ranking factors, search intent classification, semantic keyword clustering, and on-page optimization best practices.

---

## Core Workflow

Execute the following steps sequentially. Do not skip steps.

### STEP 1 — Page Intake & Content Analysis

When provided with a page URL or page content:

1. **Extract and catalog:**
   - Page title (H1 and title tag)
   - Meta description
   - All heading hierarchy (H1 → H6)
   - Body content (full text)
   - Existing internal/external links
   - Image alt text
   - URL slug
   - Word count
   - Current keyword density for apparent target terms

2. **Classify the page:**
   - Content type: blog post, landing page, product page, pillar page, resource page
   - Primary topic / subject matter
   - Target audience (inferred)
   - Search intent alignment: informational, navigational, transactional, commercial investigation
   - Content depth: thin, moderate, comprehensive
   - Funnel stage: TOFU, MOFU, BOFU

3. **Output a structured content brief** summarizing the above before proceeding.

---

### STEP 2 — Keyword Opportunity Analysis

Based on the page content analysis, generate keyword recommendations across three tiers:

#### Tier 1 — Primary Keywords (1-3 terms)
- The single most valuable keyword cluster the page should target
- Criteria: highest inferred search volume × realistic ranking probability given the content depth and specificity
- These must align precisely with the page's core topic and search intent

#### Tier 2 — Secondary Keywords (3-7 terms)
- Supporting keywords and semantic variations that reinforce Tier 1
- Long-tail variations with lower competition
- Question-based keywords (People Also Ask patterns)
- Include "near me," comparative, and modifier-based variations where relevant

#### Tier 3 — Semantic / LSI Keywords (5-15 terms)
- Contextually related terms that signal topical authority to search engines
- Co-occurring terms that high-ranking pages for Tier 1 keywords would typically include
- Industry-specific terminology that establishes E-E-A-T signals

---

### STEP 3 — Optimization Plan

Generate a specific, actionable optimization plan organized by element:

#### 3A — Title Tag
- Rewrite to include Tier 1 primary keyword
- Keep under 60 characters
- Front-load the primary keyword
- Maintain click-worthiness and brand consistency

#### 3B — Meta Description
- Rewrite to include Tier 1 + one Tier 2 keyword naturally
- Keep between 150-160 characters
- Include a clear value proposition and implicit or explicit CTA

#### 3C — URL Slug
- Evaluate current slug for keyword inclusion and brevity
- If changes needed, note redirect requirements

#### 3D — Heading Structure (H1-H6)
- Ensure H1 contains primary keyword (only one H1 per page)
- Optimize H2s for Tier 2 keywords and semantic structure
- Recommend H3s that target question-based keywords where appropriate

#### 3E — Body Content Optimization
- Identify specific insertion points for Tier 2 and Tier 3 keywords
- Do NOT keyword stuff. Target natural keyword density of 1-2% for primary, 0.5-1% for secondary
- Recommend specific paragraph-level additions or rewrites

#### 3F — Image Optimization
- Rewrite alt text to include relevant keywords naturally
- Suggest image caption additions if they support keyword strategy

---

### STEP 4 — Change Impact Assessment & 10% Threshold Check

After generating all recommendations, calculate the total scope of changes:

1. Word-level diff: Count total words changed vs. original word count
2. Calculate change percentage
3. If Change % > 10%, present conservative version (≤10% changes, highest-impact only)

---

## Operating Rules

1. **Never fabricate data.** If you don't have real search volume, say "inferred" not "estimated X monthly searches."
2. **Never keyword stuff.** Every keyword insertion must read naturally in context.
3. **Preserve the author's voice.** Optimization should be invisible to the reader.
4. **Prioritize ruthlessly.** Lead with highest-impact recommendations.
5. **Flag uncertainty.** If you're unsure whether a change will help, say so.
6. **One page, one primary keyword cluster.** Do not try to rank for unrelated keyword groups.
7. **Search intent is king.** Always verify intent alignment first.
8. **Think in clusters, not individual keywords.** Optimize for the topic, use keywords as signals.
9. **The 10% threshold exists for a reason.** Respect the guardrail.`;

async function askClaude(userPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SEO_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function analyzePost(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: markdown } = matter(content);

  // Count words
  const wordCount = markdown.split(/\s+/).filter(w => w.length > 0).length;

  // Extract H2s
  const h2s = markdown.match(/^## .+$/gm) || [];

  // Extract images
  const images = markdown.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];

  const userPrompt = `Analyze this blog post for SEO optimization:

═══════════════════════════════════════════
PAGE DETAILS
═══════════════════════════════════════════

**URL Slug:** ${fileName.replace('.md', '')}
**Current Title:** ${frontmatter.title || 'MISSING'}
**Current Meta Description:** ${frontmatter.description || 'MISSING'}
**Category:** ${frontmatter.category || 'MISSING'}
**Word Count:** ${wordCount}

**Current H2 Headings:**
${h2s.length > 0 ? h2s.join('\n') : 'None found'}

**Images Found:** ${images.length}
${images.map(img => `- ${img}`).join('\n') || 'None'}

═══════════════════════════════════════════
FULL CONTENT
═══════════════════════════════════════════

${markdown}

═══════════════════════════════════════════
REQUESTED OUTPUT
═══════════════════════════════════════════

Please analyze this page and provide your optimization report. At the end, include a JSON block with the specific changes to implement:

\`\`\`json
{
  "title": {
    "current": "...",
    "proposed": "...",
    "change": true/false
  },
  "description": {
    "current": "...",
    "proposed": "...",
    "change": true/false
  },
  "tier1Keywords": ["keyword1", "keyword2"],
  "tier2Keywords": ["keyword1", "keyword2", ...],
  "h2Suggestions": [
    {"current": "...", "proposed": "..."}
  ],
  "imageAltSuggestions": [
    {"image": "...", "suggestedAlt": "..."}
  ],
  "changePercentage": X,
  "overallScore": X,
  "topPriorityAction": "..."
}
\`\`\``;

  try {
    const response = await askClaude(userPrompt);
    return { fileName, analysis: response, content, frontmatter, filePath, markdown };
  } catch (error) {
    return { fileName, error: error.message };
  }
}

function extractJSON(text) {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

async function applyChanges(result, jsonData) {
  const { filePath, content, frontmatter } = result;
  let updated = false;
  let newFrontmatter = { ...frontmatter };

  // Update title if needed
  if (jsonData.title && jsonData.title.change && jsonData.title.proposed) {
    log(colors.yellow, `\n   📝 Title Change Proposed:`);
    log(colors.dim, `      Current:  "${jsonData.title.current}"`);
    log(colors.green, `      Proposed: "${jsonData.title.proposed}"`);

    let answer = 'n';
    if (AUTO_ACCEPT) {
      answer = 'y';
      log(colors.cyan, '      Auto-accepting (--yes flag)');
    } else {
      answer = await promptUser('      Apply this change? (y/n): ');
    }

    if (answer === 'y' || answer === 'yes') {
      newFrontmatter.title = jsonData.title.proposed;
      updated = true;
      log(colors.green, '      ✓ Title updated');
    }
  }

  // Update description if needed
  if (jsonData.description && jsonData.description.change && jsonData.description.proposed) {
    log(colors.yellow, `\n   📝 Meta Description Change Proposed:`);
    log(colors.dim, `      Current:  "${jsonData.description.current}"`);
    log(colors.green, `      Proposed: "${jsonData.description.proposed}"`);
    log(colors.cyan, `      Length: ${jsonData.description.proposed.length} chars`);

    let answer = 'n';
    if (AUTO_ACCEPT) {
      answer = 'y';
      log(colors.cyan, '      Auto-accepting (--yes flag)');
    } else {
      answer = await promptUser('      Apply this change? (y/n): ');
    }

    if (answer === 'y' || answer === 'yes') {
      newFrontmatter.description = jsonData.description.proposed;
      updated = true;
      log(colors.green, '      ✓ Description updated');
    }
  }

  if (updated) {
    const { content: markdownContent } = matter(content);
    const newContent = matter.stringify(markdownContent, newFrontmatter);
    fs.writeFileSync(filePath, newContent);
    log(colors.green, '\n   ✓ File saved');
  }

  return updated;
}

async function main() {
  console.log('\n' + colors.bold + '═══════════════════════════════════════════' + colors.reset);
  console.log(colors.bold + '  🤖 Claude SEO Keyword Analyzer' + colors.reset);
  console.log(colors.bold + '═══════════════════════════════════════════' + colors.reset + '\n');

  if (!ANTHROPIC_API_KEY) {
    log(colors.red, '❌ ANTHROPIC_API_KEY environment variable not set');
    log(colors.yellow, '\nSet it in .env file or export ANTHROPIC_API_KEY=your-key-here');
    process.exit(1);
  }

  if (!fs.existsSync(POSTS_DIR)) {
    log(colors.red, '❌ Posts directory not found:', POSTS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  if (files.length === 0) {
    log(colors.yellow, '⚠️  No posts found');
    process.exit(0);
  }

  log(colors.blue, `📁 Found ${files.length} posts to analyze\n`);

  // Ask which posts to analyze
  let filesToProcess = [];

  if (AUTO_ACCEPT) {
    log(colors.cyan, '🤖 Auto mode enabled (--yes flag) - processing all posts\n');
    filesToProcess = files;
  } else {
    console.log('Posts available:');
    files.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file}`);
    });
    console.log(`   a. All posts`);

    const selection = await promptUser('\nSelect post number (or "a" for all): ');

    if (selection === 'a' || selection === 'all') {
      filesToProcess = files;
    } else {
      const index = parseInt(selection) - 1;
      if (index >= 0 && index < files.length) {
        filesToProcess = [files[index]];
      } else {
        log(colors.red, 'Invalid selection');
        process.exit(1);
      }
    }
  }

  let totalUpdated = 0;

  for (const file of filesToProcess) {
    const filePath = path.join(POSTS_DIR, file);

    console.log('\n' + colors.bold + '───────────────────────────────────────────' + colors.reset);
    log(colors.bold, `📄 Analyzing: ${file}`);
    console.log(colors.bold + '───────────────────────────────────────────' + colors.reset);

    log(colors.cyan, '\n   🔍 Sending to Claude for analysis...\n');

    const result = await analyzePost(filePath);

    if (result.error) {
      log(colors.red, `   ❌ Error: ${result.error}`);
      continue;
    }

    // Print the full analysis
    console.log(colors.dim + '───────────────────────────────────────────' + colors.reset);
    console.log(result.analysis);
    console.log(colors.dim + '───────────────────────────────────────────' + colors.reset);

    // Extract and apply JSON changes
    const jsonData = extractJSON(result.analysis);

    if (jsonData) {
      log(colors.magenta, `\n   📊 SEO Score: ${jsonData.overallScore || 'N/A'}/10`);
      log(colors.yellow, `   🎯 Top Priority: ${jsonData.topPriorityAction || 'N/A'}`);

      if (jsonData.tier1Keywords && jsonData.tier1Keywords.length > 0) {
        log(colors.green, `   🔑 Tier 1 Keywords: ${jsonData.tier1Keywords.join(', ')}`);
      }

      if (jsonData.changePercentage) {
        const threshold = jsonData.changePercentage <= 10 ? colors.green : colors.yellow;
        log(threshold, `   📏 Change %: ${jsonData.changePercentage}% ${jsonData.changePercentage <= 10 ? '✓' : '⚠️ >10%'}`);
      }

      const wasUpdated = await applyChanges(result, jsonData);
      if (wasUpdated) totalUpdated++;
    } else {
      log(colors.yellow, '\n   ⚠️  Could not extract structured changes from response');
      const answer = await promptUser('   View full response and make manual changes? (y/n): ');
      if (answer === 'y') {
        console.log('\n' + result.analysis);
      }
    }
  }

  console.log('\n' + colors.bold + '═══════════════════════════════════════════' + colors.reset);
  log(colors.bold, `📊 Summary: ${totalUpdated} posts updated`);
  console.log(colors.bold + '═══════════════════════════════════════════' + colors.reset + '\n');

  if (totalUpdated > 0) {
    log(colors.green, '✅ Run "npm run validate:seo" to verify changes');
    log(colors.green, '✅ Run "npm run build" to build with validation\n');
  }
}

main().catch(err => {
  log(colors.red, '❌ Error:', err.message);
  process.exit(1);
});
