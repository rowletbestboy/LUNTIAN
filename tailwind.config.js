/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1E2761",
          light: "#273268",
          lighter: "#323D7C",
        },
        ice: "#CADCFC",
        canvas: "#F4F6FA",
        border: "#E3E8F2",
        ink: "#1B2338",
        muted: "#8A93A8",
        faint: "#AEB6C7",
        accent: "#2F6FED",
        ok: "#22A559",
        warn: "#E8A317",
        crit: "#E0432B",
        violet: "#8B6FE8",
      },
      fontFamily: {
        display: ["Cambria", "Georgia", "serif"],
        sans: ["Calibri", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(154, 165, 192, 0.25)",
      },
    },
  },
  plugins: [],
};
