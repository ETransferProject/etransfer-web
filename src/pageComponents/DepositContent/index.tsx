import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import WebDepositContent from './WebDepositContent';
import MobileDepositContent from './MobileDepositContent';
import { useAppDispatch, useCommonState, useDepositState, useLoading } from 'store/Provider/hooks';
import {
  BusinessType,
  TDepositInfo,
  TGetNetworkListRequest,
  TNetworkItem,
  TDepositTokenItem,
  NetworkStatus,
  TToTokenItem,
} from 'types/api';
import { getDepositInfo, getNetworkList } from 'utils/api/deposit';
import { CHAIN_LIST, IChainNameItem, SupportedELFChainId } from 'constants/index';
import {
  setDepositAddress,
  setFromNetwork,
  setFromNetworkList,
} from 'store/reducers/deposit/slice';
import { useEffectOnce } from 'react-use';
import singleMessage from 'components/SingleMessage';
import { InitDepositInfo } from 'constants/deposit';
import { CommonErrorNameType } from 'api/types';
import { handleErrorMessage } from '@portkey/did-ui-react';
import myEvents from 'utils/myEvent';
import { isAuthTokenError } from 'utils/api/error';
import { useSetCurrentChainItem } from 'hooks/common';
import { SideMenuKey } from 'constants/home';

export type TDepositContentProps = {
  fromNetworkSelected?: TNetworkItem;
  fromTokenSelected?: TDepositTokenItem;
  depositInfo: TDepositInfo;
  contractAddress: string;
  contractAddressLink: string;
  qrCodeValue: string;
  tokenLogoUrl?: string;
  showRetry?: boolean;
  isShowNetworkLoading?: boolean;
  toTokenSelected?: TToTokenItem;
  onRetry?: () => void;
  fromNetworkChanged: (item: TNetworkItem) => Promise<void>;
  fromTokenChanged: (item: TDepositTokenItem) => void;
  toChainChanged: (item: IChainNameItem) => void;
  toTokenSelectCallback: (item: TDepositTokenItem | TToTokenItem) => void;
};

