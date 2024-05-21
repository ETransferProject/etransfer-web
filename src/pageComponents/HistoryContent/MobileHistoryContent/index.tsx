import Filter from 'pageComponents/HistoryContent/MobileHistoryContent/Filter';
import HistoryCardItem from 'pageComponents/HistoryContent/MobileHistoryContent/HistoryCardItem';
import { useRecordsState } from 'store/Provider/hooks';
import EmptyDataBox from 'pageComponents/HistoryContent/EmptyDataBox';
import { Divider } from 'antd';
import { TRecordsContentProps } from 'pageComponents/HistoryContent';
import styles from './styles.module.scss';

export default function MobileHistoryContent({
  requestRecordsList,
  onReset,
}: TRecordsContentProps) {
  const { recordsList } = useRecordsState();
  return (
    <div>
      <Filter requestRecordsList={requestRecordsList} onReset={onReset} />
      <Divider className={styles['divider-style']} />
      {recordsList?.length !== 0 && <HistoryCardItem requestRecordsList={requestRecordsList} />}
      {recordsList?.length === 0 && <EmptyDataBox emptyText={'No records found'} />}
    </div>
  );
}
