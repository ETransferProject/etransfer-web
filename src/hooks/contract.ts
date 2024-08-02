import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import singleMessage from 'components/SingleMessage';
import { SupportedELFChainId } from 'constants/index';
import { useCallback } from 'react';
import { handleWebLoginErrorMessage } from 'utils/api/error';
import { divDecimals } from 'utils/calculate';
import { getBalance } from 'utils/contract';
import { useGetAccount } from './wallet';

export function useGetBalanceDivDecimals() {
  const { callViewMethod } = useConnectWallet();
  const accounts = useGetAccount();

  return useCallback(
    async (symbol: string, decimals: string | number, chainId: SupportedELFChainId) => {
      try {
        const caAddress = accounts?.[chainId];
        if (!caAddress) return '';

        const maxBalance = await getBalance({
          callViewMethod,
          symbol,
          chainId,
          caAddress,
        });
        return divDecimals(maxBalance, decimals).toFixed();
      } catch (error) {
        singleMessage.error(handleWebLoginErrorMessage(error));
        throw new Error('Failed to get balance.');
      }
    },
    [accounts, callViewMethod],
  );
}
