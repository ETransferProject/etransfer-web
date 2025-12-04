import { afterEach, describe, it, expect } from 'vitest';
import { TelegramPlatform } from '../telegram';

// Mocking the browser `window` object
declare const window: Window & typeof globalThis & { Telegram?: any };

describe('TelegramPlatform', () => {
  // Clean up `window.Telegram` after each test
  afterEach(() => {
    delete window.Telegram;
  });

  /**
   * Test `getTelegram` method
   */
  describe('getTelegram', () => {
    it('should return `undefined` if `window.Telegram` is not defined', () => {
      expect(TelegramPlatform.getTelegram()).toBeUndefined();
    });

    it('should return `window.Telegram` if it is defined', () => {
      const mockTelegram = { WebApp: { platform: 'web' } };
      window.Telegram = mockTelegram;

      expect(TelegramPlatform.getTelegram()).toBe(mockTelegram);
    });
  });

  /**
   * Test `getWebApp` method
   */
  describe('getWebApp', () => {
    it('should return `undefined` if `window.Telegram` is not defined', () => {
      expect(TelegramPlatform.getWebApp()).toBeUndefined();
    });

    it('should return the `Telegram.WebApp` object if `window.Telegram` is defined', () => {
      const mockWebApp = { platform: 'web' };
      const mockTelegram = { WebApp: mockWebApp };
      window.Telegram = mockTelegram;

      expect(TelegramPlatform.getWebApp()).toBe(mockWebApp);
    });

    it('should return `undefined` if `Telegram.WebApp` is not defined', () => {
      window.Telegram = {};

      expect(TelegramPlatform.getWebApp()).toBeUndefined();
    });
  });

  /**
   * Test `isTelegramPlatform` method
   */
  describe('isTelegramPlatform', () => {
    it('should return `false` if `window.Telegram` is not defined', () => {
      expect(TelegramPlatform.isTelegramPlatform()).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp` is not defined', () => {
      window.Telegram = {};

      expect(TelegramPlatform.isTelegramPlatform()).toBe(false);
    });

    it('should return `false` if `Telegram.WebApp.platform` is "unknown"', () => {
      window.Telegram = { WebApp: { platform: 'unknown' } };

      expect(TelegramPlatform.isTelegramPlatform()).toBe(false);
    });

    it('should return `true` if `Telegram.WebApp.platform` is not "unknown"', () => {
      window.Telegram = { WebApp: { platform: 'web' } };

      expect(TelegramPlatform.isTelegramPlatform()).toBe(true);
    });
  });
});
