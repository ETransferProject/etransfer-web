'use client';
import React, { useCallback } from 'react';
import { RE_CAPTCHA_SITE_KEY } from 'constants/misc';
import GoogleReCaptcha from 'components/GoogleRecaptcha';
import styles from './styles.module.scss';

export default function ReCaptcha() {
  const handleSuccess = useCallback((response: string) => {
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
        siteKey={RE_CAPTCHA_SITE_KEY}
        theme="light"
        size="normal"
        onSuccess={handleSuccess}
        onError={handleError}
        onExpired={handleExpired}
      />
    </div>
  );
}
