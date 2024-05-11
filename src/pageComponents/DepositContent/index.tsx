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
import { CHAIN_LIST, IChainNameItem, TokenType } from 'constants/index';
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
import { handleErrorMessage } from '@portkey/did-ui-react';
import myEvents from 'utils/myEvent';
import { isAuthTokenError } from 'utils/api/error';
import { useSetCurrentChainItem } from 'hooks/common';
import { SideMenuKey } from 'constants/home';
import { ChainId } from '@portkey/provider-types';

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
  chainId: ChainId;
  symbol?: string;
  toSymbol?: string;
};

export default function Content() {
  const dispatch = useAppDispatch();
  const { isMobilePX } = useCommonState();
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
  const fromNetworkRef = useRef<TNetworkItem>();
  const [depositInfo, setDepositInfo] = useState<TDepositInfo>(InitDepositInfo);
  const [showRetry, setShowRetry] = useState(false);

  const fromTokenSelected = useMemo(() => {
    return fromTokenList?.find((item) => item.symbol === fromTokenSymbol) || fromTokenList?.[0];
  }, [fromTokenList, fromTokenSymbol]);

  const toTokenSelected = useMemo(() => {
    return toTokenList?.find((item) => item.symbol === toTokenSymbol) || toTokenList?.[0];
  }, [toTokenList, toTokenSymbol]);

  const getTokenList = useCallback(async () => {
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
      const isExitFromTokenSelected = fromTokenList?.find(
        (item) => item.symbol === fromTokenSymbol,
      );
      if (!isExitFromTokenSelected?.symbol) {
        dispatch(setFromTokenSymbol(fromTokenList?.[0].symbol));
      }
      // Handle toTokenList and toToken
      const toTokenList =
        fromTokenList?.find((item) => item.symbol === TokenType.USDT)?.toTokenList ||
        fromTokenList[0]?.toTokenList ||
        [];
      dispatch(setToTokenList(toTokenList));
      const isExitToTokenSelected = toTokenList?.find((item) => item.symbol === toTokenSymbol);
      if (isExitToTokenSelected?.symbol) {
        dispatch(setToChainList(isExitToTokenSelected?.chainList || []));
        const isExitChain = isExitToTokenSelected?.chainList?.find(
          (item) => item.key === toChainItem.key,
        );
        if (!isExitChain) {
          dispatch(setToChainItem(isExitToTokenSelected?.chainList?.[0] || CHAIN_LIST[0]));
        }
      } else {
        const toToken = toTokenList?.[0] || [];
        dispatch(setToTokenSymbol(toToken?.symbol));
        dispatch(setToChainList(toToken?.chainList || []));
        dispatch(setToChainItem(toToken?.chainList?.[0] || CHAIN_LIST[0]));
      }
    } catch (error) {
      console.log('getTokenList error', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, fromTokenSymbol, setLoading, toChainItem.key, toTokenSymbol]);

  const getDepositData = useCallback(
    async (chainId: ChainId, symbol: string, toSymbol: string) => {
      try {
        if (!fromNetworkRef.current?.network) return;
        setLoading(true);
        const res = await getDepositInfo({
          chainId,
          network: fromNetworkRef.current?.network || '',
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
          fromNetworkRef.current = networkList[0];
          dispatch(setFromNetwork(networkList[0]));
        } else {
          const exitNetwork = networkList.filter(
            (item) => item.network === fromNetworkRef.current?.network,
          );
          if (exitNetwork?.length === 0) {
            fromNetworkRef.current = undefined;
            dispatch(setFromNetwork(undefined));
            return;
          }
        }
        await getDepositData(chainId, lastSymbol, lastToSymbol);
      } catch (error: any) {
        setIsShowNetworkLoading(false);
        if (error.name !== CommonErrorNameType.CANCEL && !isAuthTokenError(error)) {
          singleMessage.error(handleErrorMessage(error));
        }
      } finally {
        setIsShowNetworkLoading(false);
      }
    },
    [dispatch, fromTokenSymbol, getDepositData, toTokenSymbol],
  );

  const handleFromTokenChange = async (newItem: TDepositTokenItem) => {
    // Set fromToken
    dispatch(setFromTokenSymbol(newItem.symbol));

    // Check 1 - toToken
    const currentFromToken = fromTokenList?.find((item) => item.symbol === newItem.symbol);
    const isExitToToken = currentFromToken?.toTokenList?.find(
      (item) => item.symbol === toTokenSymbol,
    );
    // toToken not exist, toToken = fromToken
    let toSymbol = toTokenSymbol;
    if (!isExitToToken) {
      toSymbol = newItem.symbol;
      dispatch(setToTokenSymbol(newItem.symbol));
      dispatch(setToChainItem(currentFromToken?.toTokenList?.[0]?.chainList?.[0] || CHAIN_LIST[0]));
      dispatch(setToChainList(currentFromToken?.toTokenList?.[0]?.chainList || []));
    }
    // toToken exist, next check
    let toChain = toChainItem;
    if (isExitToToken) {
      // Check 2 - toChain
      const isExitToChain = isExitToToken.chainList?.find((item) => item.key === toChainItem.key);
      // toChain not exist, set toChain and toChainList
      if (!isExitToChain) {
        toChain = isExitToToken.chainList?.[0] || CHAIN_LIST[0];
        dispatch(setToChainItem(isExitToToken.chainList?.[0] || CHAIN_LIST[0]));
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
      fromNetworkRef.current = item;
      dispatch(setFromNetwork(item));
      await getDepositData(toChainItem.key, fromTokenSymbol, toTokenSymbol);
    },
    [dispatch, fromTokenSymbol, getDepositData, toChainItem.key, toTokenSymbol],
  );

  const handleToTokenChange = useCallback(
    async (newItem: TToTokenItem) => {
      dispatch(setToTokenSymbol(newItem.symbol));
      dispatch(setToChainList(newItem.chainList || []));

      // Check - to chain
      let optionChainId = toChainItem.key;
      const isExitChain = newItem.chainList?.find((item) => item.key === toChainItem.key);
      if (!isExitChain) {
        const chainItem = newItem.chainList?.[0] || CHAIN_LIST[0];
        dispatch(setToChainItem(chainItem));
        optionChainId = chainItem.key;
      }

      // Check - from token
      const isExitFromToken = fromTokenList?.find((from) => {
        return (
          from.symbol === fromTokenSymbol &&
          from.toTokenList?.find((to) => {
            return to.symbol === newItem.symbol;
          })
        );
      });

      if (!isExitFromToken) {
        dispatch(setFromTokenSymbol(newItem.symbol));
        setDepositInfo(InitDepositInfo);
        dispatch(setDepositAddress(InitDepositInfo.depositAddress));
        setShowRetry(false);
        // get network data
        return getNetworkData({
          chainId: optionChainId,
          symbol: newItem.symbol,
          toSymbol: newItem.symbol,
        });
      } else {
        if (!isExitChain) {
          // toChain changed, need refresh network and deposit info.
          return getNetworkData({
            chainId: optionChainId,
            symbol: fromTokenSymbol,
            toSymbol: newItem.symbol,
          });
        }
        // toChain and fromToken not changed, refresh deposit info.
        return getDepositData(optionChainId, fromTokenSymbol, newItem.symbol);
      }
    },
    [dispatch, fromTokenList, fromTokenSymbol, getDepositData, getNetworkData, toChainItem.key],
  );

  const setCurrentChainItem = useSetCurrentChainItem();
  const handleToChainChanged = useCallback(
    async (item: IChainNameItem) => {
      // if currentSymbol is empty, don't send request
      setCurrentChainItem(item, SideMenuKey.Deposit);
      fromTokenSymbol &&
        (await getNetworkData({
          chainId: item.key,
          symbol: fromTokenSymbol,
        }));
    },
    [fromTokenSymbol, getNetworkData, setCurrentChainItem],
  );

  const handleRetry = useCallback(async () => {
    await getDepositData(toChainItem.key, fromTokenSymbol, toTokenSymbol);
  }, [fromTokenSymbol, getDepositData, toChainItem.key, toTokenSymbol]);

  const init = useCallback(async () => {
    await getTokenList();

    if (fromNetwork?.network && fromNetworkList && fromNetworkList?.length > 0) {
      fromNetworkRef.current = fromNetwork;

      getDepositData(toChainItem.key, fromTokenSymbol, toTokenSymbol);
    } else {
      getNetworkData({
        chainId: toChainItem.key,
        symbol: fromTokenSymbol,
      });
    }
  }, [
    fromNetwork,
    fromNetworkList,
    fromTokenSymbol,
    getDepositData,
    getNetworkData,
    getTokenList,
    toChainItem.key,
    toTokenSymbol,
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
