/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Shadow Grey - Neutral grays
        'shadow-grey': {
          50: '#f2f2f3',
          100: '#e4e4e7',
          200: '#cacace',
          300: '#afafb6',
          400: '#95959d',
          500: '#7a7a85',
          600: '#62626a',
          700: '#494950',
          800: '#313135',
          900: '#18181b',
          950: '#111113',
        },
        // Turquoise - Primary accent
        'turquoise': {
          50: '#e8fcf9',
          100: '#d2f9f3',
          200: '#a5f3e7',
          300: '#78eddc',
          400: '#4ae8d0',
          500: '#1de2c4',
          600: '#17b59d',
          700: '#128776',
          800: '#0c5a4e',
          900: '#062d27',
          950: '#04201b',
        },
        // Ink Black - Deep blues
        'ink-black': {
          50: '#e5eeff',
          100: '#ccdcff',
          200: '#99b9ff',
          300: '#6696ff',
          400: '#3374ff',
          500: '#0051ff',
          600: '#0041cc',
          700: '#003099',
          800: '#002066',
          900: '#001033',
          950: '#000b24',
        },
        // Blue Bell - Softer blues
        'blue-bell': {
          50: '#ebf3fa',
          100: '#d7e8f4',
          200: '#aed1ea',
          300: '#86badf',
          400: '#5ea3d4',
          500: '#368cc9',
          600: '#2b70a1',
          700: '#205479',
          800: '#153851',
          900: '#0b1c28',
          950: '#07141c',
        },
        // Slate Grey - Blue-tinted grays
        'slate-grey': {
          50: '#f0f3f4',
          100: '#e2e7e9',
          200: '#c4cfd4',
          300: '#a7b7be',
          400: '#8a9fa8',
          500: '#6c8793',
          600: '#576c75',
          700: '#415158',
          800: '#2b363b',
          900: '#161b1d',
          950: '#0f1315',
        },
        // Semantic colors (mapped to new palette)
        'white': '#FFFFFF',
        'off-white': '#f2f2f3',           // shadow-grey-50
        'black': '#111113',               // shadow-grey-950
        'gray-900': '#18181b',            // shadow-grey-900
        'gray-700': '#494950',            // shadow-grey-700
        'gray-600': '#62626a',            // shadow-grey-600
        'gray-500': '#7a7a85',            // shadow-grey-500
        'gray-400': '#95959d',            // shadow-grey-400
        'gray-300': '#afafb6',            // shadow-grey-300
        'gray-200': '#cacace',            // shadow-grey-200
        'gray-100': '#e4e4e7',            // shadow-grey-100
        // Accent colors (turquoise)
        'accent': '#1de2c4',              // turquoise-500
        'accent-hover': '#4ae8d0',        // turquoise-400
        'accent-muted': '#17b59d',        // turquoise-600
        // Bright blue
        'blue-bright': '#0051ff',         // ink-black-500
      },
      fontFamily: {
        'sans': ['Soehne Breit', 'system-ui', 'sans-serif'],
        'mono': ['Sohne Mono', 'JetBrains Mono', 'monospace'],
        'display': ['Soehne Breit', 'system-ui', 'sans-serif'],
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
