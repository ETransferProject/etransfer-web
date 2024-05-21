import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BusinessType, TTokenItem } from 'types/api';
import { TOKEN_INFO_USDT, TokenType } from 'constants/index';

export type TokenState = {
  [key in BusinessType]: {
    tokenList: TTokenItem[];
    currentSymbol: string;
  };
};

// init deposit empty
export const InitDepositTokenState = {
  tokenList: [],
  currentSymbol: '',
};

// init withdraw USDT
export const InitWithdrawTokenState = {
  tokenList: [TOKEN_INFO_USDT],
  currentSymbol: TokenType.USDT,
};

export const InitialTokenState: TokenState = {
  [BusinessType.Deposit]: InitDepositTokenState,
  [BusinessType.Withdraw]: InitWithdrawTokenState,
};

export const TokenSlice = createSlice({
  name: 'token',
  initialState: InitialTokenState,
  reducers: {
    setTokenList: (state, action: PayloadAction<{ key: BusinessType; data: TTokenItem[] }>) => {
      if (!state[action.payload.key]) {
        state[action.payload.key] = JSON.parse(
          JSON.stringify(InitialTokenState[action.payload.key]),
        );
      }
      state[action.payload.key].tokenList = JSON.parse(JSON.stringify(action.payload.data));
    },
    setCurrentSymbol: (state, action: PayloadAction<{ key: BusinessType; symbol: string }>) => {
      if (!state[action.payload.key]) {
        state[action.payload.key] = JSON.parse(
          JSON.stringify(InitialTokenState[action.payload.key]),
        );
      }
      state[action.payload.key].currentSymbol = action.payload.symbol;
    },
    resetTokenState: (state) => {
      state[BusinessType.Deposit] = JSON.parse(JSON.stringify(InitDepositTokenState));
      state[BusinessType.Withdraw] = JSON.parse(JSON.stringify(InitWithdrawTokenState));
    },
  },
});

export const { resetTokenState, setTokenList, setCurrentSymbol } = TokenSlice.actions;

export default TokenSlice;
