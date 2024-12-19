import { ICommonStepsProps } from 'components/CommonSteps';
import LinkForBlank from 'components/LinkForBlank';
import { ApplicationChainStatusEnum } from 'types/api';
import {
  TokenInformationFormKeys,
  SelectChainFormKeys,
  TTokenInformationFormValidateData,
  FormValidateStatus,
  TTokenInformationFormValues,
  TSelectChainFormValues,
  TSelectChainFormValidateData,
  TChains,
} from 'types/listing';

export const VIEW_PROGRESS = 'View Progress';

export const NO_APPLICATION = 'No application';

export const WALLET_CONNECTION_REQUIRED = 'Wallet connection required';

export enum ListingStep {
  TOKEN_INFORMATION = 0,
  SELECT_CHAIN = 1,
  COBO_CUSTODY_REVIEW = 2,
  INITIALIZE_LIQUIDITY_POOL = 3,
  COMPLETE = 4,
}

export const LISTING_STEP_PATHNAME_MAP: Record<ListingStep, string> = {
  [ListingStep.TOKEN_INFORMATION]: '/token-information',
  [ListingStep.SELECT_CHAIN]: '/select-chain',
  [ListingStep.COBO_CUSTODY_REVIEW]: '/cobo-custody-review',
  [ListingStep.INITIALIZE_LIQUIDITY_POOL]: '/initialize-liquidity-pool',
  [ListingStep.COMPLETE]: '/complete',
};

export const LISTING_STEP_ITEMS: ICommonStepsProps['stepItems'] = [
  {
    title: 'Token Information',
  },
  {
    title: 'Select Chain',
  },
  {
    title: 'Cobo Custody Review',
  },
  {
    title: 'Initialize Liquidity Pool',
  },
  {
    title: 'Complete',
  },
];

export const CONTACT_US_ROW = (
  <>
    {'• If you need any support, please '}
    <LinkForBlank
      href="https://form.etransfer.exchange/contact"
      element={<span>contact us</span>}
    />
    {'.'}
  </>
);

export enum ListingProcessStep {
  SUBMIT_TOKEN_INFO = 0,
  ISSUE_TOKEN = 1,
  COBO_CUSTODY_REVIEW = 2,
  INITIALIZE_LIQUIDITY_POOL = 3,
  CROSS_CHAIN_INTEGRATION = 4,
  COMPLETE = 5,
}

export const VIEW_COBO_CUSTODY_PROGRESS: ICommonStepsProps['stepItems'] = [
  {
    title: 'Submit token info',
  },
  {
    title: 'Issue token',
  },
  {
    title: 'Cobo Custody Review',
  },
  {
    title: 'Initialize Liquidity Pool',
  },
  {
    title: 'Cross-chain integration (1 business day)',
  },
  {
    title: 'Complete',
  },
];

// ================ Token information ================

export const TOKEN_INFORMATION_FORM_LABEL_MAP: Record<TokenInformationFormKeys, string> = {
  [TokenInformationFormKeys.TOKEN]: 'Select aelf chain token',
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: 'Official website',
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: 'Official Twitter',
  [TokenInformationFormKeys.TITLE]: 'What is your title on the project/team/company?',
  [TokenInformationFormKeys.PERSON_NAME]: 'Contact person name',
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: 'Your Telegram handle (for contact purposes)',
  [TokenInformationFormKeys.EMAIL]: 'Contact E-mail',
};

export const TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP: Record<TokenInformationFormKeys, string> = {
  [TokenInformationFormKeys.TOKEN]: 'Select a token',
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: 'https://',
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: 'Twitter account',
  [TokenInformationFormKeys.TITLE]: 'Your title',
  [TokenInformationFormKeys.PERSON_NAME]: 'Your name',
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: 'Example@yourhandle',
  [TokenInformationFormKeys.EMAIL]: 'It must be the official email address',
};

export const TOKEN_INFORMATION_FORM_INITIAL_VALUES: Partial<TTokenInformationFormValues> = {
  [TokenInformationFormKeys.TOKEN]: undefined,
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: '',
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: '',
  [TokenInformationFormKeys.TITLE]: '',
  [TokenInformationFormKeys.PERSON_NAME]: '',
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: '',
  [TokenInformationFormKeys.EMAIL]: '',
};

export const TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA: TTokenInformationFormValidateData = {
  [TokenInformationFormKeys.TOKEN]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.TITLE]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.PERSON_NAME]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.EMAIL]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
};

export const REQUIRED_ERROR_MESSAGE = 'This field is required';

// ================ Select chain ================

export const SELECT_CHAIN_FORM_LABEL_MAP: Record<SelectChainFormKeys, string> = {
  [SelectChainFormKeys.AELF_CHAINS]: 'Select aelf chain(s)',
  [SelectChainFormKeys.OTHER_CHAINS]: 'Select other chain(s)',
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Create & Issue Token',
};

export const SELECT_CHAIN_FORM_PLACEHOLDER_MAP: Partial<Record<SelectChainFormKeys, string>> = {
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Initial supply',
};

export const SELECT_CHAIN_FORM_INITIAL_VALUES: TSelectChainFormValues = {
  [SelectChainFormKeys.AELF_CHAINS]: [],
  [SelectChainFormKeys.OTHER_CHAINS]: [],
  [SelectChainFormKeys.INITIAL_SUPPLY]: '',
};

export const SELECT_CHAIN_FORM_INITIAL_VALIDATE_DATA: TSelectChainFormValidateData = {
  [SelectChainFormKeys.INITIAL_SUPPLY]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
};

export const DEFAULT_CHAINS: TChains = {
  [SelectChainFormKeys.AELF_CHAINS]: [],
  [SelectChainFormKeys.OTHER_CHAINS]: [],
};

export const SELECT_CHAIN_FORM_CHAIN_NOT_CREATED_STATUS_LIST = [
  ApplicationChainStatusEnum.Unissued,
  ApplicationChainStatusEnum.Issuing,
  ApplicationChainStatusEnum.Issued,
];

export const SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST = [
  ApplicationChainStatusEnum.Reviewing,
  ApplicationChainStatusEnum.Reviewed,
  ApplicationChainStatusEnum.PoolInitializing,
  ApplicationChainStatusEnum.Integrating,
  ApplicationChainStatusEnum.Failed,
];

export const SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST = [ApplicationChainStatusEnum.Complete];

export const SELECT_CHAIN_FORM_CHAIN_DISABLED_STATUS_LIST = [
  ...SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST,
  ...SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST,
];

export const SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP = {
  LISTED: 'The token is already listed on ETransfer.',
  CREATED_NOT_LISTED: 'The token has been created on {{chainName}}.',
  REJECTED: 'The token has been rejected by Cobo. Please reapply in {{hours}} hours.',
};
