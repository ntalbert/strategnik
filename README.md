# Strategnik.com

Personal brand and thought leadership platform for demand generation strategy.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) - Content-focused, fast, MDX support
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Newsletter:** [Beehiiv](https://beehiiv.com/) - Newsletter platform (free tier)
- **Hosting:** [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) (free tier)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
strategnik/
├── src/
│   ├── components/       # Reusable UI components
│   ├── content/          # Markdown content (posts, physics concepts)
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   └── styles/           # Global CSS
├── public/               # Static assets (fonts, images)
└── package.json
```

## Adding Content

### New Blog Post

Create a new `.astro` or `.md` file in `src/pages/writing/`:

```markdown
---
title: "Your Post Title"
description: "Brief description for SEO"
date: 2025-01-15
category: "field-notes"  # or "case-study", "playbook", "physics"
---

Your content here...
```

### New Physics Concept

Add a new page in `src/pages/physics-of-growth/`. Follow the structure of `momentum.astro` or `friction.astro` as templates.

## Configuration

### Beehiiv Newsletter

1. Get your Beehiiv publication ID from your Beehiiv dashboard
2. Update `src/components/NewsletterForm.astro`:
   ```javascript
   const BEEHIIV_PUBLICATION_ID = "your-publication-id";
   ```

### Fonts (Söhne)

When you have the Söhne license:

1. Add font files to `public/fonts/`
2. Uncomment the `@font-face` declarations in `src/styles/global.css`
3. Update the font-family in `tailwind.config.mjs`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Vercel auto-detects Astro - no config needed
4. Add custom domain: `strategnik.com`

### DNS Configuration (Cloudflare)

Once domain transfer completes:

1. Add A record: `@` → Vercel IP (76.76.21.21)
2. Add CNAME: `www` → `cname.vercel-dns.com`
3. Keep existing MX records for email

## Design System

### Colors

- **Charcoal:** `#1A1A1A` (primary text)
- **Cream:** `#FAF9F6` (background)
- **Forest Teal:** `#2D5A4A` (accent)
- **Gray Mid:** `#6B6B6B` (secondary text)

### Typography

Currently using Inter as placeholder. Target: Söhne family from Klim Type.

## TODO

- [ ] Purchase Söhne font license and install
- [ ] Connect Beehiiv publication ID
- [ ] Add LinkedIn URL to footer
- [ ] Create OG images for social sharing
- [ ] Add more Physics of Growth concepts
- [ ] Set up content collections for proper blog functionality

---

Built with intention.
# Trigger redeploy
