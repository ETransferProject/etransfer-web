import Space from 'components/Space';
import WebTokensHeader from './WebTokensHeader';
import WebTokensTable from './WebTokensTable';
import { TokensDashboardType } from 'types/api';

export default function WebTokens({
  selectType,
  onTypeChange,
}: {
  selectType: TokensDashboardType;
  onTypeChange: (item: TokensDashboardType) => void;
}) {
  return (
    <div>
      <WebTokensHeader selectType={selectType} onTypeChange={onTypeChange} />
      <Space direction={'vertical'} size={12} />
      <WebTokensTable />
    </div>
  );
}
