import { SingleMessage } from '@etransfer/ui-react';
import { SupportedELFChainId } from 'constants/index';
import { useCallback } from 'react';
import { handleWebLoginErrorMessage } from 'utils/api/error';
import { divDecimals } from 'utils/calculate';
import { getBalance } from 'utils/contract';
import { useGetAccount } from './wallet';

export function useGetBalanceDivDecimals() {
  const accounts = useGetAccount();

  return useCallback(
    async (symbol: string, decimals: string | number, chainId: SupportedELFChainId) => {
      try {
        const caAddress = accounts?.[chainId];
        if (!caAddress) return '';

        const maxBalance = await getBalance({
          symbol,
          chainId,
          caAddress,
        });
        return divDecimals(maxBalance, decimals).toFixed();
      } catch (error) {
        SingleMessage.error(handleWebLoginErrorMessage(error));
        throw new Error('Failed to get balance.');
      }
    },
    [accounts],
  );
}
