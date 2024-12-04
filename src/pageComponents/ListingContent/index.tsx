import { useState } from 'react';
import LinkForBlank from 'components/LinkForBlank';
import CommonSteps from 'components/CommonSteps';
import Remind from 'components/Remind';
import TokenInformation from './TokenInformation';
import SelectChain from './SelectChain';
import { BackIcon } from 'assets/images';
import {
  LISTING_STEP_ITEMS,
  LISTING_FORM_PROMPT_CONTENT_MAP,
  ListingStep,
} from 'constants/listing';
import styles from './styles.module.scss';
import Complete from './Complete';

export default function ListingContent() {
  const [currentStep, setCurrentStep] = useState<ListingStep>(ListingStep.SELECT_CHAIN);

  const renderForm = () => {
    switch (currentStep) {
      case ListingStep.TOKEN_INFORMATION:
        return <TokenInformation />;
      case ListingStep.SELECT_CHAIN:
        return <SelectChain />;
      default:
        return null;
    }
  };

  return (
    <div className={styles['listing-container']}>
      <div className={styles['listing-content']}>
        <LinkForBlank
          className={styles['listing-back']}
          href="/"
          element={
            <>
              <BackIcon />
              <span className={styles['listing-back-text']}>Back</span>
            </>
          }
        />
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
            {LISTING_FORM_PROMPT_CONTENT_MAP[currentStep] && (
              <Remind>{LISTING_FORM_PROMPT_CONTENT_MAP[currentStep]}</Remind>
            )}
            <div className={styles['listing-card-form-content']}>{renderForm()}</div>
          </div>

          <Complete />
        </div>
      </div>
    </div>
  );
}
