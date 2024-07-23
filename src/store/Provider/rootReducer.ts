import CommonSlice from 'store/reducers/common/slice';
import { customCombineReducers } from 'store/utils/customCombineReducers';
import { persistReducer } from 'redux-persist';
import {
  commonPersistConfig,
  depositPersistConfig,
  withdrawPersistConfig,
  infoDashboardPersistConfig,
} from './config';
import DepositSlice from 'store/reducers/deposit/slice';
import WithdrawSlice from 'store/reducers/withdraw/slice';
import RecordsSlice from 'store/reducers/records/slice';
import InfoDashboardSlice from 'store/reducers/infoDashboard/slice';

export const commonReducer = persistReducer(commonPersistConfig, CommonSlice.reducer);
export const depositReducer = persistReducer(depositPersistConfig, DepositSlice.reducer);
export const withdrawReducer = persistReducer(withdrawPersistConfig, WithdrawSlice.reducer);
export const infoDashboardReducer = persistReducer(
  infoDashboardPersistConfig,
  InfoDashboardSlice.reducer,
);

const rootReducer = customCombineReducers({
  [CommonSlice.name]: CommonSlice.reducer,
  [DepositSlice.name]: DepositSlice.reducer,
  [WithdrawSlice.name]: WithdrawSlice.reducer,
  [RecordsSlice.name]: RecordsSlice.reducer,
  [InfoDashboardSlice.name]: InfoDashboardSlice.reducer,
});

export default rootReducer;
