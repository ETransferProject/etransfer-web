import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BusinessType, TokenItem } from 'types/api';
import { USDT_DECIMAL } from 'constants/index';

export type TokenState = {
  [key in BusinessType]: {
    tokenList: TokenItem[];
    currentSymbol: string;
  };
};

const initTokenStateItem = {
  tokenList: [
    {
      name: 'USDT',
      symbol: 'USDT',
      icon: '',
      contractAddress: '',
      decimals: USDT_DECIMAL,
    },
  ],
  currentSymbol: 'USDT',
};

export const initialTokenState: TokenState = {
  [BusinessType.Deposit]: initTokenStateItem,
  [BusinessType.Withdraw]: initTokenStateItem,
};

export const TokenSlice = createSlice({
  name: 'token',
  initialState: initialTokenState,
  reducers: {
    setTokenList: (state, action: PayloadAction<{ key: BusinessType; data: TokenItem[] }>) => {
      state[action.payload.key].tokenList = action.payload.data;
    },
    setCurrentSymbol: (state, action: PayloadAction<{ key: BusinessType; symbol: string }>) => {
      state[action.payload.key].currentSymbol = action.payload.symbol;
    },
    resetTokenState: (state) => {
      state[BusinessType.Deposit] = initTokenStateItem;
      state[BusinessType.Withdraw] = initTokenStateItem;
    },
  },
});

export const { setTokenList, setCurrentSymbol } = TokenSlice.actions;

export default TokenSlice;
