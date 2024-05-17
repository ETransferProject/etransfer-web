import {
  Accounts,
  IPortkeyProvider,
  MethodsBase,
  MethodsWallet,
  NetworkType,
} from '@portkey/provider-types';
import detectProvider, { TProviderName } from '@portkey/detect-provider';
import { evokePortkey } from '@portkey/onboarding';
import elliptic from 'elliptic';
import { zeroFill } from 'utils/calculate';
import { sleep } from '@portkey/utils';
import { queryAuthToken } from '../utils/authToken';
import { SupportedELFChainId, NetworkTypeText } from 'constants/index';
import { isMobileDevices } from 'utils/isMobile';
import { isPortkey } from 'portkeySDK/utils/portkey';
import { CaHolderWithGuardian as CaHolderWithGuardianV1 } from '@portkey-v1/graphql';
import { CaHolderWithGuardian as CaHolderWithGuardianV2 } from '@portkey/graphql';
import {
  GetCAHolderByManagerResult as GetCAHolderByManagerResultV1,
  GetCAHolderByManagerParams as GetCAHolderByManagerParamsV1,
} from '@portkey-v1/services';
import {
  GetCAHolderByManagerResult as GetCAHolderByManagerResultV2,
  GetCAHolderByManagerParams as GetCAHolderByManagerParamsV2,
} from '@portkey/services';
import singleMessage from 'components/SingleMessage';
import { NetworkNotMatchTipPrefix, PortkeyVersion } from 'constants/wallet';

const ec = new elliptic.ec('secp256k1');

type TPortkeyDidV1 = typeof import('@portkey-v1/did-ui-react');
type TPortkeyDidV2 = typeof import('@portkey/did-ui-react');
type TPortkeyDid = TPortkeyDidV1 | TPortkeyDidV2;
type TCaHolderWithGuardian = CaHolderWithGuardianV1 | CaHolderWithGuardianV2;
type TGetCAHolderByManagerResult = GetCAHolderByManagerResultV1 | GetCAHolderByManagerResultV2;
type TGetCAHolderByManagerParams = GetCAHolderByManagerParamsV1 | GetCAHolderByManagerParamsV2;

type TNetworkType = NetworkType | 'MAIN';

type TProviderInfo = {
  name: string;
  accounts: Accounts;
  networkType: TNetworkType;
};

export interface PortkeyWalletOptions {
  version: PortkeyVersion;
  matchNetworkType: TNetworkType;
  providerName: TProviderName;
}

export interface PortkeyWalletInitOptions {
  networkType: TNetworkType;
}

export interface IPortkeyWalletAttribute extends PortkeyWalletOptions {
  provider?: IPortkeyProvider;
  managerAddress?: string;
  caHash?: string;
  manager?: TCaHolderWithGuardian;
}

export interface IPortkeyWalletAbstract extends IPortkeyWalletAttribute {
  init: (props: PortkeyWalletInitOptions) => Promise<void>;
  setProvider: (provider: IPortkeyProvider) => void;
  setMatchNetworkType: (networkType: TNetworkType) => void;
  /**
   * The activate connection can optionally pass in a new node
   * @param nodes - @see PortkeyReactProviderProps.nodes
   */
  activate: () => Promise<TProviderInfo>;
  // try eagerly connection
  connectEagerly: () => Promise<{ accounts: Accounts }>;
  connected: () => Promise<TProviderInfo>;
  getProvider: () => Promise<IPortkeyProvider | undefined>;
  getPortkeyDid: () => TPortkeyDid;
  clearData: () => void;
  getCaHash: () => Promise<string | undefined>;
}

abstract class PortkeyWalletAbstract implements IPortkeyWalletAbstract {
  public version: PortkeyVersion;
  public matchNetworkType: TNetworkType;
  public providerName: TProviderName;
  public provider?: IPortkeyProvider;
  public managerAddress?: string;
  public caHash?: string;
  public manager?: TCaHolderWithGuardian;

  constructor(options: PortkeyWalletOptions) {
    this.provider = undefined;
    this.version = options.version;
    this.providerName = options.providerName;
    this.matchNetworkType = options.matchNetworkType;
  }

  public async getProvider() {
    if (this.provider) return this.provider;
    try {
      const provider = await detectProvider({
        providerName: this.providerName,
      });
      if (provider) return (this.provider = provider);
      return undefined;
    } catch (error) {
      console.log('>>>>>> getProvider:', error);
      return undefined;
    }
  }

  public async init({ networkType }: PortkeyWalletInitOptions) {
    this.setMatchNetworkType(networkType);
    const provider = await this.getProvider();
    if (provider) this.provider = provider;
  }

  public setProvider(provider: IPortkeyProvider) {
    this.provider = provider;
  }

  public setMatchNetworkType(networkType: TNetworkType) {
    this.matchNetworkType = networkType;
  }

