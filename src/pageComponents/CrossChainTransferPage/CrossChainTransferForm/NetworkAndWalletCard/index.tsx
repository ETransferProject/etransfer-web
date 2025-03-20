import { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { useWallet } from 'context/Wallet';
import { useCrossChainTransfer } from 'store/Provider/hooks';
import { computeWalletType, getConnectWalletText, isAelfChain } from 'utils/wallet';
import { WalletTypeEnum } from 'context/Wallet/types';
import { getWalletLogo } from 'utils/wallet';
import NetworkSelected from '../NetworkSelected';
import { TNetworkItem } from 'types/api';
import clsx from 'clsx';
import { getOmittedStr } from 'utils/calculate';
import ConnectWalletModal from 'components/Header/LoginAndProfile/ConnectWalletModal';
import { useGetAelfAccount } from 'hooks/wallet/useAelf';
import { MY_WALLET } from 'constants/wallet';

const SelectSourceChain = 'Select Source Chain';
const SelectDestinationChain = 'Select Destination Chain';

export interface NetworkAndWalletCardProps {
  className?: string;
  label?: string;
  cardType: 'From' | 'To';
  onSelectNetworkCallback?: (item: TNetworkItem) => Promise<void>;
}

export function NetworkAndWalletCard({
  className,
  label,
  cardType,
  onSelectNetworkCallback,
}: NetworkAndWalletCardProps) {
  const accounts = useGetAelfAccount();
  const [{ fromWallet, toWallet }] = useWallet();
  const { fromNetwork, fromNetworkList, fromWalletType, toWalletType, toNetwork, toNetworkList } =
    useCrossChainTransfer();
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const [walletAllowList, setWalletAllowList] = useState<WalletTypeEnum[] | undefined>();

  const selectedNetwork = useMemo(() => {
    return cardType === 'From' ? fromNetwork : toNetwork;
  }, [cardType, fromNetwork, toNetwork]);

  const selectedNetworkList = useMemo(() => {
    return cardType === 'From' ? fromNetworkList : toNetworkList;
  }, [cardType, fromNetworkList, toNetworkList]);

  const labelFormat = useMemo(() => {
    if (label) return label;
    return cardType;
  }, [cardType, label]);

  const handleConnectWallet = useCallback((network: string) => {
    const walletType = computeWalletType(network);
    if (!walletType) return;

    setWalletAllowList([walletType]);
    setOpenConnectWalletModal(true);
  }, []);

  const WalletLogo = useMemo(() => {
    if (cardType === 'From' && fromWalletType) {
      return getWalletLogo(fromWalletType, fromWallet?.connector);
    }

    if (cardType === 'To' && toWalletType) {
      return getWalletLogo(toWalletType, toWallet?.connector);
    }

    return null;
  }, [cardType, fromWallet?.connector, fromWalletType, toWallet?.connector, toWalletType]);

  const renderWallet = useMemo(() => {
    const isConnected =
      cardType === 'From'
        ? fromWallet?.isConnected && fromWallet?.account
        : toWallet?.isConnected && toWallet?.account;
    let account = (cardType === 'From' ? fromWallet?.account : toWallet?.account) || '';
    const network = (cardType === 'From' ? fromNetwork?.network : toNetwork?.network) || '';
    const connectWalletText = getConnectWalletText(network);

    if (network && (accounts as any)?.[network]) {
      account = (accounts as any)[network];
    }

    return (
      <div>
        {isConnected ? (
          <div
            className="flex-row-center gap-4 cursor-pointer"
            onClick={() => {
              setWalletAllowList(undefined);
              setOpenConnectWalletModal(true);
            }}>
            <WalletLogo />
            <span className={styles['wallet-account']}>
              {isAelfChain(network) ? getOmittedStr(account, 8, 8) : getOmittedStr(account, 4, 4)}
            </span>
          </div>
        ) : (
          <div
            className={styles['connect-wallet-link']}
            onClick={() => handleConnectWallet(network || '')}>
            {connectWalletText}
          </div>
        )}
        <ConnectWalletModal
          open={openConnectWalletModal}
          title={walletAllowList?.length ? connectWalletText : MY_WALLET}
          allowList={walletAllowList}
          onCancel={() => setOpenConnectWalletModal(false)}
        />
      </div>
    );
  }, [
    WalletLogo,
    accounts,
    cardType,
    fromNetwork?.network,
    fromWallet?.account,
    fromWallet?.isConnected,
    handleConnectWallet,
    openConnectWalletModal,
    toNetwork?.network,
    toWallet?.account,
    toWallet?.isConnected,
    walletAllowList,
  ]);

  return (
    <div className={clsx(styles['network-and-wallet-card'], className)}>
      <div className={clsx('flex-row-center-between', styles['network-and-wallet-card-title-row'])}>
        <div className={styles['network-and-wallet-card-title']}>{labelFormat}</div>
        {renderWallet}
      </div>

      <NetworkSelected
        modalTitle={cardType === 'From' ? SelectSourceChain : SelectDestinationChain}
        selectCallback={onSelectNetworkCallback}
        selected={selectedNetwork}
        networkList={selectedNetworkList || []}
      />
    </div>
  );
}
