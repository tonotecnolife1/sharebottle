import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ═══════════════ NIGHTOS palette (light theme) ═══════════════
        pearl: {
          DEFAULT: "#faf7f2",
          soft: "#f5efe6",
          warm: "#fdfcf9",
        },
        champagne: {
          DEFAULT: "#f1e7d0",
          light: "#f7f0de",
          dark: "#e6d6b0",
        },
        roseGold: {
          DEFAULT: "#c98d80",
          light: "#d9a99e",
          dark: "#a6695c",
          muted: "rgba(201, 141, 128, 0.12)",
          border: "rgba(201, 141, 128, 0.3)",
        },
        amethyst: {
          DEFAULT: "#9a7bbb",
          light: "#b89cd3",
          dark: "#6e4f8f",
          muted: "rgba(154, 123, 187, 0.1)",
          border: "rgba(154, 123, 187, 0.35)",
        },
        blush: {
          DEFAULT: "#e4a3b0",
          light: "#f2c9d1",
          dark: "#c57786",
        },
        ink: {
          DEFAULT: "#2b232a",
          secondary: "#675d66",
          muted: "#a39ba1",
        },
        beige: {
          DEFAULT: "#f5ede0",
          dark: "#ebdcc2",
          border: "#d9c7a8",
        },

        // ═══════════════ SHAREBOTTLE palette (legacy — do not remove) ═══════════════
        bg: {
          DEFAULT: "#08080d",
          card: "#111118",
          elevated: "#191920",
          sheet: "#14141c",
          hover: "#1e1e28",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#d4b962",
          dark: "#b8963f",
          muted: "rgba(201, 168, 76, 0.12)",
          border: "rgba(201, 168, 76, 0.25)",
        },
        text: {
          primary: "#eeeef0",
          secondary: "#85858f",
          muted: "#55555f",
        },
        emerald: "#4ade80",
        rose: "#ef4444",
        amber: "#f59e0b",
        line: {
          DEFAULT: "#222230",
          light: "#2c2c3a",
        },
      },
      borderRadius: {
        card: "14px",
        btn: "10px",
        badge: "20px",
        sheet: "20px 20px 0 0",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
        elevated: "0 8px 32px rgba(0,0,0,0.5)",
        "glow-gold": "0 0 24px rgba(201,168,76,0.08)",
        // NIGHTOS light shadows
        "soft-card": "0 2px 8px rgba(60, 40, 50, 0.06), 0 1px 2px rgba(60, 40, 50, 0.04)",
        "elevated-light": "0 12px 40px rgba(60, 40, 50, 0.12)",
        "glow-amethyst": "0 0 32px rgba(154, 123, 187, 0.2)",
        "glow-rose": "0 0 24px rgba(201, 141, 128, 0.18)",
      },
      backgroundImage: {
        "gradient-rose-gold":
          "linear-gradient(135deg, #d9a99e 0%, #c98d80 50%, #a6695c 100%)",
        "gradient-amethyst":
          "linear-gradient(135deg, #b89cd3 0%, #9a7bbb 50%, #6e4f8f 100%)",
        "gradient-pearl":
          "linear-gradient(180deg, #fdfcf9 0%, #faf7f2 50%, #f5efe6 100%)",
        "gradient-champagne":
          "linear-gradient(135deg, #f7f0de 0%, #f1e7d0 100%)",
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ['"Geist Mono"', "monospace"],
        // Mixed-script display: Latin/numerals fall on Cormorant Garamond,
        // Japanese glyphs fall through to Noto Serif JP. Order matters —
        // Cormorant has no JP coverage, so JP automatically uses the next.
        display: [
          '"Cormorant Garamond"',
          '"Noto Serif JP"',
          "Georgia",
          "serif",
        ],
      },
      fontSize: {
        "display-lg": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["1.5rem", { lineHeight: "1.3", fontWeight: "700" }],
        "display-sm": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["0.875rem", { lineHeight: "1", fontWeight: "500" }],
        "label-sm": ["0.75rem", { lineHeight: "1", fontWeight: "500" }],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-overlay": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.3s ease-out both",
        "fade-overlay": "fade-overlay 0.2s ease-out both",
        shimmer: "shimmer 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
