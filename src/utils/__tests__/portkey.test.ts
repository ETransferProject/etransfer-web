import { afterEach, describe, it, expect, vi } from 'vitest';
import { isPortkey } from '../portkey';

// Mocking `window` object for testing
declare const window: Window & typeof globalThis;

describe('isPortkey', () => {
  afterEach(() => {
    // Reset the mocked `window` object after each test
    vi.resetModules();
  });

  it('should return true if `window.navigator.userAgent` contains "Portkey"', () => {
    // Mock a user agent containing "Portkey"
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'SomeBrowser Portkey OtherInfo' },
      writable: true,
    });

    expect(isPortkey()).toBe(true);
  });

  it('should return false if `window.navigator.userAgent` does not contain "Portkey"', () => {
    // Mock a user agent not containing "Portkey"
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'SomeBrowser OtherInfo' },
      writable: true,
    });

    expect(isPortkey()).toBe(false);
  });

  it('should return false if `window` is not an object', () => {
    // Simulate a non-browser environment by completely removing `window`
    const originalWindow = global.window;
    delete (global as any).window;

    expect(isPortkey()).toBe(false);

    // Restore original `window` after the test
    global.window = originalWindow;
  });
});
