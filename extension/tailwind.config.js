/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#F6F5F2',
          card: '#EDECEA',
          elevated: '#E4E2DF',
          dark: '#2A2825',
          darker: '#1A1917',
        },
        txt: {
          primary: '#1A1917',
          secondary: '#6B6860',
          muted: '#9C9890',
          inverse: '#F6F5F2',
        },
        accent: {
          DEFAULT: '#C4563A',
          soft: '#D4785F',
          muted: '#E8A48E',
          bg: 'rgba(196, 86, 58, 0.08)',
        },
        border: {
          DEFAULT: '#D8D5D0',
          strong: '#C5C1BB',
        },
      },
      fontFamily: {
        heading: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"Sora"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '12px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};
