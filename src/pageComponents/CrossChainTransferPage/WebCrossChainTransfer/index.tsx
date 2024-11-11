import { useMemo } from 'react';
import styles from './styles.module.scss';
import CrossChainTransferForm from '../CrossChainTransferForm';
import CrossChainTransferFooter from '../CrossChainTransferFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_CROSS_CHAIN_TRANSFER } from 'constants/footer';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import useAelf from 'hooks/wallet/useAelf';
import { useRecordsState } from 'store/Provider/hooks';
export interface WebCrossChainTransferProps {
  onClickProcessingTip: () => void;
}

export default function WebCrossChainTransfer({
  onClickProcessingTip,
}: WebCrossChainTransferProps) {
  const { isConnected } = useAelf(); // TODO
  const { depositProcessingCount, transferProcessingCount } = useRecordsState();

  const renderDepositMainContent = useMemo(() => {
    return (
      <div
        className={clsx(
          'main-content-container',
          'main-content-container-safe-area',
          styles['main-content'],
        )}>
        {isConnected && (
          <ProcessingTip
            depositProcessingCount={depositProcessingCount}
            transferProcessingCount={transferProcessingCount}
            onClick={onClickProcessingTip}
          />
        )}

        <div className={styles['transfer-title']}>Cross-chain Transfer</div>

        <CrossChainTransferForm />
        <CrossChainTransferFooter recipientAddress={''} />
      </div>
    );
  }, [depositProcessingCount, isConnected, onClickProcessingTip, transferProcessingCount]);

  return (
    <div className="content-container flex-row">
      <div className={styles['main-container']}>
        <div className={styles['main-wrapper']}>{renderDepositMainContent}</div>
      </div>
      <div className={clsx('flex-row', styles['faq-wrapper'])}>
        <div className={styles['faq-left']}></div>
        <FAQ
          className={styles['faq']}
          title={FAQ_CROSS_CHAIN_TRANSFER.title}
          list={FAQ_CROSS_CHAIN_TRANSFER.list}
        />
      </div>
    </div>
  );
}
