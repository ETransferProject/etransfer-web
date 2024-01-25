/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useMemo } from 'react';
import getPortkeyWallet from 'wallet/portkeyWallet';
import { SupportedELFChainId } from 'constants/index';
import { usePortkeyWalletState } from 'store/Provider/hooks';

export type GetBalancesProps = {
  tokenContractAddress: string;
  address: string;
  symbol: string;
  chainId: SupportedELFChainId;
};

export const useBalances = () => {
  const { currentVersion } = usePortkeyWalletState();
  const portkeyWallet = useMemo(() => getPortkeyWallet(currentVersion), [currentVersion]);

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
    [portkeyWallet],
  );
};
