import { TApplicationChainStatusItem } from './api';

export type TSearchParams = {
  symbol?: string;
  id?: string;
  networks?: string;
};

export enum TokenInformationFormKeys {
  TOKEN = 'token',
  OFFICIAL_WEBSITE = 'officialWebsite',
  OFFICIAL_TWITTER = 'officialTwitter',
  TITLE = 'title',
  PERSON_NAME = 'personName',
  TELEGRAM_HANDLER = 'telegramHandler',
  EMAIL = 'email',
}

export type TTokenItem = {
  name: string;
  symbol: string;
  icon: string;
  liquidityInUsd: string;
  holders: number;
};

export type TTokenInformationFormValues = {
  [TokenInformationFormKeys.TOKEN]: TTokenItem;
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: string;
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: string;
  [TokenInformationFormKeys.TITLE]: string;
  [TokenInformationFormKeys.PERSON_NAME]: string;
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: string;
  [TokenInformationFormKeys.EMAIL]: string;
};

export enum FormValidateStatus {
  Error = 'error',
  Normal = '',
}

export type TTokenInformationFormValidateData = {
  [key in TokenInformationFormKeys]: {
    validateStatus: FormValidateStatus;
    errorMessage: string;
  };
};

export enum SelectChainFormKeys {
  AELF_CHAINS = 'aelfChains',
  OTHER_CHAINS = 'otherChains',
  INITIAL_SUPPLY = 'initialSupply',
}

export type TChains = {
  [SelectChainFormKeys.AELF_CHAINS]: TApplicationChainStatusItem[];
  [SelectChainFormKeys.OTHER_CHAINS]: TApplicationChainStatusItem[];
};

export type TSelectChainFormValues = TChains & {
  [SelectChainFormKeys.INITIAL_SUPPLY]: string;
};

export type TSelectChainFormValidateData = {
  [key in SelectChainFormKeys]: {
    validateStatus: FormValidateStatus;
    errorMessage: string;
  };
};
