import { useTokenState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';
import { initDepositTokenState } from 'store/reducers/token/slice';

export function useDeposit() {
  const tokenState = useTokenState();
  // compatible with old logic add init value
  if (!tokenState[BusinessType.Deposit]) {
    tokenState[BusinessType.Deposit] = initDepositTokenState;
  }

  return tokenState[BusinessType.Deposit];
}
