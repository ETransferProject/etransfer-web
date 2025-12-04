import {
  useAppDispatch,
  useCommonState,
  useInfoDashboardState,
  useLoading,
} from 'store/Provider/hooks';
import MobileTransfer from './MobileTransfer';
import WebTransfer from './WebTransfer';
import { useCallback, useState } from 'react';
import { getTransferFilterOption } from 'utils/api/infoDashboard';
import {
  TTransferDashboardFilterNetwork,
  TTransferDashboardFilterToken,
  TokensDashboardType,
} from 'types/api';
import { useEffectOnce } from 'react-use';
import { HandleApplyFilterParams } from './types';
import {
  DefaultTransferDashboardFromChainOptions,
  DefaultTransferDashboardFromTokenOptions,
  DefaultTransferDashboardToChainOptions,
  DefaultTransferDashboardToTokenOptions,
} from 'constants/infoDashboard';
import { setTokensInfo, setTransferList } from 'store/reducers/infoDashboard/slice';
import { getTransferDashboard } from './utils';
import { useDebounceCallback } from 'hooks/debounce';
import PadTransfer from './PadTransfer';

export default function TransferDashboard() {
  const { isMobilePX, isPadPX } = useCommonState();
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();
  const { transferList } = useInfoDashboardState();
  const [filterNetworkList, setFilterNetworkList] = useState<TTransferDashboardFilterNetwork[]>([]);
  const [filterTokenList, setTokenNetworkList] = useState<TTransferDashboardFilterToken[]>([]);
  const [filterType, setFilterType] = useState<TokensDashboardType>(TokensDashboardType.All);
  const [filterFromToken, setFilterFromToken] = useState<number>(
    DefaultTransferDashboardFromTokenOptions.value,
  );
  const [filterFromChain, setFilterFromChain] = useState<number>(
    DefaultTransferDashboardFromChainOptions.value,
  );
  const [filterToToken, setFilterToToken] = useState<number>(
    DefaultTransferDashboardToTokenOptions.value,
  );
  const [filterToChain, setFilterToChain] = useState<number>(
    DefaultTransferDashboardToChainOptions.value,
  );

  // pagination
  const [skipPageCount, setSkipPageCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const getFilterData = useCallback(async () => {
    try {
      const res = await getTransferFilterOption();

      setFilterNetworkList(res.networkList);
      setTokenNetworkList(res.tokenList);
      dispatch(setTokensInfo(res.tokenList));
    } catch (error) {
      console.log('transfer dashboard getFilterData error', error);
    }
  }, [dispatch]);

  const getTransferData = useCallback(
    async ({
      type,
      fromToken,
      fromChainId,
      toToken,
      toChainId,
      skip,
      max,
    }: {
      type?: number;
      fromToken?: number;
      fromChainId?: number;
      toToken?: number;
      toChainId?: number;
      skip?: number;
      max?: number;
    }) => {
      try {
        setLoading(true);

        const currentSkipPageCount = typeof skip !== 'number' ? skipPageCount : skip;
        const currentMaxCount = typeof max !== 'number' ? maxResultCount : max;
        const currentSkipCount = currentSkipPageCount * currentMaxCount;
        const res = await getTransferDashboard({
          type: typeof type !== 'number' ? filterType : type,
          fromToken: typeof fromToken !== 'number' ? filterFromToken : fromToken,
          fromChainId: typeof fromChainId !== 'number' ? filterFromChain : fromChainId,
          toToken: typeof toToken !== 'number' ? filterToToken : toToken,
          toChainId: typeof toChainId !== 'number' ? filterToChain : toChainId,
          skipCount: currentSkipCount,
          maxResultCount: currentMaxCount,
        });

        if (isMobilePX) {
          let mobileTransferList = [];
          if (currentSkipCount === 0) {
            mobileTransferList = res.list;
          } else {
            mobileTransferList = [...transferList, ...res.list];
          }

          dispatch(setTransferList(mobileTransferList));
        } else {
          dispatch(setTransferList(res.list));
        }

        setTotalCount(res.total);
      } catch (error) {
        console.log('transfer dashboard getTransferData error', error);
      } finally {
        setLoading(false);
      }
    },
    [
      dispatch,
      filterFromChain,
      filterFromToken,
      filterToChain,
      filterToToken,
      filterType,
      isMobilePX,
      maxResultCount,
      setLoading,
      skipPageCount,
      transferList,
    ],
  );

  const handleTypeChange = useCallback(
    (type: TokensDashboardType) => {
      setFilterType(type);
      setSkipPageCount(0);

      getTransferData({
        type: type,
        skip: 0,
      });
    },
    [getTransferData],
  );

  const handleFromTokenChange = useCallback(
    (symbol: number) => {
      setFilterFromToken(symbol);
      setSkipPageCount(0);

      getTransferData({
        fromToken: symbol,
        skip: 0,
      });
    },
    [getTransferData],
  );

  const handleFromChainChange = useCallback(
    (network: number) => {
      setFilterFromChain(network);
      setSkipPageCount(0);

      getTransferData({
        fromChainId: network,
        skip: 0,
      });
    },
    [getTransferData],
  );

  const handleToTokenChange = useCallback(
    (symbol: number) => {
      setFilterToToken(symbol);
      setSkipPageCount(0);

      getTransferData({
        toToken: symbol,
        skip: 0,
      });
    },
    [getTransferData],
  );

  const handleToChainChange = useCallback(
    (chainId: number) => {
      setFilterToChain(chainId);
      setSkipPageCount(0);

      getTransferData({
        toChainId: chainId,
        skip: 0,
      });
    },
    [getTransferData],
  );

  const handleResetFilter = useCallback(() => {
    setFilterType(TokensDashboardType.All);
    setFilterFromToken(DefaultTransferDashboardFromTokenOptions.value);
    setFilterFromChain(DefaultTransferDashboardFromChainOptions.value);
    setFilterToToken(DefaultTransferDashboardToTokenOptions.value);
    setFilterToChain(DefaultTransferDashboardToChainOptions.value);
    setSkipPageCount(0);

    getTransferData({
      type: TokensDashboardType.All,
      fromToken: DefaultTransferDashboardFromTokenOptions.value,
      fromChainId: DefaultTransferDashboardFromChainOptions.value,
      toToken: DefaultTransferDashboardToTokenOptions.value,
      toChainId: DefaultTransferDashboardToChainOptions.value,
      skip: 0,
    });
  }, [getTransferData]);

  const handleApplyFilter = useCallback(
    (params: HandleApplyFilterParams) => {
      setFilterType(params.type);
      setFilterFromToken(params.fromToken);
      setFilterFromChain(params.fromChain);
      setFilterToToken(params.toToken);
      setFilterToChain(params.toChain);
      setSkipPageCount(0);
      getTransferData({
        type: params.type,
        fromToken: params.fromToken,
        fromChainId: params.fromChain,
        toToken: params.toToken,
        toChainId: params.toChain,
        skip: 0,
      });
    },
    [getTransferData],
  );

  // web get page date
  const tableOnChange = useCallback(
    (page: number, pageSize: number) => {
      let skip = skipPageCount;
      let max = maxResultCount;
      const newPage = page - 1;
      if (newPage !== skipPageCount) {
        skip = newPage;
        setSkipPageCount(newPage);
      }
      if (maxResultCount !== pageSize) {
        // pageSize change and skipCount need init
        skip = 0;
        max = pageSize;
        setSkipPageCount(0);
        setMaxResultCount(pageSize);
      }

      getTransferData({
        skip,
        max,
      });
    },
    [getTransferData, maxResultCount, skipPageCount],
  );

  // mobile get next page
  const handleNextPage = useDebounceCallback(async () => {
    if (transferList.length < totalCount) {
      setSkipPageCount(skipPageCount + 1);
      await getTransferData({
        skip: skipPageCount + 1,
      });
    }
  }, [getTransferData, skipPageCount, totalCount, transferList.length]);

  const init = useCallback(async () => {
    getFilterData();
    getTransferData({});
  }, [getFilterData, getTransferData]);

  useEffectOnce(() => {
    init();
  });

  if (isMobilePX) {
    return (
      <MobileTransfer
        // filter
        filterFromTokenList={filterTokenList}
        filterFromChainList={filterNetworkList}
        filterToTokenList={filterTokenList}
        filterToChainList={filterNetworkList}
        filterType={filterType}
        filterFromToken={filterFromToken}
        filterFromChain={filterFromChain}
        filterToToken={filterToToken}
        filterToChain={filterToChain}
        handleResetFilter={handleResetFilter}
        handleApplyFilter={handleApplyFilter}
        // table
        totalCount={totalCount}
        handleNextPage={handleNextPage}
      />
    );
  } else if (isPadPX) {
    return (
      <PadTransfer
        // filter
        filterFromTokenList={filterTokenList}
        filterFromChainList={filterNetworkList}
        filterToTokenList={filterTokenList}
        filterToChainList={filterNetworkList}
        filterType={filterType}
        filterFromToken={filterFromToken}
        filterFromChain={filterFromChain}
        filterToToken={filterToToken}
        filterToChain={filterToChain}
        handleResetFilter={handleResetFilter}
        handleApplyFilter={handleApplyFilter}
        // table
        totalCount={totalCount}
        maxResultCount={maxResultCount}
        skipPageCount={skipPageCount}
        tableOnChange={tableOnChange}
      />
    );
  } else {
    return (
      <WebTransfer
        // filter
        filterFromTokenList={filterTokenList}
        filterFromChainList={filterNetworkList}
        filterToTokenList={filterTokenList}
        filterToChainList={filterNetworkList}
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
        totalCount={totalCount}
        maxResultCount={maxResultCount}
        skipPageCount={skipPageCount}
        tableOnChange={tableOnChange}
        handleResetFilter={handleResetFilter}
      />
    );
  }
}
