import { ChainConstantsType, SupportedELFChain } from 'constants/index';
import { AelfInstancesKey, ChainType, Web3Type } from 'types';

type AElfOwnConstants = {
  CONTRACTS?: { [key: string]: string };
  TOKEN_CONTRACT?: string;
  CROSS_CHAIN_CONTRACT?: string;
  BRIDGE_CONTRACT?: string;
  BRIDGE_CONTRACT_OUT?: string;
};

type Constants = ChainConstantsType & AElfOwnConstants;

export class ChainConstants {
  public id: number | string;
  static chainId: number | string;
  static chainType: ChainType;
  constructor(id: number | string) {
    this.id = id;
  }
}

export class ELFChainConstants extends ChainConstants {
  static chainType: ChainType = 'ELF';
  static aelfInstances?: Web3Type['aelfInstances'];
  static constants: { [k in AelfInstancesKey]: Constants };
  constructor(id: number | string, aelfInstances?: Web3Type['aelfInstances']) {
    super(id);
    ELFChainConstants['aelfInstances'] = aelfInstances;
    this.setStaticAttrs();
  }
  setStaticAttrs() {
    ELFChainConstants['constants'] = SupportedELFChain as any;
  }
}
