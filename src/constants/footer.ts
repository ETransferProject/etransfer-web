import {
  CommunityIcon,
  ContactsIcon,
  DeveloperIcon,
  DiscordIcon,
  FooterLogo,
  LegalIcon,
  QuestionMarkLarge,
  TelegramIcon,
  TwitterIcon,
} from 'assets/images';

type TFooterConfig = {
  logoUrl: string;
  describe: string[];
  faq: TFrequentlyAskedQuestions;
  menus: TFooterMenu[];
};

type TFooterMenu = {
  group: string;
  items: TFooterMenuItem[];
  icon: string;
};

type TFooterMenuItem = {
  name: string;
  link: string;
  icon?: string;
};

type TFrequentlyAskedQuestions = Required<TFooterMenuItem>;

export const FOOTER_CONFIG: TFooterConfig = {
  logoUrl: FooterLogo,
  describe: [
    'ETransfer - Your Universal Gateway to Seamless Transfers.',
    'Securely between aelf and other popular networks.',
  ],
  faq: {
    name: 'FAQ',
    icon: QuestionMarkLarge,
    link: 'https://etransfer.gitbook.io/docs/faq',
  },
  menus: [
    {
      group: 'Community',
      icon: CommunityIcon,
      items: [
        {
          icon: TelegramIcon,
          name: 'Telegram',
          link: '',
        },
        {
          icon: DiscordIcon,
          name: 'Discord',
          link: '',
        },
        {
          icon: TwitterIcon,
          name: 'Twitter',
          link: '',
        },
      ],
    },
    {
      group: 'Developers',
      icon: DeveloperIcon,
      items: [
        {
          name: 'Documentation',
          link: 'https://etransfer.gitbook.io/docs/about-etransfer/introduction',
        },
        {
          name: 'Wallet',
          link: 'https://doc.portkey.finance/docs/How-to-download-Portkey',
        },
        {
          name: 'Explorer',
          link: 'https://aelfscan.io/',
        },
      ],
    },
    {
      group: 'Legal',
      icon: LegalIcon,
      items: [
        {
          name: 'Terms of Service',
          link: 'https://etransfer.gitbook.io/docs/more-information/terms-of-service',
        },
        {
          name: 'Privacy Policy',
          link: 'https://etransfer.gitbook.io/docs/more-information/privacy-policy',
        },
      ],
    },
    {
      group: 'Contacts',
      icon: ContactsIcon,
      items: [
        {
          name: 'Emails',
          link: 'contact@etransfer.exchange',
        },
        {
          name: 'Support',
          link: 'https://t.me/etransfer_support',
        },
      ],
    },
  ],
};
