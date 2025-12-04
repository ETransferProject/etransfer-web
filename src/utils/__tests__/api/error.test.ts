import { describe, it, expect, Mock } from 'vitest';
import axios from 'axios';
import { handleErrorMessage } from '@etransfer/utils';
import {
  formatApiError,
  handleWebLoginErrorMessage,
  isAuthTokenError,
  isHtmlError,
  isWriteOperationError,
} from '../../api/error';
import { CommonErrorNameType } from 'api/types';

// Mock `handleErrorMessage`
vi.mock('@etransfer/utils', () => ({
  handleErrorMessage: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    isCancel: vi.fn(),
  },
}));

describe('isHtmlError', () => {
  it('should return true for a 5xx error code and HTML error message', () => {
    // Case 1: 5xx code with "<!DOCTYPE HTML PUBLIC"
    expect(isHtmlError(500, '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">')).toBe(
      true,
    );

    // Case 2: 5xx code with "Bad Gateway" message
    expect(isHtmlError(502, 'Bad Gateway')).toBe(true);

    // Case 3: 5xx code (string) with "<!DOCTYPE HTML PUBLIC"
    expect(
      isHtmlError('503', '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">'),
    ).toBe(true);

    // Case 4: 5xx code (string) with "Bad Gateway"
    expect(isHtmlError('504', '502 Bad Gateway')).toBe(true);
  });

  it('should return false for non-5xx error codes, even with an HTML message', () => {
    expect(isHtmlError(404, '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">')).toBe(
      false,
    ); // Not a 5xx code
    expect(isHtmlError('403', 'Bad Gateway')).toBe(false); // Non-5xx code
  });

  it('should return false for non-HTML messages, even with a 5xx error code', () => {
    expect(isHtmlError(500, 'Internal Server Error')).toBe(false);
    expect(isHtmlError('503', 'Service Unavailable')).toBe(false);
  });

  it('should handle unexpected input gracefully', () => {
    // Case 1: Invalid code value
    expect(isHtmlError('invalid_code', 'Bad Gateway')).toBe(false);

    // Case 2: Empty message
    expect(isHtmlError(503, '')).toBe(false);

    // Case 3: Empty code and message
    expect(isHtmlError('', '')).toBe(false);
    expect(isHtmlError(null as unknown as number, null as unknown as string)).toBe(false);

    // Case 4: Undefined inputs
    expect(isHtmlError(undefined as unknown as number, undefined as unknown as string)).toBe(false);
  });
});

describe('isWriteOperationError', () => {
  const baseErrorTip = 'A write operation resulted in an error';
  it('should return true for a 5xx error code and valid error message', () => {
    // Valid 5xx error code and expected message
    expect(isWriteOperationError(500, `${baseErrorTip} while processing the request.`)).toBe(true);

    expect(isWriteOperationError(503, `${baseErrorTip}  at the server.`)).toBe(true);

    expect(isWriteOperationError('504', baseErrorTip)).toBe(true);
  });

  it('should return false for non-5xx error codes, even with a valid error message', () => {
    // Non-5xx error codes
    expect(isWriteOperationError(400, baseErrorTip)).toBe(false);

    expect(isWriteOperationError(404, baseErrorTip)).toBe(false);

    expect(isWriteOperationError('403', baseErrorTip)).toBe(false);
  });

  it('should return false for 5xx error codes with invalid or unrelated error messages', () => {
    // 5xx error codes but messages do not contain the required substring
    expect(isWriteOperationError(500, 'Internal Server Error.')).toBe(false);

    expect(
      isWriteOperationError(502, 'A read operation resulted in an error.'), // Not related to write operations
    ).toBe(false);

    expect(isWriteOperationError('503', 'Random unrelated error.')).toBe(false);
  });

  it('should handle unexpected or empty inputs gracefully', () => {
    // Invalid or unexpected inputs
    expect(isWriteOperationError(null as unknown as number, baseErrorTip)).toBe(false);

    // Empty string inputs
    expect(isWriteOperationError('', '')).toBe(false);
    expect(isWriteOperationError(500, '')).toBe(false);
    expect(isWriteOperationError('', baseErrorTip)).toBe(false);
  });
});

describe('isAuthTokenError', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should return true if the error message includes "401"', () => {
    // Mock `handleErrorMessage` to return a message containing "401"
    (handleErrorMessage as Mock).mockReturnValue('Error 401: Unauthorized access');

    const result = isAuthTokenError(new Error('Some error'));

    // Assert
    expect(result).toBe(true);
    expect(handleErrorMessage).toHaveBeenCalledWith(new Error('Some error'));
  });

  it('should return false if the error message does not include "401"', () => {
    // Mock `handleErrorMessage` to return a message NOT containing "401"
    (handleErrorMessage as Mock).mockReturnValue('Error 404: Not Found');

    const result = isAuthTokenError(new Error('Some error'));

    // Assert
    expect(result).toBe(false);
    expect(handleErrorMessage).toHaveBeenCalledWith(new Error('Some error'));
  });

  it('should handle unexpected inputs and return false', () => {
    // Mock `handleErrorMessage` to handle invalid inputs
    (handleErrorMessage as Mock).mockReturnValue('');

    expect(isAuthTokenError(null)).toBe(false);
    expect(isAuthTokenError(undefined)).toBe(false);
    expect(isAuthTokenError({})).toBe(false);

    // Verify that `handleErrorMessage` is still called
    expect(handleErrorMessage).toHaveBeenCalledTimes(3);
  });
});

