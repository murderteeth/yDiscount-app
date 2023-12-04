import { Renderable } from '@yearn-finance/web-lib/components/Renderable'

export default function Text({ 
  value, loading 
}: { 
  value?: string | number, loading?: boolean 
}) {
  return <Renderable fallback={'*'.repeat(value?.toString().length || 0)} shouldRender={!loading}>
    {value}
  </Renderable>
}
