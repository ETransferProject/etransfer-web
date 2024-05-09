import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportedChainId, SupportedELFChainId } from 'constants/index';

export type TUserState = {
  userInfo: UserInfo;
};

export interface UserInfo {
  caHash: string;
  managerAddress: string;
  originChainId: SupportedELFChainId;
}

export const InitialUserState: TUserState = {
  userInfo: {
    caHash: '',
    managerAddress: '',
    originChainId: SupportedChainId.sideChain,
  },
};

export const UserSlice = createSlice({
  name: 'user',
  initialState: InitialUserState,
  reducers: {
    initUserState: () => {
      return InitialUserState;
    },
    setUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (action.payload.caHash) state.userInfo.caHash = action.payload.caHash;
      if (action.payload.managerAddress)
        state.userInfo.managerAddress = action.payload.managerAddress;
      if (action.payload.originChainId) state.userInfo.originChainId = action.payload.originChainId;
    },
  },
});

export const { initUserState, setUserInfo } = UserSlice.actions;

export default UserSlice;
