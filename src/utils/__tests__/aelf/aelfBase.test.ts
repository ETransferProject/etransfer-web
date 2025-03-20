import { AllSupportedELFChainId } from 'constants/chain';
import { SupportedELFChainId } from 'constants/index';
import {
  formatDIDAddress,
  getAElf,
  getELFAddress,
  getNodeByChainId,
  getRawTx,
  isDIDAddress,
  isDIDAddressSuffix,
  isELFAddress,
  isELFChain,
  isElfChainSymbol,
  pubKeyToAddress,
  recoverPubKey,
  removeAddressSuffix,
  removeELFAddressSuffix,
  transformArrayToMap,
} from 'utils/aelf/aelfBase';
import { isSymbol, isValidBase58 } from 'utils/reg';
import { beforeEach, describe, it, expect, Mock } from 'vitest';

// Mock `isSymbol`
vi.mock('utils/reg', () => ({
  isSymbol: vi.fn(),
  isValidBase58: vi.fn(),
}));

const plainText = '4e6f6e63653a31373136333538353032393233';
// const plainTextHex256 = '74141569cd552d88aeda74e521ea33034398159c82d7c8f0fafc5e978e70ba83';
const signature =
  '05d641d117822f42f25278d8893f3a1ba9a36c32590080f84fe1d1095712819d223c3b3fa0c1de8f62b9b6ac89992c7e2f09678ad01eef1e97b0f21d6c6bd49c01';
const pubkey =
  '04671bfc20edb4cdc171bd7d20877aa64862e88dc9f52173673db9789e0dea71aca45472fd4841cad362cae8b5b6f05c55a350014f7917fe90870fd680c845edae';
const managerAddress = '7iC6EQtt4rKsqv9vFiwpUDvZVipSoKwvPLy7pRG189qJjyVT7';
const correctAelfAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF';
const evmAddress = '0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679';

describe('getNodeByChainId', () => {
  it('should return correct AELF chain node', () => {
    const result = getNodeByChainId(AllSupportedELFChainId.AELF);

    expect(result).toEqual({
      chainId: 'AELF',
      exploreUrl: 'https://testnet.aelfscan.io/AELF/',
      exploreDomain: 'https://testnet.aelfscan.io/',
      rpcUrl: 'https://aelf-test-node.aelf.io',
    });
  });

  it('should return undefined if input is not aelf chain', () => {
    const result = getNodeByChainId('ETH' as any);

    expect(result).toBeUndefined();
  });
});

describe('getAElf', () => {
  it('should return correct AELF chain node', () => {
    const result = getAElf(AllSupportedELFChainId.AELF);

    expect(result).toHaveProperty('chain');
  });
});

describe('recoverPubKey', () => {
  it('recover pubkey by signature', () => {
    const result = recoverPubKey(plainText, signature) + '';

    expect(result).toBe(pubkey);
  });
});

describe('pubKeyToAddress', () => {
  it('recover manager address by pubkey', () => {
    const result = pubKeyToAddress(pubkey);

    // Assertions
    expect(result).toBe(managerAddress);
  });
});

