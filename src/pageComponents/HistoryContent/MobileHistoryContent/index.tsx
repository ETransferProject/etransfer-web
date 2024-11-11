import Filter from 'pageComponents/HistoryContent/MobileHistoryContent/Filter';
import HistoryCardItem from 'pageComponents/HistoryContent/MobileHistoryContent/HistoryCardItem';
import { useRecordsState } from 'store/Provider/hooks';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import { Divider } from 'antd';
import { TRecordsContentProps } from 'pageComponents/HistoryContent';
import styles from './styles.module.scss';
import useAelf from 'hooks/wallet/useAelf';
import { LOGIN_TO_VIEW_HISTORY, NO_HISTORY_FOUND } from 'constants/records';

export default function MobileHistoryContent({
  requestRecordsList,
  onReset,
}: TRecordsContentProps) {
  const { recordsList } = useRecordsState();
  const { isConnected } = useAelf();
  return (
    <div>
      <Filter requestRecordsList={requestRecordsList} onReset={onReset} />
      <Divider className={styles['divider-style']} />
      {recordsList?.length !== 0 && <HistoryCardItem requestRecordsList={requestRecordsList} />}
      {recordsList?.length === 0 && (
        <EmptyDataBox emptyText={isConnected ? NO_HISTORY_FOUND : LOGIN_TO_VIEW_HISTORY} />
      )}
    </div>
  );
}
