import { useTokenState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';

export function useDeposit() {
  const tokenState = useTokenState();
  return tokenState[BusinessType.Deposit];
}
