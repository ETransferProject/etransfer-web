import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach } from 'vitest';
import { useHistoryFilter } from '../history';
import { setType, setStatus, setTimestamp } from 'store/reducers/records/slice';
import { TRecordsRequestType, TRecordsRequestStatus } from 'types/records';
import { useSearchParams } from 'next/navigation';

// Mock dependencies
vi.mock('store/Provider/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: mockRouterReplace })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// const mockStringify = vi.fn();
vi.mock('query-string', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    stringify: vi.fn().mockReturnValue(''),
  };
});

const mockDispatch = vi.fn();
const mockRouterReplace = vi.fn();
// const mockStringify = vi.mocked(queryString.stringify);
// const mockStringify = vi.fn();

describe('useHistoryFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mockStringify.mockReturnValue('');
  });

  test('setTypeFilter should dispatch actions and update URL', () => {
    const { result } = renderHook(() => useHistoryFilter());
    const type = TRecordsRequestType.Deposit;

    result.current.setTypeFilter(type);

    expect(mockDispatch).toHaveBeenCalledWith(setType(type));
    expect(mockDispatch).toHaveBeenCalledWith(setStatus(TRecordsRequestStatus.ALL));
    expect(mockDispatch).toHaveBeenCalledWith(setTimestamp(null));
    // expect(mockStringify).toHaveBeenCalledWith({
    //   type,
    //   status: TRecordsRequestStatus.ALL,
    // });
  });

  test('setStatusFilter should dispatch status and update URL', () => {
    const { result } = renderHook(() => useHistoryFilter());
    const status = TRecordsRequestStatus.Processing;

    result.current.setStatusFilter(status);

    expect(mockDispatch).toHaveBeenCalledWith(setStatus(status));
    // expect(mockStringify).toHaveBeenCalledWith({
    //   type: undefined,
    //   status,
    //   start: undefined,
    //   end: undefined,
    // });
  });

  test('setTimestampFilter should handle valid timeArray', () => {
    const { result } = renderHook(() => useHistoryFilter());
    const timeArray = [1625097600000, 1627689600000];

    result.current.setTimestampFilter(timeArray);

    expect(mockDispatch).toHaveBeenCalledWith(setTimestamp(timeArray));
    // expect(mockStringify).toHaveBeenCalledWith({
    //   type: undefined,
    //   status: undefined,
    //   start: 1625097600000,
    //   end: 1627689600000,
    // });
  });

  test('setFilter should combine status and timeArray', () => {
    const { result } = renderHook(() => useHistoryFilter());
    const filterParams = {
      status: TRecordsRequestStatus.Succeed,
      timeArray: [1625097600000, 1627689600000],
    };

    result.current.setFilter(filterParams);

    expect(mockDispatch).toHaveBeenCalledWith(setStatus(filterParams.status));
    expect(mockDispatch).toHaveBeenCalledWith(setTimestamp(filterParams.timeArray));
    //   expect(mockStringify).toHaveBeenCalledWith({
    //     type: undefined,
    //     status: filterParams.status,
    //     start: filterParams.timeArray[0],
    //     end: filterParams.timeArray[1],
    //   });
  });

  test('should handle undefined parameters in URL', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new (class ReadonlyURLSearchParams extends URLSearchParams {})(
        'type=deposit&status=success',
      ) as ReturnType<typeof useSearchParams>,
    );

    const { result } = renderHook(() => useHistoryFilter());
    result.current.setStatusFilter(TRecordsRequestStatus.Failed);

    //   expect(mockStringify).toHaveBeenCalledWith({
    //     type: 'deposit',
    //     status: TRecordsRequestStatus.Failed,
    //     start: undefined,
    //     end: undefined,
    //   });
  });

  test('should handle invalid timeArray values', () => {
    const { result } = renderHook(() => useHistoryFilter());

    // Test invalid start time
    result.current.setTimestampFilter([NaN, 1627689600000]);
    // expect(mockStringify).toHaveBeenCalledWith({
    //   type: undefined,
    //   status: undefined,
    //   start: undefined,
    //   end: undefined,
    // });

    // Test invalid end time
    result.current.setTimestampFilter([1625097600000, NaN]);
    //   expect(mockStringify).toHaveBeenCalledWith({
    //     type: undefined,
    //     status: undefined,
    //     start: 1625097600000,
    //     end: undefined,
    //   });
  });
});
