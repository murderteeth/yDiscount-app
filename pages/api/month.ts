import { NextApiRequest, NextApiResponse } from 'next'
import { DISCOUNT_ADDRESS } from 'utils/constants'
import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'wagmi'

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const fullnode = process.env.HTTP_FULL_NODE_1
  if(!fullnode) throw new Error('!HTTP_FULL_NODE_1')
  const rpc = createPublicClient({ chain: mainnet, transport: http(fullnode) })

  const month = await rpc.readContract({
    address: DISCOUNT_ADDRESS,
    functionName: 'month',
    abi: parseAbi(['function month() external view returns (uint256)'])
  })

  res.status(200).json({ month: Number(month) })
}
