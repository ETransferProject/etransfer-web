import clsx from 'clsx';
import styles from './styles.module.scss';
import CommonModal from 'components/CommonModal';
import { useMemo, useState } from 'react';
import DisplayImage from 'components/DisplayImage';
import { formatSymbolDisplay } from '@etransfer/ui-react';
import CommonSteps from 'components/CommonSteps';
import { VIEW_COBO_CUSTODY_PROGRESS } from 'constants/listing';

const ViewProgressTitle = 'View Progress';

export default function ViewProgress({
  className,
  open = false,
  onClose,
  onConfirm,
}: {
  className?: string;
  open?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const token = useMemo(
    () => ({
      name: 'SGR',
      symbol: 'SGR-1',
      icon: '',
      networkName: 'aelf MainChain',
    }),
    [],
  );

  const content = useMemo(() => {
    return (
      <div>
        <div className={clsx('flex-row-center-between', styles['token-info'])}>
          <div className="flex-row-center gap-8">
            <DisplayImage width={20} height={20} name={token.name} src={token.icon} />
            <span className={clsx(styles['token-symbol'])}>
              {formatSymbolDisplay(token.symbol)}
            </span>
          </div>
          <div className={styles['token-network']}>{token.networkName}</div>
        </div>
        <div className={styles['view-progress-steps-wrapper']}>
          <CommonSteps
            className={styles['view-progress-steps']}
            stepItems={VIEW_COBO_CUSTODY_PROGRESS}
            current={currentStep}
            direction={'vertical'}
            onChange={setCurrentStep}
          />
        </div>
      </div>
    );
  }, [currentStep, token.icon, token.name, token.networkName, token.symbol]);

  return (
    <CommonModal
      className={clsx(styles['view-progress-modal'], className)}
      title={ViewProgressTitle}
      open={open}
      hideCancelButton
      onCancel={onClose}
      onOk={onConfirm}>
      {content}
    </CommonModal>
  );
}
