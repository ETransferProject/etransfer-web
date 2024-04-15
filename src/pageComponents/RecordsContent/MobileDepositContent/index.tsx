import Filter from 'pageComponents/RecordsContent/MobileDepositContent/Filter';
import RecordsCardItem from 'pageComponents/RecordsContent/MobileDepositContent/RecordsCardItem';
import { useRecordsState } from 'store/Provider/hooks';
import EmytyDataBox from 'pageComponents/RecordsContent/EmptyDataBox';
import { Divider } from 'antd';
import { RecordsContentParams } from 'types/api';
import styles from './styles.module.scss';

export default function MobileRecordsContent({ requestRecordsList }: RecordsContentParams) {
  const { recordsList } = useRecordsState();
  return (
    <div>
      <Filter requestRecordsList={requestRecordsList} />
      <Divider className={styles['divider-style']} />
      {recordsList?.length !== 0 && <RecordsCardItem requestRecordsList={requestRecordsList} />}
      {recordsList?.length === 0 && <EmytyDataBox emptyText={'No record found'} />}
    </div>
  );
}
