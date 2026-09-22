/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#0b0f19",
          panel: "#111827",
          card: "#1f2937",
          hover: "#374151",
          border: "#2d3748",
          purple: "#7c3aed",
          "purple-hover": "#6d28d9",
          green: "#10b981",
          "green-hover": "#059669",
          cyan: "#06b6d4",
          gold: "#f59e0b",
          text: "#f9fafb",
          muted: "#9ca3af",
          dark: "#080c14"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
};
