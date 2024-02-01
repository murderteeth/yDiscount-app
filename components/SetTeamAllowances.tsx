import { useCallback, useEffect, useMemo, useState } from 'react'
import AddressInput, { TInputAddressLike, defaultInputAddressLike } from './fields/AddressInput'
import { handleInputChangeEventValue } from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue'
import { AmountInput } from './fields/AmountInput'
import { TNormalizedBN, toNormalizedBN } from '@yearn-finance/web-lib/utils/format.bigNumber'
import { Button } from '@yearn-finance/web-lib/components/Button'
import { formatAmount } from '@yearn-finance/web-lib/utils/format.number'
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { DISCOUNT_ADDRESS } from 'utils/constants'
import { parseAbi } from 'viem'
import Numeric from './fields/Numeric'
import Tokens from './fields/Tokens'
import { useData } from 'hooks/useData'

type Contributor = { 
  address: TInputAddressLike
  allowance: TNormalizedBN 
  allowanceInYfi: TNormalizedBN
}

function useSpotPrice() {
  const { spotPrice } = useData()

  const ethToYfi = useCallback((yfi: TNormalizedBN) => {
    return toNormalizedBN(10n**18n * yfi.raw / spotPrice.raw)
  }, [spotPrice])

  const yfiToEth = useCallback((eth: TNormalizedBN) => {
    return toNormalizedBN(spotPrice.raw * eth.raw / 10n**18n)
  }, [spotPrice])

  return { ethToYfi, yfiToEth }
}

function ContributorRow({
  contributor, onAddressChange, onAmountChange, rowAction
}: {
  contributor: Contributor,
  onAddressChange: (value: TInputAddressLike) => void,
  onAmountChange: (amount: string) => boolean,
  rowAction: { label: string, onClick: () => void }
}) {
  const { ethToYfi } = useSpotPrice()

  const { data: allowance, refetch } = useContractRead({
    address: DISCOUNT_ADDRESS,
    functionName: 'contributor_allowance',
    args: [contributor.address.address as `0x${string}`],
    abi: parseAbi(['function contributor_allowance(address) external view returns (uint256)']),
    enabled: false
  })

  useEffect(() => {
    if(contributor.address.isValid === true) refetch()
  }, [refetch, contributor])

  const currentAllowance = useMemo(() => toNormalizedBN(allowance || 0n), [allowance])

  const total = useMemo(() => {
    return Number(toNormalizedBN(ethToYfi(contributor.allowance).raw + ethToYfi(currentAllowance).raw).normalized)
  }, [contributor, currentAllowance, ethToYfi])

  return <>
    <div className="flex items-center justify-center">
      <button tabIndex={-1} onClick={rowAction.onClick}
        className={`right-2 ml-2 h-6 cursor-pointer border-none
          px-2 py-1 font-mono text-xs text-neutral-0 
          transition-colors hover:bg-purple-400`}>
        {rowAction.label}
      </button>
    </div>
    <div className="col-span-6">
      <AddressInput value={contributor.address} onChangeValue={onAddressChange} />
    </div>
    <div className="col-span-2">
      <AmountInput amount={contributor.allowanceInYfi} disabled={contributor.address.isValid !== true} onAmountChange={onAmountChange} />
    </div>
    <div className="col-span-3 flex items-center justify-end gap-2 font-mono text-purple-100">
      <div className="text-purple-100/60">{formatAmount(ethToYfi(currentAllowance).normalized, 3, 3)}</div>
      <div>+</div>
      <div>{formatAmount(contributor.allowanceInYfi.normalized, 3, 3)}</div>
      <div>=</div>
      <div className="font-bold">
        <Tokens value={total} symbol="YFI" decimals={3} loading={false} />
      </div>
    </div>
  </>
}

