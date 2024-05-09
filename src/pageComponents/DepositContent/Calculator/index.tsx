import { useCallback, useMemo, useState } from 'react';
import { Input } from 'antd';
import styles from './styles.module.scss';
import { CalculatorIcon } from 'assets/images';
import DynamicArrow from 'components/DynamicArrow';
import clsx from 'clsx';
import Space from 'components/Space';
import { useCommonState, useDepositState } from 'store/Provider/hooks';
import { getDepositCalculate } from 'utils/api/deposit';
import { defaultNullValue } from 'constants/index';
import { handleErrorMessage, singleMessage } from '@portkey/did-ui-react';

type TCalculator = {
  payToken: string;
  receiveToken: string;
};

export default function Calculator({ payToken, receiveToken }: TCalculator) {
  const { isMobilePX } = useCommonState();
  const { fromTokenSymbol, toChainItem, toTokenSymbol } = useDepositState();
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState(defaultNullValue);
  const [minReceiveAmount, setMinReceiveAmount] = useState(defaultNullValue);
  const [isExpand, setIsExpand] = useState(false);

  const getCalculate = useCallback(
    async (amount: string) => {
      try {
        if (!amount || !toChainItem.key || !fromTokenSymbol || !toTokenSymbol) return;
        const { conversionRate } = await getDepositCalculate({
          toChainId: toChainItem.key,
          fromSymbol: fromTokenSymbol,
          toSymbol: toTokenSymbol,
          fromAmount: amount,
        });
        setReceiveAmount(conversionRate?.toAmount || defaultNullValue);
        setMinReceiveAmount(conversionRate?.minimumReceiveAmount || defaultNullValue);
      } catch (error) {
        singleMessage.error(handleErrorMessage(error));
      }
    },
    [fromTokenSymbol, toChainItem.key, toTokenSymbol],
  );

  const onPayChange = useCallback(
    (e: any) => {
      const value = e.target.value;
      setPayAmount(value);
      getCalculate(value);
    },
    [getCalculate],
  );

  const renderHeader = useMemo(() => {
    return (
      <div
        className={clsx('flex-row-center-between', styles['calculator-header'])}
        onClick={() =>
          setIsExpand((pre) => {
            return !pre;
          })
        }>
        <div className={clsx('flex-row-center', styles['calculator-header-right'])}>
          <CalculatorIcon />
          <span>Calculator</span>
        </div>
        <DynamicArrow isExpand={isExpand} />
      </div>
    );
  }, [isExpand]);

  const renderYouPay = useMemo(() => {
    return (
      <div>
        <div className={styles['label']}>You Pay</div>
        <Space direction="vertical" size={6} />
        <div className={clsx('flex-row-center', styles['you-pay-main'])}>
          {/* TODO check rule */}
          <Input
            className={styles['pay-input']}
            placeholder="0.00"
            value={payAmount}
            onChange={onPayChange}
            type="number"
          />
          <div className={styles['dividing-line']} />
          <span className={styles['unit']}>{payToken}</span>
        </div>
      </div>
    );
  }, [onPayChange, payAmount, payToken]);

  const renderReceive = useMemo(() => {
    return (
      <div>
        <div className={styles['label']}>Expected Receive</div>
        <Space direction="vertical" size={8} />
        <div className={styles['receive-amount']}>{`≈${receiveAmount} ${receiveToken}`}</div>
        <div>
          <span className={styles['label']}>Minimum Receive:</span>
          <span
            className={styles['min-receive-amount']}>{`≈${minReceiveAmount} ${receiveToken}`}</span>
        </div>
      </div>
    );
  }, [minReceiveAmount, receiveAmount, receiveToken]);

  return (
    <div className={styles['calculator']}>
      {renderHeader}
      {isExpand && (
        <>
          <Space direction="vertical" size={16} />
          {isMobilePX ? (
            <div className={styles['calculator-content']}>
              <div>{renderYouPay}</div>
              <Space direction="vertical" size={16} />
              <div>{renderReceive}</div>
            </div>
          ) : (
            <div className={clsx('flex-row-start', styles['calculator-content'])}>
              <div className="flex-1">{renderYouPay}</div>
              <div className="flex-1">{renderReceive}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
