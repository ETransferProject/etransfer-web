import { useCallback, useMemo, useRef, useState } from 'react';
import { Input } from 'antd';
import styles from './styles.module.scss';
import { CalculatorIcon } from 'assets/images';
import DynamicArrow from 'components/DynamicArrow';
import clsx from 'clsx';
import Space from 'components/Space';
import { useCommonState, useDepositState } from 'store/Provider/hooks';
import { getDepositCalculate } from 'utils/api/deposit';
import { handleErrorMessage, singleMessage } from '@portkey/did-ui-react';
import { TOKEN_INFO_USDT } from 'constants/index';
import { useEffectOnce } from 'react-use';
import { formatSymbolDisplay } from 'utils/format';

type TCalculator = {
  payToken: string;
  receiveToken: string;
};

const DEFAULT_AMOUNT = '0.00';

export default function Calculator({ payToken, receiveToken }: TCalculator) {
  const { isMobilePX } = useCommonState();
  const { fromTokenSymbol, fromTokenList, toChainItem, toTokenSymbol } = useDepositState();
  const [payAmount, setPayAmount] = useState('100');
  const amountRef = useRef('100');
  const [receiveAmount, setReceiveAmount] = useState(DEFAULT_AMOUNT);
  const [minReceiveAmount, setMinReceiveAmount] = useState(DEFAULT_AMOUNT);
  const [isExpand, setIsExpand] = useState(false);

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
    } catch (error) {
      singleMessage.error(handleErrorMessage(error));
    }
  }, [fromTokenSymbol, toChainItem.key, toTokenSymbol]);

  const onPayChange = useCallback(
    (e: any) => {
      const value: string = e.target.value.trim();
      if (!value) {
        amountRef.current = value;
        setPayAmount('');
        setReceiveAmount(DEFAULT_AMOUNT);
        setMinReceiveAmount(DEFAULT_AMOUNT);
        return;
      }
      // check decimals
      const stringReg = `^[0-9]{1,9}((\\.\\d)|(\\.\\d{0,${currentTokenDecimal}}))?$`;
      const CheckNumberReg = new RegExp(stringReg);
      if (!CheckNumberReg.exec(value)) return;

      amountRef.current = value;
      setPayAmount(value);
      getCalculate();
    },
    [currentTokenDecimal, getCalculate],
  );

  useEffectOnce(() => {
    getCalculate();
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
        <div className={styles['label']}>You Receive</div>
        <Space direction="vertical" size={8} />
        <div className={styles['receive-amount']}>{`≈${receiveAmount} ${formatSymbolDisplay(
          receiveToken,
        )}`}</div>
        <div>
          <span className={styles['label']}>Minimum Sum To Receive:</span>
          <span
            className={styles['min-receive-amount']}>{`≈${minReceiveAmount} ${formatSymbolDisplay(
            receiveToken,
          )}`}</span>
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
