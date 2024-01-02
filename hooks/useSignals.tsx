import { DISCOUNT_ADDRESS } from 'utils/constants'
import { parseAbi } from 'viem'
import { useContractReads } from 'wagmi'
import { signal } from '@preact/signals-react'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { toNormalizedBN } from '@yearn-finance/web-lib/utils/format.bigNumber'
import { useWeb3 } from '@yearn-finance/web-lib/contexts/useWeb3'

type SignalContext = {
  isLoading: boolean
  isSuccess: boolean
  refetch: () => void
  isFetching: boolean
  isFetched: boolean
}

const DEFAULT = {
  isLoading: false,
  isSuccess: false,
  refetch: () => {},
  isFetching: false,
  isFetched: false
} as SignalContext

export const signals = signal({
  month: 0,
  teamAllowance: toNormalizedBN(0),
  contributorAllowance: toNormalizedBN(0),
  spotPrice: toNormalizedBN(0)
})

export const signalsContext = createContext<SignalContext>(DEFAULT)
export const useSignals = () => useContext(signalsContext)
export default function SignalsProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<SignalContext>(DEFAULT)
  const { address } = useWeb3()

  const { data, isLoading, isSuccess, refetch, isFetching, isFetched } = useContractReads({
    contracts: [{
      address: DISCOUNT_ADDRESS,
      functionName: 'month',
      abi: parseAbi(['function month() external view returns (uint256)'])
    }, {
      address: DISCOUNT_ADDRESS,
      functionName: 'team_allowance',
      args: [address as `0x${string}`],
      abi: parseAbi(['function team_allowance(address) external view returns (uint256)'])
    }, {
      address: DISCOUNT_ADDRESS,
      functionName: 'contributor_allowance',
      args: [address as `0x${string}`],
      abi: parseAbi(['function contributor_allowance(address) external view returns (uint256)'])
    }, {
      address: DISCOUNT_ADDRESS,
      functionName: 'spot_price',
      abi: parseAbi(['function spot_price() external view returns (uint256)'])
    }],
    enabled: address !== undefined
  })

  useEffect(() => {
    if(isSuccess && data) {
      const [month, teamAllowance, contributorAllowance, spotPrice] = data
      const update = {
        month: (month.status === 'success') ? Number(month.result) : 0,
        teamAllowance: (teamAllowance.status === 'success') ? toNormalizedBN(teamAllowance.result) : toNormalizedBN(0),
        contributorAllowance: (contributorAllowance.status === 'success') ? toNormalizedBN(contributorAllowance.result) : toNormalizedBN(0),
        spotPrice: (spotPrice.status === 'success') ? toNormalizedBN(spotPrice.result) : toNormalizedBN(0)
      }
      signals.value = update
    }
  }, [data, isSuccess])

  useEffect(() => {
    setContext({ isLoading, isSuccess, refetch, isFetching, isFetched })
  }, [setContext, isLoading, isSuccess, refetch, isFetching, isFetched])

  return <signalsContext.Provider value={context}>{children}</signalsContext.Provider>
}
