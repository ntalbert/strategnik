import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://strategnik.com',
  output: 'static',
  adapter: vercel({
    isr: false
  }),
  integrations: [
    tailwind(),
    mdx(),
    react()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
