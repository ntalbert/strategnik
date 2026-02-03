import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://strategnik.com',
  output: 'hybrid',
  adapter: vercel({
    runtime: 'nodejs20.x'
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
