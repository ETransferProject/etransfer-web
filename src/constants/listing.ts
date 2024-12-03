import { ICommonStepsProps } from 'components/CommonSteps';

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

export const LISTING_FORM_PROMPT_CONTENT = [
  [
    'Only the current token owner on the aelf chain can apply.',
    'The token must meet the requirements of Liquidity > $1000 and Holders > 1000.',
  ],
  'Please select at least one aelf chain and one other chain.',
  [
    'You can see the progress in ‘My Applications’.',
    'Once approved, please add liquidity to complete the listing.',
    'If you need any support, please contact us.',
  ],
  [
    'Please transfer the SGR for each chain into the liquidity pool.',
    'Transferring other tokens will be invalid.',
    'The 24-hour transfer limit for the SGR is $5,000.',
  ],
  '',
];

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
