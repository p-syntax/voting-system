/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // MUT brand green scale (anchored around #66c743)
        brand: {
          50:  "#f3fdee",
          100: "#e4f9d6",
          200: "#c8f1ae",
          300: "#a2e67a",
          400: "#7ad94f",
          500: "#66c743", // primary brand color (given)
          600: "#4ea92f",
          700: "#3d8526",
          800: "#326a22",
          900: "#2b581f",
        },
        danger: {
          50:  "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        // If MUT site uses a different font name, tell me and I will adjust.
        // This stack matches common "modern portal" look and will be applied globally via CSS.
        sans: ['"DM Sans"', "Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};