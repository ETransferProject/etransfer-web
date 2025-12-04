import { describe, it, vi, expect, beforeEach, Mock } from 'vitest';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { configureAndSendCurrentTransaction } from 'utils/wallet/SOL';

// Mock the dependencies
const mockConnection = {
  getLatestBlockhash: vi.fn(),
  sendRawTransaction: vi.fn(),
  confirmTransaction: vi.fn(),
} as unknown as Connection;

const mockPublicKey = new PublicKey('11111111111111111111111111111111');
const mockTransaction = new Transaction();
const mockSignTransaction = vi.fn();

describe('configureAndSendCurrentTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should configure and send a transaction successfully', async () => {
    // Mock the blockhash response
    const mockBlockhash = {
      blockhash: 'mockBlockhash',
      lastValidBlockHeight: 100,
    };
    (mockConnection.getLatestBlockhash as Mock).mockResolvedValue(mockBlockhash);

    // Mock signed transaction
    const mockSignedTransaction = {
      serialize: vi.fn().mockReturnValue(Buffer.from('mockSerializedTransaction')),
    };
    mockSignTransaction.mockResolvedValue(mockSignedTransaction);

    // Mock raw transaction signature
    const mockSignature = 'mockTransactionSignature';
    (mockConnection.sendRawTransaction as Mock).mockResolvedValue(mockSignature);

    // Mock successful confirmation
    (mockConnection.confirmTransaction as Mock).mockResolvedValue({});

    // Call the function
    const signature = await configureAndSendCurrentTransaction(
      mockTransaction,
      mockConnection,
      mockPublicKey,
      mockSignTransaction,
    );

    // Assert the result
    expect(signature).toBe(mockSignature);

    // Assert `getLatestBlockhash` is called
    expect(mockConnection.getLatestBlockhash).toHaveBeenCalledTimes(1);

    // Assert transaction properties are set
    expect(mockTransaction.feePayer).toBe(mockPublicKey);
    expect(mockTransaction.recentBlockhash).toBe(mockBlockhash.blockhash);

    // Assert `signTransaction` is called
    expect(mockSignTransaction).toHaveBeenCalledWith(mockTransaction);

    // Assert `sendRawTransaction` is called with the serialized transaction
    expect(mockConnection.sendRawTransaction).toHaveBeenCalledWith(
      mockSignedTransaction.serialize(),
    );

    // Assert `confirmTransaction` is called with correct arguments
    expect(mockConnection.confirmTransaction).toHaveBeenCalledWith({
      blockhash: mockBlockhash.blockhash,
      lastValidBlockHeight: mockBlockhash.lastValidBlockHeight,
      signature: mockSignature,
    });
  });

  it('should throw an error if `signTransaction` fails', async () => {
    // Mock the blockhash response
    const mockBlockhash = {
      blockhash: 'mockBlockhash',
      lastValidBlockHeight: 100,
    };
    (mockConnection.getLatestBlockhash as Mock).mockResolvedValue(mockBlockhash);

    // Mock `signTransaction` to throw an error
    const mockError = new Error('Signing transaction failed');
    mockSignTransaction.mockRejectedValue(mockError);

    // Call the function and expect it to throw
    await expect(
      configureAndSendCurrentTransaction(
        mockTransaction,
        mockConnection,
        mockPublicKey,
        mockSignTransaction,
      ),
    ).rejects.toThrow(mockError);

    // Assert that methods called before `signTransaction` were executed
    expect(mockConnection.getLatestBlockhash).toHaveBeenCalledTimes(1);
    expect(mockSignTransaction).toHaveBeenCalledWith(mockTransaction);

    // Ensure `sendRawTransaction` and `confirmTransaction` are not called
    expect(mockConnection.sendRawTransaction).not.toHaveBeenCalled();
    expect(mockConnection.confirmTransaction).not.toHaveBeenCalled();
  });

  it('should throw an error if sending the transaction fails', async () => {
    // Mock the blockhash response
    const mockBlockhash = {
      blockhash: 'mockBlockhash',
      lastValidBlockHeight: 100,
    };
    (mockConnection.getLatestBlockhash as Mock).mockResolvedValue(mockBlockhash);

    // Mock successful signing
    const mockSignedTransaction = {
      serialize: vi.fn().mockReturnValue(Buffer.from('mockSerializedTransaction')),
    };
    mockSignTransaction.mockResolvedValue(mockSignedTransaction);

    // Mock `sendRawTransaction` to throw an error
    const mockError = new Error('Failed to send transaction');
    (mockConnection.sendRawTransaction as Mock).mockRejectedValue(mockError);

    // Call the function and expect it to throw
    await expect(
      configureAndSendCurrentTransaction(
        mockTransaction,
        mockConnection,
        mockPublicKey,
        mockSignTransaction,
      ),
    ).rejects.toThrow(mockError);

    // Ensure `confirmTransaction` is not called after `sendRawTransaction` fails
    expect(mockConnection.confirmTransaction).not.toHaveBeenCalled();
  });

  it('should throw an error if confirming the transaction fails', async () => {
    // Mock the blockhash response
    const mockBlockhash = {
      blockhash: 'mockBlockhash',
      lastValidBlockHeight: 100,
    };
    (mockConnection.getLatestBlockhash as Mock).mockResolvedValue(mockBlockhash);

    // Mock successful signing
    const mockSignedTransaction = {
      serialize: vi.fn().mockReturnValue(Buffer.from('mockSerializedTransaction')),
    };
    mockSignTransaction.mockResolvedValue(mockSignedTransaction);

    // Mock raw transaction signature
    const mockSignature = 'mockTransactionSignature';
    (mockConnection.sendRawTransaction as Mock).mockResolvedValue(mockSignature);

    // Mock `confirmTransaction` to throw an error
    const mockError = new Error('Failed to confirm transaction');
    (mockConnection.confirmTransaction as Mock).mockRejectedValue(mockError);

    // Call the function and expect it to throw
    await expect(
      configureAndSendCurrentTransaction(
        mockTransaction,
        mockConnection,
        mockPublicKey,
        mockSignTransaction,
      ),
    ).rejects.toThrow(mockError);

    // Assert `confirmTransaction` was called
    expect(mockConnection.confirmTransaction).toHaveBeenCalledWith({
      blockhash: mockBlockhash.blockhash,
      lastValidBlockHeight: mockBlockhash.lastValidBlockHeight,
      signature: mockSignature,
    });
  });
});
