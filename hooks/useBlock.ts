import { useEffect, useState } from 'react'
import { Block } from 'viem'
import { useBlockNumber, usePublicClient } from 'wagmi'

export function useBlock() {
  const publicClient = usePublicClient()
  const [blockNumber, setBlockNumber] = useState<bigint | undefined>(undefined)
  const [block, setBlock] = useState<Block | undefined>(undefined)
  const _blockNumber = useBlockNumber()

  useEffect(() => {
    if(!_blockNumber.isFetched) return
    setBlockNumber(_blockNumber.data)
  }, [_blockNumber])

  useEffect(() => {
    if(!blockNumber) return
    publicClient
      .getBlock({ blockNumber })
      .then(_block => setBlock(_block))
      .catch(error => console.log(error))
  }, [publicClient, blockNumber])

  return { block }
}
