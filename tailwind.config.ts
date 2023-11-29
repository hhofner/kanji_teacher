import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      height: {
        'webkit': '100svh'
      }
    },
  },
  plugins: [],
} satisfies Config