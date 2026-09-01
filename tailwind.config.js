/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "var(--border-color)",
        background: "var(--bg-dark)",
        card: "var(--bg-card)",
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
