/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Montserrat", "sans-serif"],
    },
    colors: {
      demos: {
        100: "#f5fafc", // Bijna wit
        200: "#13c0f5", // Demos lichtblauw
        300: "#2e3c57", // Demos donkerblauw
        400: "#1a253b", // Demos donkerderblauw
        500: "#0c1424", // Bijna zwart
      },
    },
  },
};
