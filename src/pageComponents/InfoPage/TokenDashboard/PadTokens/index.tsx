import CommonSpace from 'components/CommonSpace';
import MobileTokensHeader from '../MobileTokens/MobileTokensHeader';
import WebTokensTable from '../WebTokens/WebTokensTable';
import { TokenDashboardFilterProps } from '../types';

export default function PadTokens({ selectType, onTypeChange }: TokenDashboardFilterProps) {
  return (
    <div>
      <MobileTokensHeader selectType={selectType} onTypeChange={onTypeChange} />
      <CommonSpace direction={'vertical'} size={16} />
      <WebTokensTable />
    </div>
  );
}
