import { useCallback, useState } from 'react'
import AddressInput, { TInputAddressLike, defaultInputAddressLike } from './AddressInput'
import { handleInputChangeEventValue } from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue'
import { AmountInput } from './AmountInput'
import { TNormalizedBN, toNormalizedBN } from '@yearn-finance/web-lib/utils/format.bigNumber'

type TeamMember = { address: TInputAddressLike, allowance: TNormalizedBN }

function MemberRow({
  member, onAddressChange, onAmountChange, rowAction
}: {
  member: TeamMember,
  onAddressChange: (value: TInputAddressLike) => void,
  onAmountChange: (amount: string) => void,
  rowAction: { label: string, onClick: () => void }
}) {

  const handleKeyDown = useCallback((event: any) => {
    if (event.key === 'Enter') {
      rowAction.onClick()
    }
  }, [rowAction])

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
      <AddressInput value={member.address} onChangeValue={onAddressChange} handleKeyDown={handleKeyDown} />
    </div>
    <div className="w-[30%]">
      <AmountInput amount={member.allowance} disabled={member.address.isValid !== true} onAmountChange={onAmountChange} handleKeyDown={handleKeyDown} />
    </div>
  </div>
}

export default function SetTeamAllowances() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState<TeamMember>({ 
    address: defaultInputAddressLike, 
    allowance: toNormalizedBN(0) 
  })

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

  return <div className="fill flex flex-col sm:flex-row items-start gap-12">
    <div className="sm:w-2/3">
      <h1 className="my-6 sm:my-8">Contributor Allowances</h1>
      <div className="flex flex-col gap-4">

        {team.map((member, index) => <MemberRow key={index} member={member} 
          onAddressChange={(value) => {
            updateAddress(index, value)
          }} 
          onAmountChange={(amount) => {
            updateAmount(index, handleInputChangeEventValue(amount, 18))
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
            setNewMember(current => ({ ...current, allowance: handleInputChangeEventValue(amount, 18) }))
          }}
          rowAction={{ label: 'add', onClick: () => {
            setTeam(current => [...current, newMember])
            setNewMember({ address: defaultInputAddressLike, allowance: toNormalizedBN(0) })
          }}}
        />

      </div>
    </div>

    <div className="sm:w-1/3">
      <div className={`w-fit p-12
        flex flex-col items-center justify-center
        border border-purple-200/40`}>
        <div className="my-6 text-3xl md:text-8xl font-mono font-black">05.00 dYFI</div>
        <p className="text-sm">Most important stat about yDiscount (ie northstar metric)</p>
      </div>
    </div>
  </div>
}
