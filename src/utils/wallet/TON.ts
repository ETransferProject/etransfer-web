import TonWeb from 'tonweb';

export const tonWeb = new TonWeb();

export const getTONJettonMinter = (tokenContractAddress: string) => {
  const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonWeb.provider, {
    address: tokenContractAddress,
  } as any);
  return jettonMinter;
};
