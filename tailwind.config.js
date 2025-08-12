module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        lex: {
          bg: '#10101a', // dashboard background
          card: '#181827', // card/panel background
          accent: '#c026d3', // Lex fuchsia
          blue: '#3b82f6', // Lex blue
          glow: '#f472b6', // for subtle glows
        }
      },
      boxShadow: {
        lex: "0 8px 32px 0 rgba(192,38,211,0.12), 0 2px 8px 0 rgba(59,130,246,0.10)",
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '2rem',
        '4xl': '2.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
