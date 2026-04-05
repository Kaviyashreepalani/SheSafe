/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff4d6d",    // SOS Pink
        secondary: "#c9184a",  // Deep Rose
        accent: "#ff758f",     // Soft Rose
        safe: "#2ecc71",       // Safe Green
        danger: "#e74c3c",     // Hazard Red
        dark: "#1a1a1a",       // Clean Dark
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
