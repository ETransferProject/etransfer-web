import { compareVersion } from '../version';
import { describe, it, expect } from 'vitest';

// Main test suite for the `compareVersion` function
describe('compareVersion', () => {
  // Test: Handles equal versions
  it('should return 0 for equal versions', () => {
    expect(compareVersion('1.0', '1.0')).toBe(0);
    expect(compareVersion('0.0.1', '0.0.1')).toBe(0);
    expect(compareVersion('1.0.0', '1.0.0')).toBe(0); // Includes trailing zeros
  });

  // Test: First version is greater
  it('should return 1 when the first version is greater', () => {
    expect(compareVersion('2.0', '1.0')).toBe(1);
    expect(compareVersion('1.1', '1.0')).toBe(1);
    expect(compareVersion('1.0.1', '1.0.0')).toBe(1);
    expect(compareVersion('1.0.1', '1.0')).toBe(1);
    expect(compareVersion('1.0.0.1', '1.0')).toBe(1); // Unequal lengths
  });

  // Test: Second version is greater
  it('should return -1 when the second version is greater', () => {
    expect(compareVersion('1.0', '2.0')).toBe(-1);
    expect(compareVersion('1.0', '1.1')).toBe(-1);
    expect(compareVersion('1.0.0', '1.0.1')).toBe(-1);
    expect(compareVersion('1.0', '1.0.1')).toBe(-1);
    expect(compareVersion('1', '1.0.1')).toBe(-1); // Unequal lengths
  });

  // Test: Handles cases with trailing zeros and considers them equal
  it('should consider trailing zeros when versions are equal', () => {
    expect(compareVersion('1.0.0', '1.0')).toBe(0); // Trailing zero
    expect(compareVersion('1.0.0', '1.0.0.0')).toBe(0); // Multiple trailing zeros
  });

  // Test: Handles versions with leading zeros properly
  it('should handle versions with leading zeros appropriately', () => {
    expect(compareVersion('01.0.0', '1.0.0')).toBe(0); // Leading zeros
    expect(compareVersion('1.01', '1.1')).toBe(0); // Ignore leading zeros
    expect(compareVersion('1.0.01', '1.0.1')).toBe(0); // Ignore leading zeros
    expect(compareVersion('0.1', '0.01')).toBe(0); // Ignore leading zeros
  });

  // Test: Handles complex version comparison scenarios
  it('should handle complex version cases', () => {
    expect(compareVersion('1.2.3.4', '1.2.3')).toBe(1); // First version is longer and non-zero at the end
    expect(compareVersion('1.2.3', '1.2.3.4')).toBe(-1); // Second version is longer with a non-zero value
    expect(compareVersion('1.0.0.0', '1')).toBe(0); // Different lengths but versions are equivalent
  });
});
