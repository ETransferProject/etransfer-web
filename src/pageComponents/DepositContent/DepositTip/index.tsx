import { InfoBrandIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { formatSymbolDisplay } from 'utils/format';
import { useCommonState } from 'store/Provider/hooks';

type TDepositTipProps = {
  fromToken: string;
  toToken: string;
  isShowIcon?: boolean;
};

export default function DepositTip({ fromToken, toToken, isShowIcon = true }: TDepositTipProps) {
  const { isMobilePX } = useCommonState();

  return (
    <div className={clsx('flex-row-center', styles['deposit-tip'])}>
      {isShowIcon && <InfoBrandIcon className="flex-shrink-0" />}

      <span className={styles['text']}>
        <span>{`Your deposit address may change. Please use the latest address for deposits.`}</span>

        {!isMobilePX && (
          <>
            <br />
            <span>{`Deposit `}</span>
            <span className={styles['token']}>{formatSymbolDisplay(fromToken)}</span>
            <span>{` to the address below to receive `}</span>
            <span className={styles['token']}>{formatSymbolDisplay(toToken)}</span>
            <span>{` in your wallet.`}</span>
          </>
        )}
      </span>
    </div>
  );
}
