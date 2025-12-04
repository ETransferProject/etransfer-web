import { useCommonState } from 'store/Provider/hooks';
import MobileTransferDetail from './MobileTransferDetail';
import WebTransferDetail from './WebTransferDetail';
import { TTransferDashboardData } from 'types/infoDashboard';

export default function TransferDetail(props: TTransferDashboardData) {
  const { isPadPX } = useCommonState();

  return isPadPX ? <MobileTransferDetail {...props} /> : <WebTransferDetail {...props} />;
}
