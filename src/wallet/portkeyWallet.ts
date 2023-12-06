import {
  Accounts,
  IPortkeyProvider,
  MethodsBase,
  MethodsWallet,
  NetworkType,
} from '@portkey/provider-types';
import detectProvider from '@portkey/detect-provider';
import { evokePortkey } from '@portkey/onboarding';
import elliptic from 'elliptic';
import { zeroFill } from 'utils/calculate';
import { sleep } from 'utils/common';
import { did } from 'aelf-web-login';
import { queryAuthToken } from 'api/utils';
import { SupportedELFChainId } from 'constants/index';
import { CaHolderWithGuardian } from '@portkey/graphql';
import isMobile from 'utils/isMobile';
import { isPortkey } from 'utils/portkey';

const ec = new elliptic.ec('secp256k1');

export interface IPortkeyWalletAttribute {
  provider?: IPortkeyProvider;
  matchNetworkType?: string;
  managerAddress?: string;
  caHash?: string;
  manager?: CaHolderWithGuardian;
}

type ProviderInfo = {
  name: string;
  accounts: Accounts;
  networkType: NetworkType;
};

export interface IPortkeyWallet extends IPortkeyWalletAttribute {
  init: (props: PortkeyWalletOptions) => Promise<void>;
  setProvider: (provider: IPortkeyProvider) => void;
  setMatchNetworkType: (networkType: NetworkType) => void;
  /**
   * The activate connection can optionally pass in a new node
   * @param nodes - @see PortkeyReactProviderProps.nodes
   */
  activate: () => Promise<ProviderInfo>;
  // try eagerly connection
  connectEagerly: () => Promise<{ accounts: Accounts }>;
  connected: () => Promise<ProviderInfo>;
  getProvider: () => Promise<IPortkeyProvider | undefined>;
}

export interface PortkeyWalletOptions {
  networkType: NetworkType;
}

class PortkeyWallet implements IPortkeyWallet {
  public provider?: IPortkeyProvider;
  public matchNetworkType?: NetworkType;
  public managerAddress?: string;
  public caHash?: string;
  public manager?: CaHolderWithGuardian;

  constructor() {
    this.provider = undefined;
  }

  public async getProvider() {
    if (this.provider) return this.provider;
    try {
      const provider = await detectProvider();
      if (provider) return (this.provider = provider);
      return undefined;
    } catch (error) {
      console.log('getProvider:', error);
      return undefined;
    }
  }

  public async init({ networkType }: PortkeyWalletOptions) {
    this.setMatchNetworkType(networkType);
    const provider = await this.getProvider();
    if (provider) this.provider = provider;
  }

  public setProvider(provider: IPortkeyProvider) {
    this.provider = provider;
  }

  public setMatchNetworkType(networkType: NetworkType) {
    this.matchNetworkType = networkType;
  }

  public async activate() {
    if (!this.matchNetworkType) throw Error('please set network type');

    const provider = await this.getProvider();
    if (!provider) {
      if (isMobile()) {
        if (!isPortkey()) {
          await evokePortkey.app({
            action: 'linkDapp',
            custom: {
              url: window.location.href,
            },
          });
        }
      } else {
        const installed = await evokePortkey.extension();
        if (!installed) throw Error('provider not installed');
      }
      throw Error('provider init error');
    }

    const accounts = await provider.request({ method: MethodsBase.REQUEST_ACCOUNTS });
    console.log('from provider - accounts:', accounts);
    const [name, networkType] = await Promise.all([
      provider.request({ method: MethodsWallet.GET_WALLET_NAME }),
      provider.request({ method: MethodsBase.NETWORK }),
    ]);
    console.log('from provider - name,networkType:', name, networkType);
    if (networkType !== this.matchNetworkType) throw Error('networkType error');

    if (!this.caHash) {
      await this.getCaHashByManagerAddress();
    }
    await sleep(500);
    await queryAuthToken(
      (this.manager?.originChainId as SupportedELFChainId) || SupportedELFChainId.AELF,
    );

    return { name, accounts, networkType };
  }

  public async connectEagerly() {
    const provider = await this.getProvider();
    if (!provider) throw Error('provider init error');

    const accounts = await provider.request({ method: MethodsBase.ACCOUNTS });
    if (Object.keys(accounts).length) return { accounts };
    throw Error(`Can't Connect Eagerly`);
  }

  public async connected() {
    if (!this.provider) throw Error('provider init error');
    const [accounts, name, networkType] = await Promise.all([
      this.provider.request({ method: MethodsBase.ACCOUNTS }),
      this.provider.request({ method: MethodsWallet.GET_WALLET_NAME }),
      this.provider.request({ method: MethodsBase.NETWORK }),
    ]);
    return { accounts, name, networkType };
  }

  public async getManagerAddress() {
    if (!this.provider || !this.provider?.request) return {}; // TODO
    const managerAddress = await this.provider?.request({
      method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
    });
    console.log('getManagerAddress this.managerAddress:', this.managerAddress);
    this.managerAddress = managerAddress;
    return managerAddress;
  }

  public async getCaHashByManagerAddress() {
    if (!this.managerAddress) {
      await this.getManagerAddress();
    }
    console.log('getCaHashByManagerAddress this.managerAddress:', this.managerAddress);
    const res = await did.services.getHolderInfoByManager({
      chainId: 'AELF',
      manager: this.managerAddress || '',
    });
    console.log('getCaHashByManagerAddress res:', res);
    this.caHash = res[0]?.caHash || '';
    this.manager = res[0];
    return res;
  }

  public async getSignature(data: string) {
    if (!this.provider || !this.provider?.request) return {}; // TODO
    const signature = await this.provider.request({
      method: MethodsWallet.GET_WALLET_SIGNATURE,
      payload: { data },
    });
    if (!signature || signature.recoveryParam == null) return {}; // TODO
    const signatureStr = [
      zeroFill(signature.r),
      zeroFill(signature.s),
      `0${signature.recoveryParam.toString()}`,
    ].join('');
    return { signature, signatureStr };
  }

  public async getManagerPublicKey(data: string) {
    if (!this.provider || !this.provider?.request) return {}; // TODO

    const { signature, signatureStr } = await this.getSignature(data);
    if (!signature || signature.recoveryParam == null) return {}; // TODO

    // recover pubkey by signature
    const publicKey = ec.recoverPubKey(
      Buffer.from(data.slice(0, 64), 'hex'),
      signature,
      signature.recoveryParam,
    );
    const pubKey = ec.keyFromPublic(publicKey).getPublic('hex');

    return { signatureStr, pubKey };
  }
}

const portkeyWallet = new PortkeyWallet();

export default portkeyWallet;
