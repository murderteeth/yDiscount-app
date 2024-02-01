import Numeric from './fields/Numeric'
import { useContractRead, useContractReads, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { DISCOUNT_ADDRESS, VEYFI_ADDRESS } from 'utils/constants'
import { useWeb3 } from '@yearn-finance/web-lib/contexts/useWeb3'
import { parseAbi } from 'viem'
import { TNormalizedBN, toNormalizedBN } from '@yearn-finance/web-lib/utils/format.bigNumber'
import Text from './fields/Text'
import Percent from './fields/Percent'
import Tokens from './fields/Tokens'
import { PercentInput } from './fields/PercentInput'
import { AmountInput } from './fields/AmountInput'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { handleInputChangeEventValue } from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue'
import { Button } from '@yearn-finance/web-lib/components/Button'
import Accordian from './Accordian'
import AddressInput, { TInputAddressLike } from './fields/AddressInput'
import { formatAmount } from '@yearn-finance/web-lib/utils/format.number'
import { useBlock } from 'hooks/useBlock'
import { useData } from 'hooks/useData'

function Row({ label, disabled, className, children }: { label: string, disabled?: boolean, className?: string, children: React.ReactNode }) {
  return <div className={`
    relative w-full px-1 py-2
    flex items-center
    odd:bg-purple-100/5
    ${disabled ? 'text-neutral-800' : ''}
    ${className}`}>
    <div className="w-1/2">{label}</div>
    <div className="w-1/2 text-right">
      {children}
    </div>
  </div>
}

function useOnchainData({ address }: { address?: `0x${string}` }) {
  const { data, refetch, isFetching } = useContractReads({
    enabled: !!address,
    contracts: [{
      address: VEYFI_ADDRESS,
      functionName: 'locked',
      args: [address as `0x${string}`],
      abi: parseAbi(['function locked(address) external view returns (uint256, uint256)'])
    }, {
      address: DISCOUNT_ADDRESS,
      functionName: 'discount',
      args: [address as `0x${string}`],
      abi: parseAbi(['function discount(address) external view returns (uint256)'])
    }, {
      address: DISCOUNT_ADDRESS,
      functionName: 'spot_price',
      abi: parseAbi(['function spot_price() external view returns (uint256)'])
    }],
    select: data => {
      const result = {
        veYFI: {
          locked: toNormalizedBN(0),
          expiration: 0
        },
        discount: toNormalizedBN(0),
        price: toNormalizedBN(0)
      }

      if(data[0].status === 'success') {
        result.veYFI = {
          locked: toNormalizedBN(data[0].result[0] || 0n),
          expiration: Number(data[0].result[1] * 1000n || 0)
        }
      }

      if(data[1].status === 'success') {
        result.discount = toNormalizedBN(data[1].result)
      }

      if(data[2].status === 'success') {
        result.price = toNormalizedBN(data[2].result)
      }

      return result
    }
  })

  return { data, refetch, isFetching }
}

function usePreview({ 
  address, amount, delegate, allowance, minLock
}: { 
  address?: `0x${string}`, amount: TNormalizedBN, delegate: boolean, allowance: TNormalizedBN, minLock?: boolean 
}) {
  const { data, isFetching } = useContractRead({
    enabled: !!address && allowance.raw > 0n && minLock,
    address: DISCOUNT_ADDRESS,
    functionName: 'preview',
    args: [address as `0x${string}`, amount.raw, delegate],
    abi: parseAbi(['function preview(address, uint256, bool) external view returns (uint256)']),
    select: data => toNormalizedBN(data)
  })
  return { preview: data, isFetchingPreview: isFetching }
}

export default function BuyVeYFI() {
  const [buy, setBuy] = useState({ 
    amount: toNormalizedBN(0), 
    slippage: toNormalizedBN(50)
  })

  const [delegate, setDelegate] = useState<TInputAddressLike>({ 
    address: undefined, 
    label: '', 
    isValid: false 
  })

  const { address: sender } = useWeb3()
  const address = useMemo(() => {
    if(!sender) return undefined
    if(delegate.isValid) return delegate.address
    return sender
  }, [sender, delegate])

  const { refetch, isFetching, month, contributorAllowance } = useData()
  const { data: onchain, refetch: refetchOnchain, isFetching: isFetchingOnchain } = useOnchainData({ address })

  const { block } = useBlock()
  const minLock = useMemo(() => {
    if(!(block && onchain)) return false

    const WEEK = 7 * 24 * 60 * 60 * 1000
    const MIN_LOCK_WEEKS = 4
    const DELEGATE_MIN_LOCK_WEEKS = 104
    const CAP_DISCOUNT_WEEKS = 208

    const timestamp = Number(block.timestamp) * 1000
    const weeks = Math.min(
      Math.floor(onchain?.veYFI.expiration / WEEK)
      - Math.floor(timestamp / WEEK),
      CAP_DISCOUNT_WEEKS
    )

    if(delegate.isValid) {
      return weeks >= DELEGATE_MIN_LOCK_WEEKS
    } else {
      return weeks >= MIN_LOCK_WEEKS
    }
  }, [block, onchain, delegate])

  const allowanceYfi = useMemo(() => {
    if(!onchain || onchain.price.raw === 0n) return toNormalizedBN(0)
    return toNormalizedBN(10n**18n * contributorAllowance.raw / onchain.price.raw)
  }, [contributorAllowance, onchain])

  const preview = usePreview({ 
    address, 
    amount: buy.amount,
    allowance: allowanceYfi,
    delegate: delegate.isValid === true && delegate.address !== sender,
    minLock
  })

  const toETH = useCallback((yfi: TNormalizedBN) => {
    if(!onchain) return toNormalizedBN(0)
    return toNormalizedBN(yfi.raw * onchain.price.raw / 10n**18n)
  }, [onchain])

  const onAmountChange = useCallback((amount: string) => {
    const amountBn = handleInputChangeEventValue(amount, 18)
    if(allowanceYfi.raw < amountBn.raw) return
    setBuy(current => ({ ...current, amount: amountBn }))
  }, [setBuy, allowanceYfi])

  const onMaxClick = useCallback(() => {
    setBuy(current => ({ ...current, amount: allowanceYfi }))
  }, [setBuy, allowanceYfi])

  const onSlippageChange = useCallback((amount: TNormalizedBN) => {
    setBuy(current => ({ ...current, slippage: amount }))
  }, [])

  const minAmount = useMemo(() => {
    return toNormalizedBN(buy.amount.raw - (buy.amount.raw * buy.slippage.raw / 10_000n))
  }, [buy])

  const savings = useMemo(() => {
    if(!onchain || !preview.preview) return toNormalizedBN(0)
    const marketRate = (onchain.price.raw * buy.amount.raw) / 10n**18n
    return toNormalizedBN(marketRate - preview.preview.raw)
  }, [onchain, preview, buy])

  const cta = useMemo(() => {
    const amount = formatAmount(buy.amount.normalized, 3, 3)
    const price = formatAmount(preview.preview?.normalized || 0, 3, 3)
    if(delegate.isValid && delegate.address !== sender) return `Delegate ${amount} veYFI for ${price} ETH`
    return `Buy ${amount} veYFI for ${price} ETH`
  }, [buy, preview, delegate, sender])

  const { config, isError: isBuyError } = usePrepareContractWrite({
    enabled: !!address && allowanceYfi.raw >= 0n && minAmount.raw > 0n,
    address: DISCOUNT_ADDRESS,
    functionName: 'buy',
    args: [minAmount.raw, address as `0x${string}`],
    abi: parseAbi(['function buy(uint256, address) payable']),
    value: toETH(preview.preview || toNormalizedBN(0)).raw
  })

  const { write, isLoading: isWriting, isSuccess: isWritten } = useContractWrite(config)

  const onBuy = useCallback(() => {
    if(write) write()
  }, [write])

  useEffect(() => {
    if(!isWritten) return
    refetch()
    refetchOnchain()
    setBuy(current => ({ ...current, amount: toNormalizedBN(0) }))
  }, [isWritten, refetch, refetchOnchain, setBuy])

  const validation = useMemo(() => {
    const hasLock = (onchain?.veYFI.locked.raw || 0) > 0
    return {
      hasLock,
      minLock,
      disabled: !(hasLock && minLock)
    }
  }, [onchain, minLock])

  return <div className="w-full flex flex-col items-start gap-8">
    <div className={`w-full pb-2
      flex items-center justify-between
      border-b-2 border-purple-200/40`}>
      <div className="w-1/3 text-xl md:text-5xl font-black">
        yDiscount
      </div>

      <div className="w-1/3 font-bold text-center">
        <div className="text-xs sm:text-sm">Month</div>
        <div className="font-mono text-sm sm:text-3xl">{month}</div>
      </div>

      <div className="w-1/3 flex flex-col items-end">
        <div className="flex items-end gap-3 text-xs sm:text-sm">
          <div className="font-mono font-black whitespace-nowrap">Your allowance</div>
        </div>
        <div className="font-black text-sm sm:text-3xl">
          <Tokens value={allowanceYfi.normalized || 0} symbol={'veYFI'} decimals={3} loading={isFetching} />
        </div>
      </div>
    </div>

    <div className="w-full sm:w-3/4 sm:mx-auto flex flex-col gap-4">

      <Row label="veYFI" disabled={validation.hasLock && !validation.minLock} className={`${!validation.hasLock ? 'text-pink-400' : ''}`}>
        <Numeric value={onchain?.veYFI.locked.normalized || 0} decimals={3} loading={isFetchingOnchain} />
        {!validation.hasLock && <p className='absolute sm:right-0 text-sm text-neutral-100'>
          {delegate.isValid ? `Delegate has no locked YFI. They need some skin in the game first, anon!` : `You don't have any locked YFI. Get some skin in the game first, anon!`}
        </p>}
      </Row>

      <Row label="Expiration" disabled={!validation.hasLock} className={`${validation.hasLock && !minLock ? 'text-pink-400' : ''}`}>
        <Text value={new Date(onchain?.veYFI.expiration || 0).toDateString()} loading={isFetchingOnchain} />
        {validation.hasLock && !minLock && <p className='absolute sm:right-0 text-sm text-neutral-100'>
          Expiration doesn`&apos;`t meet the {delegate.isValid ? '2 year' : '4 week'} minimum lockup =(
        </p>}
      </Row>

      <Row label="YFI spot price" disabled={validation.disabled}>
        <Tokens value={onchain?.price.normalized} symbol={'ETH'} decimals={3} loading={isFetchingOnchain} />
      </Row>
      <Row label="Discount" className="text-lg font-bold" disabled={validation.disabled}>
        <Percent value={onchain?.discount.normalized || 0} decimals={2} loading={isFetchingOnchain} />
      </Row>
      <Row label="Buy veYFI" className="text-lg font-bold" disabled={validation.disabled}>
        <AmountInput
          amount={buy.amount}
          disabled={validation.disabled}
          maxAmount={allowanceYfi}
          onAmountChange={onAmountChange}
          onMaxClick={onMaxClick} />
      </Row>
      <Row label="Max slippage" disabled={validation.disabled}>
        <PercentInput
          amount={buy.slippage} 
          disabled={validation.disabled}
          onAmountChange={onSlippageChange} />
      </Row>
      <Row label="Cost" className="text-lg" disabled={validation.disabled}>
        <Tokens value={preview.preview?.normalized} symbol={'ETH'} decimals={3} loading={preview.isFetchingPreview} />
      </Row>
      <Row label="You get at least" className="text-sm" disabled={validation.disabled}>
        <Tokens value={minAmount.normalized} symbol={'veYFI'} decimals={3} />
      </Row>
      <Row label="You save" className={`text-sm ${minLock && !minLock || savings.raw > 0n ? 'text-orange-100' : ''}`} disabled={!minLock || savings.raw === 0n}>
        <Tokens value={savings.normalized} symbol={'ETH'} decimals={3} />
      </Row>

      <div className="py-4 flex justify-end">
        <Button
          onClick={onBuy}
          isBusy={isWriting}
          isDisabled={validation.disabled || buy.amount.raw === 0n || isBuyError}
          className={'font-mono w-fit border-none'}>
          {cta}
        </Button>
      </div>

      <Accordian title={'Delegate'} expanded={false} className="py-2 border-t border-purple-400/20">
        <div className="p-2 flex flex-col gap-2">
          <AddressInput value={delegate} onChangeValue={setDelegate} />
          <p className="p-2">
            Enter an address to delegate your allowance.
          </p>
        </div>
      </Accordian>
    </div>
  </div>
}
