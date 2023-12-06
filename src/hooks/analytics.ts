import { useEffect } from 'react';
import ReactGA from 'react-ga';

export function useGoogleAnalytics(id?: string) {
  useEffect(() => {
    if (typeof window === 'object' && id) {
      ReactGA.initialize(id);
      ReactGA.pageview(window.location.pathname + window.location.search);
      // ReactGA.event({
      //   category: 'User',
      //   action: 'Created an Account',
      // });
    }
  }, [id]);
}
