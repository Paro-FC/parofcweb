/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
        display: ["var(--font-hanken)", "system-ui", "sans-serif"],
        heading: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "5xs": ["7px", { lineHeight: "1.2", letterSpacing: "0.06em" }],
        "4xs": ["8px", { lineHeight: "1.25", letterSpacing: "0.06em" }],
        "3xs": ["9px", { lineHeight: "1.3", letterSpacing: "0.05em" }],
        "2xs": ["10px", { lineHeight: "1.35", letterSpacing: "0.04em" }],
        xs: ["11px", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        sm: ["13px", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        base: ["15px", { lineHeight: "1.6", letterSpacing: "0" }],
        lg: ["17px", { lineHeight: "1.6", letterSpacing: "0" }],
        xl: ["19px", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "2xl": ["24px", { lineHeight: "1.4", letterSpacing: "-0.02em" }],
        "3xl": ["30px", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "4xl": ["36px", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
        "5xl": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em" }],
        "6xl": ["60px", { lineHeight: "1.1", letterSpacing: "-0.05em" }],
        "hero-120": ["120px", { lineHeight: "0.95", letterSpacing: "-0.06em" }],
        "hero-180": ["180px", { lineHeight: "0.92", letterSpacing: "-0.06em" }],
        "hero-200": ["200px", { lineHeight: "0.92", letterSpacing: "-0.06em" }],
        "hero-220": ["220px", { lineHeight: "0.9", letterSpacing: "-0.06em" }],
      },
      colors: {
        // Primary Colors — Paro FC Brand (from brand spec)
        primary: "#ce0505", // Paro Red
        secondary: "#ce0505", // Paro Red (yellow replaced with red)
        brand: {
          red: "#ce0505",
          yellow: "#ce0505", // kept key for compatibility; now red
          black: "#000000",
          white: "#ffffff",
        },
        "paro-red": "#ce0505", // Paro Red — Primary brand & accent
        "tiger-yellow": "#ce0505", // yellow replaced with red
        black: "#000000",
        white: "#ffffff",
        // Core brand palette
        "parofc-red": "#ce0505",   // Paro Red — primary accent
        "parofc-gold": "#C9A84C",  // Luxury Gold — secondary accent
        "light-gold": "#EFE28D",   // Pale Gold — nav hover highlights
        bronze: "#A66337",         // Bronze — gradient endpoint
        // Backgrounds
        "dark-charcoal": "#000000", // Pure black — nav, hero sections
        "near-black": "#0a0a0a",    // Page background
        "card-dark": "#111111",     // Card / section background
        // Supporting neutrals
        "medium-grey": "#5E5952",
        "light-grey": "#9F9384",
        // Legacy aliases
        "parofc-blue": "#000000",
        "dark-bg": "#4a4a4a",
      },
      backgroundImage: {
        "gradient-parofc":
          "linear-gradient(135deg, #000000 0%, #5E5952 50%, #A66337 100%)",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
        "marquee-vertical": "marquee-vertical 25s linear infinite",
        "marquee-vertical-reverse":
          "marquee-vertical-reverse 25s linear infinite",
        gradient: "gradient 8s linear infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "marquee-vertical": {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(-100%)" },
        },
        "marquee-vertical-reverse": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0%)" },
        },
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
  },
  plugins: [],
};
