import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import WebDepositContent from './WebDepositContent';
import MobileDepositContent from './MobileDepositContent';
import {
  useAppDispatch,
  useCommonState,
  useLoading,
  useUserActionState,
} from 'store/Provider/hooks';
import {
  BusinessType,
  TDepositInfo,
  TGetNetworkListRequest,
  TNetworkItem,
  TTokenItem,
  NetworkStatus,
} from 'types/api';
import { getDepositInfo, getNetworkList } from 'utils/api/deposit';
import { IChainNameItem, SupportedELFChainId } from 'constants/index';
import {
  setDepositAddress,
  setDepositCurrentNetwork,
  setDepositNetworkList,
} from 'store/reducers/userAction/slice';
import { useEffectOnce } from 'react-use';
import singleMessage from 'components/SingleMessage';
import { InitDepositInfo } from 'constants/deposit';
import { CommonErrorNameType } from 'api/types';
import { handleErrorMessage } from '@portkey/did-ui-react';
import { useDeposit } from 'hooks/deposit';
import myEvents from 'utils/myEvent';
import { isAuthTokenError } from 'utils/api/error';

export type TDepositContentProps = {
  networkList: TNetworkItem[];
  depositInfo: TDepositInfo;
  contractAddress: string;
  contractAddressLink: string;
  qrCodeValue: string;
  networkSelected?: TNetworkItem;
  tokenLogoUrl?: string;
  showRetry?: boolean;
  isShowLoading?: boolean;
  currentToken?: TTokenItem;
  tokenList: TTokenItem[];
  onRetry?: () => void;
  chainChanged: (item: IChainNameItem) => void;
  networkChanged: (item: TNetworkItem) => Promise<void>;
  onTokenChanged: (item: TTokenItem) => void;
};

export default function Content() {
  const dispatch = useAppDispatch();
  const { isMobilePX } = useCommonState();
  const { deposit } = useUserActionState();
  const { currentSymbol, tokenList, currentChainItem } = useDeposit();
  const { setLoading } = useLoading();
  const [isShowNetworkLoading, setIsShowNetworkLoading] = useState(false);
  const [networkList, setNetworkList] = useState<TNetworkItem[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<TNetworkItem>();
  const currentNetworkRef = useRef<TNetworkItem>();
  const [depositInfo, setDepositInfo] = useState<TDepositInfo>(InitDepositInfo);
  const [showRetry, setShowRetry] = useState(false);

  const currentToken = useMemo(() => {
    return tokenList.find((item) => item.symbol === currentSymbol) as TTokenItem;
  }, [currentSymbol, tokenList]);

  const tokenLogoUrl = useMemo(() => {
    const res = tokenList.filter((item) => item.symbol === currentSymbol);
    if (res.length > 0) {
      return res[0].icon;
    }
    return '';
  }, [currentSymbol, tokenList]);

  const getDepositData = useCallback(
    async (chainId: SupportedELFChainId, symbol: string) => {
      try {
        setLoading(true);
        if (!currentNetworkRef.current?.network) return;
        const res = await getDepositInfo({
          chainId,
          network: currentNetworkRef.current?.network || '',
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
        const lastSymbol = symbol || currentSymbol;
        setIsShowNetworkLoading(true);
        const { networkList } = await getNetworkList({
          type: BusinessType.Deposit,
          chainId: chainId,
          symbol: symbol,
        });
        setNetworkList(networkList);
        dispatch(setDepositNetworkList(networkList));
        if (networkList?.length === 1 && networkList[0].status !== NetworkStatus.Offline) {
          setCurrentNetwork(networkList[0]);
          currentNetworkRef.current = networkList[0];
          dispatch(setDepositCurrentNetwork(networkList[0]));

          await getDepositData(currentChainItem.key, lastSymbol);
        } else {
          const exitNetwork = networkList.filter(
            (item) => item.network === currentNetworkRef.current?.network,
          );
          if (exitNetwork?.length === 0) {
            setCurrentNetwork(undefined);
            currentNetworkRef.current = undefined;
            dispatch(setDepositCurrentNetwork(undefined));
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
    [currentChainItem.key, currentSymbol, dispatch, getDepositData],
  );

  const handleChainChanged = useCallback(
    async (item: IChainNameItem) => {
      // if currentSymbol is empty, don't send request
      currentSymbol &&
        (await getNetworkData({
          chainId: item.key,
          symbol: currentSymbol,
        }));
      if (!currentNetworkRef.current?.network) return;
      await getDepositData(item.key, currentSymbol);
    },
    [currentSymbol, getDepositData, getNetworkData],
  );

  const handleNetworkChanged = useCallback(
    async (item: TNetworkItem) => {
      setCurrentNetwork(item);
      currentNetworkRef.current = item;
      dispatch(setDepositCurrentNetwork(item));
      await getDepositData(currentChainItem.key, currentSymbol);
    },
    [currentChainItem.key, currentSymbol, dispatch, getDepositData],
  );

  const handleRetry = useCallback(async () => {
    await getDepositData(currentChainItem.key, currentSymbol);
  }, [currentChainItem.key, currentSymbol, getDepositData]);

  const handleTokenChange = async (item: TTokenItem) => {
    setCurrentNetwork(undefined);
    currentNetworkRef.current = undefined;
    dispatch(setDepositCurrentNetwork(undefined));
    setDepositInfo(InitDepositInfo);
    dispatch(setDepositAddress(InitDepositInfo.depositAddress));
    setShowRetry(false);
    await getNetworkData({
      chainId: currentChainItem.key,
      symbol: item.symbol,
    });
  };

  const init = useCallback(() => {
    if (
      deposit?.currentNetwork?.network &&
      deposit?.networkList &&
      deposit.networkList?.length > 0
    ) {
      setCurrentNetwork(deposit.currentNetwork);
      currentNetworkRef.current = deposit.currentNetwork;
      setNetworkList(deposit?.networkList);

      getDepositData(currentChainItem.key, currentSymbol);
    } else {
      if (currentSymbol) {
        getNetworkData({
          chainId: currentChainItem.key,
          symbol: currentSymbol,
        });
      }
    }
  }, [
    currentChainItem.key,
    currentSymbol,
    deposit.currentNetwork,
    deposit.networkList,
    getDepositData,
    getNetworkData,
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
      networkList={networkList}
      depositInfo={depositInfo}
      contractAddress={currentNetwork?.contractAddress || ''}
      contractAddressLink={currentNetwork?.explorerUrl || ''}
      qrCodeValue={depositInfo.depositAddress}
      networkSelected={currentNetwork}
      tokenLogoUrl={tokenLogoUrl}
      showRetry={showRetry}
      isShowLoading={isShowNetworkLoading}
      onRetry={handleRetry}
      chainChanged={handleChainChanged}
      networkChanged={handleNetworkChanged}
      currentToken={currentToken}
      tokenList={tokenList}
      onTokenChanged={handleTokenChange}
    />
  ) : (
    <WebDepositContent
      networkList={networkList}
      depositInfo={depositInfo}
      contractAddress={currentNetwork?.contractAddress || ''}
      contractAddressLink={currentNetwork?.explorerUrl || ''}
      qrCodeValue={depositInfo.depositAddress}
      networkSelected={currentNetwork}
      tokenLogoUrl={tokenLogoUrl}
      showRetry={showRetry}
      isShowLoading={isShowNetworkLoading}
      onRetry={handleRetry}
      chainChanged={handleChainChanged}
      networkChanged={handleNetworkChanged}
      currentToken={currentToken}
      tokenList={tokenList}
      onTokenChanged={handleTokenChange}
    />
  );
}
