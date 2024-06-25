import { InfoBrandIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { formatSymbolDisplay } from 'utils/format';

type TDepositTipProps = {
  fromToken: string;
  toToken: string;
  isShowIcon?: boolean;
};

export default function DepositTip({ fromToken, toToken, isShowIcon = true }: TDepositTipProps) {
  return (
    <div className={clsx('flex-row-center', styles['deposit-tip'])}>
      {isShowIcon && <InfoBrandIcon className="flex-shrink-0" />}
      <span className={styles['text']}>
        <span>{`Deposit `}</span>
        <span className={styles['token']}>{formatSymbolDisplay(fromToken)}</span>
        <span>{` to the following address to receive `}</span>
        <span className={styles['token']}>{formatSymbolDisplay(toToken)}</span>
        <span>{` in your connected wallet on aelf chain.`}</span>
      </span>
    </div>
  );
}
