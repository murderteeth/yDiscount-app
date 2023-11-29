import { toAddress } from '@yearn-finance/web-lib/utils/address'

import type { TAddress } from '@yearn-finance/web-lib/types'

export const DEFAULT_CHAIN_ID = 1
export const YEARN_VOTER_ADDRESS = toAddress('0x90be6DFEa8C80c184C442a36e17cB2439AAE25a7')
export const VECRV_AIRDROP_ADDRESS = toAddress('0x3ea03249B4D68Be92a8eda027C5ac12e6E419BEE')
export const EARLY_AIRDROP_ADDRESS = toAddress('0x2C533357664d8750e5F851f39B2534147F5578af')
export const PRISMA_ADDRESS = toAddress('0xdA47862a83dac0c112BA89c6abC2159b95afd71C')
export const YPRISMA_LEGACY_ADDRESS = toAddress('0xfd37356c1a62288b32Fa58188c77Ab0D694a0f4E')
export const LEGACY_MINTER_ADDRESS = toAddress(`0x04EcFdb67b00Fd70007570342887390ebf934C28`)

export const YPRISMA_ADDRESS = toAddress('0xe3668873d944e4a949da05fc8bde419eff543882')
export const YPRISMA_STAKING_ADDRESS = toAddress('0x774a55C3Eeb79929fD445Ae97191228Ab39c4d0f')
export const YPRISMA_REWARD_TOKEN_ADDRESS = toAddress(`0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0`)

export const YCRV_ADDRESS = toAddress(`0xFCc5c47bE19d06BF83eB04298b026F81069ff65b`)
export const YCRV_STAKING_ADDRESS = toAddress(`0x84c94d739e075b3C7431bdb1A005F0412DF828a5`)

export const LP_YPRISMA_ADDRESS = toAddress(`0x69833361991ed76f9e8DBBcdf9ea1520fEbFb4a7`)
export const LP_YPRISMA_STAKING_ADDRESS = toAddress(`0x6806D62AAdF2Ee97cd4BCE46BF5fCD89766EF246`)

export const DYFI_ADDRESS = toAddress('0x41252E8691e964f7DE35156B68493bAb6797a275')
export const DYFI_STAKING_ADDRESS = toAddress(`0x93283184650f4d3B4253ABd00978176732118428`)

export type TAvailableFarm = {
	tabIndex: number
	stakingContract: TAddress
	stakingToken: TAddress
	rewardToken: TAddress
	stakingTokenName: string
	rewardTokenName: string
	slug: string
}
export const AVAILABLE_FARMS: TAvailableFarm[] = [
	{
		tabIndex: 1,
		stakingContract: YPRISMA_STAKING_ADDRESS,
		stakingToken: YPRISMA_ADDRESS,
		rewardToken: YPRISMA_REWARD_TOKEN_ADDRESS,
		stakingTokenName: 'yPrisma',
		rewardTokenName: 'wstETH',
		slug: 'yprisma'
	},
	{
		tabIndex: 2,
		stakingContract: DYFI_STAKING_ADDRESS,
		stakingToken: YPRISMA_ADDRESS,
		rewardToken: DYFI_ADDRESS,
		stakingTokenName: 'yPrisma',
		rewardTokenName: 'dYFI',
		slug: 'dyfi'
	},
	{
		tabIndex: 3,
		stakingContract: YCRV_STAKING_ADDRESS,
		stakingToken: YCRV_ADDRESS,
		rewardToken: YPRISMA_ADDRESS,
		stakingTokenName: 'yCRV',
		rewardTokenName: 'yPrisma',
		slug: 'ycrv'
	},
	{
		tabIndex: 4,
		stakingContract: LP_YPRISMA_STAKING_ADDRESS,
		stakingToken: LP_YPRISMA_ADDRESS,
		rewardToken: YPRISMA_ADDRESS,
		stakingTokenName: 'yPrisma LP',
		rewardTokenName: 'yPrisma',
		slug: 'curve-prisma-lp'
	}
]
