/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#121212",
        },
        surface: {
          DEFAULT: "#141414",
          raised: "#1B1B1B",
        },
        border: {
          DEFAULT: "#2A2A2A",
          soft: "#232323",
        },
        paper: {
          DEFAULT: "#F6F5F1",
          muted: "#A6A39B",
        },
        signal: {
          DEFAULT: "#FF3B2F",
          hover: "#E42B20",
          soft: "#3A1512",
        },
        acid: {
          DEFAULT: "#D8FF3E",
        },
      },
      fontFamily: {
        display: ["Devil Breeze", "Arial", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        serif: ["Fraunces", "serif"],
      },
      fontSize: {
        "hero": ["clamp(2.75rem, 7vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3.2vw, 2.75rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.25em",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      maxWidth: {
        content: "1400px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
