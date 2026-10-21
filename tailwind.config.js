/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        engineering: {
          bg:          '#0a0a0a',
          surface1:    '#111111',
          surface2:    '#161616',
          surface3:    '#1c1c1c',
          border:      '#2a2a2a',
          borderActive:'#3d3d3d',
          textPrimary: '#f0f0f0',
          textSecondary:'#888888',
          textMuted:   '#555555',
          accent:      '#f59e0b',
          accentBlue:  '#3b82f6',
          success:     '#22c55e',
          danger:      '#ef4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'spin-slow':   'spin 12s linear infinite',
        'blink':       'blink 1s step-end infinite',
        'pulse-amber': 'pulse-amber 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'pulse-amber': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(245,158,11,0)' },
        },
      },
    },
  },
  plugins: [],
}
