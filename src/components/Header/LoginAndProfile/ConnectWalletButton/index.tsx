import { CommonButtonProps } from 'components/CommonButton';
import { usePathname } from 'next/navigation';
import ConnectOtherWalletButton from './ConnectOtherWallet';
import ConnectAelfWalletButton from './ConnectAelfWallet';
import { useState } from 'react';
import ConnectWalletModal from '../ConnectWalletModal';
import { WalletTypeEnum } from 'context/Wallet/types';
import useAelf from 'hooks/wallet/useAelf';
import {
  CONNECT_AELF_WALLET,
  CONNECT_WALLET,
  MY_AELF_WALLET,
  MY_WALLET,
} from 'constants/wallet/index';
import { useCheckHasConnectedWallet } from 'hooks/wallet';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const pathname = usePathname();
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const { isConnected } = useAelf();
  const { hasConnected } = useCheckHasConnectedWallet();

  if (pathname === '/deposit') {
    return (
      <>
        <ConnectAelfWalletButton {...props} onClick={() => setOpenConnectWalletModal(true)} />
        <ConnectWalletModal
          open={openConnectWalletModal}
          title={isConnected ? MY_AELF_WALLET : CONNECT_AELF_WALLET}
          allowList={[WalletTypeEnum.AELF]}
          drawerZIndex={301}
          onCancel={() => setOpenConnectWalletModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <ConnectOtherWalletButton {...props} onClick={() => setOpenConnectWalletModal(true)} />
      <ConnectWalletModal
        open={openConnectWalletModal}
        title={hasConnected ? MY_WALLET : CONNECT_WALLET}
        onCancel={() => setOpenConnectWalletModal(false)}
      />
    </>
  );
}
