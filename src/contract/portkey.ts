import { ADDRESS_MAP, AllSupportedELFChainId, ContractType } from 'constants/chain';
import { SupportedELFChainId } from 'constants/index';
import portkeyWallet from 'wallet/portkeyWallet';
import { IContract } from '@portkey/types';

export interface IContractUnity {
  contract: IContractInstance;
  getContract: (params: GetContractProps) => Promise<IContract>;
}

export type IContractInstance = {
  [chainId in AllSupportedELFChainId]: {
    [contractAddress in ContractType]?: IContract;
  };
};

export type GetContractProps = { chainId: SupportedELFChainId; contractType: ContractType };

const initContractUnity = {
  [AllSupportedELFChainId.AELF]: {
    [ContractType.CA]: undefined,
    [ContractType.TOKEN]: undefined,
    [ContractType.ETRANSFER]: undefined,
  },
  [AllSupportedELFChainId.tDVV]: {
    [ContractType.CA]: undefined,
    [ContractType.TOKEN]: undefined,
    [ContractType.ETRANSFER]: undefined,
  },
  [AllSupportedELFChainId.tDVW]: {
    [ContractType.CA]: undefined,
    [ContractType.TOKEN]: undefined,
    [ContractType.ETRANSFER]: undefined,
  },
};

class ContractUnity implements IContractUnity {
  public contract: IContractInstance;

  constructor() {
    this.contract = initContractUnity;
  }

  public async getContract({ chainId, contractType }: GetContractProps): Promise<IContract> {
    if (this.contract[chainId][contractType]) {
      return this.contract[chainId][contractType] as IContract;
    }
    return await this.fetchContract({ chainId, contractType });
  }

  async fetchContract({ chainId, contractType }: GetContractProps): Promise<IContract> {
    try {
      const provider = await portkeyWallet?.getProvider();
      if (!provider) throw new Error('no provider');

      const chain = await provider?.getChain(chainId);
      const targetContract = await chain.getContract(ADDRESS_MAP[chainId][contractType]);

      // inject instance
      this.contract[chainId][contractType] = targetContract;
      return targetContract;
    } catch (error) {
      console.log('fetchContract error:', error);
      throw new Error('Fetch Contract Failed');
    }
  }
}

const contractUnity = new ContractUnity();

export default contractUnity;
