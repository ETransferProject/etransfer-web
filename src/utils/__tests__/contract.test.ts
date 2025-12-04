import AElf from 'aelf-sdk';
// import { getAElf } from 'utils/aelf/aelfBase';
import { getContractMethods, handleManagerForwardCall } from '@portkey/contracts';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import {
  checkIsEnoughAllowance,
  checkTokenAllowanceAndApprove,
  createManagerForwardCall,
  createTokenTransfer,
  createTransferTokenTransaction,
  getBalance,
  getTxResult,
  handleContractErrorMessage,
  handleTransaction,
  TXError,
} from 'utils/contract';
import { describe, it, test, expect, vi, Mock } from 'vitest';
import { SupportedELFChainId } from 'constants/index';
import { getAElf, getRawTx } from 'utils/aelf/aelfBase';
import {
  getAllowance,
  getBalance as getBalanceOrigin,
  getTokenContract,
  getTokenInfo,
} from '@etransfer/utils';

vi.mock('aelf-sdk');
vi.mock('@etransfer/utils');
vi.mock('@portkey/utils');
vi.mock('@portkey/contracts');
vi.mock('utils/aelf/aelfBase', async (importOriginal) => {
  const originalModule: any = await importOriginal();
  const mockTransactionId = 'mockTransactionId';
  const mockTxResult = { transactionId: mockTransactionId } as never;

  return {
    __esModule: true,
    ...originalModule,
    getTxResult: vi.fn().mockResolvedValueOnce(mockTxResult as never),
    getRawTx: vi.fn(),
    getAElf: vi.fn().mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return vi.fn();
          }),
        },
      };
    }),
    getNodeByChainId: vi.fn().mockReturnValue('https://aelf-public-node.aelf.io'),
  };
});

const aelfAddress = 'ELF_Py2TJpjTtt29zAtqLWyLEU1DEzBFPz1LJU594hy6evPF8Cvft_AELF';
const mainChainId = 'AELF' as SupportedELFChainId;
const mockSymbol = 'ELF';
const mockOwner = 'mockOwnerAddress';
const mockSpender = 'mockSpenderAddress';
const mockMemo = 'Test memo';

describe('createManagerForwardCall', () => {
  const caContractAddress = 'caContractAddress';
  const contractAddress = 'contractAddress';
  const args = { key: 'value' };
  const methodName = 'mockMethod';
  const caHash = 'caHash';
  const chainId = mainChainId;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a manager forward call and return encoded message', async () => {
    const mockResponse = {
      args: new Uint8Array([1, 2, 3]),
    } as never;

    // Mock handleManagerForwardCall method
    (handleManagerForwardCall as Mock).mockResolvedValue(mockResponse);

    // Mock AElf utils
    (AElf.utils.uint8ArrayToHex as Mock).mockReturnValue('01 02 03');

    // Mock getContractMethods method
    (getContractMethods as Mock).mockResolvedValue({
      ManagerForwardCall: {
        fromObject: vi.fn().mockReturnValue({}),
        encode: vi.fn().mockReturnValue({
          finish: vi.fn().mockReturnValue('encoded_result'),
        }),
      },
    } as never);

    const result = await createManagerForwardCall({
      caContractAddress,
      contractAddress,
      // endPoint,
      args,
      methodName,
      caHash,
      chainId,
    });

    expect(result).toBe('encoded_result'); // Ensure the return value is correct
  });
});

describe('createTokenTransfer', () => {
  const contractAddress = 'contractAddress';
  const args = { key: 'value' };
  const chainId = mainChainId;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create transfer token and return encoded message', async () => {
    // Mock AElf utils
    (AElf.utils.uint8ArrayToHex as Mock).mockReturnValue('01 02 03');
    (AElf.utils.transform.transformMapToArray as Mock).mockReturnValue(['01', '02', '03']);
    (AElf.utils.transform.transform as Mock).mockReturnValue({});

    // Mock getContractMethods method
    (getContractMethods as Mock).mockResolvedValue({
      TransferToken: {
        fromObject: vi.fn().mockReturnValue({}),
        encode: vi.fn().mockReturnValue({
          finish: vi.fn().mockReturnValue('encoded_result'),
        }),
      },
    } as never);

    const result = await createTokenTransfer({
      contractAddress,
      args,
      chainId,
    });

    expect(result).toBe('encoded_result');
  });
});

