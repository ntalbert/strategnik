/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        'charcoal': '#1A1A1A',
        'charcoal-deep': '#0D0D0D',
        'cream': '#FAF9F6',
        'cream-dark': '#F0EDE8',
        
        // Accent
        'forest': '#2D5A4A',
        'forest-light': '#3D7A64',
        'forest-dark': '#1D4A3A',
        
        // Supporting
        'gray-mid': '#6B6B6B',
        'gray-light': '#9A9A9A',
        'gray-rule': '#E0E0E0',
      },
      fontFamily: {
        // Placeholder: Using Inter until Söhne license is ready
        // TODO: Replace with Söhne when fonts are available
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Architectural type scale
        'display-xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'heading': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'subheading': ['1.25rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.7' }],
        'small': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'prose': '65ch',
        'content': '1200px',
        'narrow': '800px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
