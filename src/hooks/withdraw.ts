import { useTokenState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';
import { initWithdrawTokenState } from 'store/reducers/token/slice';

export function useWithdraw() {
  const tokenState = useTokenState();
  // compatible with old logic add init value
  if (!tokenState[BusinessType.Withdraw]) {
    tokenState[BusinessType.Withdraw] = initWithdrawTokenState;
  }

  return tokenState[BusinessType.Withdraw];
}
