import { useAppDispatch, useCommonState, useLoading } from 'store/Provider/hooks';
import WebTokens from './WebTokens';
import MobileTokens from './MobileTokens';
import { useCallback, useState } from 'react';
import { getTokenDashboard } from './utils';
import { setTokens } from 'store/reducers/infoDashboard/slice';
import { useEffectOnce } from 'react-use';
import { TokensDashboardType } from 'types/api';
import PadTokens from './PadTokens';

export default function TokenDashboard() {
  const { isMobilePX, isPadPX } = useCommonState();
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();
  const [filterType, setFilterType] = useState<TokensDashboardType>(TokensDashboardType.All);

  const getData = useCallback(
    async (type: TokensDashboardType) => {
      try {
        setLoading(true);
        const res = await getTokenDashboard({
          type,
        });
        dispatch(setTokens(res));
      } catch (error) {
        console.log('TokenDashboard get data error', error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, setLoading],
  );

  const handleFilterTypeChange = useCallback(
    async (item: TokensDashboardType) => {
      setFilterType(item);
      getData(item);
    },
    [getData],
  );

  useEffectOnce(() => {
    getData(TokensDashboardType.All);
  });

  if (isMobilePX) {
    return <MobileTokens selectType={filterType} onTypeChange={handleFilterTypeChange} />;
  } else if (isPadPX) {
    return <PadTokens selectType={filterType} onTypeChange={handleFilterTypeChange} />;
  } else {
    return <WebTokens selectType={filterType} onTypeChange={handleFilterTypeChange} />;
  }
}
