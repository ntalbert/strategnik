/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Monochromatic palette
        'white': '#FFFFFF',
        'off-white': '#FAFAFA',
        'black': '#111111',
        'gray-900': '#1A1A1A',
        'gray-600': '#6B6B6B',
        'gray-400': '#9CA3AF',
        'gray-200': '#E5E7EB',
        'gray-100': '#F3F4F6',
        // Subtle accent
        'accent': '#4A5568',
        // Bright blue
        'blue-bright': '#0165fc',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'display': ['Sohne Mono', 'monospace'],
      },
      fontSize: {
        // Minimal type scale with light weights
        'display-xl': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '300' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '300' }],
        'display': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '300' }],
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '400' }],
        'subheading': ['1.25rem', { lineHeight: '1.4', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.75' }],
        'small': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'prose': '65ch',
        'content': '1200px',
        'narrow': '720px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
