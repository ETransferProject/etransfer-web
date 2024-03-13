import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BusinessType, TokenItem } from 'types/api';
import { USDT_DECIMAL } from 'constants/index';

export type TokenState = {
  [key in BusinessType]: {
    tokenList: TokenItem[];
    currentSymbol: string;
  };
};

// init deposit empty
const initDepositTokenState = {
  tokenList: [],
  currentSymbol: '',
};

// init withdraw USDT
const initWithdrawTokenState = {
  tokenList: [
    {
      name: 'Tether USD',
      symbol: 'USDT',
      icon: '',
      contractAddress: '',
      decimals: USDT_DECIMAL,
    },
  ],
  currentSymbol: 'USDT',
};

export const initialTokenState: TokenState = {
  [BusinessType.Deposit]: initDepositTokenState,
  [BusinessType.Withdraw]: initWithdrawTokenState,
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
      state[BusinessType.Deposit] = initDepositTokenState;
      state[BusinessType.Withdraw] = initWithdrawTokenState;
    },
  },
});

export const { setTokenList, setCurrentSymbol } = TokenSlice.actions;

export default TokenSlice;
