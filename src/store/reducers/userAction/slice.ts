import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SideMenuKey } from 'constants/home';
import { CHAIN_LIST, IChainNameItem, SupportedChainId, SupportedELFChainId } from 'constants/index';
import { NetworkItem } from 'types/api';

export interface UserActionDeposit {
  currentChainItem: IChainNameItem;
  address?: string;
  currentNetwork?: NetworkItem;
  networkList?: NetworkItem[];
  initOpenNetworkModalCount: number; // cant persist
  initOpenTokenModalCount: number;
}

export interface UserActionWithdraw {
  currentChainItem?: IChainNameItem;
  address?: string;
  currentNetwork?: NetworkItem;
  networkList?: NetworkItem[];
}
export interface UserActionState {
  deposit: UserActionDeposit;
  withdraw: UserActionWithdraw;
  userInfo: UserInfo;
}

export interface UserInfo {
  caHash: string;
  managerAddress: string;
  originChainId: SupportedELFChainId;
}

export const initialUserActionState: UserActionState = {
  deposit: {
    currentChainItem: CHAIN_LIST[0],
    initOpenNetworkModalCount: 0,
    initOpenTokenModalCount: 0,
  },
  withdraw: { currentChainItem: CHAIN_LIST[0] },
  userInfo: {
    caHash: '',
    managerAddress: '',
    originChainId: SupportedChainId.sideChain,
  },
};

export const UserActionSlice = createSlice({
  name: 'userAction',
  initialState: initialUserActionState,
  reducers: {
    setCurrentChainItem: (
      state,
      action: PayloadAction<{ chainItem: IChainNameItem; activeMenuKey?: SideMenuKey }>,
    ) => {
      const key = action.payload?.activeMenuKey;
      switch (key) {
        case SideMenuKey.Deposit:
          state.deposit.currentChainItem = action.payload.chainItem;
          break;
        case SideMenuKey.Withdraw:
          state.withdraw.currentChainItem = action.payload.chainItem;
          break;
        default:
          state.deposit.currentChainItem = action.payload.chainItem;
          state.withdraw.currentChainItem = action.payload.chainItem;
          break;
      }
    },
    setDepositChainItem: (state, action: PayloadAction<IChainNameItem>) => {
      state.deposit.currentChainItem = action.payload;
    },
    setDepositAddress: (state, action: PayloadAction<string | undefined>) => {
      state.deposit.address = action.payload;
    },
    setDepositCurrentNetwork: (state, action: PayloadAction<NetworkItem | undefined>) => {
      state.deposit.currentNetwork = action.payload;
    },
    setDepositNetworkList: (state, action: PayloadAction<NetworkItem[]>) => {
      state.deposit.networkList = action.payload;
    },
    setAddInitOpenNetworkModalCount: (state) => {
      state.deposit.initOpenNetworkModalCount = state.deposit.initOpenNetworkModalCount++;
    },
    setAddInitOpenTokenModalCount: (state) => {
      state.deposit.initOpenTokenModalCount = state.deposit.initOpenTokenModalCount++;
    },
    setWithdrawChainItem: (state, action: PayloadAction<IChainNameItem>) => {
      state.withdraw.currentChainItem = action.payload;
    },
    setWithdrawAddress: (state, action: PayloadAction<string | undefined>) => {
      state.withdraw.address = action.payload;
    },
    setWithdrawCurrentNetwork: (state, action: PayloadAction<NetworkItem | undefined>) => {
      state.withdraw.currentNetwork = action.payload;
    },
    setWithdrawNetworkList: (state, action: PayloadAction<NetworkItem[]>) => {
      state.withdraw.networkList = action.payload;
    },
    initUserAction: () => {
      return initialUserActionState;
    },
    setUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (action.payload.caHash) state.userInfo.caHash = action.payload.caHash;
      if (action.payload.managerAddress)
        state.userInfo.managerAddress = action.payload.managerAddress;
      if (action.payload.originChainId) state.userInfo.originChainId = action.payload.originChainId;
    },
  },
});

export const {
  setCurrentChainItem,
  setDepositChainItem,
  setDepositAddress,
  setDepositCurrentNetwork,
  setDepositNetworkList,
  setAddInitOpenNetworkModalCount,
  setAddInitOpenTokenModalCount,
  setWithdrawChainItem,
  setWithdrawAddress,
  setWithdrawCurrentNetwork,
  setWithdrawNetworkList,
  initUserAction,
  setUserInfo,
} = UserActionSlice.actions;

export default UserActionSlice;