describe('formatApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear all mocks before each test
  });

  it('should return a formatted error message and preserve `error.code`', () => {
    // Mock `handleErrorMessage` to return a specific message
    (handleErrorMessage as Mock).mockReturnValue('Formatted error message');

    const mockError = { code: '1234' };
    const result = formatApiError(mockError, 'Default Message');

    // Assert returned error attributes
    expect(handleErrorMessage).toHaveBeenCalledWith(mockError, 'Default Message');
    expect(result.message).toBe('Formatted error message'); // Message embedded using `handleErrorMessage`
    expect(result.code).toBe('1234'); // Preserves error code
    expect(result.name).toBe('Error'); // Default `Error` name
  });

  it('should set error name to "Cancel" if `isSetCancelName` is true and axios.isCancel returns true', () => {
    // Mock `handleErrorMessage`
    (handleErrorMessage as Mock).mockReturnValue('Error message for cancel');
    // Mock `axios.isCancel` to return true
    (axios.isCancel as Mock).mockReturnValue(true);

    const mockError = { code: '5678' };
    const result = formatApiError(mockError, 'Default Message', true);

    // Assert returned error attributes
    expect(handleErrorMessage).toHaveBeenCalledWith(mockError, 'Default Message');
    expect(axios.isCancel).toHaveBeenCalledWith(mockError); // Verify axios.isCancel is called
    expect(result.name).toBe(CommonErrorNameType.CANCEL); // `name` should be "Cancel"
    expect(result.message).toBe('Error message for cancel'); // Matches mocked `handleErrorMessage` value
    expect(result.code).toBe('5678');
  });

  it('should not set error name to "Cancel" if `isSetCancelName` is true but axios.isCancel returns false', () => {
    // Mock `handleErrorMessage`
    (handleErrorMessage as Mock).mockReturnValue('Regular error message');
    // Mock `axios.isCancel` to return false
    (axios.isCancel as Mock).mockReturnValue(false);

    const mockError = { code: '9001' };
    const result = formatApiError(mockError, 'Default Message', true);

    // Assert returned error attributes
    expect(handleErrorMessage).toHaveBeenCalledWith(mockError, 'Default Message');
    expect(axios.isCancel).toHaveBeenCalledWith(mockError); // Verify axios.isCancel is called
    expect(result.name).toBe('Error'); // `name` remains "Error"
    expect(result.message).toBe('Regular error message'); // Matches mocked `handleErrorMessage` value
    expect(result.code).toBe('9001');
  });

  it('should handle missing error code gracefully', () => {
    // Mock `handleErrorMessage`
    (handleErrorMessage as Mock).mockReturnValue('Error with no code');

    const mockError = { someProp: 'someVal' };
    const result = formatApiError(mockError, 'Default Message');

    // Assert returned error attributes
    expect(handleErrorMessage).toHaveBeenCalledWith(mockError, 'Default Message');
    expect(result.message).toBe('Error with no code');
    expect(result.code).toBeUndefined(); // No `code` in mock error
  });

  it('should handle undefined error gracefully', () => {
    // Mock `handleErrorMessage`
    (handleErrorMessage as Mock).mockReturnValue('Default Error');

    const result = formatApiError(undefined, 'Default Message');

    // Assert returned error attributes
    expect(handleErrorMessage).toHaveBeenCalledWith(undefined, 'Default Message');
    expect(result.message).toBe('Default Error'); // HandleErrorMessage output
    expect(result.code).toBeUndefined(); // code should be undefined for undefined error
  });
});

describe('handleWebLoginErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
  });

  it('should process `nativeError` when it exists and has a `message`', () => {
    // Mock `handleErrorMessage` to return a specific message
    (handleErrorMessage as Mock).mockReturnValue('Processed native error');

    const mockNativeError = {
      nativeError: {
        message: 'Native error occurred',
      },
    };

    const result = handleWebLoginErrorMessage(mockNativeError, 'Custom error text');

    // Assert
    expect(handleErrorMessage).toHaveBeenCalledWith(
      mockNativeError.nativeError,
      'Custom error text',
    );
    expect(result).toEqual('Processed native error');
  });

  it('should process non-native errors normally', () => {
    // Mock `handleErrorMessage`
    (handleErrorMessage as Mock).mockReturnValue('Processed regular error');

    const mockError = {
      message: 'Regular error occurred',
    };

    const result = handleWebLoginErrorMessage(mockError, 'Custom error text');

    // Assert
    expect(handleErrorMessage).toHaveBeenCalledWith(mockError, 'Custom error text');
    expect(result).toEqual('Processed regular error');
  });

  it('should handle undefined or empty error gracefully', () => {
    // Mock `handleErrorMessage`
    (handleErrorMessage as Mock).mockReturnValue('No error provided');

    const result2 = handleWebLoginErrorMessage({}, 'Default error text');

    // Assert `handleErrorMessage` was called correctly
    expect(handleErrorMessage).toHaveBeenNthCalledWith(1, {}, 'Default error text');

    // Assert returned values
    expect(result2).toEqual('No error provided');
  });

  it('should not crash if `nativeError` exists but lacks a `message`', () => {
    // Mock `handleErrorMessage`
    (handleErrorMessage as Mock).mockReturnValue('Error processed with missing native message');

    const mockError = {
      nativeError: {},
    };

    const result = handleWebLoginErrorMessage(mockError, 'Error text fallback');

    // Assert `handleErrorMessage` was called with the outer error
    expect(handleErrorMessage).toHaveBeenCalledWith(mockError, 'Error text fallback');
    expect(result).toEqual('Error processed with missing native message');
  });
});