describe('handleTransaction', () => {
  const mockGetSignature: any = vi.fn();
  const rawTxInput = {
    walletInfo: { address: aelfAddress },
    walletType: AelfWalletTypeEnum.elf,
    blockHeightInput: '1',
    blockHashInput: 'mockBlockHash',
    packedInput: 'packedInputValue',
    address: 'mockAddress',
    contractAddress: 'mockContractAddress',
    functionName: 'mockFunction',
    caAddress: aelfAddress,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create and return encoded hex transaction', async () => {
    const mockRawTx = {
      params: '0x123456',
    };
    (getRawTx as Mock).mockReturnValue(mockRawTx);
    (AElf.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue('encoded_tx'),
    });

    mockGetSignature.mockResolvedValue({ signature: 'mockSignature' } as never);

    const result = await handleTransaction({ ...rawTxInput, getSignature: mockGetSignature });

    expect(result).toBe('01 02 03');
  });

  it('should create and return encoded hex transaction with discover wallet and methodCheck return true', async () => {
    const mockRawTx = {
      params: '0x123456',
    };

    // Mock getRawTx method
    (getRawTx as Mock).mockReturnValue(mockRawTx);

    // Mock AElf util
    (AElf.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue('encoded_tx'),
    });

    // Mock getSignature method
    mockGetSignature.mockResolvedValue({ signature: 'mockSignature' } as never);

    const result = await handleTransaction({
      ...rawTxInput,
      walletInfo: {
        address: aelfAddress,
        extraInfo: {
          provider: {
            methodCheck: vi.fn().mockReturnValue(true),
            request: vi.fn().mockReturnValue({ r: '1', s: '2', recoveryParam: 123 }),
          },
        },
      },
      walletType: AelfWalletTypeEnum.discover,
      getSignature: mockGetSignature,
    });

    expect(result).toBe('01 02 03');
  });

  it('should create and return encoded hex transaction with discover wallet and methodCheck return false', async () => {
    const mockRawTx = {
      params: '0x123456',
    };

    // Mock getRawTx method
    (getRawTx as Mock).mockReturnValue(mockRawTx);

    // Mock AElf util
    (AElf.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue('encoded_tx'),
    });

    // Mock getSignature method
    mockGetSignature.mockResolvedValue({ signature: 'mockSignature' } as never);

    const result = await handleTransaction({
      ...rawTxInput,
      walletInfo: {
        address: aelfAddress,
        extraInfo: {
          provider: {
            methodCheck: vi.fn().mockReturnValue(false),
            request: vi.fn().mockReturnValue({ r: '1', s: '2', recoveryParam: 123 }),
          },
        },
      },
      walletType: AelfWalletTypeEnum.discover,
      getSignature: mockGetSignature,
    });

    expect(result).toBe('01 02 03');
  });

  it('should create and return encoded hex transaction, with discover wallet, methodCheck return false and signature is undefined ', async () => {
    const mockRawTx = {
      params: '0x123456',
    };

    // Mock getRawTx method
    (getRawTx as Mock).mockReturnValue(mockRawTx);

    // Mock AElf util
    (AElf.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue('encoded_tx'),
    });

    // Mock getSignature method
    mockGetSignature.mockResolvedValue({ signature: undefined } as never);

    const result = await handleTransaction({
      ...rawTxInput,
      walletInfo: {
        address: aelfAddress,
        extraInfo: {
          provider: {
            methodCheck: vi.fn().mockReturnValue(false),
            request: vi.fn().mockReturnValue({ r: '1', s: '2', recoveryParam: 123 }),
          },
        },
      },
      walletType: AelfWalletTypeEnum.discover,
      getSignature: mockGetSignature,
    });

    expect(result).toBeUndefined();
  });

  it('signature is undefined and return undefined', async () => {
    const mockRawTx = {
      params: '0x123456',
    };
    (getRawTx as Mock).mockReturnValue(mockRawTx);
    (AElf.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue('encoded_tx'),
    });

    mockGetSignature.mockResolvedValue(undefined as never);

    const result = await handleTransaction({ ...rawTxInput, getSignature: mockGetSignature });

    expect(result).toBe(undefined);
  });

  it('tx is buffer and return correct', async () => {
    // Mock getRawTx method
    const mockRawTx = {
      params: '0x123456',
    };
    (getRawTx as Mock).mockReturnValue(mockRawTx);

    // Mock AElf utils
    (AElf.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue(Buffer.from(mockRawTx.params, 'utf-8')),
    });

    mockGetSignature.mockResolvedValue({ signature: 'mockSignature' } as never);

    const result = await handleTransaction({ ...rawTxInput, getSignature: mockGetSignature });

    expect(result).toBe('3078313233343536');
  });
});