  public async activate() {
    if (!this.matchNetworkType) throw Error('please set network type');
    const provider = await this.getProvider();

    if (!provider) {
      const versionParam = this.version === PortkeyVersion.v1 ? this.version : undefined;
      if (isMobileDevices() && !isPortkey()) {
        await evokePortkey.app({
          action: 'linkDapp',
          version: versionParam,
          custom: {
            url: window.location.href,
          },
        });
      } else {
        const installed = await evokePortkey.extension({
          version: versionParam,
        });
        if (!installed) throw Error('provider not installed');
      }
      throw Error('provider init error');
    }

    const networkType = await provider.request({ method: MethodsBase.NETWORK });
    console.log('>>>>>> from provider - networkType:', networkType);
    if (networkType !== this.matchNetworkType) {
      singleMessage.error(
        `${NetworkNotMatchTipPrefix} ${
          this.matchNetworkType === 'TESTNET' ? NetworkTypeText.TESTNET : NetworkTypeText.MAINNET
        }.`,
      );
      throw Error('networkType error');
    }

    const accounts = await provider.request({ method: MethodsBase.REQUEST_ACCOUNTS });
    console.log('>>>>>> from provider - accounts:', accounts);
    const name = await provider.request({ method: MethodsWallet.GET_WALLET_NAME });
    console.log('>>>>>> from provider - name:', name);

    if (!this.caHash) {
      await this.getCaHash();
    }
    await sleep(500);
    await queryAuthToken({
      chainId: (this.manager?.originChainId as SupportedELFChainId) || SupportedELFChainId.AELF,
      version: this.version,
    });

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
    console.log('>>>>>> connected networkType', networkType);
    return { accounts, name, networkType };
  }

  public async getManagerAddress() {
    if (!this.provider || !this.provider?.request) return {};
    const managerAddress = await this.provider?.request({
      method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
    });
    this.managerAddress = managerAddress;
    console.log('>>>>>> getManagerAddress this.managerAddress:', this.managerAddress);
    return managerAddress;
  }
  public async getCaHash() {
    if (this?.caHash) return this.caHash;
    await this.refreshCaHash();
    return this.caHash;
  }
  public abstract getPortkeyDid(): TPortkeyDid;
  public refreshCaHash: (count?: number) => Promise<TGetCAHolderByManagerResult> = async (
    count = 0,
  ) => {
    try {
      if (!this.managerAddress) await this.getManagerAddress();

      const provider = await this.getProvider();
      if (!provider) throw Error('provider init error');

      const accounts = await provider.request({ method: MethodsBase.ACCOUNTS });

      // get current ca address;
      const caAddress = Object.values(accounts)
        .filter((i) => Array.isArray(i) && i.length > 0)
        .map((i) => i[0])[0]
        // format
        .split('_')[1];

      // get ca info by indexer;
      const portkeyDid = this.getPortkeyDid();
      const res = await portkeyDid.did.services.getHolderInfoByManager({
        caAddresses: [caAddress],
        maxResultCount: 100,
      } as unknown as TGetCAHolderByManagerParams);
      const _originChainId = res[0].originChainId;

      const caInfo = res.find((i) => i.chainId === _originChainId);
      if (!caInfo) throw Error('caInfo not exits');
      const { managerInfos, caHash } = caInfo;
      const isExist = managerInfos?.some((i) => i?.address === this.managerAddress);
      if (isExist && caHash) {
        this.caHash = caHash;
        this.manager = caInfo;
        return res;
      }
    } catch (error) {
      console.log(error, '===error');
    }
    // sleep wait indexer
    await sleep(3000);
    if (count >= 10) throw Error('Please try again');
    count++;
    return this.refreshCaHash(count);
  };

  public async getSignature(data: string) {
    if (!this.provider || !this.provider?.request) return {};
    const signature = await this.provider.request({
      method: MethodsWallet.GET_WALLET_SIGNATURE,
      payload: { data },
    });
    if (!signature || signature.recoveryParam == null) return {};
    const signatureStr = [
      zeroFill(signature.r),
      zeroFill(signature.s),
      `0${signature.recoveryParam.toString()}`,
    ].join('');
    return { signature, signatureStr };
  }

  public async getManagerPublicKey(data: string) {
    if (!this.provider || !this.provider?.request) return {};

    const { signature, signatureStr } = await this.getSignature(data);
    if (!signature || signature.recoveryParam == null) return {};

    // recover pubkey by signature
    const publicKey = ec.recoverPubKey(
      Buffer.from(data.slice(0, 64), 'hex'),
      signature,
      signature.recoveryParam,
    );
    const pubKey = ec.keyFromPublic(publicKey).getPublic('hex');

    return { signatureStr, pubKey };
  }

  public clearData() {
    this.managerAddress = '';
    this.caHash = '';
    this.manager = undefined;
  }
}

export default PortkeyWalletAbstract;
