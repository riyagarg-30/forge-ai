/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Class-based so the Landing page's dark-mode toggle can flip a `.dark`
  // ancestor class instead of following the OS preference. No other page
  // uses `dark:` variants yet, so this has no effect anywhere else.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#0a0a14',
          surface: '#12121f',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          violet: '#7c3aed',
        },
        // Light design system for the public landing page only — kept as a
        // separate namespace so it never affects the existing dark app.
        landing: {
          bg: '#FAFAF8',
          card: '#FFFFFF',
          text: '#111111',
          muted: '#6B7280',
          accent: '#6366F1',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        landing: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'forge-gradient': 'linear-gradient(135deg, #6d28d9 0%, #3b82f6 100%)',
        'forge-radial': 'radial-gradient(circle at top, rgba(124,58,237,0.25), transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(139,92,246,0.35)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
