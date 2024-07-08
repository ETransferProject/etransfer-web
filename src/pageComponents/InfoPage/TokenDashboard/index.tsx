import { useCommonState } from 'store/Provider/hooks';
import WebTokens from './WebTokens';
import MobileTokens from './MobileTokens';

export default function TokenDashboard() {
  const { isPadPX } = useCommonState();
  return isPadPX ? <MobileTokens /> : <WebTokens />;
}
