/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'float-1': 'float-1 4s ease-in-out infinite',
        'float-2': 'float-2 4s ease-in-out infinite 0.5s',
        'float-3': 'float-3 4s ease-in-out infinite 1s',
        'float-4': 'float-4 4s ease-in-out infinite 1.5s',
        'float-5': 'float-5 4s ease-in-out infinite 2s',
        'float-6': 'float-6 4s ease-in-out infinite 2.5s',
      },
      keyframes: {
        'float-1': {
          '0%, 100%': { transform: 'translate(-50%, -50%) translateY(0)' },
          '50%': { transform: 'translate(-50%, -50%) translateY(-20px)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translate(-50%, -50%) translateY(0)' },
          '50%': { transform: 'translate(-50%, -50%) translateY(20px)' },
        },
        'float-3': {
          '0%, 100%': { transform: 'translateX(-50%) translateY(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(-50%) translateY(15px)' },
        },
        'float-4': {
          '0%, 100%': { transform: 'translate(0, 0) translateY(0)' },
          '50%': { transform: 'translate(0, 0) translateY(-25px)' },
        },
        'float-5': {
          '0%, 100%': { transform: 'translate(0, 0) translateY(0)' },
          '50%': { transform: 'translate(0, 0) translateY(18px)' },
        },
        'float-6': {
          '0%, 100%': { transform: 'translateX(50%) translateY(-50%) translateY(0)' },
          '50%': { transform: 'translateX(50%) translateY(-50%) translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
} 