import Space from 'components/Space';
import styles from './styles.module.scss';
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
    <div className={styles['mobile-tokens']}>
      <MobileTokensHeader selectType={selectType} onTypeChange={onTypeChange} />
      <Space direction={'vertical'} size={12} />
      <MobileTokensBody />
    </div>
  );
}
