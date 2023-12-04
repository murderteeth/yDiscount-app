import { Renderable } from '@yearn-finance/web-lib/components/Renderable'
import { formatAmount } from '@yearn-finance/web-lib/utils/format.number'
import { useMemo } from 'react'

export default function Numeric({ 
  value, decimals, padStart, loading 
}: { 
  value: number | string, decimals: number, padStart?: number, loading?: boolean 
}) {
  const formatted = useMemo(() => 
    formatAmount(value, decimals, decimals).padStart(padStart || 0, '0')
    , [value, decimals, padStart]
  )

  return <Renderable fallback={'*'.repeat(formatted.length)} shouldRender={!loading}>
    <span className="font-mono">{formatted}</span>
  </Renderable>
}