describe('checkTokenAllowanceAndApprove', () => {
  const mockTransactionResult = { transactionId: 'mockTransactionId', Status: 'mined' };
  const mockWallet = { address: 'mockWalletAddress' };

  let mockTokenContract: { GetBalance: any; GetAllowance: any; GetTokenInfo: any };
  beforeEach(() => {
    mockTokenContract = {
      GetBalance: {
        call: vi.fn(),
      },
      GetAllowance: {
        call: vi.fn(),
      },
      GetTokenInfo: {
        call: vi.fn(),
      },
    };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (AElf.wallet.createNewWallet as Mock).mockReturnValue(mockWallet);

    const mockAElfInstance = {
      chain: {
        contractAt: vi.fn().mockResolvedValue(mockTokenContract as never),
      },
    };
    (AElf as Mock).mockImplementation(() => mockAElfInstance);
  });

  it('decimal is undefined, and return correct', async () => {
    const status = 'mined';
    const txResult = { Status: status };

    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return txResult;
          }),
        },
      };
    });

    // Mock getTokenContract,getAllowance and getTokenInfo methods
    (getTokenContract as Mock).mockResolvedValue(mockTokenContract);
    (getAllowance as Mock).mockResolvedValue('100');
    (getTokenInfo as Mock).mockResolvedValue({ decimals: 6 });

    const result = await checkTokenAllowanceAndApprove({
      callSendMethod: vi.fn().mockResolvedValue(mockTransactionResult as never) as any,
      chainId: mainChainId,
      symbol: mockSymbol,
      amount: '10',
      address: mockOwner,
      approveTargetAddress: mockSpender,
      memo: mockMemo,
    });

    expect(result).toBe(false);
  });

  it('should approve allowance if not enough', async () => {
    // Mock getTokenInfo method
    (getTokenInfo as Mock).mockResolvedValue({ decimals: undefined });

    const result = await checkTokenAllowanceAndApprove({
      callSendMethod: vi.fn().mockResolvedValue(mockTransactionResult as never) as any,
      chainId: 'tDVW' as SupportedELFChainId,
      symbol: mockSymbol,
      amount: '100000',
      address: mockOwner,
      approveTargetAddress: mockSpender,
      memo: mockMemo,
    });
    expect(result).toBe(false);
  });

  it('should not approve allowance if already enough', async () => {
    const result = await checkTokenAllowanceAndApprove({
      callSendMethod: vi.fn().mockResolvedValue(mockTransactionResult as never) as any,
      chainId: 'tDVW' as SupportedELFChainId,
      symbol: mockSymbol,
      amount: '0.0000001',
      address: mockOwner,
      approveTargetAddress: mockSpender,
      memo: mockMemo,
    });
    expect(result).toBe(true);
  });
});

describe('checkIsEnoughAllowance', () => {
  it('should return true if allowance is sufficient', async () => {
    const result = await checkIsEnoughAllowance({
      chainId: mainChainId,
      symbol: mockSymbol,
      address: mockOwner,
      approveTargetAddress: mockSpender,
      amount: '0.000000001',
    });

    expect(result).toBe(true);
  });

  it('should return false if allowance is insufficient', async () => {
    const result = await checkIsEnoughAllowance({
      chainId: mainChainId,
      symbol: mockSymbol,
      address: mockOwner,
      approveTargetAddress: mockSpender,
      amount: '100000',
    });

    expect(result).toBe(false);
  });
});

