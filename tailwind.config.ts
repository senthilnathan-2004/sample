import type { Config } from "tailwindcss";

// Single-brand magenta system. NO gradients, no Amazon/Flipkart hues.
// Tokens mirror the CSS variables declared in globals.css (spec §B7).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          tint: "var(--brand-tint)",
          "tint-strong": "var(--brand-tint-strong)",
        },
        ink: "var(--text)",
        muted: "var(--text-muted)",
        cream: "var(--bg-cream)",
        hairline: "var(--border)",
        success: "var(--success)",
        warning: "var(--warning)",
        info: "var(--info)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(48,24,18,0.06)",
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
      maxWidth: {
        page: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
