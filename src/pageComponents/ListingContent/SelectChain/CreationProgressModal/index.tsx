import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CommonDrawer from 'components/CommonDrawer';
import CommonModal from 'components/CommonModal';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';
import Remind, { RemindType } from 'components/Remind';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { useCommonState } from 'store/Provider/hooks';
import { useGetAllConnectedWalletAccount } from 'hooks/wallet';
import useEVM from 'hooks/wallet/useEVM';
import { getApplicationIssue, prepareBindIssue } from 'utils/api/application';
import { computeWalletSourceType } from 'utils/wallet';
import {
  ApplicationChainStatusEnum,
  TApplicationChainStatusItem,
  TPrepareBindIssueRequest,
} from 'types/api';
import { EVM_CREATE_TOKEN_CONTRACT_ADDRESS } from 'constants/wallet/EVM';
import styles from './styles.module.scss';

export interface ICreationProgressModalProps {
  open: boolean;
  chains: TApplicationChainStatusItem[];
  supply: string;
  handleCreateFinish: () => void;
}

type TTxHash = `0x${string}`;

type TChainItem = TApplicationChainStatusItem & {
  txHash?: TTxHash;
};

type TStepItem = ICommonStepsProps['stepItems'][number] & {
  chain: TChainItem;
};

const POLLING_INTERVAL = 15000;

