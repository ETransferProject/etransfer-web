// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { NETWORK_NAME, NETWORK_TYPE_V1 } from 'constants/index';
import { NetworkName } from 'constants/network';
import * as Sentry from '@sentry/nextjs';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

console.log(
  'firebase - NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID1',
  process.env.NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID,
);
console.log(
  'firebase - NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
);

const firebaseBaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_ANALYTICS_API_KEY,
  authDomain: 'etransfer-83ef6.firebaseapp.com',
  projectId: 'etransfer-83ef6',
  storageBucket: 'etransfer-83ef6.appspot.com',
  messagingSenderId: '528873682054',
};

// mainnet
const firebaseConfigMainnet = {
  ...firebaseBaseConfig,
  appId: process.env.NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MAINNET_FIREBASE_ANALYTICS_MEASUREMENT_ID,
};

// testnet
const firebaseConfigTestnet = {
  ...firebaseBaseConfig,
  appId: process.env.NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_TESTNET_FIREBASE_ANALYTICS_MEASUREMENT_ID,
};

let analytics: Analytics;

if (NETWORK_NAME === NetworkName.mainnet || NETWORK_NAME === NetworkName.testnet) {
  // Initialize Firebase
  const app = initializeApp(
    NETWORK_TYPE_V1 === 'MAIN' ? firebaseConfigMainnet : firebaseConfigTestnet,
  );

  // only for csr
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
}

export const setEvent = (eventName: string, params?: object) => {
  logEvent(analytics, eventName, params);
};

const reportError = Sentry.captureException;

export { reportError };
