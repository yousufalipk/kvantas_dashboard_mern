/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-image': "url('/src/Assets/bg.png')",
      },
      colors: {
        bluebtn: '#2fedbf'
      }
    },
  },
  plugins: [],
}
