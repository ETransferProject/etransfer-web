// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { NETWORK_TYPE } from 'constants/index';
import * as Sentry from '@sentry/nextjs';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

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

// Initialize Firebase
const app = initializeApp(NETWORK_TYPE === 'MAIN' ? firebaseConfigMainnet : firebaseConfigTestnet);
let analytics: Analytics;
// only for csr
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export const setEvent = (eventName: string, params?: object) => {
  logEvent(analytics, eventName, params);
};

const reportError = Sentry.captureException;

export { reportError };
