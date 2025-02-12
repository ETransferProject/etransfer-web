import TonWeb, { AddressType } from 'tonweb';

export const tonWeb = new TonWeb();

export const getTONJettonMinter = (tokenContractAddress: string) => {
  const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonWeb.provider, {
    address: tokenContractAddress,
  } as any);
  return jettonMinter;
};

type TCacheJettonWalletAddress = { [key: string]: AddressType };

const CacheJettonWalletAddress: TCacheJettonWalletAddress = {};

export const getJettonWalletAddress = async (address: string, tokenContractAddress: string) => {
  const key = tokenContractAddress + address;
  if (!CacheJettonWalletAddress[key]) {
    const jettonMinter = getTONJettonMinter(tokenContractAddress);
    (CacheJettonWalletAddress as TCacheJettonWalletAddress)[key] =
      await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(address));
  }
  return CacheJettonWalletAddress[key];
};
