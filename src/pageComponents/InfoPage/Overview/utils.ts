import { ZERO } from 'utils/format';

export const computePlus = (deposit?: number | string, withdraw?: number | string) => {
  return ZERO.plus(String(deposit) || '')
    .plus(String(withdraw) || '')
    .toFixed();
};
