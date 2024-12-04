import { ICommonStepsProps } from 'components/CommonSteps';
import { TokenInformationFormKeys, SelectChainFormKeys } from 'types/listing';

export const VIEW_PROGRESS = 'View Progress';

export enum ListingStep {
  TOKEN_INFORMATION = 0,
  SELECT_CHAIN = 1,
  COBO_CUSTODY_REVIEW = 2,
  INITIALIZE_LIQUIDITY_POOL = 3,
  COMPLETE = 4,
}

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

export const LISTING_FORM_PROMPT_CONTENT_MAP: Record<ListingStep, React.ReactNode> = {
  [ListingStep.TOKEN_INFORMATION]: (
    <div key="0">
      <p>{'• Only the current token owner on the aelf chain can apply.'}</p>
      <p>{'• The token must meet the requirements of Liquidity > $1000 and Holders > 1000.'}</p>
    </div>
  ),
  [ListingStep.SELECT_CHAIN]: (
    <p key="1">{'Please select at least one aelf chain and one other chain.'}</p>
  ),
  [ListingStep.COBO_CUSTODY_REVIEW]: (
    <div key="2">
      <p>{'• You can see the progress in ‘My Applications’.'}</p>
      <p>{'• Once approved, please add liquidity to complete the listing.'}</p>
      <p>{'• If you need any support, please contact us.'}</p>
    </div>
  ),
  [ListingStep.INITIALIZE_LIQUIDITY_POOL]: (
    <div key="3">
      <p>{'• Please transfer the SGR for each chain into the liquidity pool.'}</p>
      <p>{'• Transferring other tokens will be invalid.'}</p>
      <p>{'• The 24-hour transfer limit for the SGR is $5,000.'}</p>
    </div>
  ),
  [ListingStep.COMPLETE]: null,
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
  [TokenInformationFormKeys.AELF_CHAIN_TOKEN]: 'Select aelf chain token',
  [TokenInformationFormKeys.WEBSITE]: 'Official website',
  [TokenInformationFormKeys.TWITTER]: 'Official Twitter',
  [TokenInformationFormKeys.TITLE]: 'What is your title on the project/team/company?',
  [TokenInformationFormKeys.NAME]: 'Contact person name',
  [TokenInformationFormKeys.TELEGRAM]: 'Your Telegram handle (for contact purposes)',
  [TokenInformationFormKeys.EMAIL]: 'Contact E-mail',
};

export const TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP: Record<TokenInformationFormKeys, string> = {
  [TokenInformationFormKeys.AELF_CHAIN_TOKEN]: 'Select a token',
  [TokenInformationFormKeys.WEBSITE]: 'https://',
  [TokenInformationFormKeys.TWITTER]: 'Twitter account',
  [TokenInformationFormKeys.TITLE]: 'Your title',
  [TokenInformationFormKeys.NAME]: 'Your name',
  [TokenInformationFormKeys.TELEGRAM]: 'Example@yourhandle',
  [TokenInformationFormKeys.EMAIL]: 'It must be the official email address',
};

export const SELECT_CHAIN_FORM_LABEL_MAP: Record<SelectChainFormKeys, string> = {
  [SelectChainFormKeys.AELF_CHAINS]: 'Select aelf chain(s)',
  [SelectChainFormKeys.OTHER_CHAINS]: 'Select other chain(s)',
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Create & Issue Token',
};

export const SELECT_CHAIN_FORM_PLACEHOLDER_MAP: Partial<Record<SelectChainFormKeys, string>> = {
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Initial supply',
};
