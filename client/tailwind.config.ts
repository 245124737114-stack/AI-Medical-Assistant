import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        medical: {
          blue: "#2563EB",
          cyan: "#06B6D4",
          ice: "#EFF6FF",
          surface: "#F8FBFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.05), 0 8px 24px rgba(37, 99, 235, 0.06)",
        "card-hover": "0 4px 12px rgba(15, 23, 42, 0.08), 0 16px 32px rgba(37, 99, 235, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
