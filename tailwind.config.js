/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        momo: ['"Noto Serif SC"', 'STSong', 'Songti SC', 'SimSun', 'serif'],
        momoSans: ['"Noto Sans SC"', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
        momoLatin: ['"EB Garamond"', 'Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        paper: '#f4f2e8',
      },
    },
  },
  plugins: [],
}
