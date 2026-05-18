/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Indian artisan earthy tones
        'clay': '#A67C52',
        'terracotta': '#C85A54',
        'saffron': '#FF9933',
        'indigo': '#1C0E4F',
        'sage': '#7B8A5E',
        'gold': '#D4AF37',
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
