import WebHistoryHeader from './WebHistoryHeader';
import WebHistoryTable from './WebHistoryTable';
import { RecordsContentParams } from 'types/api';

export default function WebHistoryContent({ requestRecordsList }: RecordsContentParams) {
  return (
    <div>
      <WebHistoryHeader requestRecordsList={requestRecordsList} />
      <WebHistoryTable requestRecordsList={requestRecordsList} />
    </div>
  );
}
