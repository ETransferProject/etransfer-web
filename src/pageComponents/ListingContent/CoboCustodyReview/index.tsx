import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CoboCustodyReviewStatusIcon } from 'assets/images';
import clsx from 'clsx';
import { VIEW_PROGRESS } from 'constants/listing';

export default function CoboCustodyReview({ networks }: { networks: { name: string }[] }) {
  const router = useRouter();

  const networksString = useMemo(() => {
    let str = '';
    if (networks.length === 1) {
      str = networks[0].name + ' network';
    } else if (networks.length === 2) {
      str = networks[0].name + ' and ' + networks[1].name + ' networks';
    } else {
      networks?.forEach((item, index) => {
        if (index === networks.length - 1) {
          str += 'and ' + item.name + ' networks';
        } else if (index === networks.length - 2) {
          str += item.name + ' ';
        } else {
          str += item.name + ', ';
        }
      });
    }

    return str;
  }, [networks]);

  const handleGoMyApplications = useCallback(() => {
    router.push('/my-applications');
  }, [router]);

  return (
    <div className={styles['cobo-custody-review']}>
      <div className={styles['component-title']}>{`Cobo Custody Review`}</div>
      <div className={styles['cobo-custody-review-body']}>
        <CoboCustodyReviewStatusIcon />
        <div className={styles['cobo-custody-review-text']}>
          {`The token is successfully created on ${networksString} and submitted for Cobo Custody review. Please resubmit for networks where creation has failed.`}
        </div>

        <div
          className={clsx(styles['action'], styles['action-bold'])}
          onClick={handleGoMyApplications}>
          {VIEW_PROGRESS}
        </div>
      </div>
    </div>
  );
}