export default function CreationProgressModal({
  open,
  chains,
  supply,
  handleCreateFinish,
}: ICreationProgressModalProps) {
  const getAllConnectedWalletAccount = useGetAllConnectedWalletAccount();
  const { accountListWithWalletType } = getAllConnectedWalletAccount();
  const { createToken, getTransactionReceipt } = useEVM();
  const { isPadPX } = useCommonState();
  const poolingTimerForTransactionResultRef = useRef<NodeJS.Timeout | null>(null);
  const poolingTimerForIssueResultRef = useRef<NodeJS.Timeout | null>(null);

  const [isCreateStart, setIsCreateStart] = useState(false);
  const [isPollingStart, setIsPollingStart] = useState(false);
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

  useEffect(() => {
    const list: TStepItem[] = chains.map((chain) => ({
      chain,
      title: `Creating token on ${chain.chainName}`,
    }));
    list.forEach((item) => {
      item.status = 'process';
      item.isLoading = true;
    });
    setStepItems(list);
  }, [open, chains]);

  useEffect(() => {
    if (open) {
      setIsCreateStart(true);
    }
  }, [open]);

  useEffect(() => {
    if (open && !isCreateStart && isCreateFinished) {
      handleCreateFinish();
    }
  }, [open, isCreateStart, isCreateFinished, handleCreateFinish]);

  useEffect(() => {
    if (!open) {
      setIsCreateStart(false);
      setIsPollingStart(false);
    }
  }, [open]);

  const handleStepItemChange = useCallback(
    ({
      step,
      status,
      params,
    }: {
      step: number;
      status?: ICommonStepsProps['stepItems'][number]['status'];
      params?: {
        bindingId?: string;
        thirdTokenId?: string;
        txHash?: TTxHash;
      };
    }) => {
      setStepItems((prev) => {
        const newStepItems = prev.map((item) => ({ ...item, chain: { ...item.chain } }));
        if (status) {
          newStepItems[step].status = status;
          newStepItems[step].isLoading = status === 'process';
        }
        if (params) {
          newStepItems[step].chain = {
            ...newStepItems[step].chain,
            ...params,
          };
        }
        return newStepItems;
      });
    },
    [],
  );

  const handlePrepareBindIssue = useCallback(
    async (chain: TChainItem) => {
      try {
        const sourceType = computeWalletSourceType(chain.chainId);
        const address = accountListWithWalletType.find(
          (item) => item.SourceType === sourceType,
        )?.Address;
        if (!address) {
          throw new Error('No address found');
        }
        const params: TPrepareBindIssueRequest = {
          address,
          symbol: chain.symbol,
          // TODO: chainId
          chainId: 'AELF',
          otherChainId: chain.chainId,
          // Currently only supports evm
          contractAddress: EVM_CREATE_TOKEN_CONTRACT_ADDRESS[chain.chainId],
          supply,
        };
        const id = await prepareBindIssue(params);
        if (!id) {
          throw new Error('Failed to prepare bind issue');
        }
        return id;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [accountListWithWalletType, supply],
  );

  const handleIssue = useCallback(
    async ({ chain }: { chain: TChainItem }) => {
      try {
        const txHash = await createToken({
          network: chain.chainId,
          // Currently only supports evm
          contractAddress: EVM_CREATE_TOKEN_CONTRACT_ADDRESS[chain.chainId],
          name: chain.tokenName,
          symbol: chain.symbol,
          initialSupply: Number(supply),
        });
        if (!txHash) {
          throw new Error('Failed to create token');
        }
        return txHash;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [createToken, supply],
  );

  const handlePollingForTransactionResult = useCallback(
    async (txHash?: TTxHash) => {
      if (!txHash) {
        return;
      }
      try {
        const data = await getTransactionReceipt({ txHash });
        if (data?.status !== 'success') {
          if (poolingTimerForTransactionResultRef.current) {
            clearTimeout(poolingTimerForTransactionResultRef.current);
          }
          poolingTimerForTransactionResultRef.current = setTimeout(async () => {
            await handlePollingForTransactionResult(txHash);
          }, POLLING_INTERVAL);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [getTransactionReceipt],
  );

  const handlePollingForIssueResult = useCallback(
    async ({ bindingId, thirdTokenId }: { bindingId?: string; thirdTokenId?: string }) => {
      if (!bindingId || !thirdTokenId) {
        return;
      }
      try {
        const isFinished = await getApplicationIssue({ bindingId, thirdTokenId });
        if (!isFinished) {
          if (poolingTimerForIssueResultRef.current) {
            clearTimeout(poolingTimerForIssueResultRef.current);
          }
          poolingTimerForIssueResultRef.current = setTimeout(async () => {
            await handlePollingForIssueResult({ bindingId, thirdTokenId });
          }, POLLING_INTERVAL);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [],
  );

  const handlePolling = useCallback(async () => {
    await Promise.all(
      stepItems.map(async (item, index) => {
        if (item.status === 'error' || item.status === 'finish') {
          return;
        }
        try {
          await handlePollingForTransactionResult(item.chain.txHash);
          await handlePollingForIssueResult({
            bindingId: item.chain.bindingId,
            thirdTokenId: item.chain.thirdTokenId,
          });
          handleStepItemChange({ step: index, status: 'finish' });
        } catch (error) {
          console.error(error);
          handleStepItemChange({ step: index, status: 'error' });
        }
      }),
    );
  }, [
    handlePollingForIssueResult,
    handlePollingForTransactionResult,
    handleStepItemChange,
    stepItems,
  ]);

  const handleCreate = useCallback(async () => {
    const create = async (step: number) => {
      try {
        const currentChain = stepItems[step].chain;
        if (currentChain.status === ApplicationChainStatusEnum.Unissued) {
          const { bindingId, thirdTokenId } = await handlePrepareBindIssue(currentChain);
          const txHash = await handleIssue({ chain: currentChain });
          handleStepItemChange({ step, params: { bindingId, thirdTokenId, txHash } });
        }
      } catch (error) {
        console.error(error);
        handleStepItemChange({ step, status: 'error' });
      }
    };

    for (let index = 0; index < stepItems.length; index++) {
      if (stepItems[index].status === 'finish') {
        continue;
      }
      await create(index);
    }
    setIsPollingStart(true);
  }, [stepItems, handlePrepareBindIssue, handleIssue, handleStepItemChange]);

  useEffect(() => {
    if (open && isCreateStart && stepItems.length > 0) {
      setIsCreateStart(false);
      handleCreate();
    }
  }, [handleCreate, isCreateStart, open, stepItems.length]);

  useEffect(() => {
    if (isPollingStart) {
      setIsPollingStart(false);
      handlePolling();
    }
  }, [isPollingStart, handlePolling]);

  const handleTryAgain = useCallback(() => {
    setStepItems((prev) => {
      const newStepItems = prev.map((item) => ({ ...item, chain: { ...item.chain } }));
      newStepItems.forEach((item) => {
        if (item.status === 'error') {
          item.status = 'process';
          item.isLoading = true;
        }
      });
      return newStepItems;
    });
    setIsCreateStart(true);
  }, []);

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
    return stepItems.map(({ chain, ...rest }) => rest);
  }, [stepItems]);

  const renderContent = () => {
    return (
      <>
        <CommonSteps
          className={styles['creation-progress-steps']}
          direction="vertical"
          hideLine
          stepItems={steps}
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
            <CommonButton className={styles['creation-progress-button']} onClick={handleTryAgain}>
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
