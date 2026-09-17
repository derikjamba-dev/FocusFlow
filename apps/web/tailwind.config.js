/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07080d',
        surface: '#0e0f17',
        card: '#13151f',
        border: '#1e2130',
        border2: '#2d3a5c',
        accent: '#6ee7b7',
        accent2: '#34d399',
        text: '#e2e8f0',
        muted: '#94a3b8',
        purple: '#a78bfa',
        purple2: '#a78bfa',
        blue: '#60a5fa',
        red: '#f87171',
        amber: '#fbbf24',
      },
      animation: {
        'pulse-slow': 'pulse-slow 2.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
};
