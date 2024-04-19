import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RecordsListItem, GetRecordsListRequest, RangeValue } from 'types/api';
import { RecordsRequestType, RecordsRequestStatus } from 'types/records';

export type RecordsState = GetRecordsListRequest & {
  recordsList: RecordsListItem[];
  totalCount: number;
  timestamp: RangeValue;
  hasMore: boolean;
};

export const initialRecordState: RecordsState = {
  recordsList: [],
  totalCount: 0,
  type: RecordsRequestType.ALL,
  status: RecordsRequestStatus.ALL,
  timestamp: null,
  skipCount: 1,
  maxResultCount: 10,
  search: '',
  hasMore: true,
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
    setType: (state, action) => {
      state.type = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setTimestamp: (state, action: PayloadAction<RangeValue>) => {
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
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setHandleReset: (state) => {
      state.status = RecordsRequestStatus.ALL;
      state.type = RecordsRequestType.ALL;
      state.timestamp = null;
      state.skipCount = 1;
      state.maxResultCount = 10;
      state.hasMore = true;
      state.search = '';
      state.totalCount = 0;
      state.recordsList = [];
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
  setSearch,
  setHasMore,
  setHandleReset,
} = RecordsSlice.actions;

export default RecordsSlice;