describe('getRawTx', () => {
  it('Input blockHashInput is not start with 0x.', () => {
    const result = getRawTx({
      blockHeightInput: '120594862',
      blockHashInput: 'b093de3b6a52fefb691228922b18f9c300fd2ed7f3838d10f6c5024c289bc7a5',
      packedInput:
        '0a220a20ba5f748422c4d882b664077f7bbdacbf5b2ce18da880cd4e6946a2eb2267dffd12220a2099ad42e68447aa3cab9b31e85531d09d5cdf5d5b8bb60e6b30941d78d32d09b91a0d5472616e73666572546f6b656e220a0a03454c4610c0e2b069',
      address: 'V922RLhmJsmGHCW6zPDR7czgNYfihnAe175somxFdqXKKjweP',
      contractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      functionName: 'ManagerForwardCall',
    });
    expect(result).toBeTruthy();
  });

  it('Input blockHashInput is start with 0x.', () => {
    const result = getRawTx({
      blockHeightInput: '120594862',
      blockHashInput: '0xb093de3b6a52fefb691228922b18f9c300fd2ed7f3838d10f6c5024c289bc7a5',
      packedInput:
        '0a220a20ba5f748422c4d882b664077f7bbdacbf5b2ce18da880cd4e6946a2eb2267dffd12220a2099ad42e68447aa3cab9b31e85531d09d5cdf5d5b8bb60e6b30941d78d32d09b91a0d5472616e73666572546f6b656e220a0a03454c4610c0e2b069',
      address: 'V922RLhmJsmGHCW6zPDR7czgNYfihnAe175somxFdqXKKjweP',
      contractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      functionName: 'ManagerForwardCall',
    });
    expect(result).toBeTruthy();
  });
});

describe('transformArrayToMap', () => {
  it('should return an empty string when origin is null or empty', () => {
    expect(transformArrayToMap(null, null as any)).toBe('');
    expect(transformArrayToMap({}, [])).toBe('');

    expect(transformArrayToMap(undefined, ['address123'])).toEqual(['address123']);
    expect(transformArrayToMap({}, ['address123'])).toEqual(['address123']);
  });

  it('should return origin if it is not an array', () => {
    const input = { key: 'value' } as any;

    expect(transformArrayToMap(null, input)).toBe(input);
  });

  it('should return the first element of origin if inputType is an Address or Hash', () => {
    const inputTypeAddress = { name: 'Address', fieldsArray: [{ type: 'bytes' }] };

    expect(transformArrayToMap(inputTypeAddress, ['address123'])).toBe('address123');

    const inputTypeHash = { name: 'Hash', fieldsArray: [{ type: 'bytes' }] };

    expect(transformArrayToMap(inputTypeHash, ['hash123'])).toBe('hash123');
  });

  it('should return false if inputType.fieldsArray length===2', () => {
    const inputTypeAddress = {
      name: 'Address',
      fieldsArray: [{ type: 'bytes' }, { type: 'string' }],
    };

    expect(transformArrayToMap(inputTypeAddress, ['address123'])).toEqual({
      '0': 'address123',
      undefined: undefined,
    });
  });

  it('should return origin if inputType.fieldsArray is empty', () => {
    const inputType = { name: 'CustomType', fieldsArray: [] };
    const origin = ['value1', 'value2'];

    expect(transformArrayToMap(inputType, origin)).toEqual(origin);
  });

  it('should return a map with one key-value pair if inputType.fieldsArray has one field', () => {
    const inputType = { fieldsArray: [{ name: 'key1', type: 'string' }] };
    const origin = ['value1'];

    expect(transformArrayToMap(inputType, origin)).toEqual({ key1: 'value1' });
  });

  it('should map origin to a map when fieldsArray has multiple fields', () => {
    const inputType = {
      fieldsArray: [
        { name: 'key1', type: 'string' },
        { name: 'key2', type: 'int' },
      ],
    };
    const origin = ['value1', 42];

    expect(transformArrayToMap(inputType, origin)).toEqual({
      '0': 'value1',
      '1': 42,
      key1: 'value1',
      key2: 42,
    });
  });

  it('should handle missing keys gracefully when fieldsArray is larger than origin', () => {
    const inputType = {
      fieldsArray: [
        { name: 'key1', type: 'string' },
        { name: 'key2', type: 'int' },
      ],
    };
    const origin = ['value1'];

    expect(transformArrayToMap(inputType, origin)).toEqual({
      '0': 'value1',
      key1: 'value1',
      key2: undefined,
    });
  });
});

