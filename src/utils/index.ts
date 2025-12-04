export function isFairyVault() {
  if (typeof window === 'object') return window.navigator.userAgent.includes('FairyVault');
  return false;
}
