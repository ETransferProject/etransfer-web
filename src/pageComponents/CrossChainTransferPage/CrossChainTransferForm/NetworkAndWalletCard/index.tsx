import { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { useWallet } from 'context/Wallet';
import { useAppDispatch, useCrossChainTransfer } from 'store/Provider/hooks';
import { computeWalletType, getConnectWalletText, isAelfChain } from 'utils/wallet';
import { IConnector, WalletTypeEnum } from 'context/Wallet/types';
import { getWalletLogo } from 'utils/wallet';
import NetworkSelected from '../NetworkSelected';
import { TNetworkItem } from 'types/api';
import clsx from 'clsx';
import { getOmittedStr } from 'utils/calculate';
import ConnectWalletModal from 'components/Header/LoginAndProfile/ConnectWalletModal';
import { setFromWalletType, setToWalletType } from 'store/reducers/crossChainTransfer/slice';
import { useGetAccount } from 'hooks/wallet/useAelf';

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
  const dispatch = useAppDispatch();
  const accounts = useGetAccount();
  const [{ fromWallet, toWallet }] = useWallet();
  const { fromNetwork, fromNetworkList, fromWalletType, toWalletType, toNetwork, toNetworkList } =
    useCrossChainTransfer();
  const [openConnectWalletModal, setOpenConnectWalletModal] = useState(false);
  const [walletAllowList, setWalletAllowList] = useState<WalletTypeEnum[]>([]);

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

  const handleSelectWallet = useCallback(
    (walletType: WalletTypeEnum) => {
      if (cardType === 'From') {
        dispatch(setFromWalletType(walletType));
      } else {
        dispatch(setToWalletType(walletType));
      }
    },
    [cardType, dispatch],
  );

  const WalletLogo = useMemo(() => {
    if (cardType === 'From' && fromWalletType) {
      return getWalletLogo(
        fromWalletType,
        fromWalletType === WalletTypeEnum.EVM ? (fromWallet?.connector as IConnector) : undefined,
      );
    }

    if (cardType === 'To' && toWalletType) {
      return getWalletLogo(
        toWalletType,
        toWalletType === WalletTypeEnum.EVM ? (toWallet?.connector as IConnector) : undefined,
      );
    }

    return null;
  }, [cardType, fromWallet?.connector, fromWalletType, toWallet?.connector, toWalletType]);

  const renderWallet = useMemo(() => {
    const isConnected =
      cardType === 'From'
        ? fromWallet?.isConnected && fromWallet?.account
        : toWallet?.isConnected && toWallet?.account;
    let account = cardType === 'From' ? fromWallet?.account : toWallet?.account;
    const network = cardType === 'From' ? fromNetwork?.network : toNetwork?.network;
    const walletType = cardType === 'From' ? fromWalletType : toWalletType;
    const connectWalletText = getConnectWalletText({ network, walletType });

    if (network && (accounts as any)?.[network]) {
      account = (accounts as any)[network];
    }

    return (
      <div>
        {isConnected && account && network ? (
          <div
            className="flex-row-center gap-4 cursor-pointer"
            onClick={() => handleConnectWallet(network || '')}>
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
          title={connectWalletText}
          allowList={walletAllowList}
          onCancel={() => setOpenConnectWalletModal(false)}
          onSelected={handleSelectWallet}
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
    fromWalletType,
    handleConnectWallet,
    handleSelectWallet,
    openConnectWalletModal,
    toNetwork?.network,
    toWallet?.account,
    toWallet?.isConnected,
    toWalletType,
    walletAllowList,
  ]);

  return (
    <div className={clsx(styles['network-and-wallet-card'], className)}>
      <div className={clsx('flex-row-center-between', styles['network-and-wallet-card-title-row'])}>
        <div className={styles['network-and-wallet-card-title']}>{labelFormat}</div>
        {renderWallet}
      </div>

      <NetworkSelected
        selectCallback={onSelectNetworkCallback}
        selected={selectedNetwork}
        networkList={selectedNetworkList || []}
      />
    </div>
  );
}
