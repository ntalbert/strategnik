# Strategnik Audit Template

Template for creating client marketing audits deployed to `{client}.strategnik.com`.

## Quick Start

### 1. Create a new audit project

```bash
# Copy template to a new folder
cp -r audit-template ~/audits/{client-name}
cd ~/audits/{client-name}

# Initialize git
git init
git add .
git commit -m "Initial audit setup"
```

### 2. Customize the content

Edit `index.html` and replace all `[PLACEHOLDER]` text:
- `[CLIENT NAME]` - Company name
- `[DATE]` - Audit date
- Fill in sections: Overview, Strengths, Opportunities, Recommendations, Action Plan

### 3. Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Set up custom domain
vercel domains add {client}.strategnik.com
```

### 4. Configure DNS (in Vercel Dashboard)

1. Go to your Vercel project settings
2. Add domain: `{client}.strategnik.com`
3. In your domain registrar, add CNAME record:
   - Name: `{client}`
   - Value: `cname.vercel-dns.com`

## Structure

```
audit-template/
├── index.html      # Main audit page
├── styles.css      # Strategnik-branded styles
├── vercel.json     # Deployment config (noindex headers)
└── README.md       # This file
```

## Sections

1. **Overview** - Executive summary with stats
2. **Strengths & Opportunities** - Two-column layout
3. **Recommendations** - Prioritized burndown list
   - Critical (red)
   - High Priority (orange)
   - Medium Priority (yellow)
   - Nice to Have (teal)
4. **Action Plan** - Phased timeline

## Notes

- Pages are set to `noindex, nofollow` for client privacy
- Logo pulls from `strategnik.com/logo-dark.png`
- Mobile responsive
- Smooth scroll navigation
