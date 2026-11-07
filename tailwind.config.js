/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Re-map "blue" so every existing page picks up the new navy / sky brand colours
      colors: {
        blue: {
          50: '#eef6fc', 100: '#d9ebf8', 200: '#b5d7f0', 300: '#82bce5', 400: '#4a9bd6',
          500: '#2a80c0', 600: '#1f6f9f', 700: '#1a5a85', 800: '#162f55', 900: '#0c1b36',
        },
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
    },
  },
  plugins: [],
};
