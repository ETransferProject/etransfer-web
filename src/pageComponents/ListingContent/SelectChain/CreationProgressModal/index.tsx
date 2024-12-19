import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SingleMessage } from '@etransfer/ui-react';
import { handleErrorMessage } from '@etransfer/utils';
import CommonDrawer from 'components/CommonDrawer';
import CommonModal from 'components/CommonModal';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';
import Remind, { RemindType } from 'components/Remind';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import ListingTip from 'pageComponents/ListingContent/ListingTip';
import { useCommonState } from 'store/Provider/hooks';
import { useGetAllConnectedWalletAccount } from 'hooks/wallet';
import useEVM from 'hooks/wallet/useEVM';
import { getApplicationIssue, prepareBindIssue } from 'utils/api/application';
import { computeWalletSourceType } from 'utils/wallet';
import { getTransactionReceiptAutoRetry } from 'utils/evm';
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
  isCreated?: boolean;
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
  const { createToken, getCurrentChainInfo } = useEVM();
  const { isPadPX } = useCommonState();
  const poolingTimerForIssueResultRef = useRef<Record<string, NodeJS.Timeout | null>>({});

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
    return stepItems.length > 0 && stepItems.every((item) => item.status === 'finish');
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
        isCreated?: boolean;
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
          (item) => item.SourceType === sourceType.toLocaleLowerCase(),
        )?.Address;
        if (!address) {
          throw new Error('No address found');
        }
        const params: TPrepareBindIssueRequest = {
          address,
          symbol: chain.symbol,
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
      } catch (error: any) {
        error.shouldShowMessage = true;
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

  const handlePollingForIssueResult = useCallback(
    async ({ bindingId, thirdTokenId }: { bindingId?: string; thirdTokenId?: string }) => {
      if (!bindingId || !thirdTokenId) {
        return Promise.resolve();
      }
      try {
        const isFinished = await getApplicationIssue({ bindingId, thirdTokenId });
        if (!isFinished) {
          if (poolingTimerForIssueResultRef.current[bindingId]) {
            clearTimeout(poolingTimerForIssueResultRef.current[bindingId]);
          }
          return new Promise<void>((resolve) => {
            poolingTimerForIssueResultRef.current[bindingId] = setTimeout(async () => {
              await handlePollingForIssueResult({ bindingId, thirdTokenId });
              resolve();
            }, POLLING_INTERVAL);
          });
        }
      } catch (error: any) {
        error.shouldShowMessage = true;
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
          if (item.chain.txHash) {
            const chain = await getCurrentChainInfo(item.chain.chainId);
            if (chain) {
              await getTransactionReceiptAutoRetry({
                hash: item.chain.txHash,
                chainId: chain.id,
              });
            }
          }
          await handlePollingForIssueResult({
            bindingId: item.chain.bindingId,
            thirdTokenId: item.chain.thirdTokenId,
          });
          handleStepItemChange({ step: index, status: 'finish' });
        } catch (error: any) {
          if (error.shouldShowMessage) {
            SingleMessage.error(handleErrorMessage(error));
          }
          handleStepItemChange({ step: index, status: 'error' });
        }
      }),
    );
  }, [handlePollingForIssueResult, handleStepItemChange, getCurrentChainInfo, stepItems]);

  const handleCreate = useCallback(async () => {
    const create = async (step: number) => {
      try {
        const currentChain = stepItems[step].chain;
        if (currentChain.status === ApplicationChainStatusEnum.Unissued) {
          const txHash = await handleIssue({ chain: currentChain });
          const { bindingId, thirdTokenId } = await handlePrepareBindIssue(currentChain);
          handleStepItemChange({
            step,
            params: { bindingId, thirdTokenId, txHash, isCreated: true },
          });
        }
      } catch (error: any) {
        if (error.shouldShowMessage) {
          SingleMessage.error(handleErrorMessage(error));
        }
        handleStepItemChange({ step, status: 'error' });
      }
    };

    for (let index = 0; index < stepItems.length; index++) {
      if (stepItems[index].status === 'finish' || stepItems[index].chain.isCreated) {
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

  const steps: ICommonStepsProps['stepItems'] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return stepItems.map(({ chain, ...rest }) => rest);
  }, [stepItems]);

  const renderContent = () => {
    const networkList = stepItems
      .filter((item) => item.status === 'error')
      .map((item) => item.chain.chainId);

    const formattedNetworkList =
      networkList.length > 1
        ? `${networkList.slice(0, -1).join(', ')} and ${networkList[networkList.length - 1]}`
        : networkList[0];

    return (
      <>
        <CommonSteps
          className={styles['creation-progress-steps']}
          direction="vertical"
          hideLine
          stepItems={steps}
        />
        {isWarning && (
          <>
            <Remind type={RemindType.WARNING} className={styles['creation-progress-remind']}>
              {`Token creation on the ${formattedNetworkList} networks failed. Would you like to initiate the transaction again.`}
            </Remind>
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
          </>
        )}
      </>
    );
  };

  const commonProps = useMemo(() => {
    return {
      title: (
        <div className={styles['creation-progress-title-wrapper']}>
          <span className={styles['creation-progress-title']}>Token Creation in Progress</span>
          <ListingTip
            tip={
              <>
                <p>Tips:</p>
                <ul className="list-style-decimal">
                  <li>
                    Please approve the transaction in your wallet to create tokens on each chain.
                  </li>
                  <li>
                    If no wallet popup appears, please open your wallet manually to approve the
                    transaction.
                  </li>
                </ul>
              </>
            }
          />
        </div>
      ),
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
