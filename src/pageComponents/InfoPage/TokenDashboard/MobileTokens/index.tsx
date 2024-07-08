import Space from 'components/Space';
import styles from './styles.module.scss';
import MobileTokensHeader from './MobileTokensHeader';
import MobileTokensBody from './MobileTokensBody';

export default function MobileTokens() {
  return (
    <div className={styles['mobile-tokens']}>
      <MobileTokensHeader />
      <Space direction={'vertical'} size={12} />
      <MobileTokensBody />
    </div>
  );
}
