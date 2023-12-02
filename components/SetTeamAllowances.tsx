import { useCallback, useEffect, useMemo, useState } from 'react'
import AddressInput, { TInputAddressLike, defaultInputAddressLike } from './AddressInput'
import { handleInputChangeEventValue } from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue'
import { AmountInput } from './AmountInput'
import { TNormalizedBN, toNormalizedBN } from '@yearn-finance/web-lib/utils/format.bigNumber'
import { Button } from '@yearn-finance/web-lib/components/Button'
import { formatAmount } from '@yearn-finance/web-lib/utils/format.number'
import { signals, useSignals } from 'hooks/useSignals'
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { DISCOUNT_ADDRESS } from 'utils/constants'
import { parseAbi } from 'viem'
import { useDebounce } from 'hooks/useDebounce'

type TeamMember = { address: TInputAddressLike, allowance: TNormalizedBN }

function MemberRow({
  member, onAddressChange, onAmountChange, rowAction
}: {
  member: TeamMember,
  onAddressChange: (value: TInputAddressLike) => void,
  onAmountChange: (amount: string) => void,
  rowAction: { label: string, onClick: () => void }
}) {

  const { data: allowance, refetch } = useContractRead({
    address: DISCOUNT_ADDRESS,
    functionName: 'contributor_allowance',
    args: [member.address.address as `0x${string}`],
    abi: parseAbi(['function contributor_allowance(address) external view returns (uint256)']),
    enabled: false
  })

  useEffect(() => {
    if(member.address.isValid === true) refetch()
  }, [refetch, member])

  const onAddressChangeMiddleWare = useCallback(async (value: TInputAddressLike) => {
    onAddressChange(value)
  }, [onAddressChange])

  return <div className="w-full flex items-center gap-4">
    <div>
      <button tabIndex={-1} onClick={rowAction.onClick}
        className={`right-2 ml-2 h-6 cursor-pointer rounded border-none bg-neutral-900 
          px-2 py-1 font-mono text-xs text-neutral-0 
          transition-colors hover:bg-neutral-700`}>
        {rowAction.label}
      </button>
    </div>
    <div className="grow">
      <AddressInput value={member.address} onChangeValue={onAddressChangeMiddleWare} />
    </div>
    <div className="p-2 font-mono text-purple-100 ">
      {formatAmount(toNormalizedBN(allowance || 0n).normalized, 3, 3)} + 
    </div>
    <div className="w-[20%]">
      <AmountInput amount={member.allowance} disabled={member.address.isValid !== true} onAmountChange={onAmountChange} />
    </div>
  </div>
}

export default function SetTeamAllowances() {
  const { refetch } = useSignals()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState<TeamMember>({ 
    address: defaultInputAddressLike, 
    allowance: toNormalizedBN(0) 
  })

  const allocated = useMemo(() => {
    return team.reduce((sum, member) => toNormalizedBN(sum.raw + member.allowance.raw), toNormalizedBN(0))
  }, [team])

  const unallocated = useMemo(() => {
    return toNormalizedBN(signals.value.teamAllowance.raw - allocated.raw)
  }, [allocated, signals.value])

  const unallocatedDebounced = useDebounce(unallocated, 100)

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
      update[index] = { ...update[index], allowance }
      return update
    })
  }, [setTeam])

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
    enabled: signals.value.teamAllowance.raw > 0
  })

  const { write, isLoading: isWriting, isSuccess: isWritten } = useContractWrite(config)

  const onSetAllowances = useCallback(() => {
    if(write) write()
  }, [write])

  useEffect(() => {
    if(!isWritten) return
    refetch()
    setTeam(current => {
      return current.map(member => ({ ...member, allowance: toNormalizedBN(0) }))
    })
  }, [isWritten, refetch, setTeam])

  return <div className="w-full flex flex-col sm:flex-row items-start gap-12">
    <div className="sm:w-2/3 flex flex-col sm:gap-8">
      <h1 className="mt-6 sm:mt-8">Contributor Allowances</h1>
      <div className="flex flex-col gap-4">

        {team.map((member, index) => <MemberRow key={index} member={member} 
          onAddressChange={(value) => {
            updateAddress(index, value)
          }} 
          onAmountChange={(amount) => {
            const amountBn = handleInputChangeEventValue(amount, 18)
            const overAllowance =  (unallocatedDebounced.raw + member.allowance.raw - amountBn.raw) < 0
            if(overAllowance) return
            updateAmount(index, amountBn)
          }} 
          rowAction={{ label: 'del', onClick: () => {
            setTeam((current) => {
              const update = [...current]
              update.splice(index, 1)
              return update })
          }}} />
        )}

        <MemberRow member={newMember} 
          onAddressChange={value => {
            if(value.isValid === true) {
              setTeam(current => [...current, { address: value, allowance: toNormalizedBN(0) }])
              setNewMember({ address: defaultInputAddressLike, allowance: toNormalizedBN(0) })
            } else {
              setNewMember(current => ({ ...current, address: value }))
            }
          }} 
          onAmountChange={amount => {
            const amountBn = handleInputChangeEventValue(amount, 18)
            const overAllowance =  (unallocatedDebounced.raw - amountBn.raw) < 0
            if(overAllowance) return
            setNewMember(current => ({ ...current, allowance: amountBn }))
          }}
          rowAction={{ label: 'add', onClick: () => {
            setTeam(current => [...current, newMember])
            setNewMember({ address: defaultInputAddressLike, allowance: toNormalizedBN(0) })
          }}}
        />
      </div>
      <div className="place-self-end">
        <Button 
          onClick={onSetAllowances}
          isBusy={isWriting}
          isDisabled={false}
          className={'w-fit border-none'}>
          {`Increment month ${signals.value.month} allowances`}
        </Button>
      </div>
    </div>

    <div className="sm:w-1/3">
      <div className={`w-fit p-12
        flex flex-col items-center justify-center
        border border-purple-200/40`}>
        <div className="font-bold text-xl">
          {`Month ${signals.value.month}`}
        </div>

        <div className="my-6 flex items-end gap-3 text-2xl sm:text-4xl">
          <div className="font-mono font-black">{formatAmount(unallocatedDebounced.normalized || 0, 3, 3).padStart(6, '0')}</div>
          <div>/</div>
          <div className="font-mono font-black text-purple-100">{formatAmount(signals.value.teamAllowance.normalized || 0, 3, 3).padStart(6, '0')}</div>
        </div>

        <div className="mb-6 flex items-end gap-3 text-sm">
          <div className="font-mono font-black whitespace-nowrap">Team allowance</div>
        </div>
      </div>
    </div>
  </div>
}
