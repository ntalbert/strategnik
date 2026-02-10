# Strategnik Website - Claude Skill Reference

## Project Overview
- **Site**: https://www.strategnik.com
- **Owner**: Nick Talbert
- **Purpose**: B2B growth consulting site with case studies, writing, and services
- **Framework**: Astro (static site generator)
- **Styling**: Tailwind CSS
- **Hosting**: GitHub Pages (deploys automatically on push to main)

## Repository
- **Local Path**: `/Users/nicktalbert/strategnik`
- **Remote**: `github.com:ntalbert/strategnik.git`
- **Branch**: `main`

## Tech Stack
- Astro 4.x
- Tailwind CSS
- TypeScript
- Three.js (for homepage background animation)
- Beehiiv (newsletter integration)

## Project Structure

```
/Users/nicktalbert/strategnik/
├── src/
│   ├── components/
│   │   ├── Header.astro          # Site navigation (logo, nav links, mobile menu)
│   │   ├── Footer.astro          # Site footer
│   │   ├── NewsletterForm.astro  # Beehiiv newsletter signup
│   │   ├── PostCard.astro        # Blog post cards
│   │   ├── BrandGravityHero.astro # Homepage hero with Three.js background
│   │   └── ScrollAnimations.astro # Scroll-based animations
│   ├── layouts/
│   │   └── BaseLayout.astro      # Main layout wrapper (head, body, meta tags)
│   ├── pages/
│   │   ├── index.astro           # Homepage
│   │   ├── about.astro           # About page
│   │   ├── services.astro        # Services page
│   │   ├── work.astro            # Work/portfolio page
│   │   ├── writing/
│   │   │   └── index.astro       # Writing/blog listing page
│   │   └── physics-of-growth/
│   │       ├── index.astro       # Framework overview
│   │       ├── momentum.astro    # Momentum concept page
│   │       └── friction.astro    # Friction concept page
│   └── styles/
│       └── global.css            # Global styles and Tailwind config
├── public/
│   ├── logo.png                  # Site logo
│   ├── case-studies/             # Case study HTML files and assets
│   │   ├── case-study-01-developer-discovery.html
│   │   ├── case-study-02-propensity-scoring.html
│   │   ├── case-study-03-lifecycle-archetypes.html
│   │   ├── case-study-04-privacy-pivot.html
│   │   ├── case-study-05-government-marketplace.html
│   │   ├── case-study-06-clean-rooms.html
│   │   ├── hero-image-01.png through hero-image-06.png/svg
│   │   └── hero-video-*.mp4      # Case study videos
│   ├── videos/                   # Work page videos
│   ├── logos/                    # Company logos for work page
│   └── js/
│       └── brand-gravity-bg.js   # Three.js homepage animation
└── tailwind.config.mjs           # Tailwind configuration
```

## Key URLs

| Page | URL |
|------|-----|
| Homepage | https://www.strategnik.com/ |
| About | https://www.strategnik.com/about |
| Services | https://www.strategnik.com/services |
| Work | https://www.strategnik.com/work |
| Writing | https://www.strategnik.com/writing |
| Framework | https://www.strategnik.com/physics-of-growth |
| Case Study 01 | https://www.strategnik.com/case-studies/case-study-01-developer-discovery.html |
| Case Study 02 | https://www.strategnik.com/case-studies/case-study-02-propensity-scoring.html |
| Case Study 03 | https://www.strategnik.com/case-studies/case-study-03-lifecycle-archetypes.html |
| Case Study 04 | https://www.strategnik.com/case-studies/case-study-04-privacy-pivot.html |
| Case Study 05 | https://www.strategnik.com/case-studies/case-study-05-government-marketplace.html |
| Case Study 06 | https://www.strategnik.com/case-studies/case-study-06-clean-rooms.html |

## Design System

