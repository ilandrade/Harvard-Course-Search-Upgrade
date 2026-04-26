/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#eef2f9",
          100: "#d5dfef",
          200: "#aabfdf",
          300: "#7a9fd0",
          400: "#4d7fc0",
          500: "#2a5298",
          600: "#1D3A6B",
          700: "#162e56",
          800: "#0f2040",
          900: "#080f1f",
        },
        crimson: {
          DEFAULT: "#A41034",
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
