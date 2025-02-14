import AElf from 'aelf-sdk';
import { describe, it, expect, Mock } from 'vitest';
import { SupportedELFChainId } from 'constants/index';
import {
  encodedTransfer,
  getFileDescriptorsSet,
  getServicesFromFileDescriptors,
} from 'utils/aelf/aelfBase';

// Mock AElf class
vi.mock('aelf-sdk');

const correctAelfAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF';

describe('encodedTransfer', () => {
  const AELF_TESTNET_CA_CONTRACT = '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb';

  it('1', async () => {
    // Mock AElf utils
    AElf.mockImplementation((provider: any) => {
      provider.send = vi.fn();
      return {
        chain: {
          getContractFileDescriptorSet: vi.fn().mockImplementation(() => {
            return {
              file: [
                { service: [{ name: 'service1' }], package: { service1: '' } },
                { service: [{ name: 'service2' }], package: { service1: '' } },
                { service: [{ name: 'service3' }], package: { service1: '' } },
              ],
            };
          }),
        },
      };
    });

    const mockLookupServiceReturn = {
      methods: {
        Transfer: {
          resolve: vi.fn().mockImplementation(() => {
            return {
              resolvedRequestType: {
                fromObject: vi.fn().mockReturnValue('mockFromObject'),
                encode: vi.fn().mockImplementation(() => {
                  return {
                    finish: vi.fn().mockReturnValue('mockEncodeValue'),
                  };
                }),
              },
            };
          }),
        },
      },
    };
    (AElf.pbjs.Root.fromDescriptor as Mock).mockImplementation(() => {
      return {
        resolveAll: vi.fn().mockReturnValue({
          lookupService: vi.fn().mockReturnValue(mockLookupServiceReturn),
        }),
      };
    });

    (AElf.utils.transform.transformMapToArray as Mock).mockReturnValue({
      name: 'mockTransformMapToArray',
    });
    (AElf.utils.transform.transform as Mock).mockImplementation(() => {
      return '';
    });

    const result = await encodedTransfer({
      contractAddress: AELF_TESTNET_CA_CONTRACT,
      params: { symbol: 'ELF', to: correctAelfAddress, amount: '10', memo: '' },
      methodName: 'Transfer',
      chainId: 'AELF' as SupportedELFChainId,
    });

    expect(result).toBe('mockEncodeValue');
  });
});

describe('getFileDescriptorsSet', () => {
  const AELF_TESTNET_CA_CONTRACT = '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb';

  it('1', async () => {
    // Mock AElf utils
    AElf.mockImplementation((provider: any) => {
      provider.send = vi.fn();
      return {
        chain: {
          getContractFileDescriptorSet: vi.fn().mockImplementation(() => {
            return { file: [{ service: ['1', '2'] }] };
          }),
        },
      };
    });

    (AElf.pbjs.Root.fromDescriptor as Mock).mockImplementation(() => {
      return {
        resolveAll: vi.fn().mockReturnValue({
          lookupService: vi.fn().mockReturnValue('1234'),
        }),
      };
    });

    const result = await getFileDescriptorsSet({
      contractAddress: AELF_TESTNET_CA_CONTRACT,
      chainId: 'AELF' as SupportedELFChainId,
    });

    expect(result).toEqual(['1234', '1234', '1234']);
  });
});

describe('getServicesFromFileDescriptors', () => {
  it('should return correct value if input has not package date', async () => {
    // Mock AElf utils
    (AElf.pbjs.Root.fromDescriptor as Mock).mockImplementation(() => {
      return {
        resolveAll: vi.fn().mockReturnValue({
          lookupService: vi.fn().mockReturnValue('1234'),
        }),
      };
    });

    const result = await getServicesFromFileDescriptors({ file: [{ service: ['1', '2'] }] });

    expect(result).toEqual(['1234']);
  });

  it('should return correct value if input has package date', async () => {
    // Mock AElf utils
    (AElf.pbjs.Root.fromDescriptor as Mock).mockImplementation(() => {
      return {
        resolveAll: vi.fn().mockReturnValue({
          lookupService: vi.fn().mockReturnValue('service1'),
        }),
      };
    });

    const result = await getServicesFromFileDescriptors({
      file: [{ service: [{ name: 'service1' }], package: { service1: '' } }],
    });

    expect(result).toEqual(['service1']);
  });
});

// export type GetFileDescriptorsSet = {
//   contractAddress: string;
//   chainId: SupportedELFChainId;
// };

// export const getFileDescriptorsSet = async ({
//   contractAddress,
//   chainId,
// }: GetFileDescriptorsSet) => {
//   const aelf = getAElf(chainId as unknown as AllSupportedELFChainId);
//   const fds = await aelf.chain.getContractFileDescriptorSet(contractAddress);
//   return getServicesFromFileDescriptors(fds);
// };
