import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyInnerWallet } from '@aelf-web-login/wallet-adapter-portkey-web';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { SignInDesignEnum } from '@aelf-web-login/wallet-adapter-base';
import {
  APP_NAME,
  AelfReact,
  NETWORK_TYPE,
  SHOW_V_CONSOLE,
  SupportedChainId,
  TELEGRAM_BOT_ID,
  WebLoginConnectUrl,
  WebLoginGraphqlUrl,
  WebLoginServiceUrl,
} from 'constants/index';
import { ETRANSFER_PORTKEY_PROJECT_CODE } from 'constants/misc';
import { TelegramPlatform } from 'utils/telegram';
import { devices } from '@portkey/utils';
import { FairyVaultDiscoverWallet } from '@aelf-web-login/wallet-adapter-fairy-vault-discover';

export const didConfig = {
  graphQLUrl: WebLoginGraphqlUrl,
  connectUrl: WebLoginConnectUrl,
  serviceUrl: WebLoginServiceUrl,
  requestDefaults: {
    baseURL: WebLoginServiceUrl,
    timeout: 20000,
  },
  socialLogin: {
    Telegram: {
      botId: TELEGRAM_BOT_ID,
    },
  },
  networkType: NETWORK_TYPE,
  referralInfo: {
    referralCode: '',
    projectCode: ETRANSFER_PORTKEY_PROJECT_CODE,
  },
};

const baseConfig: IConfigProps['baseConfig'] = {
  showVconsole: SHOW_V_CONSOLE,
  networkType: NETWORK_TYPE,
  chainId: SupportedChainId.sideChain,
  sideChainId: SupportedChainId.sideChain,
  // keyboard: true,
  // noCommonBaseModal: false,
  design: SignInDesignEnum.CryptoDesign,
  enableAcceleration: true,
  appName: APP_NAME,
  theme: 'light',
};

const isTelegramPlatform = TelegramPlatform.isTelegramPlatform();

const portkeyInnerWallet = new PortkeyInnerWallet({
  networkType: NETWORK_TYPE,
  chainId: SupportedChainId.sideChain,
  disconnectConfirm: true,
});

const fairyVaultDiscoverWallet = new FairyVaultDiscoverWallet({
  networkType: NETWORK_TYPE,
  chainId: SupportedChainId.sideChain,
  autoRequestAccount: true, // If set to true, please contact Portkey to add whitelist
  autoLogoutOnDisconnected: true,
  autoLogoutOnNetworkMismatch: true,
  autoLogoutOnAccountMismatch: true,
  autoLogoutOnChainMismatch: true,
});

const isMobileDevices = devices.isMobileDevices();

export const config: IConfigProps = {
  baseConfig,
  wallets: isTelegramPlatform
    ? [portkeyInnerWallet]
    : isMobileDevices
    ? [
        portkeyInnerWallet,
        fairyVaultDiscoverWallet,
        new PortkeyDiscoverWallet({
          networkType: NETWORK_TYPE,
          chainId: SupportedChainId.sideChain,
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
        }),
      ]
    : [
        portkeyInnerWallet,
        new PortkeyDiscoverWallet({
          networkType: NETWORK_TYPE,
          chainId: SupportedChainId.sideChain,
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
        }),
        new NightElfWallet({
          chainId: SupportedChainId.sideChain,
          appName: APP_NAME,
          connectEagerly: true,
          defaultRpcUrl: AelfReact[SupportedChainId.sideChain].rpcUrl,
          nodes: AelfReact,
        }),
      ],
};
