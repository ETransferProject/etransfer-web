import { useCallback } from 'react';
import { useInfoDashboardState } from 'store/Provider/hooks';

export default function useGetTokenIcon() {
  const { tokensInfo } = useInfoDashboardState();

  return useCallback(
    (symbol: string) => {
      return tokensInfo?.find((token) => token.symbol === symbol);
    },
    [tokensInfo],
  );
}
