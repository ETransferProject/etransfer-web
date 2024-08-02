import { TimeIcon } from 'assets/images';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { defaultNullValue } from 'constants/index';
import { getDepositCalculate } from 'utils/api/deposit';
import { handleErrorMessage } from '@etransfer/utils';
import singleMessage from 'components/SingleMessage';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { formatSymbolDisplay } from 'utils/format';
import { MAX_UPDATE_TIME } from 'constants/calculate';
import { isAuthTokenError, isWriteOperationError } from 'utils/api/error';
import { SIGNATURE_MISSING_TIP } from 'constants/misc';
import { useEffectOnce } from 'react-use';
import myEvents from 'utils/myEvent';

type TExchangeRate = {
  fromSymbol: string;
  toSymbol: string;
  toChainId: TChainId;
};

const EXCHANGE_FROM_AMOUNT = '1';

export default function ExchangeRate({ fromSymbol, toSymbol, toChainId }: TExchangeRate) {
  // const { fromTokenSymbol, toChainItem, toTokenSymbol } = useDepositState();
  const [exchange, setExchange] = useState(defaultNullValue);
  const [slippage, setSlippage] = useState('');
  const [updateTime, setUpdateTime] = useState(MAX_UPDATE_TIME);
  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();

  const slippageFormat = useMemo(() => {
    if (!slippage) return '';
    return Number(slippage) * 100;
  }, [slippage]);

  const getCalculate = useCallback(async () => {
    try {
      const { conversionRate } = await getDepositCalculate({
        toChainId,
        fromSymbol,
        toSymbol,
        fromAmount: EXCHANGE_FROM_AMOUNT,
      });
      setExchange(conversionRate?.toAmount || defaultNullValue);
      setSlippage(conversionRate.extraInfo?.slippage || '');
    } catch (error: any) {
      if (isAuthTokenError(error)) {
        singleMessage.info(SIGNATURE_MISSING_TIP);
      } else if (!isWriteOperationError(error?.code, handleErrorMessage(error))) {
        singleMessage.error(handleErrorMessage(error));
      }
    }
  }, [fromSymbol, toChainId, toSymbol]);

  const handleSetTimer = useCallback(async () => {
    updateTimerRef.current = setInterval(() => {
      --updateTimeRef.current;

      if (updateTimeRef.current === 0) {
        getCalculate();
        updateTimeRef.current = MAX_UPDATE_TIME;
      }

      setUpdateTime(updateTimeRef.current);
    }, 1000);
  }, [getCalculate]);

  const stopInterval = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    setExchange(defaultNullValue);
    setSlippage('');
  }, []);

  const resetTimer = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    updateTimeRef.current = MAX_UPDATE_TIME;
    setUpdateTime(MAX_UPDATE_TIME);
    handleSetTimer();
  }, [handleSetTimer]);

  useEffect(() => {
    getCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromSymbol, toSymbol, toChainId]);

  useEffect(() => {
    resetTimer();
    return () => {
      stopInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromSymbol, toSymbol, toChainId]);

  // Listener login
  const getCalculateRef = useRef(getCalculate);
  getCalculateRef.current = getCalculate;
  useEffectOnce(() => {
    const { remove } = myEvents.LoginSuccess.addListener(() => getCalculateRef.current());

    return () => {
      remove();
    };
  });

  return (
    <div className={clsx('flex-row-between', styles['exchange-rate'])}>
      <div className="flex-row-center">
        <span className={styles['value']}>{`1 ${fromSymbol} ≈ ${exchange} ${formatSymbolDisplay(
          toSymbol,
        )}`}</span>
        <TimeIcon />
        <span className={styles['count-time']}>{`${updateTime}s`}</span>
      </div>
      {slippage && <div>{`Slippage: ${slippageFormat}%`}</div>}
    </div>
  );
}
