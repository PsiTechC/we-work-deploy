/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Ensure dark: variants are always generated for key utility classes
    { pattern: /^dark:(bg|text|border)-(gray|slate)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /^dark:bg-gray-(700|800|900|950)/ },
    { pattern: /^dark:text-(white|gray-(100|200|300|400|500))/ },
    { pattern: /^dark:border-gray-(600|700|800)/ },
    { pattern: /^dark:placeholder-gray-400/ },
    { pattern: /^dark:hover:bg-gray-(700|600)/ },
  ],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eff6ff', 100:'#dbeafe', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 900:'#1e3a8a' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
