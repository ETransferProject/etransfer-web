import { useCallback, useState } from 'react';
import clsx from 'clsx';
import ConnectWalletModal from 'components/Header/LoginAndProfile/ConnectWalletModal';
import styles from './styles.module.scss';
import { useAelfLogin, useGetAelfAccount } from 'hooks/wallet/useAelf';
import { computeWalletType, getConnectWalletText, getWalletLogo, isAelfChain } from 'utils/wallet';
import { getOmittedStr } from 'utils/calculate';
import { MY_WALLET } from 'constants/wallet';
import { WalletTypeEnum } from 'context/Wallet/types';

interface IConnectWalletAndAddressProps {
  className?: string;
  isConnected: boolean;
  network: string;
  account?: string;
  connector?: any;
  isConnectAelfDirectly?: boolean;
  isGetAuthAfterConnect?: boolean;
}

export default function ConnectWalletAndAddress({
  className,
  isConnected,
  network,
  account,
  connector,
  isConnectAelfDirectly = false,
  isGetAuthAfterConnect = false,
}: IConnectWalletAndAddressProps) {
  const accounts = useGetAelfAccount();
  const handleAelfLogin = useAelfLogin();

  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const [walletAllowList, setWalletAllowList] = useState<WalletTypeEnum[] | undefined>();

  const walletType = computeWalletType(network);

  const WalletLogo = walletType ? getWalletLogo(walletType, connector) : null;

  const connectedAccount =
    network && (accounts as any)?.[network] ? (accounts as any)[network] : account;

  const connectWalletText = getConnectWalletText(network);

  const handleAddressClick = useCallback(() => {
    setWalletAllowList(undefined);
    setOpenConnectWalletModal(true);
  }, []);

  const handleConnectWallet = useCallback(async () => {
    if (!walletType) return;

    if (isConnectAelfDirectly) {
      handleAelfLogin(isGetAuthAfterConnect);
    } else {
      setWalletAllowList([walletType]);
      setOpenConnectWalletModal(true);
    }
  }, [handleAelfLogin, isConnectAelfDirectly, isGetAuthAfterConnect, walletType]);

  return (
    <>
      {isConnected ? (
        <div
          className={clsx('flex-row-center gap-4 cursor-pointer', className)}
          onClick={handleAddressClick}>
          <WalletLogo />
          <span className={styles['wallet-account']}>
            {isAelfChain(network)
              ? getOmittedStr(connectedAccount, 8, 8)
              : getOmittedStr(connectedAccount, 4, 4)}
          </span>
        </div>
      ) : (
        <div className={styles['connect-wallet-link']} onClick={handleConnectWallet}>
          {connectWalletText}
        </div>
      )}
      <ConnectWalletModal
        open={openConnectWalletModal}
        title={walletAllowList?.length ? connectWalletText : MY_WALLET}
        allowList={walletAllowList}
        onCancel={() => setOpenConnectWalletModal(false)}
      />
    </>
  );
}