export default function Content() {
  const dispatch = useAppDispatch();
  const { isMobilePX } = useCommonState();
  // const deposit = useDepositState();
  const {
    fromNetwork,
    fromNetworkList,
    fromTokenList,
    fromTokenSymbol,
    toChainItem,
    toTokenList,
    toTokenSymbol,
  } = useDepositState();
  const { setLoading } = useLoading();
  const [isShowNetworkLoading, setIsShowNetworkLoading] = useState(false);
  // const [fromNetwork, setFromNetwork] = useState<TNetworkItem>();
  const fromNetworkRef = useRef<TNetworkItem>();
  const [depositInfo, setDepositInfo] = useState<TDepositInfo>(InitDepositInfo);
  const [showRetry, setShowRetry] = useState(false);

  const fromTokenSelected = useMemo(() => {
    return fromTokenList?.find((item) => item.symbol === fromTokenSymbol);
  }, [fromTokenList, fromTokenSymbol]);

  const toTokenSelected = useMemo(() => {
    return toTokenList?.find((item) => item.symbol === toTokenSymbol);
  }, [toTokenList, toTokenSymbol]);

  const getDepositData = useCallback(
    async (chainId: SupportedELFChainId, symbol: string) => {
      try {
        setLoading(true);
        if (!fromNetworkRef.current?.network) return;
        const res = await getDepositInfo({
          chainId,
          network: fromNetworkRef.current?.network || '',
          symbol,
        });
        setShowRetry(false);
        setLoading(false);
        setDepositInfo(res.depositInfo);
        dispatch(setDepositAddress(res.depositInfo.depositAddress));
      } catch (error: any) {
        setLoading(false);
        setDepositInfo(InitDepositInfo);
        dispatch(setDepositAddress(InitDepositInfo.depositAddress));
        if (error.name !== CommonErrorNameType.CANCEL && error.code === '50000') {
          setShowRetry(true);
        } else {
          setShowRetry(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch, setLoading],
  );

  const getNetworkData = useCallback(
    async ({ chainId, symbol }: Omit<TGetNetworkListRequest, 'type'>) => {
      try {
        const lastSymbol = symbol || fromTokenSymbol;
        setIsShowNetworkLoading(true);
        const { networkList } = await getNetworkList({
          type: BusinessType.Deposit,
          chainId: chainId,
          symbol: symbol,
        });
        dispatch(setFromNetworkList(networkList));
        if (networkList?.length === 1 && networkList[0].status !== NetworkStatus.Offline) {
          fromNetworkRef.current = networkList[0];
          dispatch(setFromNetwork(networkList[0]));

          await getDepositData(toChainItem.key, lastSymbol);
        } else {
          const exitNetwork = networkList.filter(
            (item) => item.network === fromNetworkRef.current?.network,
          );
          if (exitNetwork?.length === 0) {
            fromNetworkRef.current = undefined;
            dispatch(setFromNetwork(undefined));
          }
        }
        setIsShowNetworkLoading(false);
      } catch (error: any) {
        setIsShowNetworkLoading(false);
        if (error.name !== CommonErrorNameType.CANCEL && !isAuthTokenError(error)) {
          singleMessage.error(handleErrorMessage(error));
        }
      } finally {
        setIsShowNetworkLoading(false);
      }
    },
    [dispatch, fromTokenSymbol, getDepositData, toChainItem.key],
  );

  const setCurrentChainItem = useSetCurrentChainItem();
  const handleToChainChanged = useCallback(
    async (item: IChainNameItem) => {
      // if currentSymbol is empty, don't send request
      setCurrentChainItem(CHAIN_LIST[1], SideMenuKey.Deposit);
      fromTokenSymbol &&
        (await getNetworkData({
          chainId: item.key,
          symbol: fromTokenSymbol,
        }));
      if (!fromNetworkRef.current?.network) return;
      await getDepositData(item.key, fromTokenSymbol);
    },
    [fromTokenSymbol, getDepositData, getNetworkData, setCurrentChainItem],
  );

  const handleFromNetworkChanged = useCallback(
    async (item: TNetworkItem) => {
      fromNetworkRef.current = item;
      dispatch(setFromNetwork(item));
      await getDepositData(toChainItem.key, fromTokenSymbol);
    },
    [dispatch, fromTokenSymbol, getDepositData, toChainItem.key],
  );

  const handleRetry = useCallback(async () => {
    await getDepositData(toChainItem.key, fromTokenSymbol);
  }, [fromTokenSymbol, getDepositData, toChainItem.key]);

  const handleFromTokenChange = async (item: TDepositTokenItem) => {
    fromNetworkRef.current = undefined;
    dispatch(setFromNetwork(undefined));
    setDepositInfo(InitDepositInfo);
    dispatch(setDepositAddress(InitDepositInfo.depositAddress));
    setShowRetry(false);
    await getNetworkData({
      chainId: toChainItem.key,
      symbol: item.symbol,
    });
  };

  const handleToTokenSelectCallback = useCallback((val: any) => {
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 handleToTokenSelectCallback', val);
  }, []);

  const init = useCallback(() => {
    if (fromNetwork?.network && fromNetworkList && fromNetworkList?.length > 0) {
      fromNetworkRef.current = fromNetwork;

      getDepositData(toChainItem.key, fromTokenSymbol);
    } else {
      if (fromTokenSymbol) {
        getNetworkData({
          chainId: toChainItem.key,
          symbol: fromTokenSymbol,
        });
      }
    }
  }, [
    fromNetwork,
    fromNetworkList,
    fromTokenSymbol,
    getDepositData,
    getNetworkData,
    toChainItem.key,
  ]);

  useEffectOnce(() => {
    init();
  });

  useEffect(() => {
    const { remove } = myEvents.AuthTokenSuccess.addListener(() => {
      console.log('login success');
      init();
    });
    return () => {
      remove();
    };
  }, [init]);

  return isMobilePX ? (
    <MobileDepositContent
      fromNetworkSelected={fromNetwork}
      fromTokenSelected={fromTokenSelected}
      tokenLogoUrl={fromTokenSelected?.icon}
      contractAddress={fromNetwork?.contractAddress || ''}
      contractAddressLink={fromNetwork?.explorerUrl || ''}
      toTokenSelected={toTokenSelected}
      depositInfo={depositInfo}
      qrCodeValue={depositInfo.depositAddress}
      showRetry={showRetry}
      isShowNetworkLoading={isShowNetworkLoading}
      onRetry={handleRetry}
      fromNetworkChanged={handleFromNetworkChanged}
      fromTokenChanged={handleFromTokenChange}
      toTokenSelectCallback={handleToTokenSelectCallback}
      toChainChanged={handleToChainChanged}
    />
  ) : (
    <WebDepositContent
      fromTokenSelected={fromTokenSelected}
      tokenLogoUrl={fromTokenSelected?.icon}
      fromNetworkSelected={fromNetwork}
      contractAddress={fromNetwork?.contractAddress || ''}
      contractAddressLink={fromNetwork?.explorerUrl || ''}
      toTokenSelected={toTokenSelected}
      depositInfo={depositInfo}
      qrCodeValue={depositInfo.depositAddress}
      showRetry={showRetry}
      isShowNetworkLoading={isShowNetworkLoading}
      onRetry={handleRetry}
      fromNetworkChanged={handleFromNetworkChanged}
      fromTokenChanged={handleFromTokenChange}
      toTokenSelectCallback={handleToTokenSelectCallback}
      toChainChanged={handleToChainChanged}
    />
  );
}
