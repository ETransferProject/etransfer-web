import { ICommonStepsProps } from 'components/CommonSteps';
import LinkForBlank from 'components/LinkForBlank';
import {
  TokenInformationFormKeys,
  SelectChainFormKeys,
  TTokenInformationFormValidateData,
  FormValidateStatus,
  TTokenInformationFormValues,
} from 'types/listing';

export const VIEW_PROGRESS = 'View Progress';

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

export const LISTING_FORM_PROMPT_CONTENT_MAP: Partial<Record<ListingStep, React.ReactNode>> = {
  [ListingStep.TOKEN_INFORMATION]: (
    <div key="0">
      <p>{'• Only the current token owner on the aelf chain can apply.'}</p>
      <p>{'• The token must meet the requirements of Liquidity > $1000 and Holders > 1000.'}</p>
      <p>{CONTACT_US_ROW}</p>
    </div>
  ),
  [ListingStep.SELECT_CHAIN]: (
    <div key="1">
      <p>{'• Please select at least one aelf chain and one other chain.'}</p>
      <p>
        {
          '• You can select multiple chains simultaneously, and Transfers will be supported between any two selected chains.f'
        }
      </p>
      <p>{CONTACT_US_ROW}</p>
    </div>
  ),
};

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

export const LIQUIDITY_IN_USD_MIN_VALUE = 1000;
export const HOLDERS_MIN_VALUE = 1000;

export const SELECT_CHAIN_FORM_LABEL_MAP: Record<SelectChainFormKeys, string> = {
  [SelectChainFormKeys.AELF_CHAINS]: 'Select aelf chain(s)',
  [SelectChainFormKeys.OTHER_CHAINS]: 'Select other chain(s)',
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Create & Issue Token',
};

export const SELECT_CHAIN_FORM_PLACEHOLDER_MAP: Partial<Record<SelectChainFormKeys, string>> = {
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Initial supply',
};
