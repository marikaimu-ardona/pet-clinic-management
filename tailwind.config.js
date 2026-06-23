/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Neutral tokens are CSS variables so the whole app themes (light/dark)
      // from index.css. Brand/accent colors stay fixed (they work on both).
      colors: {
        page: "rgb(var(--c-page) / <alpha-value>)", // app background
        card: "rgb(var(--c-card) / <alpha-value>)", // card surfaces (was bg-white)
        ink: "rgb(var(--c-ink) / <alpha-value>)", // primary label/text
        muted: "rgb(var(--c-muted) / <alpha-value>)", // secondary text / placeholder
        subtle: "rgb(var(--c-subtle) / <alpha-value>)", // tertiary text
        input: "rgb(var(--c-input) / <alpha-value>)", // field background
        surface: "rgb(var(--c-surface) / <alpha-value>)", // sidebar / panels
        "card-border": "rgb(var(--c-card-border) / <alpha-value>)", // card outline
        accent: {
          rust: "#9f4122", // groomings + surgery card
          "rust-dark": "#7f2a0d", // surgery gradient end
          gold: "#735c00", // new clients
        },
        brand: {
          DEFAULT: "#4db6ac", // logo tile
          dark: "#006a63", // wordmark
          ink: "#00433f", // paw glyph
        },
        cta: {
          DEFAULT: "#fd8863", // log in button
          text: "#722104", // log in label
        },
      },
      fontFamily: {
        quicksand: ["Quicksand", "ui-sans-serif", "system-ui", "sans-serif"],
        nunito: ["'Nunito Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
