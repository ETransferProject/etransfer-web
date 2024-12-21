import { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import ViewProgress from 'pageComponents/ListingContent/ViewProgress';
import { LISTING_STEP_PATHNAME_MAP, ListingStep, VIEW_PROGRESS } from 'constants/listing';
import { useRouter } from 'next/navigation';
import { ApplicationChainStatusEnum } from 'types/api';
import { addApplicationChain } from 'utils/api/application';
import { useLoading } from 'store/Provider/hooks';
import { useEffectOnce } from 'react-use';

const TwoDaysTimestamp = 48 * 60 * 60 * 1000;

export default function ActionBox({
  symbol,
  tokenIcon,
  otherChainId,
  aelfChainIds = [],
  chainName,
  id,
  status,
  rejectedTime,
  resetList,
}: {
  symbol: string;
  tokenIcon?: string;
  otherChainId: string;
  aelfChainIds?: string[];
  chainName: string;
  id: string;
  status: ApplicationChainStatusEnum;
  rejectedTime?: number;
  resetList?: () => Promise<void>;
}) {
  const router = useRouter();
  const { setLoading } = useLoading();
  const [isReapplyDisable, setIsReapplyDisable] = useState(false);
  const [openViewProgress, setOpenViewProgress] = useState(false);

  const isSucceed = useMemo(() => {
    return status === ApplicationChainStatusEnum.Complete;
  }, [status]);

  const isFailed = useMemo(() => {
    return (
      status === ApplicationChainStatusEnum.Failed || status === ApplicationChainStatusEnum.Rejected
    );
  }, [status]);

  const isNeedInitTokenPool = useMemo(() => {
    return (
      status === ApplicationChainStatusEnum.PoolInitializing ||
      status === ApplicationChainStatusEnum.Reviewed
    );
  }, [status]);

  const handleViewProgress = useCallback(() => {
    setOpenViewProgress(true);
  }, []);

  const handleCloseViewProgress = useCallback(() => {
    setOpenViewProgress(false);
  }, []);

  const handleConfirmViewProgress = useCallback(() => {
    setOpenViewProgress(false);
  }, []);

  const handleInitializeTokenPool = useCallback(() => {
    router.push(
      `/listing/${
        LISTING_STEP_PATHNAME_MAP[ListingStep.INITIALIZE_LIQUIDITY_POOL]
      }?symbol=${symbol}&id=${id}`,
    );
  }, [id, router, symbol]);

  const handleLaunchOnOtherChain = useCallback(() => {
    router.push(`/listing/${LISTING_STEP_PATHNAME_MAP[ListingStep.SELECT_CHAIN]}?symbol=${symbol}`);
  }, [router, symbol]);

  const handleReapply = useCallback(async () => {
    try {
      setLoading(true);
      await addApplicationChain({
        symbol,
        chainIds: aelfChainIds,
        otherChainIds: [otherChainId],
      });

      await resetList?.();
    } catch (error) {
      console.log('>>>>>> handleReapply error ', error);
    } finally {
      setLoading(false);
    }
  }, [aelfChainIds, otherChainId, resetList, setLoading, symbol]);

  useEffectOnce(() => {
    if (rejectedTime && rejectedTime + TwoDaysTimestamp >= Date.now()) {
      setIsReapplyDisable(true);
    } else {
      setIsReapplyDisable(false);
    }
  });

  if (isSucceed) {
    return (
      <div className={styles['action']} onClick={handleLaunchOnOtherChain}>
        Launch on other chain
      </div>
    );
  }

  if (isFailed) {
    return (
      <div
        className={isReapplyDisable ? styles['action-disable'] : styles['action']}
        onClick={isReapplyDisable ? undefined : handleReapply}>
        Reapply
      </div>
    );
  }

  if (isNeedInitTokenPool) {
    return (
      <div className={styles['action']} onClick={handleInitializeTokenPool}>
        Initialize token pool
      </div>
    );
  }

  return (
    <>
      <div className={styles['action']} onClick={handleViewProgress}>
        {VIEW_PROGRESS}
      </div>
      <ViewProgress
        open={openViewProgress}
        status={status}
        tokenSymbol={symbol}
        tokenIcon={tokenIcon}
        chainName={chainName}
        onClose={handleCloseViewProgress}
        onConfirm={handleConfirmViewProgress}
      />
    </>
  );
}
