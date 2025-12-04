import CommonSpace from 'components/CommonSpace';
import MobileTokensHeader from './MobileTokensHeader';
import MobileTokensBody from './MobileTokensBody';
import { TokensDashboardType } from 'types/api';

export default function MobileTokens({
  selectType,
  onTypeChange,
}: {
  selectType: TokensDashboardType;
  onTypeChange: (item: TokensDashboardType) => void;
}) {
  return (
    <div>
      <MobileTokensHeader selectType={selectType} onTypeChange={onTypeChange} />
      <CommonSpace direction={'vertical'} size={12} />
      <MobileTokensBody />
    </div>
  );
}