describe('handleContractErrorMessage', () => {
  const ContractErrorMessage = 'Contract Error';

  test('Input is string, and return the correct format.', () => {
    const error = handleContractErrorMessage(ContractErrorMessage);

    expect(error).toBe(ContractErrorMessage);
  });

  test('Input error.message, and return the correct format.', () => {
    const error = handleContractErrorMessage({ message: ContractErrorMessage });

    expect(error).toBe(ContractErrorMessage);
  });

  test('Input error.Error, and return the correct format.', () => {
    const error = handleContractErrorMessage({ Error: ContractErrorMessage });

    expect(error).toBe(ContractErrorMessage);
  });

  test('Input error.Error.Details, and return the correct format.', () => {
    const error = handleContractErrorMessage({ Error: { Details: ContractErrorMessage } });

    expect(error).toBe(ContractErrorMessage);
  });

  test('Input error.Error.Message, and return the correct format.', () => {
    const error = handleContractErrorMessage({ Error: { Message: ContractErrorMessage } });

    expect(error).toBe(ContractErrorMessage);
  });

  test('Input error.Error.msg, and return the correct format.', () => {
    const error = handleContractErrorMessage({ Error: { msg: ContractErrorMessage } });

    expect(error).toEqual({ msg: ContractErrorMessage });
  });

  test('Input error.Status, and return the correct format.', () => {
    const error = handleContractErrorMessage({ Status: 500 });

    expect(error).toBe('Transaction: 500');
  });

  test('Input undefined, and return the correct format.', () => {
    const error = handleContractErrorMessage(undefined);

    expect(error).toBe('Transaction: undefined');
  });
});

describe('TXError Class', () => {
  it('should create an error with a message and transaction ID', () => {
    const error = new TXError('Transaction failed', '12345');

    expect(error.message).toBe('Transaction failed');
    expect(error.TransactionId).toBe('12345');
    expect(error.transactionId).toBe('12345');
  });
});

describe('getTxResult', () => {
  const TransactionId = '12345';
  const chainId = mainChainId;

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it('if getAElf.chain.getTxResult return Promise.reject, throw error', async () => {
    const error = 'getAElf error';

    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return Promise.reject(error);
          }),
        },
      };
    });

    await expect(getTxResult(TransactionId, chainId)).rejects.toThrow(error);
  });

  it('if getAElf.chain.getTxResult return undefined, throw error', async () => {
    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return undefined;
          }),
        },
      };
    });

    await expect(getTxResult(TransactionId, chainId)).rejects.toThrow(
      `Can not get transaction result.`,
    );
  });

  it('if status is NotExisted, throw error', async () => {
    const status = 'NotExisted';

    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return { Status: status };
          }),
        },
      };
    });

    await expect(getTxResult(TransactionId, chainId)).rejects.toThrow(`Transaction: ${status}`);
  });

  it('if status is always pending, throw error', async () => {
    const status = 'pending';

    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return { Status: status };
          }),
        },
      };
    });

    await expect(getTxResult(TransactionId, chainId)).rejects.toThrow(`Transaction: ${status}`);
  });

  it('if status is always pending_validation, throw error', async () => {
    const status = 'pending_validation';

    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return { Status: status };
          }),
        },
      };
    });

    await expect(getTxResult(TransactionId, chainId)).rejects.toThrow(`Transaction: ${status}`);
  });

  it('if status is mined, return correct tx result', async () => {
    const status = 'mined';
    const txResult = { Status: status };

    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return txResult;
          }),
        },
      };
    });

    const result = await getTxResult(TransactionId, chainId);

    expect(result).toEqual(txResult);
  });

  it('if status is unknown, throw error', async () => {
    const status = 'unknown';
    const txResult = { Status: status };

    // Mock getAElf method
    (getAElf as Mock).mockImplementation(() => {
      return {
        chain: {
          getTxResult: vi.fn().mockImplementation(() => {
            return txResult;
          }),
        },
      };
    });

    await expect(getTxResult(TransactionId, chainId)).rejects.toThrow(`Transaction: ${status}`);
  });
});

