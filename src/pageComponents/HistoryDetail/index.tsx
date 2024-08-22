import { useState } from 'react';
import { TGetRecordDetailResult } from 'types/api';
import { useCommonState } from 'store/Provider/hooks';
import MobileHistoryDetail from './MobileHistoryDetail';
import WebHistoryDetail from './WebHistoryDetail';

export default function HistoryDetail() {
  const [detailData, setDetailData] = useState<TGetRecordDetailResult>();
  const { isPadPX } = useCommonState();

  return isPadPX ? <MobileHistoryDetail {...detailData} /> : <WebHistoryDetail {...detailData} />;
}
