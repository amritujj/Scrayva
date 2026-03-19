module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Layout / dark theme
        'dark-bg':     '#0f0f23',
        'dark-card':   '#1a1a2e',
        'dark-border': '#262626',
        'dark-text':   '#e2e8f0',
        'dark-muted':  '#94a3b8',
        // Brand purple
        'purple-main': '#8b5cf6',
        'purple-light':'#c4b5fd',
        'purple-dark': '#6b21a8',
        // Semantic
        'success':     '#10b981',
        'warning':     '#f59e0b',
        'error':       '#ef4444',
        // Stitch AI landing brand
        brand: {
          primary:   '#8b5cf6',
          secondary: '#6366f1',
          dark:      '#0f172a',
          accent:    '#d8b4fe',
        },
        // Stitch AI dashboard dark tokens
        dark: {
          bg:     '#0f172a',
          card:   '#1e293b',
          border: '#334155',
          text:   '#f8fafc',
        },
        // Stitch AI template / settings tokens
        scrayva: {
          bg:           '#0a0a0c',
          card:         '#16161a',
          accent:       '#8b5cf6',
          accentHover:  '#7c3aed',
          muted:        '#9ca3af',
          dark:         '#0f172a',
          'dark-lighter':'#1e293b',
          'dark-border': '#334155',
          purple:        '#9333ea',
          'purple-hover':'#a855f7',
        },
        // Blog tokens
        "on-surface": "#ecedf6",
        "primary-container": "#bd87ff",
        "outline": "#73757d",
        "surface-container": "#161a21",
        "on-error": "#490013",
        "on-secondary": "#080079",
        "surface-variant": "#22262f",
        "on-secondary-fixed-variant": "#3a3ac8",
        "on-background": "#ecedf6",
        "tertiary-fixed-dim": "#fa7c91",
        "secondary-container": "#2f2ebe",
        "tertiary-fixed": "#ff90a1",
        "on-primary-fixed-variant": "#40007a",
        "background": "#0b0e14",
        "surface-bright": "#282c36",
        "on-tertiary-container": "#56001c",
        "tertiary": "#ff94a4",
        "primary": "#c799ff",
        "on-error-container": "#ffb2b9",
        "tertiary-container": "#fd7e94",
        "surface-container-lowest": "#000000",
        "secondary-fixed": "#cdcdff",
        "secondary-fixed-dim": "#bdbeff",
        "primary-dim": "#9a3fff",
        "on-secondary-container": "#ccccff",
        "tertiary-dim": "#f3778c",
        "surface-container-high": "#1c2028",
        "surface": "#0b0e14",
        "error-dim": "#d73357",
        "on-secondary-fixed": "#160bae",
        "on-tertiary-fixed-variant": "#71112c",
        "on-surface-variant": "#a9abb3",
        "error": "#ff6e84",
        "primary-fixed-dim": "#b374ff",
        "surface-container-low": "#10131a",
        "on-primary": "#440080",
        "inverse-surface": "#f9f9ff",
        "inverse-on-surface": "#52555c",
        "inverse-primary": "#8413ec",
        "outline-variant": "#45484f",
        "on-primary-container": "#340064",
        "on-tertiary": "#680826",
        "secondary": "#9093ff",
        "primary-fixed": "#bd87ff",
        "on-tertiary-fixed": "#390010",
        "surface-container-highest": "#22262f",
        "surface-dim": "#0b0e14",
        "error-container": "#a70138",
        "surface-tint": "#c799ff",
        "secondary-dim": "#6063ee",
        "on-primary-fixed": "#000000"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        "headline": ["Manrope"],
        "body": ["Inter"],
        "label": ["Inter"],
        "manrope": ["Manrope"]
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ]
}
