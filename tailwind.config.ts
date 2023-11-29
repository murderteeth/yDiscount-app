import { join } from 'path'
import type { Config } from 'tailwindcss'

const config: Config = {
	presets: [require('@yearn-finance/web-lib/tailwind.config.cjs')],
	content: [
		'./components/**/*.{js,ts,jsx,tsx}',
		'./contexts/**/*.{js,ts,jsx,tsx}',
		'./hooks/**/*.{js,ts,jsx,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'components', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'contexts', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'hooks', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'icons', '**', '*.{js,ts,jsx,tsx}'),
		join(__dirname, 'node_modules', '@yearn-finance', 'web-lib', 'utils', '**', '*.{js,ts,jsx,tsx}')
	],
  theme: {
    extend: {
			width: {
				inherit: 'inherit'
			},
			fontSize: {
				xxs: ['10px', '16px'],
				xs: ['12px', '16px'],
				sm: ['14px', '20px'],
				base: ['16px', '24px'],
				intermediate: ['18px', '24px'],
				lg: ['20px', '32px'],
				xl: ['24px', '32px'],
				'3xl': ['32px', '40px'],
				'4xl': ['40px', '56px'],
				'7xl': ['80px', '96px'],
				'8xl': ['88px', '106px']
			},
			maxWidth: {
				xl: '552px',
				'4xl': '904px',
				'6xl': '1200px'
			},
			gridTemplateColumns: {
				20: 'repeat(20, minmax(0, 1fr))',
				30: 'repeat(30, minmax(0, 1fr))'
			},
			gridColumn: {
				'span-18': 'span 18 / span 18',
				'span-20': 'span 20 / span 20'
			},
			scale: {
				102: '1.02'
			},
			spacing: {
				72: '72px'
			}
    },
  },
  plugins: [],
}
export default config
