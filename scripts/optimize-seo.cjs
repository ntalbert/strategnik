#!/usr/bin/env node

/**
 * SEO Optimization Script using Claude API
 *
 * Analyzes blog posts and uses Claude to:
 * - Generate optimized meta descriptions
 * - Suggest better titles (if needed)
 * - Add alt tags to images missing them
 * - Validate H2 structure
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

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function askClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
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

  const prompt = `You are an SEO expert. Analyze this blog post and provide specific recommendations.

CURRENT FRONTMATTER:
- Title: "${frontmatter.title || 'MISSING'}"
- Description: "${frontmatter.description || 'MISSING'}"
- Category: "${frontmatter.category || 'MISSING'}"

CONTENT:
${markdown.substring(0, 3000)}${markdown.length > 3000 ? '...[truncated]' : ''}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "title": {
    "current": "${frontmatter.title || ''}",
    "suggested": "Your suggested SEO-optimized title (under 60 chars)",
    "needsChange": true/false,
    "reason": "Brief reason"
  },
  "description": {
    "current": "${frontmatter.description || ''}",
    "suggested": "Your suggested meta description (120-155 chars, compelling, includes key terms)",
    "needsChange": true/false,
    "reason": "Brief reason"
  },
  "missingAltTags": [
    {"image": "image reference", "suggestedAlt": "descriptive alt text"}
  ],
  "h2Suggestions": ["List any suggested H2 headings if structure could be improved"],
  "overallScore": 1-10,
  "topPriority": "The single most important SEO fix for this post"
}`;

  try {
    const response = await askClaude(prompt);
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { fileName, analysis: JSON.parse(jsonMatch[0]), content, frontmatter, filePath };
    }
    throw new Error('No valid JSON in response');
  } catch (error) {
    return { fileName, error: error.message };
  }
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

async function applyChanges(result) {
  const { filePath, content, frontmatter, analysis } = result;
  let updated = false;
  let newFrontmatter = { ...frontmatter };

  // Update title if needed and approved
  if (analysis.title.needsChange) {
    log(colors.yellow, `\n   Current title: "${analysis.title.current}"`);
    log(colors.green, `   Suggested: "${analysis.title.suggested}"`);
    log(colors.cyan, `   Reason: ${analysis.title.reason}`);

    const answer = await promptUser('   Apply title change? (y/n): ');
    if (answer === 'y' || answer === 'yes') {
      newFrontmatter.title = analysis.title.suggested;
      updated = true;
      log(colors.green, '   ✓ Title updated');
    }
  }

  // Update description if needed and approved
  if (analysis.description.needsChange) {
    log(colors.yellow, `\n   Current description: "${analysis.description.current}"`);
    log(colors.green, `   Suggested: "${analysis.description.suggested}"`);
    log(colors.cyan, `   Reason: ${analysis.description.reason}`);

    const answer = await promptUser('   Apply description change? (y/n): ');
    if (answer === 'y' || answer === 'yes') {
      newFrontmatter.description = analysis.description.suggested;
      updated = true;
      log(colors.green, '   ✓ Description updated');
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
  console.log('\n' + colors.bold + '🤖 Claude SEO Optimizer' + colors.reset + '\n');
  console.log('━'.repeat(50) + '\n');

  if (!ANTHROPIC_API_KEY) {
    log(colors.red, '❌ ANTHROPIC_API_KEY environment variable not set');
    log(colors.yellow, '\nSet it with: export ANTHROPIC_API_KEY=your-key-here');
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

  log(colors.blue, `Found ${files.length} posts. Analyzing with Claude...\n`);

  let totalUpdated = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);

    log(colors.bold, `📄 ${file}`);
    log(colors.cyan, '   Analyzing...');

    const result = await analyzePost(filePath);

    if (result.error) {
      log(colors.red, `   ❌ Error: ${result.error}`);
      continue;
    }

    const { analysis } = result;

    log(colors.blue, `   SEO Score: ${analysis.overallScore}/10`);
    log(colors.yellow, `   Top Priority: ${analysis.topPriority}`);

    if (analysis.title.needsChange || analysis.description.needsChange) {
      const wasUpdated = await applyChanges(result);
      if (wasUpdated) totalUpdated++;
    } else {
      log(colors.green, '   ✓ No changes needed');
    }

    // Show alt tag suggestions
    if (analysis.missingAltTags && analysis.missingAltTags.length > 0) {
      log(colors.yellow, '\n   Missing alt tags:');
      analysis.missingAltTags.forEach(img => {
        log(colors.cyan, `   - ${img.image}: "${img.suggestedAlt}"`);
      });
    }

    // Show H2 suggestions
    if (analysis.h2Suggestions && analysis.h2Suggestions.length > 0) {
      log(colors.yellow, '\n   H2 suggestions:');
      analysis.h2Suggestions.forEach(h2 => {
        log(colors.cyan, `   - ${h2}`);
      });
    }

    console.log('');
  }

  console.log('━'.repeat(50));
  log(colors.bold, `\n📊 Summary: ${totalUpdated} posts updated\n`);
}

main().catch(err => {
  log(colors.red, '❌ Error:', err.message);
  process.exit(1);
});
