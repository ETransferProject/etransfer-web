import { useMemo } from 'react';
import useAelf from './useAelf';
import useEVM from './useEVM';
import useSolana from './useSolana';
import useTON from './useTON';
import useTRON from './useTRON';
import { WalletTypeEnum } from 'context/Wallet/types';

export function useCheckHasConnectedWallet() {
  const { isConnected: isAelfConnected } = useAelf();
  const { isConnected: isEVMConnected } = useEVM();
  const { isConnected: isSolanaConnected } = useSolana();
  const { isConnected: isTONConnected } = useTON();
  const { isConnected: isTRONConnected } = useTRON();

  return useMemo(() => {
    const hasConnectedTypeList = [];
    if (isAelfConnected) hasConnectedTypeList.push(WalletTypeEnum.AELF);
    if (isEVMConnected) hasConnectedTypeList.push(WalletTypeEnum.EVM);
    if (isSolanaConnected) hasConnectedTypeList.push(WalletTypeEnum.SOL);
    if (isTONConnected) hasConnectedTypeList.push(WalletTypeEnum.TON);
    if (isTRONConnected) hasConnectedTypeList.push(WalletTypeEnum.TRON);

    return {
      hasConnectedTypes: hasConnectedTypeList,
      hasConnected:
        isAelfConnected || isEVMConnected || isSolanaConnected || isTONConnected || isTRONConnected,
    };
  }, []);
}
