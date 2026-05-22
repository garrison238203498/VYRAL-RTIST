/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#020817",
          925: "#041023",
          900: "#07152f",
          850: "#0a1f44",
          800: "#102a56",
        },
        violet: {
          deep: "#22113f",
          core: "#352069",
          electric: "#6d4aff",
          glow: "#a78bfa",
        },
        cyan: {
          deep: "#083344",
          electric: "#0891b2",
          glow: "#5eead4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["SpaceGrotesk-SemiBold", "Inter", "sans-serif"],
        mono: ["JetBrainsMono", "monospace"],
        hand: ["Caveat", "cursive"],
      },
    },
  },
  plugins: [],
};
