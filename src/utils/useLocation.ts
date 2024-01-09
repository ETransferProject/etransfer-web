import { sleep } from './common';

export async function setHash(hash: string) {
  await sleep(500);
  if (typeof location != 'undefined') location.hash = hash?.toLowerCase();
}
