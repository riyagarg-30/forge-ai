/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
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
