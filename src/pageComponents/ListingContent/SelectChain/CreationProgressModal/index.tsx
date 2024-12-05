import CommonDrawer from 'components/CommonDrawer';
import CommonModal from 'components/CommonModal';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';
import Remind from 'components/Remind';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';

const stepItems: ICommonStepsProps['stepItems'] = [
  {
    title: 'Creating token on Ethereum',
  },
  {
    title: 'Creating token on BSC',
    isLoading: true,
  },
  {
    title: 'Creating token on Arbitrum',
  },
];

interface ICreationProgressModalProps {
  open: boolean;
}

export default function CreationProgressModal({ open }: ICreationProgressModalProps) {
  const { isPadPX } = useCommonState();

  const renderContent = () => {
    return (
      <>
        <CommonSteps
          className={styles['creation-progress-steps']}
          direction="vertical"
          stepItems={stepItems}
        />
        <Remind className={styles['creation-progress-remind']}>
          <p>• Please approve the transaction in your wallet to create tokens on each chain.</p>
          <p>
            • If no wallet popup appears, please open your wallet manually to approve the
            transaction.
          </p>
        </Remind>
      </>
    );
  };

  const commonProps = {
    title: 'Token Creation in Progress',
    closable: false,
    open,
  };

  if (isPadPX) {
    return (
      <CommonDrawer {...commonProps} className={styles['creation-progress-drawer']} height="auto">
        {renderContent()}
      </CommonDrawer>
    );
  }

  return (
    <CommonModal
      {...commonProps}
      className={styles['creation-progress-modal']}
      hideCancelButton
      hideOkButton>
      {renderContent()}
    </CommonModal>
  );
}
