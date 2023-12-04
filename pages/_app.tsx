import '../style.css'
import type { AppProps } from 'next/app'
import localFont from 'next/font/local'
import { WithYearn } from '@yearn-finance/web-lib/contexts/WithYearn'
import { localhost, mainnet } from '@wagmi/chains'
import Header from 'components/Header'
import Meta from 'components/Meta'
import SignalsProvider from 'hooks/useSignals'

const aeonik = localFont({
	variable: '--font-aeonik',
	display: 'swap',
	src: [
		{
			path: '../public/fonts/Aeonik-Regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: '../public/fonts/Aeonik-Bold.woff2',
			weight: '700',
			style: 'normal'
		},
		{
			path: '../public/fonts/Aeonik-Black.ttf',
			weight: '900',
			style: 'normal'
		}
	]
});

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <style
      jsx
      global>{`
      html {
        font-family: ${aeonik.style.fontFamily};
      }
    `}</style>
    <WithYearn
      supportedChains={[mainnet, localhost]}>
      <>
        <Meta />
        <Header />
				<SignalsProvider>
	        <Component {...pageProps} />
				</SignalsProvider>
      </>
    </WithYearn>
  </>
}
