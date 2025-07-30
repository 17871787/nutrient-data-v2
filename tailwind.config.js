/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      letterSpacing: {
        'wide-md': '.08em'
      },
      padding: {
        'field-y': '1rem'  // 16px
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #3B82F6)',
          hover: 'var(--color-primary-hover, #2563EB)',
          light: 'var(--brand-primary-light, #EFF6FF)'
        },
        success: 'var(--color-success, #10B981)',
        danger: 'var(--color-danger, #EF4444)'
      },
      boxShadow: {
        'card': 'var(--shadow-card, 0 1px 3px 0 rgba(0, 0, 0, 0.1))'
      },
      fontFamily: {
        'display': 'var(--font-display, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif)',
        'body': 'var(--font-text, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif)'
      }
    },
  },
  plugins: [],
}