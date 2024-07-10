import Space from 'components/Space';
import WebTokensHeader from './WebTokensHeader';
import WebTokensTable from './WebTokensTable';
import styles from './styles.module.scss';
import { TokensDashboardType } from 'types/api';

export default function WebTokens({
  selectType,
  onTypeChange,
}: {
  selectType: TokensDashboardType;
  onTypeChange: (item: TokensDashboardType) => void;
}) {
  return (
    <div className={styles['web-tokens']}>
      <WebTokensHeader selectType={selectType} onTypeChange={onTypeChange} />
      <Space direction={'vertical'} size={12} />
      <WebTokensTable />
    </div>
  );
}
