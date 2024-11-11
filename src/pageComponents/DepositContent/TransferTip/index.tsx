import { InfoBrandIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';
import useAelf from 'hooks/wallet/useAelf';
import { SideMenuKey } from 'constants/home';
import { CHAIN_NAME_ENUM, IChainNameItem } from 'constants/index';
import { useCallback } from 'react';
import { useGoWithdraw } from 'hooks/withdraw';
import { TNetworkItem } from 'types/api';

export default function TransferTip({
  toChainItem,
  symbol,
  network,
  isShowIcon = true,
  isCard = true,
}: {
  toChainItem: IChainNameItem;
  symbol: string;
  network?: TNetworkItem;
  isShowIcon?: boolean;
  isCard?: boolean;
}) {
  const { isConnected } = useAelf();
  const goWithdraw = useGoWithdraw();
  const handleGoWithdraw = useCallback(async () => {
    goWithdraw(toChainItem, symbol, network);
  }, [goWithdraw, network, symbol, toChainItem]);

  if (!isConnected) return null;

  return (
    <div
      className={clsx(
        'flex-row-center',
        isCard ? styles['transfer-tip-card'] : styles['transfer-tip-text'],
      )}>
      {isShowIcon && <InfoBrandIcon className="flex-shrink-0" />}
      <span className={styles['text']}>
        <span>{`For transfer between the `}</span>
        <span className={styles['bold-text']}>{CHAIN_NAME_ENUM.MainChain}</span>
        <span>{` and `}</span>
        <span className={styles['bold-text']}>{CHAIN_NAME_ENUM.SideChain}</span>
        <span>{`, please go to the `}</span>
        <span className={styles['action']} onClick={handleGoWithdraw}>
          {SideMenuKey.Withdraw}
        </span>
        <span>{` page.`}</span>
      </span>
    </div>
  );
}
