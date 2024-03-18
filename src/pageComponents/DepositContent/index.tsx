import React, { useCallback, useRef, useState, useMemo } from 'react';
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
  DepositInfo,
  GetNetworkListRequest,
  NetworkItem,
  TokenItem,
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
import { initDepositInfo } from 'constants/deposit';
import { CommonErrorNameType } from 'api/types';
import { handleErrorMessage } from '@portkey/did-ui-react';
import { useDeposit } from 'hooks/deposit';

export type DepositContentProps = {
  networkList: NetworkItem[];
  depositInfo: DepositInfo;
  contractAddress: string;
  contractAddressLink: string;
  qrCodeValue: string;
  networkSelected?: NetworkItem;
  tokenLogoUrl?: string;
  showRetry?: boolean;
  isShowLoading?: boolean;
  currentToken?: TokenItem;
  tokenList: TokenItem[];
  onRetry?: () => void;
  chainChanged: (item: IChainNameItem) => void;
  networkChanged: (item: NetworkItem) => Promise<void>;
  onTokenChanged: (item: TokenItem) => void;
};

export default function Content() {
  const dispatch = useAppDispatch();
  const { isMobilePX, currentChainItem } = useCommonState();
  const { deposit } = useUserActionState();
  const { currentSymbol, tokenList } = useDeposit();
  const { setLoading } = useLoading();
  const [isShowNetworkLoading, setIsShowNetworkLoading] = useState(false);
  const [networkList, setNetworkList] = useState<NetworkItem[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkItem>();
  const currentNetworkRef = useRef<NetworkItem>();
  const [depositInfo, setDepositInfo] = useState<DepositInfo>(initDepositInfo);
  const [showRetry, setShowRetry] = useState(false);

  const currentToken = useMemo(() => {
    return tokenList.find((item) => item.symbol === currentSymbol) as TokenItem;
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
        setDepositInfo(initDepositInfo);
        dispatch(setDepositAddress(initDepositInfo.depositAddress));
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
    async ({ chainId, symbol }: Omit<GetNetworkListRequest, 'type'>) => {
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
        if (error.name !== CommonErrorNameType.CANCEL) {
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
    async (item: NetworkItem) => {
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

  const handleTokenChange = async (item: TokenItem) => {
    setCurrentNetwork(undefined);
    currentNetworkRef.current = undefined;
    dispatch(setDepositCurrentNetwork(undefined));
    setDepositInfo(initDepositInfo);
    dispatch(setDepositAddress(initDepositInfo.depositAddress));
    setShowRetry(false);
    await getNetworkData({
      chainId: currentChainItem.key,
      symbol: item.symbol,
    });
  };

  useEffectOnce(() => {
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
      if (currentSymbol && currentChainItem.key) {
        getNetworkData({
          chainId: currentChainItem.key,
          symbol: currentSymbol,
        });
      }
    }
  });

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