describe('isElfChainSymbol', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should return the symbol when it meets length conditions and passes `isSymbol`', () => {
    // Mock `isSymbol` to return true
    (isSymbol as Mock).mockReturnValue(true);

    const validSymbol = 'ELF';
    const result = isElfChainSymbol(validSymbol);

    // Assertions
    expect(result).toBe(validSymbol);
    expect(isSymbol).toHaveBeenCalledWith(validSymbol); // Ensure `isSymbol` was called
  });

  it('should return false if the symbol fails the `isSymbol` test', () => {
    // Mock `isSymbol` to return false
    (isSymbol as Mock).mockReturnValue(false);

    const invalidSymbol = 'INVALID';
    const result = isElfChainSymbol(invalidSymbol);

    // Assertions
    expect(result).toBe(false);
    expect(isSymbol).toHaveBeenCalledWith(invalidSymbol); // Ensure `isSymbol` was called
  });

  it('should return false for symbols shorter than 2 characters', () => {
    // Mock `isSymbol` to return true
    (isSymbol as Mock).mockReturnValue(true);

    const shortSymbol = 'E'; // Too short
    const result = isElfChainSymbol(shortSymbol);

    // Assertions
    expect(result).toBe(false);
    expect(isSymbol).not.toHaveBeenCalled(); // Ensure `isSymbol` is not called
  });

  it('should return false for symbols longer than 10 characters', () => {
    // Mock `isSymbol` to return true
    (isSymbol as Mock).mockReturnValue(true);

    const longSymbol = 'TOOLONGSYMBOL'; // Too long
    const result = isElfChainSymbol(longSymbol);

    // Assertions
    expect(result).toBe(false);
    expect(isSymbol).not.toHaveBeenCalled(); // Ensure `isSymbol` is not called
  });

  it('should return false for invalid inputs (null, undefined, or empty string)', () => {
    // Ensure `isSymbol` is never called in these cases
    expect(isElfChainSymbol(null)).toBe(false);
    expect(isElfChainSymbol(undefined)).toBe(false);
    expect(isElfChainSymbol('')).toBe(false);
    expect(isSymbol).not.toHaveBeenCalled(); // `isSymbol` should not be called
  });
});

describe('isELFAddress', () => {
  it('should return false for addresses containing Chinese characters', () => {
    expect(isELFAddress('invalid漢')).toBe(false);
  });

  it('should return true for valid ELF addresses', () => {
    expect(isELFAddress(correctAelfAddress)).toBe(true);
  });

  it('should return false for invalid ELF addresses', () => {
    expect(isELFAddress('invalidELFAddress')).toBe(false);
  });
});

describe('isELFChain', () => {
  it('should return true for valid ELF chain IDs', () => {
    expect(isELFChain('AELF' as SupportedELFChainId)).toBe(true);
    expect(isELFChain('tDVW' as SupportedELFChainId)).toBe(true);
  });

  it('should return false for invalid chain IDs', () => {
    // Not a valid chainId in SupportedELFChainId
    expect(isELFChain('unknown' as any)).toBe(false);
    // Empty string
    expect(isELFChain('' as any)).toBe(false);
  });

  it('should return false for non-string chain IDs', () => {
    expect(isELFChain(undefined)).toBe(false); // undefined input
  });
});

describe('getELFAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('should return the ELF address when valid', () => {
    const result = getELFAddress(correctAelfAddress);

    // Assertions
    expect(result).toBe('Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft');
  });

  it('should return undefined if it it not aelf address', () => {
    const input = 'part1_InvalidAddress_part2';
    const result = getELFAddress(input);

    // Assertions
    expect(result).toBeUndefined();
  });

  it('should return undefined for improperly formatted address', () => {
    // Input with fewer than 3 parts
    expect(getELFAddress('part1_part2')).toBeUndefined();
    expect(getELFAddress('part1')).toBeUndefined();

    // Input with more than 3 parts
    expect(getELFAddress('extra_part1_ELFAddress_part2_part3')).toBeUndefined();
  });

  it('should return undefined when input is null, undefined, or empty', () => {
    expect(getELFAddress(null as unknown as string)).toBeUndefined();
    expect(getELFAddress(undefined)).toBeUndefined();
    expect(getELFAddress('')).toBeUndefined();
  });
});

