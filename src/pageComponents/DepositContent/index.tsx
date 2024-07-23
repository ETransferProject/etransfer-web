import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import WebDepositContent from './WebDepositContent';
import MobileDepositContent from './MobileDepositContent';
import { useAppDispatch, useCommonState, useDepositState, useLoading } from 'store/Provider/hooks';
import {
  BusinessType,
  TDepositInfo,
  TNetworkItem,
  TDepositTokenItem,
  NetworkStatus,
  TToTokenItem,
} from 'types/api';
import { getDepositInfo, getDepositTokenList, getNetworkList } from 'utils/api/deposit';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import {
  setDepositAddress,
  setFromNetwork,
  setFromNetworkList,
  setFromTokenList,
  setFromTokenSymbol,
  setToChainItem,
  setToChainList,
  setToTokenList,
  setToTokenSymbol,
} from 'store/reducers/deposit/slice';
import { useEffectOnce } from 'react-use';
import singleMessage from 'components/SingleMessage';
import { InitDepositInfo } from 'constants/deposit';
import { CommonErrorNameType } from 'api/types';
import { handleErrorMessage } from '@etransfer/utils';
import myEvents from 'utils/myEvent';
import { isAuthTokenError } from 'utils/api/error';
import { SideMenuKey } from 'constants/home';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey } from 'store/reducers/common/slice';

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

type TGetNetworkData = {
  chainId: TChainId;
  symbol?: string;
  toSymbol?: string;
};

