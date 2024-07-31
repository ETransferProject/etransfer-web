import clsx from 'clsx';
import styles from './styles.module.scss';
import { useCallback, useEffect, useState } from 'react';
import { useIsLogin } from 'hooks/wallet';
import { SupportedELFChainId, defaultNullValue } from 'constants/index';
import Space from 'components/Space';
import PartialLoading from 'components/PartialLoading';
import BigNumber from 'bignumber.js';
import { useGetBalanceDivDecimals } from 'hooks/contract';
import { getTokenPrices } from 'utils/api/user';

export function BalanceAndUSD({
  symbol,
  decimals,
  chainId,
}: {
  symbol: string;
  decimals: string | number;
  chainId: SupportedELFChainId;
}) {
  const isLogin = useIsLogin();
  const getBalanceDivDecimals = useGetBalanceDivDecimals();
  const [balance, setBalance] = useState<string>('');
  const [balanceUsd, setBalanceUsd] = useState<string>('');

  const fetchTokenPrices = useCallback(async () => {
    try {
      const res = await getTokenPrices({ symbols: symbol });
      return res.items;
    } catch (error) {
      console.log('fetchTokenPrices error', error);
      return [];
    }
  }, [symbol]);

  const getBalanceAndUSD = useCallback(
    async (symbol: string, decimals: string | number, chainId: SupportedELFChainId) => {
      try {
        const [tokenPrices, balance] = await Promise.all([
          fetchTokenPrices(),
          getBalanceDivDecimals(symbol, decimals, chainId),
        ]);

        setBalance(balance || '');

        const price = tokenPrices?.find((item) => item.symbol === symbol);
        if (!price || !price?.priceUsd) {
          setBalanceUsd;
        } else {
          setBalanceUsd(
            BigNumber(price?.priceUsd)
              .times(BigNumber(Number(balance)))
              .toFixed(2),
          );
        }
      } catch (error) {
        console.log('getBalanceAndUSD  error', error);
      }
    },
    [fetchTokenPrices, getBalanceDivDecimals],
  );

  useEffect(() => {
    getBalanceAndUSD(symbol, decimals, chainId);
  }, [chainId, decimals, getBalanceAndUSD, symbol]);

  if (!isLogin) {
    return (
      <div className={clsx('flex-column-end', styles['balance-and-usd'])}>
        <div className={styles['balance']}>{defaultNullValue}</div>
        <div className={styles['usd']}>{defaultNullValue}</div>
      </div>
    );
  }

  if (!balance)
    return (
      <div className="flex-column-end">
        <Space direction="vertical" size={15} />
        <PartialLoading />
        <Space direction="vertical" size={15} />
      </div>
    );

  return (
    <div className={clsx('flex-column-end', styles['balance-and-usd'])}>
      <div className={styles['balance']}>{balance}</div>
      <div className={styles['usd']}>{`$ ${balanceUsd}` || defaultNullValue}</div>
    </div>
  );
}
