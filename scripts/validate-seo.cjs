#!/usr/bin/env node

/**
 * SEO Validation Script for Blog Posts
 *
 * Checks all posts in src/content/posts/ for:
 * - Required frontmatter (title, description)
 * - Meta description length (50-160 chars recommended)
 * - At least one H2 heading
 * - Alt tags on all images
 * - Title length (under 60 chars for SEO)
 *
 * Run: node scripts/validate-seo.js
 * Or: npm run validate:seo
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function validatePost(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: markdown } = matter(content);

  const errors = [];
  const warnings = [];

  // === FRONTMATTER CHECKS ===

  // Title
  if (!frontmatter.title) {
    errors.push('Missing title in frontmatter');
  } else if (frontmatter.title.length > 60) {
    warnings.push(`Title is ${frontmatter.title.length} chars (recommended: under 60 for SEO)`);
  }

  // Description (meta description)
  if (!frontmatter.description) {
    errors.push('Missing description in frontmatter (used as meta description)');
  } else {
    if (frontmatter.description.length < 50) {
      warnings.push(`Description is only ${frontmatter.description.length} chars (recommended: 50-160)`);
    } else if (frontmatter.description.length > 160) {
      warnings.push(`Description is ${frontmatter.description.length} chars (recommended: under 160)`);
    }
  }

  // Date
  if (!frontmatter.date) {
    errors.push('Missing date in frontmatter');
  }

  // Category
  if (!frontmatter.category) {
    errors.push('Missing category in frontmatter');
  }

  // === CONTENT CHECKS ===

  // Check for H2 headings
  const h2Matches = markdown.match(/^## .+$/gm);
  if (!h2Matches || h2Matches.length === 0) {
    errors.push('No H2 headings found (## Heading). Posts should have at least one H2 for SEO structure.');
  }

  // Check for images without alt tags
  const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
  const images = [...markdown.matchAll(imageRegex)];

  images.forEach((match, index) => {
    const altText = match[1];
    if (!altText || altText.trim() === '') {
      errors.push(`Image ${index + 1} is missing alt text: ${match[0].substring(0, 50)}...`);
    }
  });

  // Check for HTML images without alt tags
  const htmlImageRegex = /<img[^>]*>/g;
  const htmlImages = [...markdown.matchAll(htmlImageRegex)];

  htmlImages.forEach((match) => {
    const imgTag = match[0];
    if (!imgTag.includes('alt=') || imgTag.includes('alt=""') || imgTag.includes("alt=''")) {
      errors.push(`HTML image missing alt attribute: ${imgTag.substring(0, 50)}...`);
    }
  });

  // Check if draft
  if (frontmatter.draft === true) {
    warnings.push('Post is marked as draft - will not be published');
  }

  return { fileName, errors, warnings };
}

function main() {
  console.log('\n' + colors.bold + '📋 SEO Validation Report' + colors.reset + '\n');
  console.log('━'.repeat(50) + '\n');

  if (!fs.existsSync(POSTS_DIR)) {
    log(colors.red, '❌ Posts directory not found:', POSTS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  if (files.length === 0) {
    log(colors.yellow, '⚠️  No posts found in', POSTS_DIR);
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    const result = validatePost(filePath);

    const hasIssues = result.errors.length > 0 || result.warnings.length > 0;

    if (hasIssues) {
      console.log(colors.bold + '📄 ' + result.fileName + colors.reset);

      result.errors.forEach(err => {
        log(colors.red, '   ❌', err);
        totalErrors++;
      });

      result.warnings.forEach(warn => {
        log(colors.yellow, '   ⚠️ ', warn);
        totalWarnings++;
      });

      console.log('');
    } else {
      log(colors.green, '✅', result.fileName, '- All checks passed');
    }
  });

  console.log('\n' + '━'.repeat(50));
  console.log(colors.bold + '\n📊 Summary:' + colors.reset);
  console.log(`   Posts checked: ${files.length}`);

  if (totalErrors > 0) {
    log(colors.red, `   Errors: ${totalErrors}`);
  } else {
    log(colors.green, '   Errors: 0');
  }

  if (totalWarnings > 0) {
    log(colors.yellow, `   Warnings: ${totalWarnings}`);
  } else {
    log(colors.green, '   Warnings: 0');
  }

  console.log('');

  if (totalErrors > 0) {
    log(colors.red, '❌ Validation failed. Please fix errors before publishing.\n');
    process.exit(1);
  } else if (totalWarnings > 0) {
    log(colors.yellow, '⚠️  Validation passed with warnings.\n');
    process.exit(0);
  } else {
    log(colors.green, '✅ All posts passed SEO validation!\n');
    process.exit(0);
  }
}

main();
