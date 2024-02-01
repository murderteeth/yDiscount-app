import { useWeb3 } from '@yearn-finance/web-lib/contexts/useWeb3'
import SetTeamAllowances from 'components/SetTeamAllowances'
import BuyVeYFI from 'components/BuyVeYFI'
import Lander from 'components/Lander'
import { useMemo } from 'react'
import { useData } from 'hooks/useData'

export default function Home() {
  const { isActive } = useWeb3()
  const { teamAllowance, contributorAllowance } = useData()

  const component = useMemo(() => {
    if(isActive && teamAllowance.raw > 0) return <SetTeamAllowances />
    if(isActive && contributorAllowance.raw > 0) return <BuyVeYFI />
    return <Lander />
  }, [isActive, teamAllowance, contributorAllowance])

  return <main className={`
    relative max-w-6xl min-h-screen
    mx-auto mt-20 sm:mt-0 sm:pt-24 sm:pb-40
    flex`}>
    {component}
  </main>
}
