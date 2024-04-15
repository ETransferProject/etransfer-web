import CommonSlice from 'store/reducers/common/slice';
import { customCombineReducers } from 'store/utils/customCombineReducers';
import { persistReducer } from 'redux-persist';
import {
  commonPersistConfig,
  portkeyWalletPersistConfig,
  tokenPersistConfig,
  userActionPersistConfig,
} from './config';
import PortkeyWalletSlice from 'store/reducers/portkeyWallet/slice';
import TokenSlice from 'store/reducers/token/slice';
import UserActionSlice from 'store/reducers/userAction/slice';
import RecordsSlice from 'store/reducers/records/slice';

export const commonReducer = persistReducer(commonPersistConfig, CommonSlice.reducer);
export const portkeyWalletReducer = persistReducer(
  portkeyWalletPersistConfig,
  PortkeyWalletSlice.reducer,
);
export const tokenReducer = persistReducer(tokenPersistConfig, TokenSlice.reducer);
export const userActionReducer = persistReducer(userActionPersistConfig, UserActionSlice.reducer);

const rootReducer = customCombineReducers({
  [CommonSlice.name]: CommonSlice.reducer,
  [PortkeyWalletSlice.name]: PortkeyWalletSlice.reducer,
  [TokenSlice.name]: TokenSlice.reducer,
  [UserActionSlice.name]: UserActionSlice.reducer,
  [RecordsSlice.name]: RecordsSlice.reducer,
});

export default rootReducer;
