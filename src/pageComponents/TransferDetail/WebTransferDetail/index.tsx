import { TGetRecordDetailResult } from 'types/api';
import TransferDetailMain from '../TransferDetailMain';
import { Breadcrumb } from 'antd';
import { useRouter } from 'next/navigation';
import styles from './styles.module.scss';

export default function WebTransferDetail(props: TGetRecordDetailResult) {
  const router = useRouter();
  return (
    <div className={'main-content-container main-content-container-safe-area'}>
      <Breadcrumb className={styles['web-transfer-detail-breadcrumb']}>
        <Breadcrumb.Item
          className={styles['web-transfer-detail-breadcrumb-first']}
          onClick={() => router.push('/history')}>
          History
        </Breadcrumb.Item>
        <Breadcrumb.Item className={styles['web-transfer-detail-breadcrumb-second']}>
          Transfer Detail
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className={styles['detail-title']}>Transfer Detail</div>
      <TransferDetailMain {...props} />
    </div>
  );
}
