/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        dark:    '#2C2C2C',
        lime:    '#C6FF34',
        purple:  '#7E3BED',
        'purple-light': '#F2EBFD',
        'map-bg': '#1E1E1E',
        'dark-bg': '#30343F',
        'card-bg': 'rgba(255,255,255,0.08)',
        'status-open':    '#22C55E',
        'status-closed':  '#EF4444',
        'status-unknown': '#F59E0B',
        'text-faint': '#FAFAFF',
        'text-slate': '#64748B',
        'input-bg': '#F8FAFC',
        'community-bg': '#F1F6FF',
        'community-text': '#0F1724',
      },
      borderRadius: {
        'xs':  '4px',
        'sm':  '8px',
        'md':  '14px',
        'lg':  '18px',
        'xl':  '28px',
        'xxl': '38px',
      },
      fontFamily: {
        regular:   ['Inter_400Regular'],
        medium:    ['Inter_500Medium'],
        semibold:  ['Inter_600SemiBold'],
        bold:      ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
