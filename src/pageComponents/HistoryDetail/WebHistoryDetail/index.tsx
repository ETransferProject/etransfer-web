import { TGetRecordDetailResult } from 'types/api';
import HistoryDetailBody from '../HistoryDetailBody';

export default function WebHistoryDetail(props: TGetRecordDetailResult) {
  return (
    <div className={'main-content-container main-content-container-safe-area'}>
      <HistoryDetailBody {...props} />
    </div>
  );
}
