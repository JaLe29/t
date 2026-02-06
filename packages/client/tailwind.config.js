/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#a5c400', // Primary color
					dark: '#00BC00', // Active/hover color
					light: '#b8d400', // Lighter variant
				},
				accent: {
					DEFAULT: '#a5c400', // Same as primary
					dark: '#00BC00', // Same as primary dark
				},
				success: {
					DEFAULT: '#00BC00', // Success color
					dark: '#00a000', // Darker success
				},
				gray: {
					50: '#FAFAFA',
					100: '#F5F5F5',
					200: '#E5E5E5',
					300: '#D4D4D4',
					400: '#A3A3A3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717',
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
		},
	},
	plugins: [],
};
