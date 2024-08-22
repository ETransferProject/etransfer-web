import { TGetRecordDetailResult } from 'types/api';
import HistoryDetailBody from '../HistoryDetailBody';
import styles from './styles.module.scss';

export default function MobileHistoryDetail(props: TGetRecordDetailResult) {
  return (
    <div className={'main-content-container main-content-container-safe-area'}>
      <HistoryDetailBody {...props} />
    </div>
  );
}
