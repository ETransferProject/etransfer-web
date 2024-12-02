import { useState } from 'react';
import CommonSteps from 'components/CommonSteps';
import { LISTING_STEP_ITEMS } from 'constants/listing';
import styles from './styles.module.scss';

export default function ListingContent() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className={styles['listing-container']}>
      <div className={styles['listing-content']}>
        <div className={styles['listing-card-list']}>
          <div className={styles['listing-card']}>
            <div className={styles['listing-card-steps-title']}>Listing Application</div>
            <CommonSteps
              stepItems={LISTING_STEP_ITEMS}
              current={currentStep}
              onChange={setCurrentStep}
            />
          </div>
          <div className={styles['listing-card']}>
            <div className={styles['listing-card-form-title']}>
              {LISTING_STEP_ITEMS[currentStep].title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
