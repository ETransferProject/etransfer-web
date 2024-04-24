'use client';
import {
  AelfReact,
  AppName,
  NETWORK_TYPE_V1,
  WebLoginConnectUrlV2,
  WebLoginGraphqlUrlV1,
  WebLoginGraphqlUrlV2,
  WebLoginRequestDefaultsUrlV2,
  NETWORK_NAME,
  NETWORK_TYPE_V2,
  WebLoginServiceUrlV1,
  WebLoginServiceUrlV2,
  SupportedChainId,
} from 'constants/index';
import { NetworkName } from 'constants/network';
import dynamic from 'next/dynamic';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { logoIcon } from 'constants/wallet';
import {
  WebLoginEvents,
  WebLoginInterface,
  WebLoginState,
  useCallContract,
  useWebLogin,
  useWebLoginEvent,
} from 'aelf-web-login';
import Wallet from 'contract/webLogin';
import { useLocation } from 'react-use';
import { singleMessage } from '@portkey/did-ui-react';
import { IWallet } from 'contract/types';

export const DESTROY = 'DESTROY';
const SET_WALLET = 'SET_WALLET';

const INITIAL_STATE = {};
const WalletContext = createContext<any>(INITIAL_STATE);

export type TWalletContextState = {
  wallet?: IWallet;
};

export function useWalletContext(): [TWalletContextState, React.Dispatch<any>] {
  return useContext(WalletContext);
}

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case SET_WALLET: {
      return {
        ...state,
        wallet: payload,
      };
    }
    case DESTROY: {
      return {};
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const webLoginContext = useWebLogin();
  const webLoginContextRef = useRef<WebLoginInterface>(webLoginContext);
  webLoginContextRef.current = webLoginContext;

  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const { wallet } = state;
  if (
    webLoginContext.loginState === WebLoginState.logined &&
    wallet &&
    webLoginContext.callContract
  ) {
    webLoginContext.callContract && wallet.setCallContract(webLoginContext.callContract);
    webLoginContext.getSignature && wallet.setGetSignature(webLoginContext.getSignature);
  }

  const { callSendMethod: callMainChainSendMethod, callViewMethod: callMainChainViewMethod } =
    useCallContract({
      chainId: SupportedChainId.mainChain,
      rpcUrl: AelfReact[SupportedChainId.mainChain].rpcUrl,
    });
  const { callSendMethod: callSideChainSendMethod, callViewMethod: callSideChainViewMethod } =
    useCallContract({
      chainId: SupportedChainId.sideChain,
      rpcUrl: AelfReact[SupportedChainId.sideChain].rpcUrl,
    });

  const onInitWallet = useCallback(() => {
    const _webLoginContext = webLoginContextRef.current;
    const wallet = new Wallet({
      walletInfo: _webLoginContext.wallet,
      walletType: _webLoginContext.walletType,
      callContract: _webLoginContext.callContract,
      getSignature: _webLoginContext.getSignature,
    });
    dispatch({
      type: SET_WALLET,
      payload: wallet,
    });
    wallet.setWebLoginContext(_webLoginContext);
    wallet.setContractMethod([
      {
        chain: SupportedChainId.mainChain,
        sendMethod: callMainChainSendMethod,
        viewMethod: callMainChainViewMethod,
      },
      {
        chain: SupportedChainId.sideChain,
        sendMethod: callSideChainSendMethod,
        viewMethod: callSideChainViewMethod,
      },
    ]);
  }, [
    callMainChainSendMethod,
    callMainChainViewMethod,
    callSideChainSendMethod,
    callSideChainViewMethod,
  ]);

  // WebLoginEvents.LOGINED - can not get wallet info.
  // Please use webLoginContext.loginState===WebLoginState.logined
  // useWebLoginEvent(WebLoginEvents.LOGINED, onInitWallet);
  useEffect(() => {
    if (webLoginContext.loginState !== WebLoginState.logined) return;
    onInitWallet();
  }, [onInitWallet, webLoginContext.loginState]);

  const onLoginError = useCallback((error: any) => {
    console.log('onLoginError', error);
    if (error?.message) {
      singleMessage.error(error.message);
    }
  }, []);
  useWebLoginEvent(WebLoginEvents.LOGIN_ERROR, onLoginError);

  return (
    <WalletContext.Provider value={useMemo(() => [state, dispatch], [state, dispatch])}>
      {children}
    </WalletContext.Provider>
  );
}

const WebLoginPortkeyProvider = dynamic(
  async () => {
    const { PortkeyProvider } = await import('aelf-web-login').then((module) => module);
    return PortkeyProvider;
  },
  { ssr: false },
);

const WebLoginProviderDynamic = dynamic(
  async () => {
    const webLogin = await import('aelf-web-login').then((module) => module);

    webLogin.setGlobalConfig({
      appName: AppName,
      chainId: SupportedChainId.sideChain,
      networkType: NETWORK_TYPE_V1,
      portkey: {
        graphQLUrl: WebLoginGraphqlUrlV1,
        requestDefaults: {
          baseURL: WebLoginServiceUrlV1,
        },
      },
      onlyShowV2: true,
      portkeyV2: {
        useLocalStorage: true,
        graphQLUrl: WebLoginGraphqlUrlV2,
        networkType: NETWORK_TYPE_V2,
        connectUrl: WebLoginConnectUrlV2,
        requestDefaults: {
          baseURL: WebLoginServiceUrlV2,
          timeout: NETWORK_NAME === NetworkName.testnet ? 300000 : 80000,
        },
        serviceUrl: WebLoginRequestDefaultsUrlV2,
      },
      aelfReact: {
        appName: AppName,
        nodes: AelfReact,
      },
      defaultRpcUrl: AelfReact[SupportedChainId.sideChain].rpcUrl,
    });
    return webLogin.WebLoginProvider;
  },
  { ssr: false },
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WebLoginPortkeyProvider
      networkType={NETWORK_TYPE_V1}
      networkTypeV2={NETWORK_TYPE_V2}
      theme="dark">
      <WebLoginProviderDynamic
        nightElf={{
          useMultiChain: false,
          connectEagerly: false,
        }}
        portkey={{
          design: 'SocialDesign',
          autoShowUnlock: true,
          checkAccountInfoSync: true,
        }}
        commonConfig={{
          showClose: true,
          iconSrc: logoIcon,
          title: 'Log In to ETransfer',
        }}
        extraWallets={['discover']}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
          onPluginNotFound: (openStore) => {
            console.log('openStore:', openStore);
          },
        }}>
        <WalletProvider>{children}</WalletProvider>
      </WebLoginProviderDynamic>
    </WebLoginPortkeyProvider>
  );
}
