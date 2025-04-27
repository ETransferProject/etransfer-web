import { vi, describe, expect, beforeEach, afterEach, Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { getRecordStatus } from 'utils/api/records';
import { useUpdateRecord } from '../updateRecord';
import { useGetAllConnectedWalletAccount } from '../wallet';
import { useAppDispatch } from 'store/Provider/hooks';
import * as CommonSlice from 'store/reducers/common/slice';

// Mock dependencies
vi.mock('utils/myEvent', () => ({
  default: {
    UpdateNewRecordStatus: {
      addListener: vi.fn().mockImplementation((fn: any) => {
        fn();
        return {
          remove: vi.fn(),
        };
      }), // Mock addListener
    },
  },
}));

vi.mock('store/Provider/hooks', () => ({
  useAppDispatch: vi.fn(),
}));

vi.mock('store/reducers/common/slice', () => ({
  setIsUnreadHistory: vi.fn(),
}));

vi.mock('utils/api/records', () => ({
  getRecordStatus: vi.fn(),
}));

vi.mock('../wallet', () => {
  return {
    useGetAllConnectedWalletAccount: vi.fn().mockImplementation(() => {
      return vi.fn();
    }),
  };
});

const mockDispatch = vi.fn().mockImplementation((action) => {
  console.log(action);
});

const mockSetIsUnreadHistory = vi
  .spyOn(CommonSlice, 'setIsUnreadHistory')
  .mockImplementation((payload) => {
    return { type: 'common/setIsUnreadHistory', payload };
  });
const mockGetAllConnectedWalletAccount = vi.fn();
const mockGetRecordStatus = vi.fn();

describe('useUpdateRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useGetAllConnectedWalletAccount).mockReturnValue(mockGetAllConnectedWalletAccount);
    vi.mocked(getRecordStatus).mockImplementation(mockGetRecordStatus);

    mockGetAllConnectedWalletAccount.mockReturnValue({
      accountList: ['address1', 'address2'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with isUnreadHistory as false', async () => {
    // Mock status response
    (getRecordStatus as Mock).mockResolvedValue({
      status: false,
    } as never);

    const { unmount } = renderHook(() => useUpdateRecord());

    // Wait for any effect to complete
    act(() => {
      vi.advanceTimersByTime(6 * 1000);
    });

    // Wait for any effect to complete
    // to fix error: expected "spy" to be called with arguments: [ false ]
    await vi.waitFor(() => {
      expect(mockSetIsUnreadHistory).toHaveBeenCalledWith(false);
    });

    unmount();
  });

  it('should initialize with isUnreadHistory as true', async () => {
    // Mock status response
    (getRecordStatus as Mock).mockResolvedValue({
      status: true,
    } as never);

    const { unmount } = renderHook(() => useUpdateRecord());

    // Wait for any effect to complete
    act(() => {
      vi.advanceTimersByTime(6 * 1000);
    });

    // Wait for any effect to complete
    await vi.waitFor(() => {
      expect(mockSetIsUnreadHistory).toHaveBeenCalledWith(true);
    });

    unmount();
  });

  it('should show log when services is throw error', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock status response
    (getRecordStatus as Mock).mockRejectedValue({
      error: 'Failed',
    } as never);

    const { unmount } = renderHook(() => useUpdateRecord());

    // Wait for any effect to complete
    await vi.waitFor(() => {
      expect(mockSetIsUnreadHistory).not.toHaveBeenCalled();
    });

    unmount();

    // Wait for any effect to complete
    act(() => {
      // push all timers
      vi.runAllTimers();
    });
  });
});
