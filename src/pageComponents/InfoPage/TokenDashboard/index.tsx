import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import WebTokens from './WebTokens';
import MobileTokens from './MobileTokens';
import { useCallback } from 'react';
import { getTokenDashboard } from './utils';
import { setTokens } from 'store/reducers/infoDashboard/slice';
import { useEffectOnce } from 'react-use';

export default function TokenDashboard() {
  const { isPadPX } = useCommonState();
  const dispatch = useAppDispatch();

  const getData = useCallback(async () => {
    const res = await getTokenDashboard({
      type: 0,
    });
    dispatch(setTokens(res));
  }, [dispatch]);

  useEffectOnce(() => {
    getData();
  });

  return isPadPX ? <MobileTokens /> : <WebTokens />;
}
