import { CommonButtonProps } from 'components/CommonButton';
import { usePathname } from 'next/navigation';
import ConnectOtherWalletButton from './ConnectOtherWallet';
import ConnectAelfWalletButton from './ConnectAelfWallet';
import { useMemo, useState } from 'react';
import ConnectWalletModal from '../ConnectWalletModal';

export default function ConnectWalletButton(props: CommonButtonProps) {
  const pathname = usePathname();
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);

  const connectButton = useMemo(() => {
    if (pathname === '/deposit') {
      return <ConnectAelfWalletButton {...props} onClick={() => setOpenConnectWalletModal(true)} />;
    }

    return <ConnectOtherWalletButton {...props} onClick={() => setOpenConnectWalletModal(true)} />;
  }, [pathname, props]);

  return (
    <>
      {connectButton}
      <ConnectWalletModal
        open={openConnectWalletModal}
        onCancel={() => setOpenConnectWalletModal(false)}
      />
    </>
  );
}
