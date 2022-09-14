/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      display: ["Oswald", "sans-serif"],
      body: ["Open Sans", "sans-serif"],
    },

    extend: {
      maxHeight: {
        128: "32rem",
      },
      scale: {
        101: "1.01",
        102: "1.02",
      },
    },
  },
};
