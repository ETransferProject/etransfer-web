import { describe, it, expect, vi } from 'vitest';
import { getAuthPlainText } from '../auth';

describe('getAuthPlainText', () => {
  it('should generate plainTextOrigin with the expected format', () => {
    // Mock the Date.now() method so the value of the nonce is predictable
    const mockTimestamp = 1680000000000;
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result = getAuthPlainText();

    // Verify plainTextOrigin content
    expect(result.plainTextOrigin).toContain('Welcome to ETransfer!');
    expect(result.plainTextOrigin).toContain(
      'Click to sign in and accept the ETransfer Terms of Service',
    );
    expect(result.plainTextOrigin).toContain(
      'https://etransfer.gitbook.io/docs/more-information/terms-of-service',
    );
    expect(result.plainTextOrigin).toContain(
      'https://etransfer.gitbook.io/docs/more-information/privacy-policy',
    );
    expect(result.plainTextOrigin).toContain(
      'This request will not trigger a blockchain transaction or cost any gas fees.',
    );
    expect(result.plainTextOrigin).toContain(`Nonce:\n${mockTimestamp}`);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });

  it('should generate plainTextHex as a correct hexadecimal representation of plainTextOrigin', () => {
    // Mock the Date.now() method to control the output of the nonce
    const mockTimestamp = 1680000000000;
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result = getAuthPlainText();

    // Convert plainTextOrigin to hex manually to compare
    const expectedHex = Buffer.from(result.plainTextOrigin).toString('hex').replace('0x', '');
    expect(result.plainTextHex).toBe(expectedHex);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });

  it('should include the correct nonce (current timestamp) in the plainTextOrigin', () => {
    // Mock the Date.now() method to control the output of the nonce
    const mockTimestamp = 1680000000000;
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result = getAuthPlainText();

    // Verify that the nonce matches the mocked timestamp
    expect(result.plainTextOrigin).toContain(`Nonce:\n${mockTimestamp}`);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });

  it('should have a consistent plainTextHex length for the same input', () => {
    // Mock the Date.now() to generate a fixed timestamp
    const mockTimestamp = 1680000000000;
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    const result1 = getAuthPlainText();
    const result2 = getAuthPlainText();

    // Both should have the same hex length because the same input is generated
    expect(result1.plainTextHex.length).toBe(result2.plainTextHex.length);

    // Restore original Date.now() function
    vi.restoreAllMocks();
  });
});
