export enum TokenInformationFormKeys {
  AELF_CHAIN_TOKEN = 'aelfChainToken',
  WEBSITE = 'website',
  TWITTER = 'twitter',
  TITLE = 'title',
  NAME = 'name',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
}

export type TTokenInformationFormValues = {
  [TokenInformationFormKeys.AELF_CHAIN_TOKEN]: string;
  [TokenInformationFormKeys.WEBSITE]: string;
  [TokenInformationFormKeys.TWITTER]: string;
  [TokenInformationFormKeys.TITLE]: string;
  [TokenInformationFormKeys.NAME]: string;
  [TokenInformationFormKeys.TELEGRAM]: string;
  [TokenInformationFormKeys.EMAIL]: string;
};

export enum SelectChainFormKeys {
  AELF_CHAINS = 'aelfChains',
  OTHER_CHAINS = 'otherChains',
  INITIAL_SUPPLY = 'initialSupply',
}

export type TSelectChainFormValues = {
  [SelectChainFormKeys.AELF_CHAINS]: string[];
  [SelectChainFormKeys.OTHER_CHAINS]: string[];
  [SelectChainFormKeys.INITIAL_SUPPLY]: string;
};
