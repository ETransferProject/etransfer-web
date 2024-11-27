import { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { useWallet } from 'context/Wallet';
import { useAppDispatch, useCrossChainTransfer } from 'store/Provider/hooks';
import { computeWalletType, getConnectWalletText } from 'utils/wallet';
import { IConnector, WalletTypeEnum } from 'context/Wallet/types';
import { getWalletLogo } from 'utils/wallet';
import NetworkSelected from '../NetworkSelected';
import { TNetworkItem } from 'types/api';
import clsx from 'clsx';
import { getOmittedStr } from 'utils/calculate';
import ConnectWalletModal from 'components/Header/LoginAndProfile/ConnectWalletModal';
import { setFromWalletType, setToWalletType } from 'store/reducers/crossChainTransfer/slice';

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

  const renderConnectWallet = useMemo(() => {
    const network = cardType === 'From' ? fromNetwork?.network : toNetwork?.network;
    const walletType = cardType === 'From' ? fromWalletType : toWalletType;
    const connectWalletText = getConnectWalletText({ network, walletType });

    return (
      <div>
        <div
          className={styles['connect-wallet-link']}
          onClick={() => handleConnectWallet(network || '')}>
          {connectWalletText}
        </div>
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
    cardType,
    fromNetwork?.network,
    fromWalletType,
    handleConnectWallet,
    handleSelectWallet,
    openConnectWalletModal,
    toNetwork?.network,
    toWalletType,
    walletAllowList,
  ]);

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
    if (cardType === 'From') {
      return fromWallet?.isConnected && fromWallet?.account ? (
        <div className="flex-row-center gap-4">
          <WalletLogo />
          <span className={styles['wallet-account']}>
            {getOmittedStr(fromWallet?.account, 5, 5)}
          </span>
        </div>
      ) : (
        renderConnectWallet
      );
    }
    return toWallet?.isConnected && toWallet?.account ? (
      <div className="flex-row-center gap-4">
        <WalletLogo />
        <span className={styles['wallet-account']}>{getOmittedStr(toWallet?.account, 5, 5)}</span>
      </div>
    ) : (
      renderConnectWallet
    );
  }, [
    WalletLogo,
    cardType,
    fromWallet?.account,
    fromWallet?.isConnected,
    renderConnectWallet,
    toWallet?.account,
    toWallet?.isConnected,
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
