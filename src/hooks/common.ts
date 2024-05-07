import { PortkeyVersion } from 'constants/wallet';
import { useCommonState } from 'store/Provider/hooks';

export function useCurrentVersion() {
  const { currentVersion } = useCommonState();

  return currentVersion || PortkeyVersion.v2;
}
