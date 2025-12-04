import {
  ImmutableStateInvariantMiddlewareOptions,
  SerializableStateInvariantMiddlewareOptions,
} from '@reduxjs/toolkit';
import { reduxStorageRoot } from 'constants/store';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import CommonSlice from 'store/reducers/common/slice';
import storage from 'redux-persist/lib/storage';
import DepositSlice from 'store/reducers/deposit/slice';
import WithdrawSlice from 'store/reducers/withdraw/slice';
import InfoDashboardSlice from 'store/reducers/infoDashboard/slice';
import CrossChainTransferSlice from 'store/reducers/crossChainTransfer/slice';
import WithdrawNewSlice from 'store/reducers/withdrawNew/slice';

interface ThunkOptions<E = any> {
  extraArgument: E;
}

export interface DefaultMiddlewareOptions {
  thunk?: boolean | ThunkOptions;
  immutableCheck?: boolean | ImmutableStateInvariantMiddlewareOptions;
  serializableCheck?: boolean | SerializableStateInvariantMiddlewareOptions;
}

export const commonPersistConfig = {
  key: CommonSlice.name,
  storage,
  // if you need add key for an existing slice, please use createMigrate.
  // migrate: createMigrate(migrations, { debug: false}) // import { createMigrate } from 'redux-persist';
};

export const depositPersistConfig = {
  key: DepositSlice.name,
  storage,
};

export const withdrawPersistConfig = {
  key: WithdrawSlice.name,
  storage,
};

export const crossChainTransferPersistConfig = {
  key: CrossChainTransferSlice.name,
  storage,
};

export const withdrawNewPersistConfig = {
  key: WithdrawNewSlice.name,
  storage,
};

export const infoDashboardPersistConfig = {
  key: InfoDashboardSlice.name,
  storage,
};

const reduxPersistConfig = {
  key: reduxStorageRoot,
  storage,

  // Reducer keys that you do NOT want stored to persistence here.
  // blacklist: [],

  // Optionally, just specify the keys you DO want stored to persistence.
  // An empty array means 'don't store any reducers' -> infinite-red/ignite#409
  whitelist: [
    CommonSlice.name,
    DepositSlice.name,
    WithdrawSlice.name,
    WithdrawNewSlice.name,
    CrossChainTransferSlice.name,
  ],
  // More info here:  https://shift.infinite.red/shipping-persistant-reducers-7341691232b1
  // transforms: [SetTokenTransform],
};

const defaultMiddlewareOptions: DefaultMiddlewareOptions = {
  thunk: true,
  serializableCheck: {
    // https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  },
};

const storeProviderConfig = {
  reduxPersistConfig,
  defaultMiddlewareOptions,
};

export default storeProviderConfig;
