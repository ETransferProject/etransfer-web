import {
  WalletInfo,
  WalletType,
  CallContractParams,
  SignatureData,
  WebLoginInterface,
} from 'aelf-web-login';
import {
  TCallContractFunc,
  TGetSignatureFunc,
  TWallet,
  TWalletProps,
  TCallSendMethod,
  TCallViewMethod,
  TSignatureParams,
} from './types';
import { getTxResult } from 'utils/contract';
import { ChainId, SendOptions } from '@portkey/types';
import { SendOptions as SendOptionsV1 } from '@portkey-v1/types';
import { sleep } from '@portkey/utils';
import { AllSupportedELFChainId } from 'constants/chain';
import { SupportedELFChainId, AppName } from 'constants/index';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { AuthTokenSource } from 'types/api';
import { getLocalJWT } from 'api/utils';
import service from 'api/axios';

class Wallet implements TWallet {
  walletInfo: WalletInfo;
  walletType: WalletType;

  _getSignature: TGetSignatureFunc;
  _callContract: TCallContractFunc;

  private context: WebLoginInterface | null = null;
  private AELFSendMethod?: TCallSendMethod;
  private AELFViewMethod?: TCallViewMethod;
  private tDVVSendMethod?: TCallSendMethod;
  private tDVVViewMethod?: TCallViewMethod;
  private tDVWSendMethod?: TCallSendMethod;
  private tDVWViewMethod?: TCallViewMethod;

  constructor(props: TWalletProps) {
    this.walletInfo = props.walletInfo;
    this.walletType = props.walletType;
    this._callContract = props.callContract;
    this._getSignature = props.getSignature;
  }

  setCallContract(callContract: TCallContractFunc) {
    this._callContract = callContract;
  }
  setGetSignature(getSignature: TGetSignatureFunc) {
    this._getSignature = getSignature;
  }

  public async callContract<T, R>(chainId: ChainId, params: CallContractParams<T>): Promise<R> {
    const req: any = await this._callContract(params);

    console.log('callContract req', req);
    if (req.error) {
      console.log(req.error, '===req.error');
      throw {
        code: req.error.message?.Code || req.error,
        message: req.errorMessage?.message || req.error.message?.Message,
      };
    }

    const transactionId =
      req.result?.TransactionId ||
      req.result?.transactionId ||
      req.TransactionId ||
      req.transactionId;

    await sleep(1000);
    // TODO login
    return getTxResult(transactionId, chainId as SupportedELFChainId);
  }

  getSignature(params: TSignatureParams): Promise<SignatureData> {
    return this._getSignature({
      appName: AppName || '',
      address: this.walletInfo.address,
      ...params,
    });
  }

  async setAuthFromStorage() {
    const { caHash } = await getCaHashAndOriginChainIdByWallet(this.walletInfo, this.walletType);
    const managerAddress = await getManagerAddressByWallet(this.walletInfo, this.walletType);
    const source =
      this.walletType === WalletType.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
    const key = (caHash || source) + managerAddress;
    const data = getLocalJWT(key);
    // local storage has JWT token
    if (data) {
      const token_type = data.token_type;
      const access_token = data.access_token;
      service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
    }
  }

  getWebLoginContext() {
    return this.context; // wallet, login, loginState
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
    sendMethod: TCallSendMethod;
    viewMethod: TCallViewMethod;
  }) {
    switch (chain) {
      case AllSupportedELFChainId.AELF: {
        this.AELFSendMethod = sendMethod;
        this.AELFViewMethod = viewMethod;
        break;
      }
      case AllSupportedELFChainId.tDVV: {
        this.tDVVSendMethod = sendMethod;
        this.tDVVViewMethod = viewMethod;
        break;
      }
      case AllSupportedELFChainId.tDVW: {
        this.tDVWSendMethod = sendMethod;
        this.tDVWViewMethod = viewMethod;
        break;
      }
    }
  }

  setContractMethod(
    contractMethod: {
      chain: ChainId;
      sendMethod: TCallSendMethod;
      viewMethod: TCallViewMethod;
    }[],
  ) {
    contractMethod.forEach((item) => {
      this.setMethod(item);
    });
  }

  callSendMethod<T, R>(
    chain: ChainId,
    params: CallContractParams<T>,
    sendOptions?: SendOptions | SendOptionsV1,
  ): Promise<R> | undefined {
    switch (chain) {
      case AllSupportedELFChainId.AELF:
        return this.AELFSendMethod?.(params, sendOptions);
      case AllSupportedELFChainId.tDVV:
        return this.tDVVSendMethod?.(params, sendOptions);
      case AllSupportedELFChainId.tDVW:
        return this.tDVWSendMethod?.(params, sendOptions);
    }
    throw new Error('Error: Invalid chainId');
  }

  callViewMethod<T, R>(chain: ChainId, params: CallContractParams<T>): Promise<R> | undefined {
    switch (chain) {
      case AllSupportedELFChainId.AELF:
        return this.AELFViewMethod?.(params);
      case AllSupportedELFChainId.tDVV:
        return this.tDVVViewMethod?.(params);
      case AllSupportedELFChainId.tDVW:
        return this.tDVWViewMethod?.(params);
    }
    throw new Error('Error: Invalid chainId');
  }
}

export default Wallet;
