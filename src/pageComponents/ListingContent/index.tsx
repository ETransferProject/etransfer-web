import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CommonSteps from 'components/CommonSteps';
import UnsavedChangesWarningModal from './UnsavedChangesWarningModal';
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

let globalCanAccessStep = false;

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

  const [currentStep, setCurrentStep] = useState<ListingStep | undefined>();
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  const isNavigatingRef = useRef(false);
  const nextUrlRef = useRef('');

  useInitAelfWallet();

  useEffect(() => {
    const step = Object.values(LISTING_STEP_PATHNAME_MAP).findIndex((item) =>
      pathname.includes(item),
    );

    if (
      step === ListingStep.TOKEN_INFORMATION ||
      step === ListingStep.SELECT_CHAIN ||
      step === ListingStep.INITIALIZE_LIQUIDITY_POOL ||
      globalCanAccessStep
    ) {
      setCurrentStep(step);
    } else {
      router.replace('/my-applications');
    }
  }, [pathname, router]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        currentStep === ListingStep.TOKEN_INFORMATION ||
        currentStep === ListingStep.SELECT_CHAIN
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStep]);

  const handleNextStep = (params?: TSearchParams) => {
    if (typeof currentStep !== 'number') return;
    const nextStep = currentStep + 1;
    if (nextStep <= ListingStep.COMPLETE) {
      globalCanAccessStep = true;
      isNavigatingRef.current = true;
      const replaceUrl = getListingUrl(nextStep, params);
      router.replace(replaceUrl);
    }
  };

  const handlePrevStep = (params?: TSearchParams) => {
    if (typeof currentStep !== 'number') return;
    const prevStep = currentStep - 1;
    if (prevStep >= ListingStep.TOKEN_INFORMATION) {
      globalCanAccessStep = true;
      isNavigatingRef.current = true;
      const replaceUrl = getListingUrl(prevStep, params);
      router.replace(replaceUrl);
    }
  };

  const handleWarningModalConfirm = () => {
    setIsWarningModalOpen(false);
    if (nextUrlRef.current === 'back') {
      isNavigatingRef.current = true;
      router.back();
    } else if (nextUrlRef.current) {
      isNavigatingRef.current = true;
      router.push(nextUrlRef.current);
    }
  };

  const handleWarningModalCancel = () => {
    setIsWarningModalOpen(false);
    nextUrlRef.current = '';
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
        return <InitializeLiquidityPool symbol={symbol} onNext={handleNextStep} />;
      case ListingStep.COMPLETE:
        return <ListingComplete />;
      default:
        return null;
    }
  };

  if (typeof currentStep !== 'number') return null;

  return (
    <>
      <div className={styles['listing-container']}>
        <div className={styles['listing-content']}>
          {!isPadPX && (
            <div
              className={styles['listing-back']}
              onClick={() => {
                if (
                  currentStep === ListingStep.TOKEN_INFORMATION ||
                  currentStep === ListingStep.SELECT_CHAIN
                ) {
                  setIsWarningModalOpen(true);
                  nextUrlRef.current = window.history.length > 1 ? 'back' : '/';
                } else if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/');
                }
              }}>
              <BackIcon />
              <span className={styles['listing-back-text']}>Back</span>
            </div>
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
      <UnsavedChangesWarningModal
        open={isWarningModalOpen}
        onCancel={handleWarningModalCancel}
        onOk={handleWarningModalConfirm}
      />
    </>
  );
}
