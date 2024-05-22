import WebHistoryHeader from './WebHistoryHeader';
import WebHistoryTable from './WebHistoryTable';
import { TRecordsContentProps } from 'pageComponents/HistoryContent';

export default function WebHistoryContent({ requestRecordsList, onReset }: TRecordsContentProps) {
  return (
    <div>
      <WebHistoryHeader requestRecordsList={requestRecordsList} onReset={onReset} />
      <WebHistoryTable requestRecordsList={requestRecordsList} />
    </div>
  );
}
