/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        'lime-custom': '#d5fb00',
        'purple-custom': '#1b0571',
      },
    },
  },
  plugins: [],
}