export default function SetTeamAllowances() {
  const { refetch, isFetching, month, teamAllowance } = useData()
  const [team, setTeam] = useState<Contributor[]>([])
  const [newMember, setNewMember] = useState<Contributor>({
    address: defaultInputAddressLike, 
    allowance: toNormalizedBN(0),
    allowanceInYfi: toNormalizedBN(0)
  })

  const { ethToYfi, yfiToEth } = useSpotPrice()

  const allocated = useMemo(() => {
    return team.reduce((sum, member) => toNormalizedBN(sum.raw + member.allowance.raw), toNormalizedBN(0))
  }, [team])

  const unallocated = useMemo(() => {
    return toNormalizedBN(teamAllowance.raw - allocated.raw)
  }, [allocated, teamAllowance])

  const updateAddress = useCallback((index: number, address: TInputAddressLike) => {
    setTeam((current) => {
      const update = [...current]
      update[index] = { ...update[index], address }
      return update
    })
  }, [setTeam])

  const updateAmount = useCallback((index: number, allowance: TNormalizedBN) => {
    setTeam((current) => {
      const update = [...current]
      update[index] = { ...update[index], allowance: yfiToEth(allowance), allowanceInYfi: allowance }
      return update
    })
  }, [setTeam, yfiToEth])

  const args = useMemo(() => {
    const valids = team.filter(m => m.address.isValid === true)
    return [
      valids.map(m => m.address.address as `0x${string}`), 
      valids.map(m => m.allowance.raw)
    ] as [`0x${string}`[], bigint[]]
  }, [team])

  const { config } = usePrepareContractWrite({
    address: DISCOUNT_ADDRESS,
    functionName: 'set_contributor_allowances',
    args,
    abi: parseAbi(['function set_contributor_allowances(address[] contributors, uint256[] allowances)']),
    enabled: teamAllowance.raw > 0
  })

  const { write, isLoading: isWriting, isSuccess: isWritten } = useContractWrite(config)

  const onSetAllowances = useCallback(() => {
    if(write) write()
  }, [write])

  useEffect(() => {
    if(!isWritten) return
    refetch()
    setTeam(current => {
      return current.map(member => ({ ...member, allowance: toNormalizedBN(0), allowanceInYfi: toNormalizedBN(0) }))
    })
  }, [isWritten, refetch, setTeam])

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
          <div className="font-mono font-black whitespace-nowrap">Team allowance</div>
        </div>
        <div className="flex items-end gap-1 sm:gap-3 text-sm sm:text-3xl">
          <div className="font-black">
            <Numeric value={ethToYfi(unallocated).normalized} decimals={3} loading={isFetching} />
          </div>
          <div>/</div>
          <div className="font-black text-purple-100">
            <Tokens value={ethToYfi(teamAllowance).normalized} symbol="YFI" decimals={3} loading={isFetching} />
          </div>
        </div>
      </div>
    </div>

    <div className="w-full flex flex-col sm:gap-8">
      <h1>Contributor Allowances</h1>

      <div className="grid grid-cols-12 gap-4">
        <div></div>
        <div className="col-span-6">address \ ens \ lens</div>
        <div className="col-span-2">allowance</div>
        <div className="col-span-3 flex items-center justify-end gap-2 font-mono text-purple-100">
          <div className="text-purple-100/60">current</div>
          <div>+</div>
          <div>new</div>
          <div>=</div>
          <div className="font-bold">total</div>
        </div>

        {team.map((member, index) => <ContributorRow key={index} contributor={member} 
          onAddressChange={(value) => {
            updateAddress(index, value)
          }} 
          onAmountChange={(amount) => {
            const amountBn = handleInputChangeEventValue(amount, 18)
            const overAllowance = (ethToYfi(unallocated).raw + ethToYfi(member.allowance).raw - amountBn.raw) < 0
            if(overAllowance) return false
            updateAmount(index, amountBn)
            return true
          }} 
          rowAction={{ label: 'del', onClick: () => {
            setTeam((current) => {
              const update = [...current]
              update.splice(index, 1)
              return update })
          }}} />
        )}

        <ContributorRow contributor={newMember} 
          onAddressChange={value => {
            if(value.isValid === true) {
              setTeam(current => [...current, { address: value, allowance: toNormalizedBN(0), allowanceInYfi: toNormalizedBN(0) }])
              setNewMember({ address: defaultInputAddressLike, allowance: toNormalizedBN(0), allowanceInYfi: toNormalizedBN(0) })
            } else {
              setNewMember(current => ({ ...current, address: value }))
            }
          }} 
          onAmountChange={amount => {
            const amountBn = handleInputChangeEventValue(amount, 18)
            const overAllowance =  (unallocated.raw - amountBn.raw) < 0
            if(overAllowance) return false
            setNewMember(current => ({ ...current, allowance: yfiToEth(amountBn), allowanceInYfi: amountBn }))
            return true
          }}
          rowAction={{ label: 'add', onClick: () => {
            setTeam(current => [...current, newMember])
            setNewMember({ address: defaultInputAddressLike, allowance: toNormalizedBN(0), allowanceInYfi: toNormalizedBN(0) })
          }}}
        />
      </div>

      <div className="place-self-end">
        <Button 
          onClick={onSetAllowances}
          isBusy={isWriting}
          isDisabled={false}
          className={'w-fit border-none'}>
          {`Add to month ${month} allowances`}
        </Button>
      </div>
    </div>
  </div>
}
