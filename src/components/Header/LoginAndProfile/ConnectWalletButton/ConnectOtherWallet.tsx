import {
  Coinbase_16,
  Metamask_16,
  NightElf_16,
  Phantom_16,
  PortkeyV2_16,
  Tonkeeper_16,
  TronLink_16,
  WalletConnect_16,
} from 'assets/images';
import CommonButton, { CommonButtonProps, CommonButtonType } from 'components/CommonButton';
import { CONNECT_WALLET, MY_WALLET } from 'constants/wallet/index';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useCheckHasConnectedWallet } from 'hooks/wallet';
import styles from '../styles.module.scss';
import useEVM from 'hooks/wallet/useEVM';
import { COINBASE_WALLET_ID, METAMASK_WALLET_ID, WALLET_CONNECT_ID } from 'constants/wallet/EVM';
import { useMemo } from 'react';
import { useCommonState } from 'store/Provider/hooks';
import useAelf from 'hooks/wallet/useAelf';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';

export default function ConnectOtherWalletButton(props: CommonButtonProps) {
  const { isMobilePX } = useCommonState();
  const { hasConnected, hasConnectedTypes } = useCheckHasConnectedWallet();
  const { connector } = useEVM();
  const { connector: aelfConnector } = useAelf();

  const walletLogoList = useMemo(() => {
    const walletLogoList = [];
    if (hasConnectedTypes.includes(WalletTypeEnum.AELF)) {
      // TODO FairyVaultDiscover icon
      if (aelfConnector === AelfWalletTypeEnum.elf) {
        walletLogoList.push(NightElf_16);
      } else {
        walletLogoList.push(PortkeyV2_16);
      }
    }
    if (hasConnectedTypes.includes(WalletTypeEnum.EVM)) {
      switch (connector?.id) {
        case METAMASK_WALLET_ID:
          walletLogoList.push(Metamask_16);
          break;
        case COINBASE_WALLET_ID:
          walletLogoList.push(Coinbase_16);
          break;
        case WALLET_CONNECT_ID:
          walletLogoList.push(WalletConnect_16);
          break;
        default:
          break;
      }
    }
    if (hasConnectedTypes.includes(WalletTypeEnum.SOL)) walletLogoList.push(Phantom_16);
    if (hasConnectedTypes.includes(WalletTypeEnum.TRON)) walletLogoList.push(TronLink_16);
    if (hasConnectedTypes.includes(WalletTypeEnum.TON)) walletLogoList.push(Tonkeeper_16);

    return walletLogoList;
  }, [aelfConnector, connector?.id, hasConnectedTypes]);

  if (hasConnected) {
    return (
      <CommonButton id="ConnectWalletButton" type={CommonButtonType.Border} ghost {...props}>
        <div className="flex-row-center gap-6">
          {walletLogoList.map((Item, index) => {
            return <Item key={'wallet-icon' + index} />;
          })}
        </div>
        {!isMobilePX && <span className={styles['connected-wallet-button-text']}>{MY_WALLET}</span>}
      </CommonButton>
    );
  }

  return (
    <CommonButton id="ConnectWalletButton" {...props}>
      {CONNECT_WALLET}
    </CommonButton>
  );
}
