import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import myEvents, { eventBus } from '../myEvent';

describe('Event System', () => {
  let callbackMock: ReturnType<typeof vi.fn>;

  // Before each test, reset mocks and initialize the callback
  beforeEach(() => {
    callbackMock = vi.fn();

    // Ensure no listeners from previous tests
    eventBus.removeAllListeners();
  });

  afterEach(() => {
    // Clean up listeners after every test
    eventBus.removeAllListeners();
  });

  /**
   * Test eventBus functionality separately
   */
  describe('eventBus', () => {
    it('should emit and listen for a custom event', () => {
      const testEvent = 'TEST_EVENT';

      // Register a listener
      eventBus.on(testEvent, callbackMock);

      // Emit the event
      eventBus.emit(testEvent, 'payload');

      // Assert callback was called with the correct payload
      expect(callbackMock).toHaveBeenCalledOnce();
      expect(callbackMock).toHaveBeenCalledWith('payload');
    });

    it('should allow removing a listener', () => {
      const testEvent = 'TEST_EVENT';

      // Register a listener
      const listener = (data: any) => {
        callbackMock(data);
      };
      eventBus.on(testEvent, listener);

      // Remove the listener
      eventBus.removeListener(testEvent, listener);

      // Emit the event (should no longer be handled)
      eventBus.emit(testEvent, 'payload');

      // Assert callback was not called
      expect(callbackMock).not.toHaveBeenCalled();
    });
  });

  /**
   * Test eventsServer generated events
   */
  describe('eventsServer-generated events', () => {
    it('should emit and handle `Unauthorized` event via myEvents', () => {
      // Register a listener
      const listener = myEvents.Unauthorized.addListener(callbackMock);

      // Emit the event
      myEvents.Unauthorized.emit('unauthorized_payload');

      // Assert that the listener was called
      expect(callbackMock).toHaveBeenCalledOnce();
      expect(callbackMock).toHaveBeenCalledWith('unauthorized_payload');

      // Remove the listener
      listener.remove();

      // Emit the event again (should have no effect)
      myEvents.Unauthorized.emit('second_payload');
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });

    it('should emit and handle multiple events', () => {
      // Register listeners for multiple events
      const authSuccessListener = vi.fn();
      const logoutSuccessListener = vi.fn();

      const authListener = myEvents.AuthTokenSuccess.addListener(authSuccessListener);
      const logoutListener = myEvents.LogoutSuccess.addListener(logoutSuccessListener);

      // Emit both events
      myEvents.AuthTokenSuccess.emit('auth_token_payload');
      myEvents.LogoutSuccess.emit('logout_payload');

      // Assert both listeners were called with respective payloads
      expect(authSuccessListener).toHaveBeenCalledOnce();
      expect(authSuccessListener).toHaveBeenCalledWith('auth_token_payload');

      expect(logoutSuccessListener).toHaveBeenCalledOnce();
      expect(logoutSuccessListener).toHaveBeenCalledWith('logout_payload');

      // Remove both listeners
      authListener.remove();
      logoutListener.remove();

      // Emit events again (should not trigger listeners)
      myEvents.AuthTokenSuccess.emit('second_payload');
      myEvents.LogoutSuccess.emit('second_payload');
      expect(authSuccessListener).toHaveBeenCalledTimes(1);
      expect(logoutSuccessListener).toHaveBeenCalledTimes(1);
    });

    it('should store event names in uppercase', () => {
      expect(myEvents.HistoryActive.name).toBe('HISTORYACTIVE');
      expect(myEvents.GoogleReCaptcha.name).toBe('GOOGLERECAPTCHA');
    });
  });

  /**
   * Edge case tests
   */
  describe('Edge cases', () => {
    it('should not crash when emitting an event with no listeners', () => {
      expect(() => myEvents.Unauthorized.emit('no_listeners_payload')).not.toThrow();
    });

    it('should behave correctly when adding multiple listeners to the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      myEvents.Unauthorized.addListener(listener1);
      myEvents.Unauthorized.addListener(listener2);

      // Emit the event
      myEvents.Unauthorized.emit('payload');

      // Assert both listeners were called
      expect(listener1).toHaveBeenCalledOnce();
      expect(listener1).toHaveBeenCalledWith('payload');
      expect(listener2).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledWith('payload');
    });
  });
});
