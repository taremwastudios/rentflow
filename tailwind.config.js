/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode class
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Include src directory
  ],
  theme: {
    extend: {
      colors: {
        // Define base colors or extend existing ones if needed
        // Example: if you want to define a primary green color
        // 'primary-green': '#10B981', // Emerald 600
      },
      // Add other theme extensions here (fonts, spacing, etc.)
    },
  },
  plugins: [],
};
