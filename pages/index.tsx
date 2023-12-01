import { useWeb3 } from '@yearn-finance/web-lib/contexts/useWeb3'
import SetTeamAllowances from 'components/SetTeamAllowances'
import BuyYFI from 'components/BuyYFI'
import Lander from 'components/Lander'
import { useMemo, useState } from 'react'

export default function Home() {
  const { isActive } = useWeb3()
  const [isTeamWallet] = useState(true)

  const component = useMemo(() => {
    return isActive
    ? isTeamWallet 
      ? <SetTeamAllowances />
      : <BuyYFI />
    : <Lander />
  }, [isActive, isTeamWallet])

  return <main className={`
    relative max-w-6xl min-h-screen
    mx-auto mt-20 sm:mt-0 sm:pt-24 sm:pb-40
    flex`}>
    {component}
  </main>
}
