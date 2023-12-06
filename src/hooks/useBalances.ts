/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback } from 'react';
import portkeyWallet from 'wallet/portkeyWallet';
import { SupportedELFChainId } from 'constants/index';

export type GetBalancesProps = {
  tokenContractAddress: string;
  address: string;
  symbol: string;
  chainId: SupportedELFChainId;
};

export const useBalances = () => {
  return useCallback(
    async ({ tokenContractAddress, address, symbol, chainId }: GetBalancesProps) => {
      if (!portkeyWallet || !portkeyWallet.provider) throw new Error('no provider');

      const portkeyContract = await (
        await portkeyWallet.provider!.getChain(chainId)
      ).getContract(tokenContractAddress);

      return await portkeyContract.callViewMethod('GetBalance', {
        symbol,
        owner: address, // caAddress
      });
    },
    [],
  );
};
