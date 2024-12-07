import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CommonDrawer from 'components/CommonDrawer';
import CommonModal from 'components/CommonModal';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';
import Remind, { RemindType } from 'components/Remind';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { useCommonState } from 'store/Provider/hooks';
import {
  ApplicationChainStatusEnum,
  TApplicationChainStatusItem,
  TPrepareBindIssueRequest,
} from 'types/api';
import { SelectChainFormKeys, TChains } from 'types/listing';
import styles from './styles.module.scss';
import { getApplicationIssue, prepareBindIssue } from 'utils/api/application';

export interface ICreationProgressModalProps {
  open: boolean;
  chains: TChains;
  supply: string;
  handleTryAgain: (errorChains: TChains) => void;
  handleCreateFinish: () => void;
}

type TStepItem = ICommonStepsProps['stepItems'][number] & {
  key: keyof TChains;
  chain: TApplicationChainStatusItem;
};

const POLLING_INTERVAL = 15000;

export default function CreationProgressModal({
  open,
  chains,
  supply,
  handleTryAgain,
  handleCreateFinish,
}: ICreationProgressModalProps) {
  const { isPadPX } = useCommonState();
  const poolingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isCreateStart, setIsCreateStart] = useState(false);
  const [stepItems, setStepItems] = useState<TStepItem[]>([]);

  const isWarning = useMemo(() => {
    return (
      stepItems.length > 0 &&
      stepItems.some((item) => item.status === 'error') &&
      (stepItems[stepItems.length - 1].status === 'finish' ||
        stepItems[stepItems.length - 1].status === 'error')
    );
  }, [stepItems]);

  const isCreateFinished = useMemo(() => {
    return stepItems.every((item) => item.status === 'finish');
  }, [stepItems]);

  const errorChains = useMemo(() => {
    const result: TChains = {
      [SelectChainFormKeys.AELF_CHAINS]: [],
      [SelectChainFormKeys.OTHER_CHAINS]: [],
    };
    stepItems.forEach(({ key, chain, status }) => {
      if (status === 'error') {
        result[key].push(chain);
      }
    });
    return result;
  }, [stepItems]);

  const getCurrentChain = useCallback(() => {
    if (stepItems.length === 0) {
      return 0;
    }
    const processIndex = stepItems.findIndex((item) => item.status === 'process');
    if (processIndex === -1) {
      return stepItems.length - 1;
    }
    return processIndex;
  }, [stepItems]);

  useEffect(() => {
    const list: TStepItem[] = [];
    (Object.entries(chains) as [keyof TChains, TApplicationChainStatusItem[]][]).forEach(
      ([key, chainsItem]) => {
        chainsItem.forEach((chain) => {
          list.push({
            key,
            chain,
            title: `Creating token on ${chain.chainId}`,
          });
        });
      },
    );
    list.forEach((item, index) => {
      if (index === 0) {
        item.status = 'process';
        item.isLoading = true;
      } else {
        item.status = 'wait';
      }
    });
    setStepItems(list);
  }, [open, chains]);

  useEffect(() => {
    if (open && isCreateStart && isCreateFinished) {
      handleCreateFinish();
    }
  }, [open, isCreateStart, isCreateFinished, handleCreateFinish]);

  useEffect(() => {
    if (!open) {
      setIsCreateStart(false);
    }
  }, [open]);

  const handleStepChange = useCallback(
    (step: number, status: ICommonStepsProps['stepItems'][number]['status']) => {
      setStepItems((prev) => {
        prev[step].status = status;
        prev[step].isLoading = false;
        const nextStep = step + 1;
        if (nextStep < prev.length) {
          prev[nextStep].status = 'process';
          prev[nextStep].isLoading = true;
        }
        return [...prev];
      });
    },
    [],
  );

  const handlePrepareBindIssue = useCallback(
    async ({ key, chain }: { key: keyof TChains; chain: TApplicationChainStatusItem }) => {
      try {
        // TODO: params
        const params: TPrepareBindIssueRequest = {
          address: '',
          symbol: chain.symbol,
          supply,
          chainId: '',
          otherChainId: '',
        };
        if (key === SelectChainFormKeys.AELF_CHAINS) {
          params.chainId = chain.chainId;
          delete params.otherChainId;
        } else {
          params.otherChainId = chain.chainId;
          // delete params.chainId;
        }
        const id = await prepareBindIssue(params);
        return id;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [supply],
  );

  const handleIssue = useCallback(
    // eslint-disable-next-line no-empty-pattern
    async ({}: { key: keyof TChains; chain: TApplicationChainStatusItem }) => {
      try {
        // TODO: issue token
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [],
  );

  const handlePollingForIssueResult = useCallback(
    async ({ step, id }: { step: number; id: string }) => {
      try {
        const isFinished = await getApplicationIssue(id);
        if (isFinished) {
          handleStepChange(step, 'finish');
        } else {
          if (poolingTimerRef.current) {
            clearTimeout(poolingTimerRef.current);
          }
          poolingTimerRef.current = setTimeout(() => {
            handlePollingForIssueResult({ step, id });
          }, POLLING_INTERVAL);
        }
      } catch (error) {
        console.error(error);
        if (poolingTimerRef.current) {
          clearTimeout(poolingTimerRef.current);
        }
        throw error;
      }
    },
    [handleStepChange],
  );

  const handleCreate = useCallback(async () => {
    const currentStep = getCurrentChain();
    const currentKey = stepItems[currentStep].key;
    const currentChain = stepItems[currentStep].chain;
    try {
      if (currentChain.status === ApplicationChainStatusEnum.Unissued) {
        const id = await handlePrepareBindIssue({
          key: currentKey,
          chain: currentChain,
        });
        await handleIssue({ key: currentKey, chain: currentChain });
        await handlePollingForIssueResult({ step: currentStep, id });
      } else if (currentChain.status === ApplicationChainStatusEnum.Issuing) {
        // TODO: polling id
        await handlePollingForIssueResult({ step: currentStep, id: '' });
      }
    } catch (error) {
      console.error(error);
      handleStepChange(currentStep, 'error');
    }
  }, [
    getCurrentChain,
    stepItems,
    handlePrepareBindIssue,
    handleIssue,
    handlePollingForIssueResult,
    handleStepChange,
  ]);

  useEffect(() => {
    if (open && !isCreateStart && stepItems.length > 0) {
      setIsCreateStart(true);
      handleCreate();
    }
  }, [open, isCreateStart, handleCreate, stepItems.length]);

  const onTryAgainClick = useCallback(() => {
    handleTryAgain(errorChains);
  }, [errorChains, handleTryAgain]);

  const remindProps = useMemo(() => {
    if (isWarning) {
      const networkList = stepItems
        .filter((item) => item.status === 'error')
        .map((item) => item.chain.chainId);

      const formattedNetworkList =
        networkList.length > 1
          ? `${networkList.slice(0, -1).join(', ')} and ${networkList[networkList.length - 1]}`
          : networkList[0];

      return {
        type: RemindType.WARNING,
        children: `Token creation on the ${formattedNetworkList} networks failed. Would you like to initiate the transaction again.`,
      };
    }
    return {
      isBorder: false,
      children: (
        <>
          <p>• Please approve the transaction in your wallet to create tokens on each chain.</p>
          <p>
            • If no wallet popup appears, please open your wallet manually to approve the
            transaction.
          </p>
        </>
      ),
    };
  }, [isWarning, stepItems]);

  const steps: ICommonStepsProps['stepItems'] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return stepItems.map(({ key, chain, ...rest }) => rest);
  }, [stepItems]);

  const renderContent = () => {
    return (
      <>
        <CommonSteps
          className={styles['creation-progress-steps']}
          direction="vertical"
          stepItems={steps}
          current={getCurrentChain()}
        />
        <Remind {...remindProps} className={styles['creation-progress-remind']} />
        {isWarning && (
          <div className={styles['creation-progress-button-wrapper']}>
            <CommonButton
              className={styles['creation-progress-button']}
              type={CommonButtonType.Secondary}
              onClick={handleCreateFinish}>
              Skip
            </CommonButton>
            <CommonButton className={styles['creation-progress-button']} onClick={onTryAgainClick}>
              Try again
            </CommonButton>
          </div>
        )}
      </>
    );
  };

  const commonProps = useMemo(() => {
    return {
      title: 'Token Creation in Progress',
      closable: false,
      open,
    };
  }, [open]);

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
