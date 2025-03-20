import { describe, it, expect } from 'vitest';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import {
  timesDecimals,
  divDecimals,
  divDecimalsStr,
  bigNumberToWeb3Input,
  valueToPercentage,
  zeroFill,
  getOmittedStr,
  LargeNumberDisplay,
  valueFixed2LessThanMin,
} from '../calculate';
import { DEFAULT_NULL_VALUE } from '../../constants/index';

describe('timesDecimals', () => {
  test('amount is undefined, and return ZERO', () => {
    const result = timesDecimals(undefined);
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is USDT, and return ZERO', () => {
    const result = timesDecimals('USDT');
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is 1.2345678 and decimals is 10000000000, and return 12345678000', () => {
    const result = timesDecimals('1.2345678', '10000000000').toFixed();
    expect(result).toBe('12345678000');
  });
  test('amount is 1.2345678 and decimals is 6, return 1234567.8', () => {
    const result = timesDecimals('1.2345678', 6).toFixed();
    expect(result).toBe('1234567.8');
  });
});

describe('divDecimals', () => {
  test('amount is undefined, and return ZERO', () => {
    const result = divDecimals(undefined);
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is USDT, and return ZERO', () => {
    const result = divDecimals('USDT');
    expect(result).toBeInstanceOf(BigNumber);
  });
  test('amount is 12345678 and decimals is 10000000000, and return 12345678000', () => {
    const result = divDecimals('12345678', '10000000000').toFixed();
    expect(result).toBe('0.0012345678');
  });
  test('amount is 12345678 and decimals is 6, and return 12.345678', () => {
    const result = divDecimals('12345678', 6).toFixed();
    expect(result).toBe('12.345678');
  });
});

describe('divDecimalsStr', () => {
  it('should return formatted number if effective', () => {
    const value = new BigNumber(1);
    const decimals = 2;

    const result = divDecimalsStr(value, decimals);

    expect(result).toBe('0.01');
  });

  it('should return default value if not effective', () => {
    const value = new BigNumber(0);
    const decimals = 2;

    const result = divDecimalsStr(value, decimals, 'DEFAULT');

    expect(result).toBe('DEFAULT');
  });

  it('should return default value if not effective', () => {
    const value = new BigNumber(0);

    const result = divDecimalsStr(value, undefined, 'DEFAULT');

    expect(result).toBe('DEFAULT');
  });
});

describe('bigNumberToWeb3Input', () => {
  it('should return a string of the number with no decimals', () => {
    const num = new BigNumber(123.456);
    const result = bigNumberToWeb3Input(num);

    expect(result).toBe('123');
  });

  it('should create a new BigNumber if input is not a BigNumber', () => {
    const result = bigNumberToWeb3Input(123.456 as any);
    expect(result).toBe('123');
  });
});

describe('valueToPercentage', () => {
  it('should return correct percentage when input is a BigNumber', () => {
    const num = new BigNumber(0.5);

    const result = valueToPercentage(num);

    expect(result).toEqual(new BigNumber(50));
  });

  it('should convert non-BigNumber input using timesDecimals', () => {
    const num = '0.5';

    const result = valueToPercentage(num);

    expect(result).toEqual(new BigNumber(50));
  });
});

describe('zeroFill', () => {
  it('should fill string with zeros up to 64 characters', () => {
    const result = zeroFill('test');

    expect(result).toHaveLength(64);
    expect(result).toMatch(/^0+test$/);
  });

  it('should convert BN input to hex string with leading zeros', () => {
    const bn = new BN(1);

    const result = zeroFill(bn);
    expect(result).toBe('0000000000000000000000000000000000000000000000000000000000000001');
  });
});

describe('valueFixed2LessThanMin', () => {
  it('should return default value if input is not provided', () => {
    expect(valueFixed2LessThanMin()).toBe(DEFAULT_NULL_VALUE);
  });

  it('should return default value if the input is NaN', () => {
    expect(valueFixed2LessThanMin('invalid')).toBe(DEFAULT_NULL_VALUE);
  });

  it('should format and return if value is above minimum', () => {
    const result = valueFixed2LessThanMin('1.2345', '$');
    expect(result).toBe('$1.23');
  });

  it('should return currency with minimum value if below minimum', () => {
    const result = valueFixed2LessThanMin('0.005', '$');
    expect(result).toBe('<$0.01');
  });

  it('should return minimum value with no currency properly', () => {
    const result = valueFixed2LessThanMin('0.005');
    expect(result).toBe('<$0.01');
  });
});

describe('LargeNumberDisplay', () => {
  it('should return default value if input is NaN', () => {
    expect(LargeNumberDisplay('invalid', 6)).toBe(DEFAULT_NULL_VALUE);
  });

  it('should handle negative numbers without decimals', () => {
    const result = LargeNumberDisplay('12345.6789');

    expect(result).toBe('12,345.6789');
  });

  it('should display number with fixed decimals', () => {
    const result = LargeNumberDisplay('12345.6789', 6);
    expect(result).toBe('12,345.6789');
  });

  it('should handle negative numbers', () => {
    const result = LargeNumberDisplay('-12345.6789', 6);
    expect(result).toBe('-12,345.6789');
  });
});

describe('getOmittedStr', () => {
  it('should return the original string if input is empty or not a string', () => {
    expect(getOmittedStr('', 2, 2)).toBe('');
    expect(getOmittedStr(null as any, 2, 2)).toBe(null);
  });

  it('should return original string if not longer than preLen + endLen', () => {
    const result = getOmittedStr('hello', 1, 1);
    expect(result).toBe('h...o');
  });

  it('should omit the string correctly', () => {
    const result = getOmittedStr('this is a test string', 4, 6);
    expect(result).toBe('this...string');
  });

  it('should handle cases where preLen or endLen is zero', () => {
    const result1 = getOmittedStr('this is a test string', 0, 6);
    const result2 = getOmittedStr('this is a test string', 4, 0);
    expect(result1).toBe('this is a test string');
    expect(result2).toBe('this is a test string');
  });

  it('should handle cases where preLen or endLen is not number', () => {
    const result1 = getOmittedStr('this is a test string', '0' as any, '6' as any);

    expect(result1).toBe('this is a test string');
  });

  it('should handle cases where string length is less than preLen + endLen', () => {
    const result1 = getOmittedStr('string', 10, 20);

    expect(result1).toBe('string');
  });
});
