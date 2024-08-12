import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { QuestionMarkIcon } from 'assets/images';
import clsx from 'clsx';
import { defaultNullValue } from 'constants/index';
import { RemainingWithdrawalQuotaTooltip } from 'constants/withdraw';
import RemainingTip from '../RemainingTip';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import CommonTooltip from 'components/CommonTooltip';

export interface RemainingLimitProps {
  remainingLimit?: string;
  totalLimit?: string;
  limitCurrency: string;
}

export default function RemainingLimit({
  remainingLimit,
  totalLimit,
  limitCurrency,
}: RemainingLimitProps) {
  const { isPadPX } = useCommonState();

  const label = useMemo(() => {
    return (
      <span className={styles['remaining-limit-label']}>
        {isPadPX && '• 24-Hour Limit:'}
        {!isPadPX && (
          <CommonTooltip
            className={clsx(styles['question-label'])}
            placement="top"
            title={RemainingWithdrawalQuotaTooltip}>
            24-Hour Limit <QuestionMarkIcon />
          </CommonTooltip>
        )}
      </span>
    );
  }, [isPadPX]);

  const value = useMemo(() => {
    return (
      <span className={styles['remaining-limit-value']}>
        {remainingLimit && totalLimit ? (
          <>
            {`${new BigNumber(remainingLimit).toFormat()} /
         ${new BigNumber(totalLimit).toFormat()}`}
            <span className={styles['remaining-limit-value-limit-currency']}>{limitCurrency}</span>
          </>
        ) : (
          defaultNullValue
        )}
        <RemainingTip title="24-Hour Limit" content={RemainingWithdrawalQuotaTooltip} />
      </span>
    );
  }, [limitCurrency, remainingLimit, totalLimit]);

  return (
    <div
      className={clsx('flex', styles['remaining-limit-wrapper'], {
        [styles['remaining-limit-error']]:
          remainingLimit !== null &&
          remainingLimit !== undefined &&
          remainingLimit !== '' &&
          new BigNumber(remainingLimit).isEqualTo(0),
      })}>
      {isPadPX ? (
        <>
          {label}
          {value}
        </>
      ) : (
        <>
          {value}
          {label}
        </>
      )}
    </div>
  );
}
