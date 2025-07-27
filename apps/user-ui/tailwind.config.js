

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    './src/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        Roboto: ['var(--font-roboto)'],
        Poppins: ['var(--font-poppins)'],
      },
    },
  },
  plugins: [],
};
