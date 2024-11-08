import { useEffectOnce } from 'react-use';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import WebCrossChainTransfer from './WebCrossChainTransfer';
import MobileCrossChainTransfer from './MobileCrossChainTransfer';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function CrossChainTransferPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();

  const router = useRouter();
  const handleClickProcessingTip = useCallback(() => {
    router.push('/history');
  }, [router]);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.CrossChainTransfer));
  });

  return isPadPX ? (
    <MobileCrossChainTransfer onClickProcessingTip={handleClickProcessingTip} />
  ) : (
    <WebCrossChainTransfer onClickProcessingTip={handleClickProcessingTip} />
  );
}
