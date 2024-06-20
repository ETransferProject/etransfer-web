export type TFooterConfig = {
  logoUrl: string;
  describe: string[];
  faq: TFrequentlyAskedQuestions;
  menus: TFooterMenu[];
};

export type TFooterMenu = {
  group: string;
  items: TFooterMenuItem[];
  icon: string;
};

export type TFooterMenuItem = {
  name: string;
  link: string;
  icon?: string;
  iconBig?: string;
};

export type TFrequentlyAskedQuestions = Omit<Required<TFooterMenuItem>, 'iconBig'>;

export type TFrequentlyAskedQuestionsSection = {
  title: string;
  list: TFooterMenuItem[];
};
