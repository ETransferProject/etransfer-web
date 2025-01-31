import { describe, it, expect, vi } from 'vitest';
import { emitLoading } from '../events';
import { eventBus } from '../myEvent';
import { SET_GLOBAL_LOADING } from '../../constants/events';

// Mock Event Bus
vi.mock('../myEvent', () => ({
  eventBus: {
    emit: vi.fn(),
  },
}));

describe('emitLoading', () => {
  it('should emit the global loading event with `loading` only', () => {
    emitLoading(true);

    // Assert that `eventBus.emit` was called with the correct arguments
    expect(eventBus.emit).toHaveBeenCalledOnce();
    expect(eventBus.emit).toHaveBeenCalledWith(SET_GLOBAL_LOADING, true, undefined);
  });

  it('should emit the global loading event with `loading` and `loadingInfo`', () => {
    const mockLoadingInfo = { text: 'Loading...' };

    emitLoading(false, mockLoadingInfo);

    // Assert that `eventBus.emit` was called with correct arguments
    expect(eventBus.emit).toHaveBeenCalledTimes(2);
    expect(eventBus.emit).toHaveBeenCalledWith(SET_GLOBAL_LOADING, false, mockLoadingInfo);
  });
});
