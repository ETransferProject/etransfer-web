/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback } from 'react';
import { SupportedELFChainId } from 'constants/index';
import { ContractMethodName } from 'constants/contract';
import { ContractType } from 'constants/chain';
import { PortkeyVersion } from 'constants/wallet';
import portkeyContractUnity from 'contract/portkey';

export type GetBalancesProps = {
  caAddress: string;
  symbol: string;
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
};

export const useBalance = () => {
  return useCallback(async ({ symbol, chainId, caAddress, version }: GetBalancesProps) => {
    const tokenContract = await portkeyContractUnity.getContract({
      chainId,
      contractType: ContractType.TOKEN,
      version,
    });

    const {
      data: { balance },
    } = await tokenContract.callViewMethod(ContractMethodName.GetBalance, {
      symbol,
      owner: caAddress, // caAddress
    });
    return balance;
  }, []);
};
