import { useCommonState } from 'store/Provider/hooks';
import MobileTransfer from './MobileTransfer';
import WebTransfer from './WebTransfer';
import { useCallback, useState } from 'react';
import { getTransferFilterOption } from 'utils/api/infoDashboard';
import { TTransferDashboardFilterNetwork, TTransferDashboardFilterToken } from 'types/api';
import { useEffectOnce } from 'react-use';
import { HandleApplyFilterParams } from './types';
import {
  DefaultTransferDashboardFromChainOptions,
  DefaultTransferDashboardFromTokenOptions,
  DefaultTransferDashboardToTokenOptions,
  InfoAelfChainType,
  InfoBusinessType,
} from 'constants/infoDashboard';

export default function TransferDashboard() {
  const { isPadPX } = useCommonState();
  const [filterNetworkList, setFilterNetworkList] = useState<TTransferDashboardFilterNetwork[]>([]);
  const [filterTokenList, setTokenNetworkList] = useState<TTransferDashboardFilterToken[]>([]);

  const [filterType, setFilterType] = useState<InfoBusinessType>(InfoBusinessType.ALL);
  const [filterFromToken, setFilterFromToken] = useState<number>(
    DefaultTransferDashboardFromTokenOptions.value,
  );
  const [filterFromChain, setFilterFromChain] = useState<number>(
    DefaultTransferDashboardFromChainOptions.value,
  );
  const [filterToToken, setFilterToToken] = useState<number>(
    DefaultTransferDashboardToTokenOptions.value,
  );
  const [filterToChain, setFilterToChain] = useState<InfoAelfChainType>(InfoAelfChainType.ALL);

  const handleTypeChange = useCallback((type: InfoBusinessType) => {
    setFilterType(type);
  }, []);

  const handleFromTokenChange = useCallback((symbol: number) => {
    setFilterFromToken(symbol);
  }, []);

  const handleFromChainChange = useCallback((network: number) => {
    setFilterFromChain(network);
  }, []);

  const handleToTokenChange = useCallback((symbol: number) => {
    setFilterToToken(symbol);
  }, []);

  const handleToChainChange = useCallback((chainId: number) => {
    setFilterToChain(chainId);

    //   dispatch(setSkipCount(1));
    //   requestRecordsList();
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilterType(InfoBusinessType.ALL);
    setFilterFromToken(DefaultTransferDashboardFromTokenOptions.value);
    setFilterFromChain(DefaultTransferDashboardFromChainOptions.value);
    setFilterToToken(DefaultTransferDashboardToTokenOptions.value);
    setFilterToChain(InfoAelfChainType.ALL);
  }, []);

  const handleApplyFilter = useCallback((params: HandleApplyFilterParams) => {
    setFilterType(params.type);
    setFilterFromToken(params.fromChain);
    setFilterFromChain(params.fromToken);
    setFilterToToken(params.toToken);
    setFilterToChain(params.toChain);
  }, []);

  const tableOnChange = useCallback((page: number, pageSize: number) => {
    console.log('>>> tableOnChange', page, pageSize);
  }, []);

  const getFilterData = useCallback(async () => {
    const res = await getTransferFilterOption();

    setFilterNetworkList(res.networkList);
    setTokenNetworkList(res.tokenList);
  }, []);

  useEffectOnce(() => {
    getFilterData();
  });

  return isPadPX ? (
    <MobileTransfer
      handleResetFilter={handleResetFilter}
      handleApplyFilter={handleApplyFilter}
      filterFromTokenList={filterTokenList}
      filterFromChainList={filterNetworkList}
      filterToTokenList={filterTokenList}
      filterToChainList={[]}
      filterType={filterType}
      filterFromToken={filterFromToken}
      filterFromChain={filterFromChain}
      filterToToken={filterToToken}
      filterToChain={filterToChain}
    />
  ) : (
    <WebTransfer
      // filter
      filterFromTokenList={filterTokenList}
      filterFromChainList={filterNetworkList}
      filterToTokenList={filterTokenList}
      filterToChainList={[]}
      filterType={filterType}
      filterFromToken={filterFromToken}
      filterFromChain={filterFromChain}
      filterToToken={filterToToken}
      filterToChain={filterToChain}
      handleTypeChange={handleTypeChange}
      handleFromTokenChange={handleFromTokenChange}
      handleFromChainChange={handleFromChainChange}
      handleToTokenChange={handleToTokenChange}
      handleToChainChange={handleToChainChange}
      // table
      totalCount={0}
      maxResultCount={0}
      skipCount={0}
      tableOnChange={tableOnChange}
    />
  );
}
