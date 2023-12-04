import {Renderable} from '@yearn-finance/web-lib/components/Renderable';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

type TAmountInputProps = {
	amount: TNormalizedBN | undefined;
	maxAmount?: TNormalizedBN;
	maxLabel?: string;
	label?: string;
	placeholder?: string;
	legend?: string | ReactElement;
	error?: string;
	disabled?: boolean;
	loading?: boolean;
	onAmountChange?: (amount: string) => void;
	onLegendClick?: () => void;
	onMaxClick?: () => void;
	handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function AmountInput({
	amount,
	maxAmount,
	label,
	placeholder,
	legend,
	error,
	disabled,
	loading,
	onAmountChange,
	onLegendClick,
	onMaxClick,
	handleKeyDown
}: TAmountInputProps): ReactElement {
	return (
		<div className={'w-full'}>
			{label && <small className={'block pb-1 text-neutral-900/40'}>{label}</small>}
			<div className={'relative flex w-full items-center justify-center'}>
				<input
					className={cl(
						`h-10 w-full p-2 font-mono text-base font-normal outline-none bg-purple-800/40`,
						maxAmount && !disabled ? 'pr-12' : '',
						error ? 'border border-solid border-[#EA5204] focus:border-[#EA5204]' : 'border-0 border-none',
						disabled ? 'text-neutral-600' : ''
					)}
					type={'text'}
					autoComplete={'off'}
					aria-label={label}
					value={amount?.normalized ?? ''}
					onChange={onAmountChange ? (e): void => onAmountChange(e.target.value) : undefined}
					onKeyDown={handleKeyDown}
					placeholder={loading ? '' : placeholder ?? '0'}
					disabled={disabled}
				/>
				<button
					onClick={onMaxClick ? (): void => onMaxClick() : undefined}
					className={cl(
						'absolute right-2 ml-2 h-6 cursor-pointer rounded border-none bg-neutral-900 px-2 py-1 text-xs text-neutral-0 transition-colors hover:bg-neutral-700',
						!!onMaxClick && !!maxAmount && !disabled && maxAmount.raw !== 0n ? '' : 'hidden pointer-events-none'
					)}>
					{'Max'}
				</button>
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
