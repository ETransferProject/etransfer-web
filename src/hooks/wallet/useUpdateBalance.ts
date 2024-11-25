import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetAccount } from './useAelf';
import { TTokenItem } from 'types/api';
// import { SingleMessage } from '@etransfer/ui-react';
// import { handleErrorMessage } from '@etransfer/utils';
import { divDecimals } from 'utils/calculate';
import { useCrossChainTransfer } from 'store/Provider/hooks';
import { InitialCrossChainTransferState } from 'store/reducers/crossChainTransfer/slice';
import { isAelfChain, isEVMChain, isSolanaChain, isTONChain } from 'utils/wallet';
import { getBalance as getAelfBalance } from 'utils/contract';
import { SupportedELFChainId } from 'constants/index';
import { useWallet } from 'context/Wallet';

export function useUpdateBalance() {
  const { tokenSymbol, totalTokenList } = useCrossChainTransfer();
  const [{ fromWallet }] = useWallet();
  const [balance, setBalance] = useState('');
  const [decimalsFromWallet, setDecimalsFromWallet] = useState<string | number>('');
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const getBalanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accounts = useGetAccount(); // aelf account

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
    ) => {
      if (!network || !fromWallet || !fromWallet?.isConnected) return '0';

      try {
        const symbol = item?.symbol || tokenSymbol;
        const decimal = item?.decimals || currentTokenDecimal;
        let _balance = '';
        let _formatBalance = '';
        let _walletDecimals: string | number = decimal;
        if (isAelfChain(network)) {
          console.log('>>>>>> getBalance', item?.symbol);

          const chainId = network as SupportedELFChainId;
          const caAddress = accounts?.[chainId];
          if (!caAddress) return '';
          isLoading && setIsBalanceLoading(true);
          _balance = await getAelfBalance({
            symbol: symbol,
            chainId: chainId,
            caAddress,
          });
          _formatBalance = divDecimals(_balance, decimal).toFixed();
        } else if (isEVMChain(network)) {
          // EVM
          if (!tokenContractAddress) return '';
          const _balanceRes = await fromWallet?.getBalance({ tokenContractAddress, network });
          _walletDecimals = _balanceRes.decimals || decimal;
          _formatBalance = divDecimals(_balanceRes.value, _walletDecimals).toFixed();
        } else if (isSolanaChain(network)) {
          // Solana
          if (!tokenContractAddress) return '';
          const _balanceRes = await fromWallet?.getBalance({ tokenContractAddress });
          _walletDecimals = _balanceRes.decimals || decimal;
          _formatBalance = divDecimals(_balanceRes.value, _walletDecimals).toFixed();
        } else if (isTONChain(network)) {
          // TON
          if (!tokenContractAddress) return '';
          const _balanceRes = await fromWallet?.getBalance({ tokenContractAddress });
          _walletDecimals = _balanceRes.decimals || decimal;
          _formatBalance = divDecimals(_balanceRes.value, _walletDecimals).toFixed();
        } else {
          // TRON
          if (!tokenContractAddress) return '';
          const _balanceRes = await fromWallet?.getBalance({ tokenContractAddress });
          _formatBalance = _balanceRes.value;
        }
        setBalance((preBalance) => {
          if (preBalance !== _formatBalance) {
            // TODO check amount
            // if (handleAmountValidate(undefined, undefined, _formatBalance)) {
            //   getTransferData(undefined, _formatBalance);
            // }
          }
          return _formatBalance;
        });
        setDecimalsFromWallet(_walletDecimals);
        // walletBalanceDecimalsRef.current = _walletDecimals;
        return _formatBalance;
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

  useEffect(() => {
    return () => {
      if (getBalanceTimerRef.current) clearInterval(getBalanceTimerRef.current);
      getBalanceTimerRef.current = null;
    };
  }, []);

  return {
    balance,
    isBalanceLoading,
    decimalsFromWallet,
    getBalance,
    getBalanceInterval,
  };
}
