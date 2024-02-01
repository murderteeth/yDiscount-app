import { DISCOUNT_ADDRESS, VEYFI_ADDRESS } from 'utils/constants'
import { parseAbi } from 'viem'
import { useContractReads } from 'wagmi'
import { toNormalizedBN } from '@yearn-finance/web-lib/utils/format.bigNumber'
import { useWeb3 } from '@yearn-finance/web-lib/contexts/useWeb3'

export function useData() {
  const { address } = useWeb3()
  const result = useContractReads({
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
    }, {
      address: VEYFI_ADDRESS,
      functionName: 'locked',
      args: [address as `0x${string}`],
      abi: parseAbi(['function locked(address) external view returns (uint256, uint256)'])
    }],
    enabled: address !== undefined
  })

  const { isLoading, isSuccess, refetch, isFetching, isFetched } = result

  if(result.isSuccess && result.data) {
    const [ month, teamAllowance, contributorAllowance, spotPrice, locked ] = result.data
    const veYfi = locked.status === 'success' ? locked.result : [0n, 0n]
    return {
      isLoading, isSuccess, refetch, isFetching, isFetched,
      month: (month.status === 'success') ? Number(month.result) : 0,
      teamAllowance: (teamAllowance.status === 'success') ? toNormalizedBN(teamAllowance.result) : toNormalizedBN(0),
      contributorAllowance: (contributorAllowance.status === 'success') ? toNormalizedBN(contributorAllowance.result) : toNormalizedBN(0),
      spotPrice: (spotPrice.status === 'success') ? toNormalizedBN(spotPrice.result) : toNormalizedBN(0),
      veYfi: {
        locked: toNormalizedBN(veYfi[0]),
        expiration: Number(veYfi[1] * 1000n)
      }
    }
  } else {
    return {
      isLoading, isSuccess, refetch, isFetching, isFetched,
      month: 0,
      teamAllowance: toNormalizedBN(0),
      contributorAllowance: toNormalizedBN(0),
      spotPrice: toNormalizedBN(0),
      veYfi: {
        locked: toNormalizedBN(0),
        expiration: 0
      }
    }
  }
}
