import { describe, it, expect } from 'vitest';
import { isSymbol, isUrl, isValidBase58, isValidNumber, isValidPositiveNumber } from '../reg';

describe('Validation Utilities', () => {
  /**
   * Test `isUrl`
   */
  describe('isUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isUrl('http://example.com')).toBe(true);
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('ftp://example.com')).toBe(true);
      expect(isUrl('http://localhost:3000')).toBe(true);
      expect(isUrl('http://localhost')).toBe(true);
      expect(isUrl('https://sub.domain.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isUrl('')).toBe(false);
      expect(isUrl('example')).toBe(false);
      expect(isUrl('http:/example.com')).toBe(false);
      expect(isUrl('://example.com')).toBe(false);
      expect(isUrl('not-a-url')).toBe(false);
      expect(isUrl('ftp:/example.com')).toBe(false);
    });

    it('should return false if input is not a string', () => {
      expect(isUrl(undefined as any)).toBe(false);
      expect(isUrl(null as any)).toBe(false);
      expect(isUrl(123 as any)).toBe(false);
      expect(isUrl({} as any)).toBe(false);
    });
  });

  /**
   * Test `isSymbol`
   */
  describe('isSymbol', () => {
    it('should return true for valid symbols', () => {
      expect(isSymbol('BTC')).toBe(true);
      expect(isSymbol('123')).toBe(true);
      expect(isSymbol('TestSymbol')).toBe(true);
    });

    it('should return false for invalid symbols', () => {
      expect(isSymbol(undefined)).toBe(false);
      expect(isSymbol('')).toBe(false);
      expect(isSymbol('BTC/USD')).toBe(false); // Contains special characters
      expect(isSymbol('BTC@')).toBe(false);
      expect(isSymbol('#SYMBOL')).toBe(false);
    });
  });

  /**
   * Test `isValidNumber`
   */
  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber('123')).toBe(true);
      expect(isValidNumber('123.45')).toBe(true);
      expect(isValidNumber('-123')).toBe(true);
      expect(isValidNumber('-123.45')).toBe(true);
      expect(isValidNumber('-')).toBe(true); // Special case
    });

    it('should return false for invalid numbers', () => {
      expect(isValidNumber('')).toBe(false);
      expect(isValidNumber('.')).toBe(false);
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber('12abc34')).toBe(false);
      expect(isValidNumber('.45')).toBe(false);
      expect(isValidNumber('12.34.56')).toBe(false);
      expect(isValidNumber('--123')).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
    });
  });

  /**
   * Test `isValidPositiveNumber`
   */
  describe('isValidPositiveNumber', () => {
    it('should return true for valid positive numbers', () => {
      expect(isValidPositiveNumber('123')).toBe(true);
      expect(isValidPositiveNumber('0')).toBe(true);
      expect(isValidPositiveNumber('123.45')).toBe(true);
    });

    it('should return false for invalid or negative numbers', () => {
      expect(isValidPositiveNumber('')).toBe(false);
      expect(isValidPositiveNumber('abc')).toBe(false);
      expect(isValidPositiveNumber('.45')).toBe(false);
      expect(isValidPositiveNumber('-123')).toBe(false);
      expect(isValidPositiveNumber('-123.45')).toBe(false);
      expect(isValidPositiveNumber('--123')).toBe(false);
      expect(isValidPositiveNumber(undefined)).toBe(false);
    });
  });

  /**
   * Test `isValidBase58`
   */
  describe('isValidBase58', () => {
    it('should return true for strings without Chinese characters', () => {
      expect(isValidBase58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')).toBe(
        true,
      );
      expect(isValidBase58('TestBase58String')).toBe(true);
      expect(isValidBase58('12345678')).toBe(true);
      expect(isValidBase58('Base58🚀')).toBe(true); // Emoji
      expect(isValidBase58('Base58!')).toBe(true); // Special character
    });

    it('should return false for strings with Chinese characters or special symbols', () => {
      expect(isValidBase58('漢')).toBe(false); // Chinese characters
    });
  });
});
