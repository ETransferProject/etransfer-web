import { useTokenState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';

export function useWithdraw() {
  const tokenState = useTokenState();
  return tokenState[BusinessType.Withdraw];
}
