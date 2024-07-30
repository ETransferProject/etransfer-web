import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { SignInDesignEnum } from '@aelf-web-login/wallet-adapter-base';
import {
  APP_NAME,
  AelfReact,
  BRAND_NAME,
  NETWORK_TYPE,
  SupportedChainId,
  TELEGRAM_BOT_ID,
  WebLoginConnectUrl,
  WebLoginGraphqlUrl,
  WebLoginServiceUrl,
} from 'constants/index';
import { ETRANSFER_LOGO_BASE64 } from 'constants/wallet';
import { TelegramPlatform } from 'utils/telegram';

const didConfig = {
  graphQLUrl: WebLoginGraphqlUrl,
  connectUrl: WebLoginConnectUrl,
  serviceUrl: WebLoginServiceUrl,
  requestDefaults: {
    baseURL: WebLoginServiceUrl,
    timeout: 20000,
  },
  socialLogin: {
    Portkey: {
      websiteName: BRAND_NAME,
      websiteIcon: ETRANSFER_LOGO_BASE64,
    },
    Telegram: {
      botId: TELEGRAM_BOT_ID,
    },
  },
  networkType: NETWORK_TYPE,
};

const baseConfig = {
  showVconsole: false,
  networkType: NETWORK_TYPE,
  chainId: SupportedChainId.sideChain,
  keyboard: true,
  noCommonBaseModal: false,
  design: SignInDesignEnum.SocialDesign,
  titleForSocialDesign: 'Log In to ETransfer',
  iconSrcForSocialDesign: ETRANSFER_LOGO_BASE64,
};

const isTelegramPlatform = TelegramPlatform.isTelegramPlatform();
const portkeyAAWallet = new PortkeyAAWallet({
  appName: APP_NAME,
  chainId: SupportedChainId.sideChain,
  autoShowUnlock: true,
});

export const config: IConfigProps = {
  didConfig,
  baseConfig,
  wallets: isTelegramPlatform
    ? [portkeyAAWallet]
    : [
        portkeyAAWallet,
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
