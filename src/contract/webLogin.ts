import { CallContractParams } from 'aelf-web-login';
import { WebLoginInterface } from 'aelf-web-login/dist/types/context';
import { ChainId } from '@portkey/types';
import { AllSupportedELFChainId } from 'constants/chain';

export interface IWebLoginArgs {
  address: string;
  chainId: string;
}

type MethodType = <T, R>(params: CallContractParams<T>) => Promise<R>;

export default class WebLoginInstance {
  public contract: any;
  public address: string | undefined;
  public chainId: string | undefined;

  private static instance: WebLoginInstance | null = null;
  private context: WebLoginInterface | null = null;
  private aelfSendMethod?: MethodType = undefined;
  private aelfViewMethod?: MethodType = undefined;
  private tdvvSendMethod?: MethodType = undefined;
  private tdvvViewMethod?: MethodType = undefined;
  private tdvwSendMethod?: MethodType = undefined;
  private tdvwViewMethod?: MethodType = undefined;

  constructor(options?: IWebLoginArgs) {
    this.address = options?.address;
    this.chainId = options?.chainId;
  }
  static get() {
    if (!WebLoginInstance.instance) {
      WebLoginInstance.instance = new WebLoginInstance();
    }
    return WebLoginInstance.instance;
  }

  setWebLoginContext(context: WebLoginInterface) {
    this.context = context;
  }

  setMethod({
    chain,
    sendMethod,
    viewMethod,
  }: {
    chain: ChainId;
    sendMethod: MethodType;
    viewMethod: MethodType;
  }) {
    switch (chain) {
      case AllSupportedELFChainId.AELF: {
        this.aelfSendMethod = sendMethod;
        this.aelfViewMethod = viewMethod;
        break;
      }
      case AllSupportedELFChainId.tDVV: {
        this.tdvvSendMethod = sendMethod;
        this.tdvvViewMethod = viewMethod;
        break;
      }
      case AllSupportedELFChainId.tDVW: {
        this.tdvwSendMethod = sendMethod;
        this.tdvwViewMethod = viewMethod;
        break;
      }
    }
  }

  setContractMethod(
    contractMethod: {
      chain: ChainId;
      sendMethod: MethodType;
      viewMethod: MethodType;
    }[],
  ) {
    contractMethod.forEach((item) => {
      this.setMethod(item);
    });
  }

  getWebLoginContext() {
    return this.context; // wallet, login, loginState
  }

  callSendMethod<T, R>(chain: ChainId, params: CallContractParams<T>): Promise<R> {
    switch (chain) {
      case AllSupportedELFChainId.AELF:
        return this.aelfSendMethod!(params);
      case AllSupportedELFChainId.tDVV:
        return this.tdvvSendMethod!(params);
      case AllSupportedELFChainId.tDVW:
        return this.tdvwSendMethod!(params);
    }
    throw new Error('Error: Invalid chainId');
  }

  callViewMethod<T, R>(chain: ChainId, params: CallContractParams<T>): Promise<R> {
    switch (chain) {
      case AllSupportedELFChainId.AELF:
        return this.aelfViewMethod!(params);
      case AllSupportedELFChainId.tDVV:
        return this.tdvvViewMethod!(params);
      case AllSupportedELFChainId.tDVW:
        return this.tdvwViewMethod!(params);
    }
    throw new Error('Error: Invalid chainId');
  }

  callContract<T>(params: CallContractParams<T>) {
    return this.context?.callContract(params);
  }
}

export const webLoginInstance = WebLoginInstance.get();
