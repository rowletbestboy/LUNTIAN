/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#23452B",
          light: "#2E5A35",
          lighter: "#3D7044",
        },
        ice: "#D8E8D5",
        canvas: "#F4F6FA",
        border: "#E3E8F2",
        ink: "#1B2338",
        muted: "#8A93A8",
        faint: "#AEB6C7",
        accent: "#4A8445",
        ok: "#22A559",
        warn: "#E8A317",
        crit: "#E0432B",
        violet: "#8B6FE8",
      },
      fontFamily: {
        display: ["Roboto Condensed", "sans-serif"],
        sans: ["Roboto Condensed", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(154, 165, 192, 0.25)",
      },
    },
  },
  plugins: [],
};