### Colors (Dark Theme)
- **Background**: `bg-black` (#000)
- **Text Primary**: `text-white`
- **Text Secondary**: `text-gray-400`
- **Accent**: `text-blue-bright` (defined in Tailwind config)
- **Borders**: `border-gray-800`

### Typography Classes
- `text-display-lg` - Large headlines
- `text-display` - Section headlines
- `text-heading` - Subsection headlines
- `text-body-lg` - Large body text
- `text-body` - Regular body text
- `text-small` - Small/caption text
- `section-label` - Section label styling

### Layout Classes
- `container-narrow` - Narrow content width
- `container-content` - Standard content width
- `section` - Standard section padding
- `section-sm` - Smaller section padding

## Common Tasks

### Update Homepage Content
Edit: `src/pages/index.astro`

### Update Navigation Links
Edit: `src/components/Header.astro`
- `navLinks` array at top of file controls nav items

### Update Case Studies
Case studies are standalone HTML files in `public/case-studies/`
- Each has its own header, styles, and scripts
- Update tech stack in sidebar `.tech-stack` section
- Hero images: `hero-image-0X.png`
- Hero videos: `hero-video-0X.mp4`

### Add Hero Image-to-Video Transition (Case Studies)
Required CSS classes:
```css
.hero { position: relative; aspect-ratio: 16/9; max-height: 600px; overflow: hidden; }
.hero-background { /* background image */ }
.hero.video-active .hero-background { transform: scale(1.1); opacity: 0.3; }
.hero-video-container { /* video wrapper, starts hidden */ }
.hero.video-active .hero-video-container { opacity: 1; }
```

Required HTML structure:
```html
<section class="hero" id="hero">
  <div class="hero-background"></div>
  <div class="hero-video-container">
    <video class="hero-video" id="heroVideo" muted playsinline>
      <source src="hero-video-0X.mp4" type="video/mp4">
    </video>
  </div>
  <div class="hero-overlay"></div>
  <div class="hero-content">...</div>
</section>
```

Required JavaScript:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero');
  const heroVideo = document.getElementById('heroVideo');
  setTimeout(() => {
    hero.classList.add('video-active');
    heroVideo.play().catch(() => {});
  }, 800);
});
```

### Update Logo
Replace: `public/logo.png`
- Logo is referenced in `src/components/Header.astro`
- Also update in each case study HTML file

### Update Newsletter Form
Edit: `src/components/NewsletterForm.astro`
- Beehiiv publication ID is in the file

## Git Workflow

### Standard Push to Production
```bash
git add -A && git commit -m "Description of changes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" && git push
```

### Push Specific Files
```bash
git add path/to/file.astro && git commit -m "Description" && git push
```

### Check Status Before Commit
```bash
git status
git diff
```

## Important Notes

1. **Case studies are static HTML** - They don't use Astro components, so updates must be made directly to each HTML file

2. **Menu backgrounds** - All nav elements use `bg-black` (solid) not `bg-black/70` (transparent)

3. **Dark theme** - Site uses dark backgrounds throughout:
   - `bg-black` for backgrounds
   - `text-white` for primary text
   - `text-gray-400` for secondary text
   - `border-gray-800` for borders

4. **OG Meta Tags** - Case studies have Open Graph tags for social sharing. When adding new images, update:
   - `og:image`
   - `og:image:width` (1920)
   - `og:image:height` (1080)
   - `twitter:image`

5. **SEO** - Case studies include meta descriptions, keywords, canonical URLs, and alt tags

## File Locations Quick Reference

| What | Where |
|------|-------|
| Site logo | `public/logo.png` |
| Homepage | `src/pages/index.astro` |
| Navigation | `src/components/Header.astro` |
| Footer | `src/components/Footer.astro` |
| Base layout | `src/layouts/BaseLayout.astro` |
| Case studies | `public/case-studies/*.html` |
| Case study images | `public/case-studies/hero-image-*.png` |
| Case study videos | `public/case-studies/hero-video-*.mp4` |
| Work page videos | `public/videos/` |
| Homepage animation | `public/js/brand-gravity-bg.js` |
| Tailwind config | `tailwind.config.mjs` |
| Global styles | `src/styles/global.css` |
