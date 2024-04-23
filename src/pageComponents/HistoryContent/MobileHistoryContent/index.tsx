import Filter from 'pageComponents/HistoryContent/MobileHistoryContent/Filter';
import HistoryCardItem from 'pageComponents/HistoryContent/MobileHistoryContent/HistoryCardItem';
import { useRecordsState } from 'store/Provider/hooks';
import EmytyDataBox from 'pageComponents/HistoryContent/EmptyDataBox';
import { Divider } from 'antd';
import { RecordsContentParams } from 'types/api';
import styles from './styles.module.scss';

export default function MobileHistoryContent({ requestRecordsList }: RecordsContentParams) {
  const { recordsList } = useRecordsState();
  return (
    <div>
      <Filter requestRecordsList={requestRecordsList} />
      <Divider className={styles['divider-style']} />
      {recordsList?.length !== 0 && <HistoryCardItem requestRecordsList={requestRecordsList} />}
      {recordsList?.length === 0 && <EmytyDataBox emptyText={'No records found'} />}
    </div>
  );
}
