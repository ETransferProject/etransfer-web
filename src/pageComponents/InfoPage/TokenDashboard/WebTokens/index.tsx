import Space from 'components/Space';
import WebTokensHeader from './WebTokensHeader';
import WebTokensTable from './WebTokensTable';
import styles from './styles.module.scss';

export default function WebTokens() {
  return (
    <div className={styles['web-tokens']}>
      <WebTokensHeader />
      <Space direction={'vertical'} size={12} />
      <WebTokensTable />
    </div>
  );
}
