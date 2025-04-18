import styles from './styles.module.scss';
import { QuestionMarkIcon } from 'assets/images';
import clsx from 'clsx';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { REMAINING_TRANSFER_QUOTA_TOOLTIP } from 'constants/crossChainTransfer';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import CommonTooltip from 'components/CommonTooltip';
import CommonSpace from 'components/CommonSpace';

export interface RemainingLimitProps {
  labelClassName?: string;
  valueClassName?: string;
  isLabelLeft?: boolean;
  remainingLimit?: string;
  totalLimit?: string;
  limitCurrency: string;
}

export default function RemainingLimit({
  labelClassName,
  valueClassName,
  isLabelLeft = true,
  remainingLimit,
  totalLimit,
  limitCurrency,
}: RemainingLimitProps) {
  const label = useMemo(() => {
    return (
      <span className={clsx(styles['remaining-limit-label'], labelClassName)}>
        <CommonTooltip
          className={clsx(styles['question-label'])}
          placement="top"
          title={REMAINING_TRANSFER_QUOTA_TOOLTIP}>
          24-Hour Limit <QuestionMarkIcon />
        </CommonTooltip>
      </span>
    );
  }, [labelClassName]);

  const value = useMemo(() => {
    return (
      <span className={clsx(styles['remaining-limit-value'], valueClassName)}>
        {remainingLimit && totalLimit ? (
          <>
            {`${new BigNumber(remainingLimit).toFormat()} /
         ${new BigNumber(totalLimit).toFormat()}`}
            <span className={styles['remaining-limit-value-limit-currency']}>{limitCurrency}</span>
          </>
        ) : (
          DEFAULT_NULL_VALUE
        )}
      </span>
    );
  }, [limitCurrency, remainingLimit, totalLimit, valueClassName]);

  return (
    <div
      className={clsx('flex', styles['remaining-limit-wrapper'], {
        [styles['remaining-limit-error']]:
          remainingLimit !== null &&
          remainingLimit !== undefined &&
          remainingLimit !== '' &&
          new BigNumber(remainingLimit).isEqualTo(0),
      })}>
      {isLabelLeft ? (
        <>
          {label}
          <CommonSpace direction={'horizontal'} size={8} />
          {value}
        </>
      ) : (
        <>
          {value}
          <CommonSpace direction={'horizontal'} size={8} />
          {label}
        </>
      )}
    </div>
  );
}
