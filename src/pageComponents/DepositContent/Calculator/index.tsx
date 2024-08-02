import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from 'antd';
import styles from './styles.module.scss';
import { CalculatorIcon } from 'assets/images';
import DynamicArrow from 'components/DynamicArrow';
import clsx from 'clsx';
import Space from 'components/Space';
import { useCommonState, useDepositState } from 'store/Provider/hooks';
import { getDepositCalculate } from 'utils/api/deposit';
import { handleErrorMessage } from '@etransfer/utils';
import singleMessage from 'components/SingleMessage';
import { TOKEN_INFO_USDT } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';
import { MAX_UPDATE_TIME } from 'constants/calculate';
import { useSearchParams } from 'next/navigation';
import { isAuthTokenError, isWriteOperationError } from 'utils/api/error';
import { SIGNATURE_MISSING_TIP } from 'constants/misc';
import { useEffectOnce } from 'react-use';
import myEvents from 'utils/myEvent';

const DEFAULT_AMOUNT = '0.00';
const DEFAULT_PAY_AMOUNT = '100';

export default function Calculator() {
  const { isPadPX } = useCommonState();
  const { fromTokenSymbol, fromTokenList, toChainItem, toTokenSymbol } = useDepositState();
  const searchParams = useSearchParams();
  const [payAmount, setPayAmount] = useState(
    searchParams.get('calculatePay') || DEFAULT_PAY_AMOUNT,
  );
  const amountRef = useRef(searchParams.get('calculatePay') || DEFAULT_PAY_AMOUNT);
  const [receiveAmount, setReceiveAmount] = useState(DEFAULT_AMOUNT);
  const [minReceiveAmount, setMinReceiveAmount] = useState(DEFAULT_AMOUNT);
  const [isExpand, setIsExpand] = useState(true);

  const currentToken = useMemo(() => {
    if (Array.isArray(fromTokenList) && fromTokenList.length > 0) {
      return fromTokenList?.find((item) => item.symbol === fromTokenSymbol);
    }
    return TOKEN_INFO_USDT;
  }, [fromTokenList, fromTokenSymbol]);

  const currentTokenDecimal = useMemo(() => currentToken?.decimals, [currentToken?.decimals]);

  const getCalculate = useCallback(async () => {
    try {
      if (!amountRef.current || !toChainItem.key || !fromTokenSymbol || !toTokenSymbol) return;
      const { conversionRate } = await getDepositCalculate({
        toChainId: toChainItem.key,
        fromSymbol: fromTokenSymbol,
        toSymbol: toTokenSymbol,
        fromAmount: amountRef.current,
      });
      if (amountRef.current) {
        setReceiveAmount(conversionRate?.toAmount || DEFAULT_AMOUNT);
        setMinReceiveAmount(conversionRate?.minimumReceiveAmount || DEFAULT_AMOUNT);
      }
    } catch (error: any) {
      if (isAuthTokenError(error)) {
        singleMessage.info(SIGNATURE_MISSING_TIP);
      } else if (!isWriteOperationError(error?.code, handleErrorMessage(error))) {
        singleMessage.error(handleErrorMessage(error));
      }
    }
  }, [fromTokenSymbol, toChainItem.key, toTokenSymbol]);

  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const handleSetTimer = useCallback(async () => {
    updateTimerRef.current = setInterval(() => {
      --updateTimeRef.current;

      if (updateTimeRef.current === 0) {
        getCalculate();
        updateTimeRef.current = MAX_UPDATE_TIME;
      }
    }, 1000);
  }, [getCalculate]);

  const resetTimer = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    updateTimeRef.current = MAX_UPDATE_TIME;
    handleSetTimer();
  }, [handleSetTimer]);

  useEffect(() => {
    return () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
    };
  }, []);

  const onPayChange = useCallback(
    (event: any) => {
      const oldValue = amountRef.current;
      const valueOrigin: string = event.target.value;
      const newValue = valueOrigin.replace(/[^\d.]/g, '');

      // CHECK1: not empty
      if (!newValue || newValue === '.') {
        event.target.value = '';
        amountRef.current = '';
        setPayAmount('');
        setReceiveAmount(DEFAULT_AMOUNT);
        setMinReceiveAmount(DEFAULT_AMOUNT);
        return;
      }

      // CHECK2: comma count
      const commaCount = newValue?.match(/\./gim)?.length;
      if (commaCount && commaCount > 1) {
        event.target.value = oldValue;
        return;
      }

      // CHECK3: decimals
      const stringReg = `^[0-9]{1,9}((\\.\\d)|(\\.\\d{0,${currentTokenDecimal}}))?$`;
      const CheckNumberReg = new RegExp(stringReg);

      if (!CheckNumberReg.exec(newValue)) {
        event.target.value = oldValue;
        return;
      }

      event.target.value = newValue;
      amountRef.current = newValue;
      setPayAmount(newValue);
      // start 15s countdown
      resetTimer();
      // then, get one-time new value
      getCalculate();
    },
    [currentTokenDecimal, getCalculate, resetTimer],
  );

  useEffect(() => {
    // start 15s countdown
    resetTimer();
    // then, get one-time new value
    getCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTokenSymbol, toChainItem, toTokenSymbol]);

  // Listener login
  const getCalculateRef = useRef(getCalculate);
  getCalculateRef.current = getCalculate;
  useEffectOnce(() => {
    const { remove } = myEvents.LoginSuccess.addListener(() => getCalculateRef.current());

    return () => {
      remove();
    };
  });

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
          <span className={styles['calculator-header-title']}>Calculator</span>
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
          <Input
            className={styles['pay-input']}
            placeholder="0.00"
            value={payAmount}
            onInput={onPayChange}
          />
          <div className={styles['dividing-line']} />
          <span className={styles['unit']}>{fromTokenSymbol}</span>
        </div>
      </div>
    );
  }, [fromTokenSymbol, onPayChange, payAmount]);

  const renderReceive = useMemo(() => {
    return (
      <div>
        <div className={styles['label']}>You Receive</div>
        <Space direction="vertical" size={8} />
        <div className={styles['receive-amount']}>{`≈${receiveAmount} ${formatSymbolDisplay(
          toTokenSymbol,
        )}`}</div>
        <div className={clsx('flex-row-center', styles['min-receive'])}>
          <span className={styles['label']}>Minimum Sum To Receive:</span>
          <span
            className={styles['min-receive-amount']}>{`≈${minReceiveAmount} ${formatSymbolDisplay(
            toTokenSymbol,
          )}`}</span>
        </div>
      </div>
    );
  }, [minReceiveAmount, receiveAmount, toTokenSymbol]);

  return (
    <div className={styles['calculator']}>
      {renderHeader}
      {isExpand && (
        <>
          <Space direction="vertical" size={16} />
          {isPadPX ? (
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
