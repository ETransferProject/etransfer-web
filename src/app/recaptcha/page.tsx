'use client';
import React, { useCallback, useMemo } from 'react';
import { RECAPTCHA_SITE_KEY_MAINNET, RECAPTCHA_SITE_KEY_TESTNET } from 'constants/misc';
import GoogleReCaptcha from 'components/GoogleRecaptcha';
import styles from './styles.module.scss';
import { NETWORK_TYPE } from 'constants/index';
import { useSearchParams } from 'next/navigation';
import { BaseReCaptcha } from 'components/GoogleRecaptcha/types';

export default function ReCaptcha() {
  const searchParams = useSearchParams();

  const type = useMemo(() => {
    return searchParams.get('type') || 'page';
  }, [searchParams]);

  const handleSuccess = useCallback(
    (response: string) => {
      console.warn('🌟 Google reCaptcha response:', response);
      if (type === 'iframe') {
        window.parent.postMessage(
          {
            type: 'GOOGLE_RECAPTCHA_RESULT',
            data: response,
          },
          '*',
        );
      } else {
        window.opener.postMessage(
          {
            type: 'GOOGLE_RECAPTCHA_RESULT',
            data: response,
          },
          '*',
        );
      }
      window.close();
    },
    [type],
  );
  const handleError = useCallback(
    (error: any) => {
      if (type === 'iframe') {
        window.parent.postMessage(
          {
            type: 'GOOGLE_RECAPTCHA_ERROR',
            data: error,
          },
          '*',
        );
      } else {
        window.opener.postMessage(
          {
            type: 'GOOGLE_RECAPTCHA_ERROR',
            data: error,
          },
          '*',
        );
      }
    },
    [type],
  );
  const handleExpired = useCallback(
    (value: any) => {
      if (type === 'iframe') {
        window.parent.postMessage(
          {
            type: 'GOOGLE_RECAPTCHA_EXPIRED',
            data: value,
          },
          '*',
        );
      } else {
        window.opener.postMessage(
          {
            type: 'GOOGLE_RECAPTCHA_EXPIRED',
            data: value,
          },
          '*',
        );
      }
    },
    [type],
  );

  return (
    <div className={styles.reCaptchaContainer}>
      <GoogleReCaptcha
        siteKey={
          NETWORK_TYPE === 'TESTNET' ? RECAPTCHA_SITE_KEY_TESTNET : RECAPTCHA_SITE_KEY_MAINNET
        }
        theme={(searchParams.get('theme') as BaseReCaptcha['theme']) || 'light'}
        size={(searchParams.get('size') as BaseReCaptcha['size']) || 'normal'}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpired={handleExpired}
      />
    </div>
  );
}
