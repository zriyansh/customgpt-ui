/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CustomGPT.ai Brand Colors
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',  
          200: '#b8d9ff',
          300: '#7ab8ff',
          400: '#3394ff',
          500: '#0a75ff', // Primary brand color
          600: '#0058e6',
          700: '#0044ba',
          800: '#003896',
          900: '#002d7a',
        },
        // Chat-specific colors
        chat: {
          user: '#2D3748',
          assistant: '#F7FAFC',
          border: '#E2E8F0',
          hover: '#EDF2F7',
        },
        // Semantic colors
        success: {
          light: '#d1fae5',
          main: '#10b981',
          dark: '#065f46',
        },
        error: {
          light: '#fee2e2',
          main: '#ef4444',
          dark: '#991b1b',
        },
        warning: {
          light: '#fef3c7',
          main: '#f59e0b',
          dark: '#92400e',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'blink': 'blink 1s infinite',
        'bounce-subtle': 'bounceSubtle 1.4s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        bounceSubtle: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
};