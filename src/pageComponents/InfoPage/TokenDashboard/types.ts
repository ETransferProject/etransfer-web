import { TokensDashboardType } from 'types/api';

export interface TokenDashboardFilterProps {
  selectType: TokensDashboardType;
  onTypeChange: (item: TokensDashboardType) => void;
}
