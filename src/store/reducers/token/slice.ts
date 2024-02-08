import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenItem } from 'types/api';
import { USDT_DECIMAL } from 'constants/index';

export interface TokenState {
  tokenList: TokenItem[];
  currentSymbol: string;
}

export const initialTokenState: TokenState = {
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

export const TokenSlice = createSlice({
  name: 'token',
  initialState: initialTokenState,
  reducers: {
    setTokenList: (state, action: PayloadAction<TokenItem[]>) => {
      state.tokenList = action.payload;
    },
    setCurrentSymbol: (state, action: PayloadAction<string>) => {
      state.currentSymbol = action.payload;
    },
  },
});

export const { setTokenList, setCurrentSymbol } = TokenSlice.actions;

export default TokenSlice;
