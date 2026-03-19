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
        // ── ベース ──
        bg: {
          DEFAULT: "#08080d",
          card: "#111118",
          elevated: "#191920",
          sheet: "#14141c",
          hover: "#1e1e28",
        },
        // ── ゴールドアクセント ──
        gold: {
          DEFAULT: "#c9a84c",
          light: "#d4b962",
          dark: "#b8963f",
          muted: "rgba(201, 168, 76, 0.12)",
          border: "rgba(201, 168, 76, 0.25)",
        },
        // ── テキスト ──
        text: {
          primary: "#eeeef0",
          secondary: "#85858f",
          muted: "#55555f",
        },
        // ── ステータス ──
        emerald: "#4ade80",
        rose: "#ef4444",
        amber: "#f59e0b",
        // ── ボーダー ──
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
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "monospace"],
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
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.3s ease-out both",
        "fade-overlay": "fade-overlay 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
