import { useCommonState } from 'store/Provider/hooks';
import MobileTransferDetail from './MobileTransferDetail';
import WebTransferDetail from './WebTransferDetail';

export default function TransferDetail() {
  const { isPadPX } = useCommonState();

  return <div>{isPadPX ? <MobileTransferDetail /> : <WebTransferDetail />}</div>;
}
