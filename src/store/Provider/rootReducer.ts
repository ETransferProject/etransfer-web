import CommonSlice from 'store/reducers/common/slice';
import { customCombineReducers } from 'store/utils/customCombineReducers';
import { persistReducer } from 'redux-persist';
import {
  commonPersistConfig,
  portkeyWalletPersistConfig,
  depositPersistConfig,
  withdrawPersistConfig,
} from './config';
import PortkeyWalletSlice from 'store/reducers/portkeyWallet/slice';
import DepositSlice from 'store/reducers/deposit/slice';
import WithdrawSlice from 'store/reducers/withdraw/slice';
import RecordsSlice from 'store/reducers/records/slice';

export const commonReducer = persistReducer(commonPersistConfig, CommonSlice.reducer);
export const portkeyWalletReducer = persistReducer(
  portkeyWalletPersistConfig,
  PortkeyWalletSlice.reducer,
);
export const depositReducer = persistReducer(depositPersistConfig, DepositSlice.reducer);
export const withdrawReducer = persistReducer(withdrawPersistConfig, WithdrawSlice.reducer);

const rootReducer = customCombineReducers({
  [CommonSlice.name]: CommonSlice.reducer,
  [PortkeyWalletSlice.name]: PortkeyWalletSlice.reducer,
  [DepositSlice.name]: DepositSlice.reducer,
  [WithdrawSlice.name]: WithdrawSlice.reducer,
  [RecordsSlice.name]: RecordsSlice.reducer,
});

export default rootReducer;
