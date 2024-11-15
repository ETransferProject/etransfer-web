import { ZERO } from 'utils/format';

export const computePlus = (deposit?: number | string, transfer?: number | string) => {
  return ZERO.plus(String(deposit) || '')
    .plus(String(transfer) || '')
    .toFixed();
};
