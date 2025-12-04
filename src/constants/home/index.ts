import { Deposit, Records, InfoDashboard, Transfer, Withdraw } from 'assets/images';

// SideMenuKey must bind BusinessType
export enum SideMenuKey {
  CrossChainTransfer = 'Transfer',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  History = 'History',
  Info = 'Info',
}

export const MENU_ITEMS = [
  {
    icon: Transfer,
    key: SideMenuKey.CrossChainTransfer,
    label: SideMenuKey.CrossChainTransfer,
    pathname: '/cross-chain-transfer',
  },
  {
    icon: Deposit,
    key: SideMenuKey.Deposit,
    label: SideMenuKey.Deposit,
    pathname: '/deposit',
  },
  {
    icon: Withdraw,
    key: SideMenuKey.Withdraw,
    label: SideMenuKey.Withdraw,
    pathname: '/withdraw',
  },
  {
    icon: Records,
    key: SideMenuKey.History,
    label: SideMenuKey.History,
    pathname: '/history',
  },
  {
    icon: InfoDashboard,
    key: SideMenuKey.Info,
    label: SideMenuKey.Info,
    pathname: '/info',
  },
];