export default function Content() {
  const dispatch = useAppDispatch();
  const { isPadPX } = useCommonState();
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
  const fromNetworkRef = useRef<string>();
  const [depositInfo, setDepositInfo] = useState<TDepositInfo>(InitDepositInfo);
  const [showRetry, setShowRetry] = useState(false);

  const fromTokenSelected = useMemo(() => {
    return fromTokenList?.find((item) => item.symbol === fromTokenSymbol) || fromTokenList?.[0];
  }, [fromTokenList, fromTokenSymbol]);

  const toTokenSelected = useMemo(() => {
    return toTokenList?.find((item) => item.symbol === toTokenSymbol) || toTokenList?.[0];
  }, [toTokenList, toTokenSymbol]);

  const getTokenList = useCallback(
    async (chainId: TChainId, fromSymbol: string, toSymbol: string) => {
      try {
        setLoading(true);
        const { tokenList } = await getDepositTokenList({
          type: BusinessType.Deposit,
        });
        // Format fromTokenList - add chainList for toTokenList
        const fromTokenList: TDepositTokenItem[] = JSON.parse(JSON.stringify(tokenList));
        fromTokenList.forEach((from) => {
          from.toTokenList?.forEach((to) => {
            const toChainList: IChainNameItem[] = [];
            to?.chainIdList?.forEach((item) => {
              if (item === CHAIN_LIST[0].key) {
                toChainList.push(CHAIN_LIST[0]);
              }
              if (item === CHAIN_LIST[1].key) {
                toChainList.push(CHAIN_LIST[1]);
              }
            });
            to.chainList = toChainList;
          });
        });

        // Handle fromTokenList and fromToken
        dispatch(setFromTokenList(fromTokenList));
        const isExitFromTokenSelected = fromTokenList?.find((item) => item.symbol === fromSymbol);
        const currentFromTokenSelected =
          isExitFromTokenSelected?.symbol || fromTokenList?.[0].symbol;
        const currentToTokenList: TToTokenItem[] =
          isExitFromTokenSelected?.toTokenList || fromTokenList?.[0]?.toTokenList || [];

        if (!isExitFromTokenSelected?.symbol) {
          dispatch(setFromTokenSymbol(currentFromTokenSelected));
        }

        // Handle toTokenList and toToken
        dispatch(setToTokenList(currentToTokenList));
        const isExitToTokenSelected = currentToTokenList?.find((item) => item.symbol === toSymbol);

        if (isExitToTokenSelected?.symbol) {
          const isExitChain = isExitToTokenSelected?.chainList?.find(
            (item) => item.key === chainId,
          );
          if (!isExitChain) {
            dispatch(setToChainItem(isExitToTokenSelected?.chainList?.[0] || CHAIN_LIST[0]));
          }
          dispatch(setToChainList(isExitToTokenSelected.chainList || []));
        } else {
          const toToken = currentToTokenList?.[0] || [];
          const tempChainList = toToken?.chainList;
          dispatch(setToTokenSymbol(toToken?.symbol));
          dispatch(setToChainList(tempChainList || []));
          dispatch(setToChainItem(tempChainList?.[0] || CHAIN_LIST[0]));
        }
      } catch (error) {
        console.log('getTokenList error', error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, setLoading],
  );

  const getDepositData = useCallback(
    async (chainId: TChainId, symbol: string, toSymbol: string) => {
      try {
        if (!fromNetworkRef.current) return;
        setLoading(true);
        const res = await getDepositInfo({
          chainId,
          network: fromNetworkRef.current || '',
          symbol,
          toSymbol,
        });
        setShowRetry(false);
        setLoading(false);
        setDepositInfo(res.depositInfo);
        dispatch(setDepositAddress(res.depositInfo.depositAddress));
      } catch (error: any) {
        if (error.name !== CommonErrorNameType.CANCEL && error.code === '50000') {
          setShowRetry(true);
        } else {
          setShowRetry(false);
        }
        if (error.name !== CommonErrorNameType.CANCEL) {
          setDepositInfo(InitDepositInfo);
          dispatch(setDepositAddress(InitDepositInfo.depositAddress));
          setLoading(false);
        }
      }
    },
    [dispatch, setLoading],
  );

  const getNetworkData = useCallback(
    async ({ chainId, symbol, toSymbol }: TGetNetworkData) => {
      try {
        setIsShowNetworkLoading(true);
        const lastSymbol = symbol || fromTokenSymbol;
        const lastToSymbol = toSymbol || toTokenSymbol;
        const { networkList } = await getNetworkList({
          type: BusinessType.Deposit,
          chainId: chainId,
          symbol: symbol,
        });
        dispatch(setFromNetworkList(networkList));
        if (networkList?.length === 1 && networkList[0].status !== NetworkStatus.Offline) {
          fromNetworkRef.current = networkList[0].network;
          dispatch(setFromNetwork(networkList[0]));
        } else {
          const exitNetwork = networkList.find((item) => item.network === fromNetworkRef.current);
          if (!exitNetwork?.network) {
            fromNetworkRef.current = undefined;
            dispatch(setFromNetwork(undefined));
            return;
          } else {
            if (exitNetwork.status !== NetworkStatus.Offline) {
              dispatch(setFromNetwork(exitNetwork));
            } else {
              fromNetworkRef.current = undefined;
              dispatch(setFromNetwork(undefined));
            }
          }
        }
        !isPadPX && (await getDepositData(chainId, lastSymbol, lastToSymbol));
      } catch (error: any) {
        setIsShowNetworkLoading(false);
        if (error.name !== CommonErrorNameType.CANCEL && !isAuthTokenError(error)) {
          singleMessage.error(handleErrorMessage(error));
        }
      } finally {
        setIsShowNetworkLoading(false);
      }
    },
    [dispatch, fromTokenSymbol, getDepositData, isPadPX, toTokenSymbol],
  );

  const handleFromTokenChange = async (newItem: TDepositTokenItem) => {
    // Set fromToken
    dispatch(setFromTokenSymbol(newItem.symbol));
    dispatch(setToTokenList(newItem.toTokenList || []));

    let toSymbol = toTokenSymbol;
    let toChain = toChainItem;
    // Check 1 - toToken
    const isExitToToken = newItem.toTokenList?.find((item) => item.symbol === toTokenSymbol);
    // toToken not exist, toToken = fromToken
    if (!isExitToToken) {
      toSymbol = newItem.symbol;
      dispatch(setToTokenSymbol(newItem.symbol));
      // Check 2 - toChain
      const isExitToChain = newItem?.toTokenList?.find((item) =>
        item.chainIdList?.includes(toChainItem.key),
      );
      if (!isExitToChain) {
        toChain = newItem?.toTokenList?.[0]?.chainList?.[0] || CHAIN_LIST[0];
      }
      dispatch(setToChainItem(toChain));
      dispatch(setToChainList(newItem?.toTokenList?.[0]?.chainList || []));
    }
    // toToken exist, next check
    if (isExitToToken) {
      // Check 2 - toChain
      const isExitToChain = isExitToToken.chainList?.find((item) => item.key === toChainItem.key);
      // toChain not exist, set toChain and toChainList
      if (!isExitToChain) {
        toChain = isExitToToken.chainList?.[0] || CHAIN_LIST[0];
        dispatch(setToChainItem(toChain));
      }
      // toChain exist, set and toChainList
      dispatch(setToChainList(isExitToToken.chainList || []));
    }

    // Reset other data
    setDepositInfo(InitDepositInfo);
    dispatch(setDepositAddress(InitDepositInfo.depositAddress));
    setShowRetry(false);

    // Refresh network and deposit info
    await getNetworkData({
      chainId: toChain.key,
      symbol: newItem.symbol,
      toSymbol,
    });
  };

  const handleFromNetworkChanged = useCallback(
    async (item: TNetworkItem) => {
      fromNetworkRef.current = item.network;
      dispatch(setFromNetwork(item));
      !isPadPX && (await getDepositData(toChainItem.key, fromTokenSymbol, toTokenSymbol));
    },
    [dispatch, fromTokenSymbol, getDepositData, isPadPX, toChainItem.key, toTokenSymbol],
  );

  const handleToTokenChange = useCallback(
    async (newItem: TToTokenItem) => {
      dispatch(setToTokenSymbol(newItem.symbol));
      dispatch(setToChainList(newItem.chainList || []));

      // Check - to chain
      let optionChainId = toChainItem.key;
      const isExitChain = newItem?.chainList?.find((item) => item.key === toChainItem.key);
      if (!isExitChain) {
        const chainItem = newItem?.chainList?.[0] || CHAIN_LIST[0];
        dispatch(setToChainItem(chainItem));
        optionChainId = chainItem.key;
        // toChain changed, need refresh network and deposit info.
        return getNetworkData({
          chainId: optionChainId,
          symbol: fromTokenSymbol,
          toSymbol: newItem.symbol,
        });
      }
      // toChain and fromToken not changed, refresh deposit info.
      return !isPadPX && getDepositData(optionChainId, fromTokenSymbol, newItem.symbol);
    },
    [dispatch, fromTokenSymbol, getDepositData, getNetworkData, isPadPX, toChainItem.key],
  );

  const handleToChainChanged = useCallback(
    async (item: IChainNameItem) => {
      // if currentSymbol is empty, don't send request
      dispatch(setToChainItem(item));
      if (fromTokenSymbol) {
        await getNetworkData({
          chainId: item.key,
          symbol: fromTokenSymbol,
        });
      }
    },
    [dispatch, fromTokenSymbol, getNetworkData],
  );

  const handleNext = useCallback(async () => {
    await getDepositData(toChainItem.key, fromTokenSymbol, toTokenSymbol);
  }, [fromTokenSymbol, getDepositData, toChainItem.key, toTokenSymbol]);

  const handleRetry = useCallback(async () => {
    await getDepositData(toChainItem.key, fromTokenSymbol, toTokenSymbol);
  }, [fromTokenSymbol, getDepositData, toChainItem.key, toTokenSymbol]);

  const searchParams = useSearchParams();
  const routeQuery = useMemo(
    () => ({
      type: searchParams.get('type') as SideMenuKey,
      chainId: searchParams.get('chainId'),
      tokenSymbol: searchParams.get('tokenSymbol'),
      depositToToken: searchParams.get('depositToToken'),
      depositFromNetwork: searchParams.get('depositFromNetwork'),
    }),
    [searchParams],
  );
  const init = useCallback(async () => {
    let chainId = toChainItem.key;
    let fromSymbol = fromTokenSymbol;
    let toSymbol = toTokenSymbol;
    let routeNetworkRef = '';

    if (routeQuery.chainId) {
      const chainItem = CHAIN_LIST.find((item) => item.key === routeQuery.chainId);
      if (chainItem) {
        chainId = chainItem.key;
        dispatch(setToChainItem(chainItem));
      }
    }
    if (routeQuery.tokenSymbol) {
      fromSymbol = routeQuery.tokenSymbol;
      dispatch(setFromTokenSymbol(routeQuery.tokenSymbol));
    }
    if (routeQuery.depositToToken) {
      toSymbol = routeQuery.depositToToken;
      dispatch(setToTokenSymbol(routeQuery.depositToToken));
    }
    if (routeQuery.depositFromNetwork) {
      routeNetworkRef = routeQuery.depositFromNetwork;
      fromNetworkRef.current = routeQuery.depositFromNetwork;
      dispatch(setFromNetwork(undefined));
      dispatch(setFromNetworkList([]));
    }

    await getTokenList(chainId, fromSymbol, toSymbol);

    if (
      !routeNetworkRef &&
      fromNetwork?.network &&
      fromNetworkList &&
      fromNetworkList?.length > 0
    ) {
      fromNetworkRef.current = fromNetwork.network;
    }

    // get new network data, when refresh page and switch side menu
    await getNetworkData({ chainId, symbol: fromSymbol, toSymbol });
  }, [
    dispatch,
    fromNetwork,
    fromNetworkList,
    fromTokenSymbol,
    getNetworkData,
    getTokenList,
    routeQuery.chainId,
    routeQuery.depositFromNetwork,
    routeQuery.depositToToken,
    routeQuery.tokenSymbol,
    toChainItem.key,
    toTokenSymbol,
  ]);

  const router = useRouter();
  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.Deposit));
    init();

    router.replace('/deposit');
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

  return isPadPX ? (
    <MobileDepositContent
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
      toTokenSelectCallback={handleToTokenChange}
      toChainChanged={handleToChainChanged}
      onNext={handleNext}
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
      toTokenSelectCallback={handleToTokenChange}
      toChainChanged={handleToChainChanged}
    />
  );
}
