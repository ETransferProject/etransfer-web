import clsx from 'clsx';
import styles from './styles.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsLogin } from 'hooks/wallet';
import { SupportedELFChainId, DEFAULT_NULL_VALUE } from 'constants/index';
import CommonSpace from 'components/CommonSpace';
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
          setBalanceUsd('');
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

  const getBalanceAndUSDRef = useRef(getBalanceAndUSD);
  getBalanceAndUSDRef.current = getBalanceAndUSD;
  useEffect(() => {
    getBalanceAndUSDRef.current(symbol, decimals, chainId);
  }, [chainId, decimals, symbol]);

  if (!isLogin) {
    return (
      <div className={clsx('flex-column-end', styles['balance-and-usd'])}>
        <div className={styles['balance']}>{DEFAULT_NULL_VALUE}</div>
        <div className={styles['usd']}>{DEFAULT_NULL_VALUE}</div>
      </div>
    );
  }

  if (!balance)
    return (
      <div className="flex-column-end">
        <CommonSpace direction="vertical" size={15} />
        <PartialLoading />
        <CommonSpace direction="vertical" size={15} />
      </div>
    );

  return (
    <div className={clsx('flex-column-end', styles['balance-and-usd'])}>
      <div className={styles['balance']}>{balance}</div>
      <div className={styles['usd']}>{balanceUsd ? `$ ${balanceUsd}` : DEFAULT_NULL_VALUE}</div>
    </div>
  );
}
