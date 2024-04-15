import WebRecordsHeader from './WebRecordsHeader';
import WebRecordsTable from './WebRecordsTable';
import { RecordsContentParams } from 'types/api';

export default function WebRecordsContent({ requestRecordsList }: RecordsContentParams) {
  return (
    <div>
      <WebRecordsHeader requestRecordsList={requestRecordsList} />
      <WebRecordsTable requestRecordsList={requestRecordsList} />
    </div>
  );
}