describe('createTransferTokenTransaction', () => {
  const mockCaContractAddress = '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb';
  const mockETransferContractAddress = '4xWFvoLvi5anZERDuJvzfMoZsb6WZLATEzqzCVe8sQnCp2XGS';
  const mockWallet = {
    address: 'mockWalletAddress',
    extraInfo: {
      provider: {
        methodCheck: vi.fn().mockReturnValue(true),
        request: vi.fn().mockReturnValue({ r: '1', s: '2', recoveryParam: 123 }),
      },
    },
  };
  const mockGetSignature: any = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock getSignature method
    mockGetSignature.mockResolvedValue({ signature: 'mockSignature' } as never);

    // Mock getAElf method
    const status = 'mined';
    const txResult = { Status: status };
    (getAElf as Mock).mockReturnValue({
      chain: {
        getTxResult: vi.fn().mockImplementation(() => {
          return txResult;
        }),
        getChainStatus: vi
          .fn()
          .mockResolvedValue({ BestChainHeight: 1, BestChainHash: 'mockChainHash' } as never),
      },
    });

    // Mock getRawTx method
    const mockRawTx = {
      params: '0x123456',
    };
    (getRawTx as Mock).mockReturnValue(mockRawTx);

    // Mock AElf utils
    (AElf.pbUtils.Transaction.encode as Mock).mockReturnValue({
      finish: vi.fn().mockReturnValue(Buffer.from(mockRawTx.params, 'utf-8')),
    });
    (AElf.utils.uint8ArrayToHex as Mock).mockReturnValue('01 02 03');
  });

  it('should return correct value with elf wallet', async () => {
    const result = await createTransferTokenTransaction({
      walletInfo: mockWallet,
      walletType: AelfWalletTypeEnum.elf,
      caContractAddress: mockCaContractAddress,
      eTransferContractAddress: mockETransferContractAddress,
      caHash: '',
      symbol: mockSymbol,
      amount: '10000',
      memo: mockMemo,
      chainId: mainChainId,
      fromManagerAddress: 'mockFromManagerAddress',
      caAddress: aelfAddress,
      getSignature: mockGetSignature,
    });

    expect(result).toBe('3078313233343536');
  });

  it('should return correct value with discover wallet', async () => {
    const mockResponse = {
      args: new Uint8Array([1, 2, 3]),
    } as never;

    // Mock handleManagerForwardCall method
    (handleManagerForwardCall as Mock).mockResolvedValue(mockResponse);

    // Mock getContractMethods method
    (getContractMethods as Mock).mockResolvedValue({
      ManagerForwardCall: {
        fromObject: vi.fn().mockReturnValue({}),
        encode: vi.fn().mockReturnValue({
          finish: vi.fn().mockReturnValue('encoded_result'),
        }),
      },
    } as never);

    const result = await createTransferTokenTransaction({
      walletInfo: mockWallet,
      walletType: AelfWalletTypeEnum.discover,
      caContractAddress: mockCaContractAddress,
      eTransferContractAddress: mockETransferContractAddress,
      caHash: '',
      symbol: mockSymbol,
      amount: '10000',
      memo: mockMemo,
      chainId: mainChainId,
      fromManagerAddress: 'mockFromManagerAddress',
      caAddress: aelfAddress,
      getSignature: mockGetSignature,
    });

    expect(result).toBe('3078313233343536');
  });
});

describe('getBalance', () => {
  it('should return correct ELF balance', async () => {
    const mockBalance = '10000';

    // Mock getBalanceOrigin method
    (getBalanceOrigin as Mock).mockResolvedValue(mockBalance);

    const result = await getBalance({
      caAddress: aelfAddress,
      symbol: mockSymbol,
      chainId: mainChainId,
    });

    expect(result).toBe(mockBalance);
  });
});
