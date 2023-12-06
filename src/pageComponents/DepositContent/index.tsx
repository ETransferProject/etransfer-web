import React, { useCallback, useRef, useState, useMemo } from 'react';
import WebDepositContent from './WebDepositContent';
import MobileDepositContent from './MobileDepositContent';
import {
  useAppDispatch,
  useCommonState,
  useLoading,
  useTokenState,
  useUserActionState,
} from 'store/Provider/hooks';
import { BusinessType, DepositInfo, GetNetworkListRequest, NetworkItem } from 'types/api';
import { getDepositInfo, getNetworkList } from 'utils/api/deposit';
import { ChainNameItem, SupportedELFChainId } from 'constants/index';
import {
  setDepositAddress,
  setDepositCurrentNetwork,
  setDepositNetworkList,
} from 'store/reducers/userAction/slice';
import { useEffectOnce } from 'react-use';
import singleMessage from 'components/SingleMessage';
import { handleErrorMessage } from 'aelf-web-login';
import { initDepositInfo } from 'constants/deposit';

export type DepositContentProps = {
  networkList: NetworkItem[];
  depositInfo: DepositInfo;
  contractAddress: string;
  contractAddressLink: string;
  qrCodeValue: string;
  networkSelected?: NetworkItem;
  tokenLogoUrl?: string;
  chainChanged: (item: ChainNameItem) => void;
  networkChanged: (item: NetworkItem) => Promise<void>;
};

export default function Content() {
  const dispatch = useAppDispatch();
  const { isMobilePX, currentChainItem } = useCommonState();
  const { deposit } = useUserActionState();
  const { currentSymbol, tokenList } = useTokenState();
  const { setLoading } = useLoading();
  const [networkList, setNetworkList] = useState<NetworkItem[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkItem>();
  const currentNetworkRef = useRef<NetworkItem>();
  const [depositInfo, setDepositInfo] = useState<DepositInfo>(initDepositInfo);

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
        setLoading(false);
        setDepositInfo(res.depositInfo);
        dispatch(setDepositAddress(res.depositInfo.depositAddress));
      } catch (error) {
        setLoading(false);
        setDepositInfo(initDepositInfo);
        dispatch(setDepositAddress(initDepositInfo.depositAddress));
        console.log('getDepositInfo error:', error);
        singleMessage.error('The deposit service is busy. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    [dispatch, setLoading],
  );

  const getNetworkData = useCallback(
    async ({ chainId, symbol }: Omit<GetNetworkListRequest, 'type'>) => {
      try {
        setLoading(true);
        const { networkList } = await getNetworkList({
          type: BusinessType.Deposit,
          chainId: chainId,
          symbol: symbol,
        });
        setNetworkList(networkList);
        dispatch(setDepositNetworkList(networkList));
        if (networkList?.length === 1) {
          setCurrentNetwork(networkList[0]);
          currentNetworkRef.current = networkList[0];
          dispatch(setDepositCurrentNetwork(networkList[0]));

          await getDepositData(currentChainItem.key, currentSymbol);
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
        setLoading(false);
      } catch (error) {
        setLoading(false);
        singleMessage.error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [currentChainItem.key, currentSymbol, dispatch, getDepositData, setLoading],
  );

  const handleChainChanged = useCallback(
    async (item: ChainNameItem) => {
      await getNetworkData({
        chainId: item.key,
        symbol: currentSymbol,
      });
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
      getNetworkData({
        chainId: currentChainItem.key,
        symbol: currentSymbol,
      });
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
      chainChanged={handleChainChanged}
      networkChanged={handleNetworkChanged}
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
      chainChanged={handleChainChanged}
      networkChanged={handleNetworkChanged}
    />
  );
}
