import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {useCallback, type ReactElement, useMemo} from 'react';
import {toNormalizedBN, type TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import { formatAmount } from '@yearn-finance/web-lib/utils/format.number';
import { handleInputChangeEventValue } from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue';

const MAX = toNormalizedBN(10_000);

type TInputProps = {
	amount: TNormalizedBN | undefined;
	label?: string;
	placeholder?: string;
	legend?: string | ReactElement;
	error?: string;
	disabled?: boolean;
	loading?: boolean;
	onAmountChange?: (amount: TNormalizedBN) => void;
	onLegendClick?: () => void;
	handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function PercentInput({
	amount,
	label,
	placeholder,
	legend,
	error,
	disabled,
	loading,
	onAmountChange,
	onLegendClick,
	handleKeyDown
}: TInputProps): ReactElement {

  const display = useMemo(() => {
    const bps = Number(amount?.raw ?? 0n)
    return formatAmount(bps / 100, 2, 2)
  }, [amount]);

  const onAmountChangeMiddleware = useCallback((value: string): void => {
    if(!onAmountChange) return
    const valueBn = handleInputChangeEventValue(value, 2)
    if(valueBn.raw > MAX.raw) return
    onAmountChange(valueBn)
  }, [onAmountChange]);

  return (
		<div className={'w-full'}>
			{label && <small className={'block pb-1 text-neutral-900/40'}>{label}</small>}
			<div className={'relative flex w-full items-center justify-center'}>
				<input
					className={cl(
						`h-10 w-full p-2 font-mono text-base font-normal outline-none bg-purple-800/40`,
						!disabled ? 'pr-12' : '',
						error ? 'border border-solid border-[#EA5204] focus:border-[#EA5204]' : 'border-0 border-none',
						disabled ? 'text-neutral-600' : ''
					)}
					type={'text'}
					autoComplete={'off'}
					aria-label={label}
					value={display}
					onChange={onAmountChange ? (e): void => onAmountChangeMiddleware(e.target.value) : undefined}
					onKeyDown={handleKeyDown}
					placeholder={loading ? '' : placeholder ?? '0'}
					disabled={disabled}
				/>
        <div className={`absolute right-2 ml-2 h-6 px-2 py-1 text-xs ${disabled ? 'text-neutral-600' : ''}`}>
          %
        </div>
			</div>
			<Renderable shouldRender={!!error || !!legend}>
				<legend
					role={onLegendClick ? 'button' : 'text'}
					onClick={onLegendClick}
					suppressHydrationWarning
					className={`mt-1 pl-1 text-xs md:mr-0 ${error ? 'text-[#EA5204]' : 'text-neutral-600'}`}>
					{error ?? legend}
				</legend>
			</Renderable>
		</div>
	);
}
