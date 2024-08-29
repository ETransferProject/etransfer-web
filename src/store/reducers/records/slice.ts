import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TRecordsListItem, TGetRecordsListRequest } from 'types/api';
import { TRecordsRequestType, TRecordsRequestStatus } from 'types/records';

export type TRecordsState = TGetRecordsListRequest & {
  recordsList: TRecordsListItem[];
  totalCount: number;
  timestamp: number[] | null;
  hasMore: boolean;
  depositProcessingCount?: number;
  withdrawProcessingCount?: number;
};

export const initialRecordState: TRecordsState = {
  recordsList: [],
  totalCount: 0,
  type: TRecordsRequestType.ALL,
  status: TRecordsRequestStatus.ALL,
  timestamp: null,
  skipCount: 1,
  maxResultCount: 10,
  search: '',
  hasMore: true,
  depositProcessingCount: 0,
  withdrawProcessingCount: 0,
};

export const RecordsSlice = createSlice({
  name: 'records',
  initialState: initialRecordState,
  reducers: {
    setRecordsList: (state, action) => {
      state.recordsList = action.payload;
    },
    setTotalCount: (state, action) => {
      state.totalCount = action.payload;
    },
    setType: (state, action: PayloadAction<TRecordsRequestType>) => {
      state.type = action.payload;
    },
    setStatus: (state, action: PayloadAction<TRecordsRequestStatus>) => {
      state.status = action.payload;
    },
    setTimestamp: (state, action: PayloadAction<number[] | null>) => {
      state.timestamp = action.payload;
    },
    setSkipCount: (state, action) => {
      state.skipCount = action.payload;
      // reset recordsList [] and hasMore true when setSkipCount value init 1
      if (action.payload === 1) {
        state.hasMore = true;
      }
    },
    setMaxResultCount: (state, action) => {
      state.maxResultCount = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setDepositProcessingCount: (state, action: PayloadAction<number>) => {
      state.depositProcessingCount = action.payload;
    },
    setWithdrawProcessingCount: (state, action: PayloadAction<number>) => {
      state.withdrawProcessingCount = action.payload;
    },
    resetRecordsWithoutFilter: (state) => {
      return {
        ...state,
        recordsList: [],
        totalCount: 0,
        skipCount: 1,
        maxResultCount: 10,
        search: '',
        hasMore: true,
      };
    },
    resetRecordsStateNotNotice: (state) => {
      return {
        ...state,
        recordsList: [],
        totalCount: 0,
        type: TRecordsRequestType.ALL,
        status: TRecordsRequestStatus.ALL,
        timestamp: null,
        skipCount: 1,
        maxResultCount: 10,
        search: '',
        hasMore: true,
      };
    },
    resetRecordsState: () => {
      return initialRecordState;
    },
  },
});

export const {
  setRecordsList,
  setTotalCount,
  setType,
  setStatus,
  setTimestamp,
  setSkipCount,
  setMaxResultCount,
  setHasMore,
  setDepositProcessingCount,
  setWithdrawProcessingCount,
  resetRecordsWithoutFilter,
  resetRecordsStateNotNotice,
  resetRecordsState,
} = RecordsSlice.actions;

export default RecordsSlice;
