import { TChainId, WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
export function isPortkey() {
  if (typeof window === 'object') return window.navigator.userAgent.includes('Portkey');
  return false;
}

export type TPortkeyWebWalletWalletInfo = {
  caAddress: string;
  caHash: string;
  managerAddress: string;
  managerPubkey: string;
  originChainId: TChainId;
};

export function getPortkeyWebWalletInfo() {
  const portkeyWebWalletInfo = localStorage.getItem('PortkeyWebWalletWalletInfo');
  if (!portkeyWebWalletInfo) return;
  try {
    return JSON.parse(portkeyWebWalletInfo) as TPortkeyWebWalletWalletInfo;
  } catch (error) {
    return;
  }
}

export function checkConnectedWallet() {
  try {
    if (localStorage.getItem('connectedWallet') === WalletTypeEnum.aa)
      localStorage.removeItem('connectedWallet');
  } catch (error) {
    console.log(error, '====checkConnectedWallet');
  }
}
