export function isPortkey() {
  if (typeof window === 'object') return window.navigator.userAgent.includes('Portkey');
  return false;
}