describe('isDIDAddress', () => {
  test('Input DID address, and return true.', () => {
    (isValidBase58 as Mock).mockReturnValue(true);

    const result = isDIDAddress(correctAelfAddress);

    // Assertions
    expect(result).toBeTruthy();
  });

  test('Input not DID address, and return false.', () => {
    (isValidBase58 as Mock).mockReturnValue(true);

    const result = isDIDAddress('Py2TJpjTtt29z');

    // Assertions
    expect(result).toBeFalsy();
  });

  test('Input not DID address with _, and return false.', () => {
    const result = isDIDAddress('ELF_Py2TJpjTtt29z');

    // Assertions
    expect(result).toBeFalsy();
  });

  test('Input undefined, and return false.', () => {
    const result = isDIDAddress();

    // Assertions
    expect(result).toBeFalsy();
  });
});

describe('isDIDAddressSuffix', () => {
  test('Input DID address, and return true.', () => {
    const result = isDIDAddressSuffix(correctAelfAddress);

    // Assertions
    expect(result).toBeTruthy();
  });

  test('Input undefined, and return false.', () => {
    const result = isDIDAddressSuffix();

    // Assertions
    expect(result).toBeFalsy();
  });

  test('Input evm address, and return false.', () => {
    const result = isDIDAddressSuffix(evmAddress);

    // Assertions
    expect(result).toBeFalsy();
  });
});

describe('removeAddressSuffix', () => {
  test('Input DID address, and return address without prefix and suffix.', () => {
    const result = removeAddressSuffix(correctAelfAddress);

    // Assertions
    expect(result).toBe('Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft');
  });
  test('Input not DID address, and return address without prefix and suffix.', () => {
    const result = removeAddressSuffix('ab_Py2TJpjTtt29zA_cd');

    // Assertions
    expect(result).toBe('Py2TJpjTtt29zA');
  });
  test('Input not DID address, and return entered address.', () => {
    const result = removeAddressSuffix('ab_Py2TJpjTtt29zA');

    // Assertions
    expect(result).toBe('ab_Py2TJpjTtt29zA');
  });
});

describe('removeELFAddressSuffix', () => {
  test('Input DID address, and return address without prefix and suffix.', () => {
    const result = removeELFAddressSuffix(correctAelfAddress);

    // Assertions
    expect(result).toBe('Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft');
  });

  test('Input not DID address, and return entered address.', () => {
    const result = removeELFAddressSuffix('4hy6evPF8Cvft_AELF');

    // Assertions
    expect(result).toBe('4hy6evPF8Cvft_AELF');
  });
});

describe('formatDIDAddress', () => {
  const chainId = 'AELF';
  test('should format DID address for aelf chain type', () => {
    const address = 'addressPart';
    const formattedAddress = formatDIDAddress(address, chainId, 'aelf');

    // Assertions
    expect(formattedAddress).toBe(`ELF_${address}_${chainId}`);
  });

  test('should return original address if chain type is not aelf', () => {
    const address = 'exampleAddress';
    const result = formatDIDAddress(address, chainId, 'ethereum');

    // Assertions
    expect(result).toBe(address);
  });

  test('should return original address if it contains "_" and is less than 3 parts', () => {
    const result = formatDIDAddress('ELF_part1_part2', chainId, 'aelf');

    // Assertions
    expect(result).toBe('ELF_part1_AELF');
  });

  test('should return original address if address does not contain "_"', () => {
    const address = 'ELF_address';
    const formattedAddress = formatDIDAddress(address, chainId, 'aelf');

    // Assertions
    expect(formattedAddress).toBe(address);
  });

  test('should return original address if no chainId and chainType', () => {
    const address = 'ELF_address';
    const formattedAddress = formatDIDAddress(address);

    // Assertions
    expect(formattedAddress).toBe(address);
  });
});
