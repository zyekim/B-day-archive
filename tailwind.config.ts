import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0E6",
        "stamp-orange": "#FF6B00",
        "album-navy": "#1D2B4F",
        polaroid: "#FFFDF7",
        "dusty-rose": "#D88C9A",
        ink: "#2B2620",
        cork: "#C89F6E",
        "cork-dark": "#A87F52",
        "wood-frame": "#B5773A",
        "paper-line": "#9FB4D8",
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        hand: ["var(--font-hand)", "cursive"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        polaroid: "0 6px 14px rgba(0,0,0,0.22)",
        pin: "0 3px 5px rgba(0,0,0,0.30)",
        board:
          "inset 0 0 70px rgba(168,127,82,0.55), 0 10px 24px rgba(0,0,0,0.20)",
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(0) rotate(-18deg)", opacity: "0" },
          "60%": { transform: "scale(1.25) rotate(-18deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-18deg)", opacity: "1" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(var(--tw-rotate))" },
          "50%": { transform: "rotate(calc(var(--tw-rotate) + 2deg))" },
        },
      },
      animation: {
        stamp: "stamp 0.35s ease-out",
        wiggle: "wiggle 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
