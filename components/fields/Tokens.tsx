import { Renderable } from '@yearn-finance/web-lib/components/Renderable'
import { formatAmount } from '@yearn-finance/web-lib/utils/format.number'
import { useMemo } from 'react'

export default function Tokens({ 
  value, decimals, symbol, loading
}: { 
  value: number | string | undefined, decimals: number, symbol: string, loading?: boolean 
}) {
  const formatted = useMemo(() => {
    if(value === undefined) return 'NA'
    return formatAmount(value, decimals, decimals)
  }, [value, decimals])

  return <Renderable fallback={'*'.repeat(formatted.length)} shouldRender={!loading}>
    <span className="font-mono whitespace-nowrap">{formatted} {symbol}</span>
  </Renderable>
}
