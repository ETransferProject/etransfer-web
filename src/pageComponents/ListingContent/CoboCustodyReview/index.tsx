import Remind from 'components/Remind';
import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CoboCustodyReviewStatusIcon } from 'assets/images';
import clsx from 'clsx';
import { VIEW_PROGRESS } from 'constants/listing';
import { openWithBlank } from 'utils/common';
import { CONTACT_US_FORM_URL } from 'constants/index';

export default function CoboCustodyReview({ networks }: { networks: { network: string }[] }) {
  const router = useRouter();

  const networksString = useMemo(() => {
    let str = '';
    if (networks.length === 1) {
      str = networks[0].network + ' network';
    } else if (networks.length === 2) {
      str = networks[0].network + ' and ' + networks[1].network + ' networks';
    } else {
      networks?.forEach((item, index) => {
        if (index === networks.length - 1) {
          str += 'and ' + item.network + ' networks';
        } else if (index === networks.length - 2) {
          str += item.network + ' ';
        } else {
          str += item.network + ', ';
        }
      });
    }

    return str;
  }, [networks]);

  const handleGoMyApplications = useCallback(() => {
    router.push('/my-applications');
  }, [router]);

  const renderRemind = useMemo(() => {
    return (
      <Remind className={styles['remind']} iconClassName={styles['remind-icon']} isBorder={false}>
        <div>
          <div className={styles['tip-row']}>
            {`• You can see the progress in ‘`}
            <span className={styles['action']} onClick={handleGoMyApplications}>
              {`My Applications`}
            </span>
            {`’.`}
          </div>
          <div className={styles['tip-row']}>
            {`• Once approved, please add liquidity to complete the listing.`}
          </div>
          <div className={styles['tip-row']}>
            {`• If you need any support, please `}
            <span className={styles['action']} onClick={() => openWithBlank(CONTACT_US_FORM_URL)}>
              {`contact us`}
            </span>
            {` .`}
          </div>
        </div>
      </Remind>
    );
  }, [handleGoMyApplications]);

  return (
    <div className={styles['cobo-custody-review']}>
      {renderRemind}
      <div className={styles['cobo-custody-review-body']}>
        <CoboCustodyReviewStatusIcon />
        <div className={styles['cobo-custody-review-text']}>
          {`The token is successfully created on ${networksString} and submitted for Cobo Custody review. Please reapply for networks where creation has failed.`}
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
