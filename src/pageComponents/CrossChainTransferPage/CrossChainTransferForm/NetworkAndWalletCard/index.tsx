import { useCallback, useMemo } from 'react';
import styles from './styles.module.scss';
import { useWallet } from 'context/Wallet';
import { useCrossChainTransfer } from 'store/Provider/hooks';
import { computeWalletType, isAelfChain } from 'utils/wallet';
import { CONNECT_AELF_WALLET, CONNECT_WALLET } from 'constants/wallet';
import { IConnector, WalletTypeEnum } from 'context/Wallet/types';
import { getWalletLogo } from 'utils/wallet';
import NetworkSelected from '../NetworkSelected';
import { TNetworkItem } from 'types/api';
import clsx from 'clsx';
import { getOmittedStr } from 'utils/calculate';

export interface NetworkAndWalletCardProps {
  className?: string;
  label?: string;
  cardType: 'From' | 'To';
  onSelectCallback?: (item: TNetworkItem) => Promise<void>;
}

export function NetworkAndWalletCard({
  className,
  label,
  cardType,
  onSelectCallback,
}: NetworkAndWalletCardProps) {
  const [{ fromWallet, fromWalletType, toWallet, toWalletType }] = useWallet();
  const { fromNetwork, toNetwork } = useCrossChainTransfer();

  const labelFormat = useMemo(() => {
    if (label) return label;
    return cardType;
  }, [cardType, label]);

  const handleConnectWallet = useCallback((network: string) => {
    const walletType = computeWalletType(network);
    if (!walletType) return;

    // TODO
    console.log('handleConnectWallet', walletType);
  }, []);

  const connectWalletText = useMemo(() => {
    if (cardType === 'From') {
      if (isAelfChain(fromNetwork?.network)) {
        return (
          <div
            className={styles['connect-wallet-link']}
            onClick={() => handleConnectWallet(fromNetwork.network)}>
            {CONNECT_AELF_WALLET}
          </div>
        );
      } else {
        return (
          <div
            className={styles['connect-wallet-link']}
            onClick={() => handleConnectWallet(fromNetwork.network)}>
            {CONNECT_WALLET}
          </div>
        );
      }
    }
    if (isAelfChain(toNetwork?.network)) {
      return (
        <div
          className={styles['connect-wallet-link']}
          onClick={() => handleConnectWallet(toNetwork.network)}>
          {CONNECT_AELF_WALLET}
        </div>
      );
    } else {
      return (
        <div
          className={styles['connect-wallet-link']}
          onClick={() => handleConnectWallet(toNetwork.network)}>
          {CONNECT_WALLET}
        </div>
      );
    }
  }, [cardType, fromNetwork.network, handleConnectWallet, toNetwork.network]);

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
        connectWalletText
      );
    }
    return toWallet?.isConnected && toWallet?.account ? (
      <div className="flex-row-center gap-4">
        <WalletLogo />
        <span className={styles['wallet-account']}>{getOmittedStr(toWallet?.account, 5, 5)}</span>
      </div>
    ) : (
      connectWalletText
    );
  }, [
    WalletLogo,
    cardType,
    connectWalletText,
    fromWallet?.account,
    fromWallet?.isConnected,
    toWallet?.account,
    toWallet?.isConnected,
  ]);

  return (
    <div className={clsx(styles['network-and-wallet-card'], className)}>
      <div className={clsx('flex-row-center-between', styles['network-and-wallet-card-title-row'])}>
        <div className={styles['network-and-wallet-card-title']}>{labelFormat}</div>
        {renderWallet}
      </div>

      <NetworkSelected selectCallback={onSelectCallback} />
    </div>
  );
}
