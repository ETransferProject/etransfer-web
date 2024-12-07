import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import LinkForBlank from 'components/LinkForBlank';
import CommonSteps from 'components/CommonSteps';
import TokenInformation from './TokenInformation';
import SelectChain from './SelectChain';
import { BackIcon } from 'assets/images';
import { LISTING_STEP_ITEMS, ListingStep, LISTING_STEP_PATHNAME_MAP } from 'constants/listing';
import { useCommonState } from 'store/Provider/hooks';
import { TSearchParams } from 'types/listing';
import styles from './styles.module.scss';

export default function ListingContent() {
  const { isPadPX, isMobilePX } = useCommonState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const symbol = useMemo(() => searchParams.get('symbol') || undefined, [searchParams]);

  const [currentStep, setCurrentStep] = useState<ListingStep>(ListingStep.TOKEN_INFORMATION);

  useEffect(() => {
    const step = Object.values(LISTING_STEP_PATHNAME_MAP).findIndex((item) =>
      pathname.includes(item),
    );
    setCurrentStep(step);
  }, [pathname]);

  const getReplaceUrl = (step: ListingStep, params: TSearchParams) => {
    let search;
    switch (step) {
      case ListingStep.TOKEN_INFORMATION:
        search = queryString.stringify({
          symbol: params.symbol,
        });
        break;
      case ListingStep.SELECT_CHAIN:
        search = queryString.stringify({
          symbol: params.symbol,
        });
        break;
    }
    return `/listing${LISTING_STEP_PATHNAME_MAP[step]}${search ? '?' + search : ''}`;
  };

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= ListingStep.COMPLETE) {
      const replaceUrl = getReplaceUrl(nextStep, { symbol });
      router.replace(replaceUrl);
    }
  };

  const handlePrevStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= ListingStep.TOKEN_INFORMATION) {
      const replaceUrl = getReplaceUrl(prevStep, { symbol });
      router.replace(replaceUrl);
    }
  };

  const renderForm = () => {
    switch (currentStep) {
      case ListingStep.TOKEN_INFORMATION:
        return <TokenInformation symbol={symbol} handleNextStep={handleNextStep} />;
      case ListingStep.SELECT_CHAIN:
        return (
          <SelectChain
            symbol={symbol}
            handleNextStep={handleNextStep}
            handlePrevStep={handlePrevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles['listing-container']}>
      <div className={styles['listing-content']}>
        {!isPadPX && (
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
        )}
        <div className={styles['listing-card-list']}>
          <div className={styles['listing-card']}>
            <div className={styles['listing-card-steps-title']}>Listing Application</div>
            <CommonSteps stepItems={LISTING_STEP_ITEMS} current={currentStep} />
          </div>
          {isMobilePX && <div className={styles['listing-card-divider']} />}
          <div className={styles['listing-card']}>
            <div className={styles['listing-card-form-title']}>
              {LISTING_STEP_ITEMS[currentStep].title}
            </div>
            <div className={styles['listing-card-form-content']}>{renderForm()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
