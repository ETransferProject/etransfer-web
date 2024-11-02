import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useMemo } from 'react';

export default function useAelf() {
  const { walletInfo, walletType, isConnected, disConnectWallet } = useConnectWallet();
  // const [{ userELFChainId }] = useChain();
  // const chainId = userELFChainId;

  const aelfContext = useMemo(() => {
    return {
      isConnected: isConnected && !!walletInfo,
      walletType: WalletTypeEnum.AELF,
      chainId: '',
      provider: walletInfo?.extraInfo?.provider,
      account: walletInfo?.address,
      accounts: [walletInfo?.address],
      connector: walletType,
      disconnect: disConnectWallet,
      getAccountInfo: () => walletInfo?.extraInfo,
    };
  }, [disConnectWallet, isConnected, walletInfo, walletType]);

  return aelfContext;
}
