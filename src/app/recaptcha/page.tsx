'use client';
import React, { useCallback, useMemo } from 'react';
import { RECAPTCHA_SITE_KEY_MAINNET, RECAPTCHA_SITE_KEY_TESTNET } from 'constants/misc';
import GoogleReCaptcha from 'components/GoogleRecaptcha';
import styles from './styles.module.scss';
import { NETWORK_TYPE } from 'constants/index';
import { TSearch } from 'types';
import { BaseReCaptcha } from 'components/GoogleRecaptcha/types';

export default function ReCaptcha({ searchParams = {} }: { searchParams: TSearch }) {
  const { theme = 'light', size = 'normal' } = useMemo(() => {
    return searchParams as Omit<BaseReCaptcha, 'customReCaptchaHandler' | 'siteKey'>;
  }, [searchParams]);
  const handleSuccess = useCallback((response: string) => {
    console.warn('Google reCaptcha response:', response);
    window.opener.postMessage(
      {
        type: 'GOOGLE_RECAPTCHA_RESULT',
        data: response,
      },
      '*',
    );
  }, []);
  const handleError = useCallback((error: any) => {
    window.opener.postMessage(
      {
        type: 'GOOGLE_RECAPTCHA_ERROR',
        data: error,
      },
      '*',
    );
  }, []);
  const handleExpired = useCallback((value: any) => {
    window.opener.postMessage(
      {
        type: 'GOOGLE_RECAPTCHA_EXPIRED',
        data: value,
      },
      '*',
    );
  }, []);

  return (
    <div className={styles.reCaptchaContainer}>
      <GoogleReCaptcha
        siteKey={
          NETWORK_TYPE === 'TESTNET' ? RECAPTCHA_SITE_KEY_TESTNET : RECAPTCHA_SITE_KEY_MAINNET
        }
        theme={theme}
        size={size}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpired={handleExpired}
      />
    </div>
  );
}
