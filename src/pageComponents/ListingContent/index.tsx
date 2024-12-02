import { useState } from 'react';
import CommonSteps from 'components/CommonSteps';
import CommonPromptCard from 'components/CommonPromptCard';
import { LISTING_STEP_ITEMS, LISTING_FORM_PROMPT_CONTENT } from 'constants/listing';
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
            {LISTING_FORM_PROMPT_CONTENT[currentStep] && (
              <CommonPromptCard content={LISTING_FORM_PROMPT_CONTENT[currentStep]} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
