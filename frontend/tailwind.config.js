/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crimson: {
          50:  "#fdf2f2",
          100: "#fde0e0",
          200: "#fbbfbf",
          300: "#f88f8f",
          400: "#f35555",
          500: "#e8252a",
          600: "#A41034",
          700: "#8b0d2c",
          800: "#6e0a23",
          900: "#57081c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
