import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetAelfAccount } from './useAelf';
import { TTokenItem } from 'types/api';
import { divDecimals } from 'utils/calculate';
import { InitialCrossChainTransferState } from 'store/reducers/crossChainTransfer/slice';
import { isAelfChain, isEVMChain, isSolanaChain, isTONChain } from 'utils/wallet';
import { SupportedELFChainId } from 'constants/index';
import { ZERO } from 'constants/calculate';
import { IWallet } from 'context/Wallet/types';

export function useUpdateBalance(
  tokenSymbol: string,
  totalTokenList: TTokenItem[],
  fromWallet: IWallet | undefined,
) {
  const [balance, setBalance] = useState('');
  const [decimalsFromWallet, setDecimalsFromWallet] = useState<string | number>('');
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const getBalanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accounts = useGetAelfAccount(); // aelf account

  const currentToken = useMemo(() => {
    const item = totalTokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialCrossChainTransferState.tokenList[0];
  }, [tokenSymbol, totalTokenList]);
  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);

  const getBalance = useCallback(
    async (
      isLoading: boolean,
      tokenContractAddress: string,
      network?: string,
      item?: TTokenItem,
    ): Promise<{ value: string; decimals?: string | number }> => {
      if (!network || !fromWallet || !fromWallet?.isConnected) {
        return { value: '0' };
      }

      try {
        const symbol = item?.symbol || tokenSymbol;
        const decimal = item?.decimals || currentTokenDecimal;
        let _formatBalance = '';
        let _walletDecimals: string | number = decimal;
        if (isAelfChain(network)) {
          // aelf
          const chainId = network as SupportedELFChainId;
          const caAddress = accounts?.[chainId];
          if (!caAddress) return { value: '0' };
          isLoading && setIsBalanceLoading(true);
          const _balanceRes = await fromWallet?.getBalance({
            tokenSymbol: symbol,
            chainId: chainId,
            address: caAddress,
          });

          _formatBalance = divDecimals(_balanceRes.value, decimal).toFixed(6);
        } else if (isEVMChain(network)) {
          // EVM
          const _balanceRes = await fromWallet?.getBalance({
            tokenContractAddress,
            network,
            tokenSymbol: symbol,
          });
          _walletDecimals = _balanceRes.decimals || decimal;
          _formatBalance = divDecimals(_balanceRes.value, _walletDecimals).toFixed(6);
        } else if (isSolanaChain(network)) {
          // Solana
          if (!tokenContractAddress) return { value: '0' };
          const _balanceRes = await fromWallet?.getBalance({ tokenContractAddress });
          _walletDecimals = _balanceRes.decimals || decimal;
          _formatBalance = divDecimals(_balanceRes.value, _walletDecimals).toFixed(6);
        } else if (isTONChain(network)) {
          // TON
          if (!tokenContractAddress) return { value: '0' };
          const _balanceRes = await fromWallet?.getBalance({ tokenContractAddress });
          _walletDecimals = _balanceRes.decimals || decimal;
          _formatBalance = divDecimals(_balanceRes.value, _walletDecimals).toFixed(6);
        } else {
          // TRON
          if (!tokenContractAddress) return { value: '0' };
          const _balanceRes = await fromWallet?.getBalance({ tokenContractAddress });
          _formatBalance = ZERO.plus(_balanceRes.value).toFixed(6);
        }
        const _parseFloat = parseFloat(_formatBalance).toString();
        setBalance(_parseFloat);
        setDecimalsFromWallet(_walletDecimals);
        return {
          value: _parseFloat,
          decimals: _walletDecimals,
        };
      } catch (error) {
        console.log('getBalance error', error);
        return { value: '0' };
      } finally {
        isLoading && setIsBalanceLoading(false);
      }
    },
    [accounts, currentTokenDecimal, fromWallet, tokenSymbol],
  );

  const getBalanceRef = useRef(getBalance);
  getBalanceRef.current = getBalance;
  const getBalanceInterval = useCallback(
    async (tokenContractAddress: string, network: string, item?: TTokenItem) => {
      console.log('>>>>>> getBalanceInterval start', item?.symbol);
      if (getBalanceTimerRef.current) clearInterval(getBalanceTimerRef.current);
      getBalanceTimerRef.current = setInterval(async () => {
        console.log('>>>>>> getBalanceInterval interval', item?.symbol);
        await getBalanceRef.current(false, tokenContractAddress, network, item);
      }, 30000);
    },
    [],
  );

  const resetBalance = useCallback(() => {
    setBalance('');
  }, []);

  useEffect(() => {
    return () => {
      if (getBalanceTimerRef.current) {
        clearInterval(getBalanceTimerRef.current);
        getBalanceTimerRef.current = null;
        setBalance('');
      }
    };
  }, []);

  return {
    balance,
    isBalanceLoading,
    decimalsFromWallet,
    getBalance,
    getBalanceInterval,
    resetBalance,
  };
}
