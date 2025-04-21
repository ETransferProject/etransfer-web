import { beforeEach, describe, it, expect, vi } from 'vitest';
import { notification } from 'antd';
import {
  browserNotification,
  showNotice,
  handleNoticeDataAndShow,
  unsubscribeUserOrderRecord,
  TTxnNoticeStatus,
} from '../notice';
import { BusinessType } from 'types/api';
import { eTransferInstance } from '../etransferInstance';
import { etransferCore } from '@etransfer/ui-react';

vi.mock('antd', () => ({
  notification: {
    info: vi.fn(),
  },
}));

vi.mock('../etransferInstance', () => ({
  eTransferInstance: {
    processingIds: [],
    showNoticeIds: [],
    setProcessingIds: vi.fn(),
    setShowNoticeIds: vi.fn(),
  },
}));

vi.mock('@etransfer/ui-react', () => ({
  etransferCore: {
    noticeSocket: {
      UnsubscribeUserOrderRecord: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

vi.mock('utils/format', () => ({
  formatSymbolDisplay: (symbol: string) => symbol.toUpperCase(),
}));

vi.mock('constants/misc', () => ({
  ETRANSFER_LOGO: 'mock-logo-url',
}));

describe('browserNotification', () => {
  const mockTitle = 'Test Title';
  const mockContent = 'Test Content';

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the Notification API between tests
    delete (window as any).Notification;
  });

  it('should log a message if the browser does not support notifications', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    browserNotification({ title: mockTitle, content: mockContent });

    expect(consoleLogSpy).toHaveBeenCalledWith('This browser does not support notifications.');
  });

  it('should send a notification if permission is granted', () => {
    const mockNotification = vi.fn();
    (window as any).Notification = mockNotification;
    (window as any).Notification.permission = 'granted';

    browserNotification({ title: mockTitle, content: mockContent });

    expect(mockNotification).toHaveBeenCalledWith(mockTitle, {
      body: mockContent,
      icon: 'mock-logo-url',
    });
  });

  it('should request permission if not previously granted or denied', () => {
    const mockNotification = vi.fn();
    (window as any).Notification = mockNotification;
    (window as any).Notification.permission = 'default';
    (window as any).Notification.requestPermission = vi.fn((callback: any) => callback('granted'));

    browserNotification({ title: mockTitle, content: mockContent });

    expect((window as any).Notification.requestPermission).toHaveBeenCalled();
    expect(mockNotification).toHaveBeenCalledWith(mockTitle, {
      body: mockContent,
      icon: 'mock-logo-url',
    });
  });

  it('should not send a notification if permission is denied', () => {
    const mockNotification = vi.fn();
    (window as any).Notification = mockNotification;
    (window as any).Notification.permission = 'denied';

    browserNotification({ title: mockTitle, content: mockContent });

    expect(mockNotification).not.toHaveBeenCalled();
  });
});

describe('showNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do nothing if required fields are missing', () => {
    showNotice({
      status: undefined as any,
      type: BusinessType.Deposit,
      amount: '10',
      symbol: 'USDT',
    });

    expect(notification.info).not.toHaveBeenCalled();
  });

  it('should show a notification for successful deposit without a swap failure', () => {
    showNotice({
      status: TTxnNoticeStatus.Successful,
      type: BusinessType.Deposit,
      amount: '10',
      symbol: 'usdt',
      isSwapFail: false,
    });

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Deposit Successful',
        description: 'The deposit of 10 USDT has been received.',
      }),
    );
  });

  it('should show a notification for successful deposit with duration 10', () => {
    showNotice({
      status: TTxnNoticeStatus.Successful,
      type: BusinessType.Deposit,
      amount: '0',
      symbol: 'usdt',
      isSwapFail: false,
      noticeProps: {
        message: '',
        duration: 10,
      },
    });

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'The deposit has been processed successfully.',
      }),
    );
  });

  it('should show a notification for successful deposit with amount: 0 and a swap failure', () => {
    showNotice({
      status: TTxnNoticeStatus.Successful,
      type: BusinessType.Deposit,
      amount: '0',
      symbol: 'usdt',
      isSwapFail: true,
    });

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Deposit Successful',
        description: 'Swap USDT failed, the USDT deposit has been processed.',
      }),
    );
  });

  it('should show a notification for successful deposit with amount: 10 and a swap failure', () => {
    showNotice({
      status: TTxnNoticeStatus.Successful,
      type: BusinessType.Deposit,
      amount: '10',
      symbol: 'usdt',
      isSwapFail: true,
    });

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Deposit Successful',
        description: 'Swap failed, the deposit of 10 USDT has been received.',
      }),
    );
  });

  it('should show a notification for failed deposit', () => {
    showNotice({
      status: TTxnNoticeStatus.Failed,
      type: BusinessType.Deposit,
      amount: '10',
      symbol: 'eth',
    });

    expect(notification.info).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Deposit Failed',
        description:
          'The deposit of 10 ETH failed; please check the transaction and contact customer service.',
      }),
    );
  });
});

describe('handleNoticeDataAndShow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    eTransferInstance.processingIds = [];
    eTransferInstance.showNoticeIds = [];
  });

  it('should correctly save processing deposit IDs and show success notifications', () => {
    const mockNoticeData = {
      processing: {
        deposit: [
          { id: '111', amount: '100', symbol: 'usdt', isSwap: true, isSwapFail: false },
          { id: '112', amount: '100', symbol: 'usdt', isSwap: true, isSwapFail: true },
        ],
        transfer: [
          { id: '222', amount: '100', symbol: 'usdt' },
          { id: '223', amount: '100', symbol: 'usdt' },
        ],
      },
      succeed: {
        deposit: [{ id: '111', amount: '100', symbol: 'usdt', isSwap: true, isSwapFail: false }],
        transfer: [{ id: '222', amount: '100', symbol: 'usdt' }],
      },
    };

    handleNoticeDataAndShow(mockNoticeData as any);

    expect(eTransferInstance.processingIds).toContain('111');
    expect(eTransferInstance.processingIds).toContain('222');
    expect(eTransferInstance.showNoticeIds).toContain('111');
    expect(eTransferInstance.showNoticeIds).toContain('222');
    expect(notification.info).toHaveBeenCalled();
  });

  it('should correctly handle failed deposit notifications', () => {
    const mockNoticeData = {
      processing: {
        deposit: [{ id: '112', amount: '100', symbol: 'usdt', isSwap: true, isSwapFail: true }],
        transfer: [{ id: '223', amount: '100', symbol: 'usdt' }],
      },
      succeed: { deposit: [], transfer: [] },
      failed: {
        deposit: [{ id: '112', amount: '100', symbol: 'usdt', isSwap: true, isSwapFail: true }],
        transfer: [{ id: '223', amount: '100', symbol: 'usdt' }],
      },
    };

    handleNoticeDataAndShow(mockNoticeData as any);

    expect(eTransferInstance.showNoticeIds).toContain('112');
    expect(eTransferInstance.showNoticeIds).toContain('223');
  });
});

describe('unsubscribeUserOrderRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unsubscribe user order record and destroy the socket', async () => {
    await unsubscribeUserOrderRecord();

    expect(eTransferInstance.setProcessingIds).toHaveBeenCalledWith([]);
    expect(eTransferInstance.setShowNoticeIds).toHaveBeenCalledWith([]);
    expect(etransferCore.noticeSocket?.UnsubscribeUserOrderRecord).toHaveBeenCalled();
    expect(etransferCore.noticeSocket?.destroy).toHaveBeenCalled();
  });
});
