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
import { CHAIN_LIST, IChainNameItem, SupportedELFChainId } from 'constants/index';
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
      // handle from
      dispatch(setFromTokenList(tokenList));
      const isExitFromTokenSelected = tokenList?.find((item) => item.symbol === fromTokenSymbol);
      if (!isExitFromTokenSelected?.symbol) {
        dispatch(setFromTokenSymbol(tokenList?.[0].symbol));
      }
      // handle to
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
      const toTokenList =
        fromTokenList?.find((item) => item.symbol === 'USDT')?.toTokenList ||
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
    async (chainId: SupportedELFChainId, symbol: string, toSymbol: string) => {
      try {
        setLoading(true);
        if (!fromNetworkRef.current?.network) return;
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
    async ({ chainId, symbol, toSymbol }: TGetNetworkData) => {
      try {
        const lastSymbol = symbol || fromTokenSymbol;
        const lastToSymbol = toSymbol || toTokenSymbol;
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
          console.log('🌈 🌈 🌈 🌈 🌈 🌈 1', '');
          await getDepositData(toChainItem.key, lastSymbol, lastToSymbol);
        } else {
          console.log('🌈 🌈 🌈 🌈 🌈 🌈 2', '');
          const exitNetwork = networkList.filter(
            (item) => item.network === fromNetworkRef.current?.network,
          );
          if (exitNetwork?.length === 0) {
            fromNetworkRef.current = undefined;
            dispatch(setFromNetwork(undefined));
          } else {
            await getDepositData(toChainItem.key, lastSymbol, lastToSymbol);
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
    [dispatch, fromTokenSymbol, getDepositData, toChainItem.key, toTokenSymbol],
  );

  const handleFromTokenChange = async (newItem: TDepositTokenItem) => {
    // set token data
    dispatch(setFromTokenSymbol(newItem.symbol));
    const currentFromToken = fromTokenList?.find((item) => item.symbol === newItem.symbol);
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 currentFromToken', currentFromToken);
    const isExitToToken = currentFromToken?.toTokenList?.find(
      (item) => item.symbol === toTokenSymbol,
    );
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 isExitToToken', isExitToToken);
    let toSymbol = toTokenSymbol;
    if (!isExitToToken) {
      toSymbol = newItem.symbol;
      dispatch(setToTokenSymbol(newItem.symbol));
      dispatch(setToChainItem(currentFromToken?.toTokenList?.[0]?.chainList?.[0] || CHAIN_LIST[0]));
      dispatch(setToChainList(currentFromToken?.toTokenList?.[0]?.chainList || []));
    }
    if (isExitToToken) {
      const isExitToChain = isExitToToken.chainList?.find((item) => item.key === toChainItem.key);
      if (!isExitToChain) {
        dispatch(setToChainItem(isExitToToken.chainList?.[0] || CHAIN_LIST[0]));
      }
      dispatch(setToChainList(isExitToToken.chainList || []));
    }

    // reset other data
    setDepositInfo(InitDepositInfo);
    dispatch(setDepositAddress(InitDepositInfo.depositAddress));
    setShowRetry(false);
    // get network data
    await getNetworkData({
      chainId: toChainItem.key,
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
      let optionChainId = toChainItem.key;

      const isExitChain = newItem.chainList?.find((item) => item.key === toChainItem.key);
      if (!isExitChain) {
        const chainItem = newItem.chainList?.[0] || CHAIN_LIST[0];
        dispatch(setToChainItem(chainItem));

        optionChainId = chainItem.key;
      }

      // check token
      const isExitFromToken = fromTokenList?.find((from) => {
        console.log('🌈 🌈 from', from.symbol);
        return (
          from.symbol === fromTokenSymbol &&
          from.toTokenList?.find((to) => {
            console.log('🌈 🌈 to', to.symbol);
            return to.symbol === newItem.symbol;
          })
        );
      });
      console.log('🌈 🌈 isExitFromToken', isExitFromToken);

      if (!isExitFromToken) {
        dispatch(setFromTokenSymbol(newItem.symbol));
        setDepositInfo(InitDepositInfo);
        dispatch(setDepositAddress(InitDepositInfo.depositAddress));
        setShowRetry(false);
        // get network data
        await getNetworkData({
          chainId: toChainItem.key,
          symbol: newItem.symbol,
          toSymbol: newItem.symbol,
        });
        return;
      } else {
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
      if (!fromNetworkRef.current?.network) return;
      await getDepositData(item.key, fromTokenSymbol, toTokenSymbol);
    },
    [fromTokenSymbol, getDepositData, getNetworkData, setCurrentChainItem, toTokenSymbol],
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
