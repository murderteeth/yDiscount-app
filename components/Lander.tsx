import { useWeb3 } from '@yearn-finance/web-lib/contexts/useWeb3'
import { signals } from 'hooks/useSignals'

export default function Lander() {
  const { isActive } = useWeb3()

  return <div className="fill flex flex-col sm:flex-row items-center gap-12">
    <div className="sm:w-2/3">
      <h1 className="my-6 sm:my-8 text-3xl md:text-5xl font-black">yDiscount</h1>
      <div className="pl-4 py-2 border-l border-l-4 border-purple-200/40 flex flex-col gap-2">
        <h2 className="text-h2">Locked YFI discounts for contributors 👷‍♂️</h2>

        <p>Woof. Apples ducks straw, quail a ostriches donkey, hay hook cucumbers. veterinarian blue berries cattle jelly canning. Augers oats hen cowpies. Prairie dogs raccoons robins rats. Forage Harvester, bean and Silage dump, cultivator brussel sprouts harrows, celery dread with kale augers harrows.</p>

        {isActive && <div className="my-2 flex flex-col gap-4 text-yellow-200">
          <p>Expecting to see a way to buy discount YFI or set allowances?</p>
          <p>If your wallet is connected and you are seeing this screen, it means <span className="font-bold">you currently have no yDiscount allowance for this month</span>.</p>
        </div>}
      </div>
    </div>

    <div className="sm:w-1/3">
      <div className={`w-fill p-12
        flex flex-col items-center justify-center
        border border-purple-200/40`}>
        <p className="text-sm">Month</p>
        <div className="my-6 text-3xl md:text-8xl font-mono font-black">{isActive && signals.value.month ? signals.value.month : '*'}</div>
      </div>
    </div>
  </div>
}
