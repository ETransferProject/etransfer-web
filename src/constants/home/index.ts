import { Deposit, Withdraw, Records } from 'assets/images';

// SideMenuKey must bind BusinessType
export enum SideMenuKey {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Records = 'History',
}

export const MENU_ITEMS = [
  {
    icon: Deposit,
    key: SideMenuKey.Deposit,
    label: SideMenuKey.Deposit,
  },
  {
    icon: Withdraw,
    key: SideMenuKey.Withdraw,
    label: SideMenuKey.Withdraw,
  },
  {
    icon: Records,
    key: SideMenuKey.Records,
    label: SideMenuKey.Records,
  },
];
