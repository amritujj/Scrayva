// Intentionally mirrors postcss.config.js to avoid Next.js picking up
// the old @tailwindcss/postcss (v4-only) plugin when resolving .mjs first.
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
