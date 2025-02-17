/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["**/*.html", "**/*.js", "./node_modules/flowbite/**/*.js"],

	theme: {
		extend: {
			colors: {},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
}
