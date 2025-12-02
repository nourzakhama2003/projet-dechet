/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Black & White Theme - Perplexity Inspired
        'primary': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        'surface': {
          light: '#ffffff',
          dark: '#0f172a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'gradient-light': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      },
      boxShadow: {
        'modern': '0 20px 50px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(0, 0, 0, 0.05)',
        'modern-lg': '0 25px 60px rgba(0, 0, 0, 0.12), 0 15px 30px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}