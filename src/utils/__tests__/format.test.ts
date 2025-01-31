import { describe, it, expect, vi, Mock } from 'vitest';
import {
  AmountSign,
  formatListWithAnd,
  formatNetworkKey,
  formatNetworkName,
  formatStr2Ellipsis,
  formatSymbolDisplay,
  formatWithCommas,
  parseWithCommas,
  parseWithStringCommas,
  replaceCharacter,
  stringToHex,
} from '../format';
import { BlockchainNetworkType } from 'constants/network';
import { ChainNamePrefix } from 'constants/index';
import { divDecimals } from '../calculate';

// Mock the `divDecimals` function (since it's external)
vi.mock('../calculate', () => ({
  divDecimals: vi.fn(),
}));

/**
 * Test `formatStr2Ellipsis`
 */
describe('formatStr2Ellipsis', () => {
  it('should format string with ellipsis in the middle', () => {
    const result = formatStr2Ellipsis('12345678901234567890', [4, 4]);

    expect(result).toBe('1234...7890');
  });

  it('should format string with ellipsis at the tail', () => {
    const result = formatStr2Ellipsis('1234567890', [4, 4], 'tail');

    expect(result).toBe('1234...');
  });

  it('should return the input string if it is short enough', () => {
    const result = formatStr2Ellipsis('12345', [4, 4]);

    expect(result).toBe('12345');
  });

  it('should return an empty string for falsy input', () => {
    const result = formatStr2Ellipsis('');

    expect(result).toBe('');
  });
});

/**
 * Test `formatWithCommas`
 */
describe('formatWithCommas', () => {
  it('should format the amount with commas and decimal places', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('123,456.78'),
        }),
      };
    });

    const result = formatWithCommas({
      amount: '12345678.1234',
      decimals: 2,
      digits: 2,
      sign: AmountSign.PLUS,
    });

    expect(result).toBe('+123,456.78.1234');
  });

  it('should handle zero amounts with the EMPTY sign', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('0'),
        }),
      };
    });

    const result = formatWithCommas({ amount: 0, sign: AmountSign.EMPTY });

    expect(result).toBe('0');
  });

  it('should properly format negative amounts', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('-12,345'),
        }),
      };
    });

    const result = formatWithCommas({ amount: '-12345.6', digits: 1, sign: AmountSign.MINUS });

    expect(result).toBe('--12,345.6');
  });

  it('should handle non-decimal amounts', () => {
    (divDecimals as Mock).mockImplementation(() => {
      return {
        decimalPlaces: () => ({
          toFormat: vi.fn().mockReturnValue('123,456'),
        }),
      };
    });

    const result = formatWithCommas({ amount: 123456, decimals: 0 });

    expect(result).toBe('123,456');
  });
});

/**
 * Test `parseWithCommas`
 */
describe('parseWithCommas', () => {
  it('should parse a comma-separated value into plain numbers', () => {
    const result = parseWithCommas('12,345,678.90');

    expect(result).toBe('12345678.9');
  });

  it('should return an empty string when input is null or undefined', () => {
    expect(parseWithCommas(null)).toBe('');

    expect(parseWithCommas(undefined)).toBe('');
  });
});

/**
 * Test `parseWithStringCommas`
 */
describe('parseWithStringCommas', () => {
  it('should remove commas from a string', () => {
    const result = parseWithStringCommas('12,345,678.90');

    expect(result).toBe('12345678.90');
  });

  it('should return an empty string for empty input', () => {
    expect(parseWithStringCommas(null)).toBe('');

    expect(parseWithStringCommas('')).toBe('');
  });
});

/**
 * Test `replaceCharacter`
 */
describe('replaceCharacter', () => {
  it('should replace matched characters', () => {
    const result = replaceCharacter('abc-def', '-', '+');

    expect(result).toBe('abc+def');
  });

  it('should handle strings without matching characters', () => {
    const result = replaceCharacter('abcdef', '-', '+');

    expect(result).toBe('abcdef');
  });
});

/**
 * Test `formatSymbolDisplay`
 */
describe('formatSymbolDisplay', () => {
  it('should replace "-1" for "SGR-1"', () => {
    const result = formatSymbolDisplay('SGR-1');

    expect(result).toBe('SGR');
  });

  it('should return the input string if it does not contain "-1"', () => {
    const result = formatSymbolDisplay('ABC');

    expect(result).toBe('ABC');
  });

  it('should return an empty string for falsy input', () => {
    expect(formatSymbolDisplay('')).toBe('');
  });
});

/**
 * Test `formatNetworkName`
 */
describe('formatNetworkName', () => {
  it('should return the main chain name for AELF', () => {
    const result = formatNetworkName(BlockchainNetworkType.AELF);

    expect(result).toBe(ChainNamePrefix.MainChain);
  });

  it('should return the side chain name for tDVV or tDVW', () => {
    expect(formatNetworkName(BlockchainNetworkType.tDVV)).toBe(ChainNamePrefix.SideChain);
    expect(formatNetworkName(BlockchainNetworkType.tDVW)).toBe(ChainNamePrefix.SideChain);
  });

  it('should return the original string for unrecognized input', () => {
    const result = formatNetworkName('UNKNOWN');

    expect(result).toBe('UNKNOWN');
  });
});

/**
 * Test `formatNetworkKey`
 */
describe('formatNetworkKey', () => {
  it('should map side chain network types to AELF', () => {
    expect(formatNetworkKey(BlockchainNetworkType.tDVV)).toBe(BlockchainNetworkType.AELF);
    expect(formatNetworkKey(BlockchainNetworkType.tDVW)).toBe(BlockchainNetworkType.AELF);
  });

  it('should return the original value for other input', () => {
    expect(formatNetworkKey('OTHER')).toBe('OTHER');
  });

  it('should return an empty string for falsy inputs', () => {
    expect(formatNetworkKey()).toBe('');
  });
});

/**
 * Test `stringToHex`
 */
describe('stringToHex', () => {
  it('should convert a string to a hexadecimal representation', () => {
    const result = stringToHex('hello');

    expect(result).toBe('68656c6c6f'); // "hello" in hex
  });

  it('should return an empty string for empty input', () => {
    expect(stringToHex('')).toBe('');
  });
});

/**
 * Test `formatListWithAnd`
 */
describe('formatListWithAnd', () => {
  it('should format a list with commas and "and"', () => {
    const result = formatListWithAnd(['Alice', 'Bob', 'Charlie']);

    expect(result).toBe('Alice, Bob and Charlie');
  });

  it('should format a list with one item correctly', () => {
    const result = formatListWithAnd(['Alice']);

    expect(result).toBe('Alice');
  });

  it('should return an empty string for an empty list', () => {
    expect(formatListWithAnd([])).toBe('');
  });
});
