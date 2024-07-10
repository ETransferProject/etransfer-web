import Space from 'components/Space';
import MobileTokensHeader from '../MobileTokens/MobileTokensHeader';
import WebTokensTable from '../WebTokens/WebTokensTable';
import { TokenDashboardFilterProps } from '../types';

export default function PadTokens({ selectType, onTypeChange }: TokenDashboardFilterProps) {
  return (
    <div>
      <MobileTokensHeader selectType={selectType} onTypeChange={onTypeChange} />
      <Space direction={'vertical'} size={16} />
      <WebTokensTable />
    </div>
  );
}
