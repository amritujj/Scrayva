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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  },
  plugins: []
}
