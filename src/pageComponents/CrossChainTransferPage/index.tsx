import { useEffectOnce } from 'react-use';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { useAppDispatch, useCommonState, useCrossChainTransfer } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import WebCrossChainTransfer from './WebCrossChainTransfer';
import MobileCrossChainTransfer from './MobileCrossChainTransfer';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { BusinessType, NetworkStatus } from 'types/api';
import { getNetworkList, getTokenList } from 'utils/api/deposit';
import {
  setFromNetwork,
  setFromNetworkList,
  setTokenList,
  setTokenSymbol,
  setToNetwork,
  setToNetworkList,
  setTotalNetworkList,
} from 'store/reducers/crossChainTransfer/slice';

export default function CrossChainTransferPage() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
  const { fromNetwork, toNetwork, tokenSymbol } = useCrossChainTransfer();

  const getTokenData = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      try {
        const res = await getTokenList({
          type: BusinessType.Withdraw,
        });

        dispatch(setTokenList(res.tokenList));

        if (isInitCurrentSymbol && !tokenSymbol) {
          dispatch(setTokenSymbol(res.tokenList[0].symbol));
        } else {
          const exitToken = res.tokenList.find((item) => item.symbol === tokenSymbol);
          if (exitToken) {
            dispatch(setTokenSymbol(exitToken.symbol));
          } else {
            dispatch(setTokenSymbol(''));
          }
        }
        return res.tokenList;
      } catch (error) {
        console.log('getTokenData error', error);
        return [];
      }
    },
    [dispatch, tokenSymbol],
  );

  const getNetworkData = useCallback(async () => {
    try {
      const { networkList } = await getNetworkList({ type: BusinessType.Transfer });

      dispatch(setTotalNetworkList(networkList));

      dispatch(setFromNetworkList(networkList));
      dispatch(setToNetworkList(networkList));

      if (networkList?.length > 0) {
        // from logic
        const exitFromNetwork = networkList.find((item) => item.network === fromNetwork?.network);
        if (exitFromNetwork && exitFromNetwork.status !== NetworkStatus.Offline) {
          dispatch(setFromNetwork(exitFromNetwork));
        } else {
          dispatch(setFromNetwork(networkList[0]));
        }

        // to logic
        const exitToNetwork = networkList.find((item) => item.network === toNetwork?.network);
        if (exitToNetwork && exitToNetwork.status !== NetworkStatus.Offline) {
          dispatch(setToNetwork(exitToNetwork));
        } else {
          dispatch(setToNetwork(networkList[0]));
        }
      } else {
        dispatch(setFromNetwork(undefined));
        dispatch(setToNetwork(undefined));
      }
    } catch (error: any) {
      console.log('getNetworkData error', error);
    }
  }, [dispatch, fromNetwork?.network, toNetwork?.network]);

  const router = useRouter();
  const handleClickProcessingTip = useCallback(() => {
    router.push('/history');
  }, [router]);

  const init = useCallback(async () => {
    await getNetworkData();
    await getTokenData();
  }, [getNetworkData, getTokenData]);

  useEffect(() => {
    init();
  }, [init]);

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.CrossChainTransfer));
  });

  return isPadPX ? (
    <MobileCrossChainTransfer onClickProcessingTip={handleClickProcessingTip} />
  ) : (
    <WebCrossChainTransfer onClickProcessingTip={handleClickProcessingTip} />
  );
}
