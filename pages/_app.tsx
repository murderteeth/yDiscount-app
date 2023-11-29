import '../style.css'
import type { AppProps } from 'next/app'
import { WithYearn } from '@yearn-finance/web-lib/contexts/WithYearn'
import { localhost, mainnet } from '@wagmi/chains'
import AppHeader from '@/components/Header'

export default function App({ Component, pageProps }: AppProps) {
  return <WithYearn
    supportedChains={[mainnet, localhost]}>
    <>
      <AppHeader />
      <Component {...pageProps} />
    </>
  </WithYearn>
}