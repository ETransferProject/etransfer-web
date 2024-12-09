import clsx from 'clsx';
import styles from './styles.module.scss';
import CommonModal from 'components/CommonModal';
import { useMemo } from 'react';
import DisplayImage from 'components/DisplayImage';
import { formatSymbolDisplay } from '@etransfer/ui-react';
import CommonSteps from 'components/CommonSteps';
import { ListingProcessStep, VIEW_COBO_CUSTODY_PROGRESS } from 'constants/listing';
import { GOT_IT } from 'constants/misc';
import CommonDrawer from 'components/CommonDrawer';
import { useCommonState } from 'store/Provider/hooks';
import CommonButton from 'components/CommonButton';
import { ApplicationChainStatusEnum } from 'types/api';

const ViewProgressTitle = 'View Progress';

export default function ViewProgress({
  className,
  open = false,
  status,
  tokenSymbol,
  tokenIcon,
  chainName,
  onClose,
  onConfirm,
}: {
  className?: string;
  open?: boolean;
  status: ApplicationChainStatusEnum;
  tokenSymbol: string;
  tokenIcon?: string;
  chainName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { isPadPX } = useCommonState();

  const currentStep = useMemo(() => {
    if (status === ApplicationChainStatusEnum.Issuing) {
      return ListingProcessStep.ISSUE_TOKEN;
    }
    if (status === ApplicationChainStatusEnum.Reviewing) {
      return ListingProcessStep.COBO_CUSTODY_REVIEW;
    }
    if (status === ApplicationChainStatusEnum.Integrating) {
      return ListingProcessStep.CROSS_CHAIN_INTEGRATION;
    }
    if (status === ApplicationChainStatusEnum.PoolInitializing) {
      return ListingProcessStep.INITIALIZE_LIQUIDITY_POOL;
    }
    return ListingProcessStep.COMPLETE;
  }, [status]);

  const content = useMemo(() => {
    return (
      <div>
        <div className={clsx('flex-row-center-between', styles['token-info'])}>
          <div className="flex-row-center gap-8">
            <DisplayImage width={20} height={20} name={tokenSymbol} src={tokenIcon} />
            <span className={clsx(styles['token-symbol'])}>{formatSymbolDisplay(tokenSymbol)}</span>
          </div>
          <div className={styles['token-network']}>{chainName}</div>
        </div>
        <div className={styles['view-progress-steps-wrapper']}>
          <CommonSteps
            className={styles['view-progress-steps']}
            stepItems={VIEW_COBO_CUSTODY_PROGRESS}
            current={currentStep}
            direction={'vertical'}
          />
        </div>
      </div>
    );
  }, [chainName, currentStep, tokenIcon, tokenSymbol]);

  if (isPadPX) {
    return (
      <CommonDrawer
        className={clsx(
          styles['view-progress-drawer'],
          styles['view-progress-drawer-weight'],
          className,
        )}
        height="auto"
        title={ViewProgressTitle}
        open={open}
        onClose={onClose}>
        {content}
        <CommonButton className={styles['confirm-button']} onClick={onConfirm}>
          {GOT_IT}
        </CommonButton>
      </CommonDrawer>
    );
  }

  return (
    <CommonModal
      className={clsx(styles['view-progress-modal'], className)}
      title={ViewProgressTitle}
      open={open}
      hideCancelButton
      okText={GOT_IT}
      onCancel={onClose}
      onOk={onConfirm}>
      {content}
    </CommonModal>
  );
}
