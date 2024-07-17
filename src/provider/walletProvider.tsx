'use client';
import { AelfReact, SupportedChainId } from 'constants/index';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
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
import { TWallet } from 'contract/types';
import myEvents from 'utils/myEvent';
import { resetLocalJWT } from 'api/utils';
import { useQueryAuthToken } from 'hooks/authToken';
import { eTransferInstance } from 'utils/etransferInstance';
import { useClearStore } from 'hooks/common';
import { useRouterPush } from 'hooks/route';

export const DESTROY = 'DESTROY';
const SET_WALLET = 'SET_WALLET';

const INITIAL_STATE = {};
const WalletContext = createContext<any>(INITIAL_STATE);

export type TWalletContextState = {
  wallet?: TWallet;
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

function WalletProvider({ children }: { children: React.ReactNode }) {
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
    console.warn('>>>>>> loginState', webLoginContext.loginState);
    if (webLoginContext.loginState !== WebLoginState.logined) return;
    onInitWallet();
  }, [onInitWallet, webLoginContext.loginState]);

  const { getAuth } = useQueryAuthToken();
  useEffect(() => {
    if (webLoginContext.loginState !== WebLoginState.logined) return;
    getAuth();
    // Ignore the impact of the change in getAuth, just watch loginState change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webLoginContext.loginState]);

  const { queryAuth } = useQueryAuthToken();
  const routerPush = useRouterPush();
  const routerPushRef = useRef(routerPush);
  routerPushRef.current = routerPush;
  const onAuthorizationExpired = useCallback(async () => {
    if (webLoginContext.loginState !== WebLoginState.logined) {
      console.log('AuthorizationExpired: Not Logined');
      routerPushRef.current('/', false);
      return;
    }
    resetLocalJWT();
    console.log('AuthorizationExpired');
    eTransferInstance.setUnauthorized(true);
    await queryAuth();
  }, [queryAuth, webLoginContext.loginState]);
  const onAuthorizationExpiredRef = useRef(onAuthorizationExpired);
  onAuthorizationExpiredRef.current = onAuthorizationExpired;

  useEffect(() => {
    const { remove } = myEvents.Unauthorized.addListener(() => {
      if (eTransferInstance.unauthorized) return;
      eTransferInstance.setUnauthorized(true);
      onAuthorizationExpiredRef.current?.();
    });
    return () => {
      remove();
    };
  }, [wallet]);

  const onLoginError = useCallback((error: any) => {
    console.log('onLoginError', error);
    if (error?.message) {
      singleMessage.error(error.message);
    }
  }, []);
  useWebLoginEvent(WebLoginEvents.LOGIN_ERROR, onLoginError);

  const clearStore = useClearStore();
  const logoutAsync = useCallback(async () => {
    console.warn('Emit WebLoginEvents.LOGOUT');
    clearStore();
  }, [clearStore]);
  useWebLoginEvent(WebLoginEvents.LOGOUT, logoutAsync);

  return (
    <WalletContext.Provider value={useMemo(() => [state, dispatch], [state, dispatch])}>
      {children}
    </WalletContext.Provider>
  );
}

export default WalletProvider;
