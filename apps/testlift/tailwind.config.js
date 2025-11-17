/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: { colors: { primary: { 500: '#F97316', 600: '#EA580C', 700: '#C2410C' } } } },
  plugins: [],
}
