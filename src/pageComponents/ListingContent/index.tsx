import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import LinkForBlank from 'components/LinkForBlank';
import CommonSteps from 'components/CommonSteps';
import TokenInformation from './TokenInformation';
import SelectChain from './SelectChain';
import { BackIcon } from 'assets/images';
import { LISTING_STEP_ITEMS, ListingStep, LISTING_STEP_PATHNAME_MAP } from 'constants/listing';
import { useCommonState } from 'store/Provider/hooks';
import { TSearchParams } from 'types/listing';
import styles from './styles.module.scss';
import { useInitAelfWallet } from 'hooks/wallet/useAelf';
import CoboCustodyReview from './CoboCustodyReview';
import ListingComplete from './ListingComplete';
import InitializeLiquidityPool from './InitializeLiquidityPool';
import { getListingUrl } from 'utils/listing';

export default function ListingContent() {
  const { isPadPX, isMobilePX } = useCommonState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const symbol = useMemo(() => searchParams.get('symbol') || undefined, [searchParams]);
  const networks = useMemo(() => {
    const str = searchParams.get('networks') || '';
    try {
      return str ? JSON.parse(str) : [];
    } catch (error) {
      return [];
    }
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState<ListingStep>(ListingStep.TOKEN_INFORMATION);

  useInitAelfWallet();

  useEffect(() => {
    const step = Object.values(LISTING_STEP_PATHNAME_MAP).findIndex((item) =>
      pathname.includes(item),
    );
    setCurrentStep(step);

    // TODO no 3 and 5 step
  }, [pathname]);

  const handleNextStep = (params?: TSearchParams) => {
    const nextStep = currentStep + 1;
    if (nextStep <= ListingStep.COMPLETE) {
      const replaceUrl = getListingUrl(nextStep, params);
      router.replace(replaceUrl);
    }
  };

  const handlePrevStep = (params?: TSearchParams) => {
    const prevStep = currentStep - 1;
    if (prevStep >= ListingStep.TOKEN_INFORMATION) {
      const replaceUrl = getListingUrl(prevStep, params);
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
      case ListingStep.COBO_CUSTODY_REVIEW:
        return <CoboCustodyReview networks={networks} />;
      case ListingStep.INITIALIZE_LIQUIDITY_POOL:
        return (
          <InitializeLiquidityPool
            symbol={symbol}
            onNext={() => setCurrentStep(ListingStep.COMPLETE)}
          />
        );
      case ListingStep.COMPLETE:
        return <ListingComplete />;
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
