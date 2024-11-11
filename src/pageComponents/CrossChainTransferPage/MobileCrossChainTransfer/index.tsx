import { useMemo } from 'react';
import styles from './styles.module.scss';
import CrossChainTransferForm from '../CrossChainTransferForm';
import CrossChainTransferFooter from '../CrossChainTransferFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_CROSS_CHAIN_TRANSFER } from 'constants/footer';
import { useCommonState, useRecordsState } from 'store/Provider/hooks';
import useAelf from 'hooks/wallet/useAelf';
import { ProcessingTip } from 'components/Tips/ProcessingTip';

export interface MobileCrossChainTransferProps {
  onClickProcessingTip: () => void;
}

export default function MobileCrossChainTransfer({
  onClickProcessingTip,
}: MobileCrossChainTransferProps) {
  const { isPadPX, isMobilePX } = useCommonState();
  const { isConnected } = useAelf(); // TODO
  const { depositProcessingCount, transferProcessingCount } = useRecordsState();

  const renderDepositMainContent = useMemo(() => {
    return (
      <div className={clsx(styles['main-section'], styles['section'])}>
        <CrossChainTransferForm />
        <CrossChainTransferFooter recipientAddress={''} />
      </div>
    );
  }, []);

  return (
    <div className="main-content-container main-content-container-safe-area">
      {isConnected && (
        <ProcessingTip
          depositProcessingCount={depositProcessingCount}
          transferProcessingCount={transferProcessingCount}
          marginBottom={isPadPX && !isMobilePX ? 24 : 0}
          borderRadius={0}
          onClick={onClickProcessingTip}
        />
      )}

      {renderDepositMainContent}

      {isPadPX && !isMobilePX && (
        <>
          <div className={styles['divider']} />
          <FAQ
            className={clsx(styles['section'], styles['faq'])}
            title={FAQ_CROSS_CHAIN_TRANSFER.title}
            list={FAQ_CROSS_CHAIN_TRANSFER.list}
          />
        </>
      )}
    </div>
  );
}
