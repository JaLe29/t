/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				mail: {
					primary: '#7c3aed', // Violet 600 - modern purple
					dark: '#6d28d9', // Violet 700
					light: '#8b5cf6', // Violet 500
					accent: '#ec4899', // Pink 500 - vibrant pink
					accentDark: '#db2777', // Pink 600
					success: '#10b981', // Emerald green
					successDark: '#059669',
					white: '#FFFFFF',
					black: '#000000',
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
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
		},
	},
	plugins: [],
};
