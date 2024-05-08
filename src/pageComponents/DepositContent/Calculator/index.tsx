import { useCallback, useMemo, useState } from 'react';
import { Input } from 'antd';
import styles from './styles.module.scss';
import { CalculatorIcon } from 'assets/images';
import DynamicArrow from 'components/DynamicArrow';
import clsx from 'clsx';
import Space from 'components/Space';
import { useCommonState } from 'store/Provider/hooks';

type TCalculator = {
  payToken: string;
  receiveToken: string;
};

export default function Calculator({ payToken, receiveToken }: TCalculator) {
  const [payAmount, setPayAmount] = useState();
  const [receiveAmount, setReceiveAmount] = useState('');
  const [minReceiveAmount, setMinReceiveAmount] = useState('');
  const [isExpand, setIsExpand] = useState(false);
  const { isMobilePX } = useCommonState();

  const onPayChange = useCallback((e: any) => {
    const value = e.target.value;
    setPayAmount(value);
  }, []);

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
