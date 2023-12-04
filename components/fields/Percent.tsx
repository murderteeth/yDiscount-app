import { Renderable } from '@yearn-finance/web-lib/components/Renderable'
import { formatAmount } from '@yearn-finance/web-lib/utils/format.number'
import { useMemo } from 'react'

export default function Percent({ 
  value, decimals, loading 
}: { 
  value: number | string | undefined, decimals: number, loading?: boolean 
}) {
  const formatted = useMemo(() => {
    if(!value) return 'NA'
    return formatAmount(100 * parseFloat(value.toString()), decimals, decimals)
  }, [value, decimals])

  return <Renderable fallback={'*'.repeat(formatted.length)} shouldRender={!loading}>
    <span className="font-mono">{formatted} %</span>
  </Renderable>
}
