import { InfoBrandIcon } from 'assets/images';
import styles from './styles.module.scss';
import clsx from 'clsx';
import useAelf from 'hooks/wallet/useAelf';
import { SideMenuKey } from 'constants/home';
import { CHAIN_NAME_ENUM } from 'constants/index';
import { useCallback } from 'react';
import { useGoTransfer } from 'hooks/crossChainTransfer';

export default function TransferTip({
  symbol,
  fromNetwork,
  toNetwork,
  isShowIcon = true,
  isCard = true,
}: {
  symbol: string;
  fromNetwork?: string;
  toNetwork?: string;
  isShowIcon?: boolean;
  isCard?: boolean;
}) {
  const { isConnected } = useAelf();
  const goTransfer = useGoTransfer();
  const handleGoTransfer = useCallback(async () => {
    goTransfer(symbol, fromNetwork, toNetwork);
  }, [fromNetwork, goTransfer, symbol, toNetwork]);

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
        <span className={styles['action']} onClick={handleGoTransfer}>
          {SideMenuKey.CrossChainTransfer}
        </span>
        <span>{` page.`}</span>
      </span>
    </div>
  );
}
