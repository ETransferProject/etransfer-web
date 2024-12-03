import { BackIcon } from 'assets/images';
import styles from './styles.module.scss';

export default function MyApplicationsPage() {
  return (
    <div className={styles['page-container-wrapper']}>
      <div className={styles['page-back']}>
        <BackIcon />
        <div className={styles['page-back-text']}>Back</div>
      </div>
      <div className={styles['page-body']}>
        <div className={styles['page-title']}>My Applications</div>
      </div>
    </div>
  );
}
