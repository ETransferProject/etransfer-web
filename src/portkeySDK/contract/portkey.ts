import { ContractType } from 'constants/chain';
import { ADDRESS_MAP, SupportedELFChainId } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import getPortkeyWallet from 'portkeySDK/portkeyWallet';
import { IContract } from '@portkey/types';

export type TPortkeyContract = { [key: string]: IContract };

export interface IPortkeyContractUnity {
  contract: TPortkeyContract;
  getContract: (params: GetContractProps) => Promise<IContract>;
}

export type GetContractProps = {
  chainId: SupportedELFChainId;
  contractType: ContractType;
  version: PortkeyVersion;
};

class PortkeyContractUnity implements IPortkeyContractUnity {
  public contract: TPortkeyContract;

  constructor() {
    this.contract = {} as TPortkeyContract;
  }

  public setContract({
    version,
    chainId,
    contractType,
    contract,
  }: GetContractProps & { contract: IContract }) {
    const key = version + chainId + contractType;
    this.contract[key] = contract;
  }

  public async getContract({
    chainId,
    contractType,
    version,
  }: GetContractProps): Promise<IContract> {
    const key = version + chainId + contractType;
    if (this.contract[key]) {
      return this.contract[key] as IContract;
    }
    return await this.fetchContract({ chainId, contractType, version });
  }

  async fetchContract({ chainId, contractType, version }: GetContractProps): Promise<IContract> {
    try {
      const portkeyWallet = getPortkeyWallet(version);
      const provider = await portkeyWallet?.getProvider();
      if (!provider) throw new Error('no provider');

      const chain = await provider?.getChain(chainId);
      const targetContract = await chain.getContract(ADDRESS_MAP[version][chainId][contractType]);

      // inject instance
      this.setContract({ chainId, contractType, version, contract: targetContract });
      return targetContract;
    } catch (error) {
      console.log('fetchContract error:', error);
      throw new Error('Fetch Contract Failed');
    }
  }
}

const portkeyContractUnity = new PortkeyContractUnity();

export default portkeyContractUnity;
