import WebHistoryHeader from './WebHistoryHeader';
import WebHistoryTable from './WebHistoryTable';
import { TRecordsContentParams } from 'types/api';

export default function WebHistoryContent({ requestRecordsList }: TRecordsContentParams) {
  return (
    <div>
      <WebHistoryHeader requestRecordsList={requestRecordsList} />
      <WebHistoryTable requestRecordsList={requestRecordsList} />
    </div>
  );
}
