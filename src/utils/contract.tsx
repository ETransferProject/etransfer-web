import AElf from 'aelf-sdk';
import { ADDRESS_MAP, SupportedELFChainId } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { ContractMethodName, ManagerForwardCall } from 'constants/contract';
import BigNumber from 'bignumber.js';
import { timesDecimals } from './calculate';
import { AllSupportedELFChainId, ContractType } from 'constants/chain';
import { WalletType } from 'aelf-web-login';
import { TWallet } from 'contract/types';
import { sleep } from '@portkey/utils';
import { GetRawTx, getAElf, getRawTx } from 'utils/aelfBase';
import { createManagerForwardCall, createTokenTransfer } from 'portkeySDK/utils/contract';

class TXError extends Error {
  public TransactionId?: string;
  public transactionId?: string;
  constructor(message: string, id?: string) {
    super(message);
    this.TransactionId = id;
    this.transactionId = id;
  }
}

export function handleContractErrorMessage(error?: any) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error.Error) {
    return error.Error.Details || error.Error.Message || error.Error || error.Status;
  }
  return `Transaction: ${error.Status}`;
}

export async function getTxResult(
  TransactionId: string,
  chainId: SupportedELFChainId,
  reGetCount = 0,
  notExistedReGetCount = 0,
): Promise<any> {
  const txFun = getAElf(chainId as unknown as AllSupportedELFChainId).chain.getTxResult;
  let txResult;
  try {
    txResult = await txFun(TransactionId);
    console.log(txResult, TransactionId, 'compBalanceMetadata====txResult');
  } catch (error) {
    console.log('getTxResult:error', error);
    throw new TXError(handleContractErrorMessage(error), TransactionId);
  }

  const result = txResult?.result || txResult;
  if (!result) {
    throw new TXError('Can not get transaction result.', TransactionId);
  }

  const lowerCaseStatus = result.Status.toLowerCase();
  if (lowerCaseStatus === 'notexisted') {
    if (notExistedReGetCount > 5)
      throw new TXError(result.Error || `Transaction: ${result.Status}`, TransactionId);
    await sleep(1000);
    notExistedReGetCount++;
    reGetCount++;
    return getTxResult(TransactionId, chainId, reGetCount, notExistedReGetCount);
  }
  if (lowerCaseStatus === 'pending' || lowerCaseStatus === 'pending_validation') {
    if (reGetCount > 20)
      throw new TXError(result.Error || `Transaction: ${result.Status}`, TransactionId);
    await sleep(1000);
    reGetCount++;
    return getTxResult(TransactionId, chainId, reGetCount, notExistedReGetCount);
  }

  if (lowerCaseStatus === 'mined') return result;
  throw new TXError(result.Error || `Transaction: ${result.Status}`, TransactionId);
}

export const handleTransaction = async ({
  wallet,
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
}: GetRawTx & {
  wallet: TWallet;
}) => {
  // Create transaction
  const rawTx = getRawTx({
    blockHeightInput,
    blockHashInput,
    packedInput,
    address,
    contractAddress,
    functionName,
  });
  rawTx.params = Buffer.from(rawTx.params, 'hex');

  const ser = AElf.pbUtils.Transaction.encode(rawTx).finish();

  let signInfo: string;
  if (wallet.walletType !== WalletType.portkey) {
    // nightElf or discover
    signInfo = AElf.utils.sha256(ser);
  } else {
    // portkey sdk
    signInfo = Buffer.from(ser).toString('hex');
  }

  // signature
  let signatureStr = '';
  const signatureRes = await wallet.getSignature({ signInfo });

  signatureStr = signatureRes.signature || '';
  if (!signatureStr) return;

  let tx = {
    ...rawTx,
    signature: Buffer.from(signatureStr, 'hex'),
  };

  tx = AElf.pbUtils.Transaction.encode(tx).finish();
  if (tx instanceof Buffer) {
    return tx.toString('hex');
  }
  return AElf.utils.uint8ArrayToHex(tx); // hex params
};

export const approveELF = async ({
  wallet,
  chainId,
  address,
  symbol,
  amount,
}: {
  wallet: TWallet;
  chainId: SupportedELFChainId;
  address: string;
  symbol: string;
  amount: BigNumber | number | string;
}) => {
  const approveResult: any = await wallet.callSendMethod(chainId, {
    contractAddress: ADDRESS_MAP[PortkeyVersion.v2][chainId][ContractType.TOKEN],
    methodName: ContractMethodName.Approve,
    args: {
      spender: address,
      symbol,
      amount: amount.toString(),
    },
  });
  const txRes = await getTxResult(approveResult.transactionId, chainId);
  console.log('approveResult: ', approveResult, txRes);
  return true;
};

export const checkTokenAllowanceAndApprove = async ({
  wallet,
  chainId,
  symbol,
  address,
  approveTargetAddress,
  amount,
}: {
  wallet: TWallet;
  chainId: SupportedELFChainId;
  symbol: string;
  address: string;
  approveTargetAddress: string;
  amount: string | number;
}): Promise<boolean> => {
  const [allowanceResult, tokenInfoResult] = await Promise.all([
    wallet.callViewMethod<any, any>(chainId, {
      contractAddress: ADDRESS_MAP[PortkeyVersion.v2][chainId][ContractType.TOKEN],
      methodName: ContractMethodName.GetAllowance,
      args: {
        symbol,
        owner: address, // owner caAddress
        spender: approveTargetAddress,
      },
    }),
    wallet.callViewMethod<any, any>(chainId, {
      contractAddress: ADDRESS_MAP[PortkeyVersion.v2][chainId][ContractType.TOKEN],
      methodName: ContractMethodName.GetTokenInfo,
      args: {
        symbol,
      },
    }),
  ]);

  console.log('first check allowance and tokenInfo:', allowanceResult, tokenInfoResult);
  const bigA = timesDecimals(amount, tokenInfoResult?.decimals || 8);
  const allowanceBN = new BigNumber(allowanceResult?.allowance);

  if (allowanceBN.lt(bigA)) {
    await approveELF({
      wallet,
      chainId,
      address: approveTargetAddress,
      symbol,
      amount: bigA.toFixed(0),
    });

    const allowanceNew = await wallet.callViewMethod<any, any>(chainId, {
      contractAddress: ADDRESS_MAP[PortkeyVersion.v2][chainId][ContractType.TOKEN],
      methodName: ContractMethodName.GetAllowance,
      args: {
        symbol,
        owner: address, // owner caAddress
        spender: approveTargetAddress,
      },
    });
    console.log('second check allowance:', allowanceNew);

    return bigA.lte(allowanceNew?.allowance);
  }
  return true;
};

export interface CreateTransferTokenTransactionParams {
  wallet: TWallet;
  caContractAddress: string;
  eTransferContractAddress: string;
  caHash: string;
  symbol: string;
  amount: string;
  chainId: SupportedELFChainId;
  fromManagerAddress: string;
}

export const createTransferTokenTransaction = async ({
  wallet,
  caContractAddress,
  eTransferContractAddress,
  caHash,
  symbol,
  amount,
  chainId,
  fromManagerAddress,
}: CreateTransferTokenTransactionParams) => {
  let transactionParams;
  if (wallet.walletType === WalletType.elf) {
    transactionParams = await createTokenTransfer({
      contractAddress: eTransferContractAddress,
      args: { symbol, amount },
      chainId,
    });
  } else {
    transactionParams = await createManagerForwardCall({
      caContractAddress,
      contractAddress: eTransferContractAddress,
      caHash,
      methodName: ContractMethodName.TransferToken,
      args: { symbol, amount },
      chainId,
    });
  }

  const packedInput = AElf.utils.uint8ArrayToHex(transactionParams);

  const aelf = getAElf(chainId as unknown as AllSupportedELFChainId);
  const { BestChainHeight, BestChainHash } = await aelf.chain.getChainStatus();

  if (wallet.walletType === WalletType.elf) {
    const transaction = await handleTransaction({
      wallet,
      blockHeightInput: BestChainHeight,
      blockHashInput: BestChainHash,
      packedInput,
      address: fromManagerAddress,
      contractAddress: eTransferContractAddress,
      functionName: 'TransferToken',
    });
    console.log('>>>>>> createTransferTokenTransaction transaction', transaction);
    return transaction;
  }

  const transaction = await handleTransaction({
    wallet,
    blockHeightInput: BestChainHeight,
    blockHashInput: BestChainHash,
    packedInput,
    address: fromManagerAddress,
    contractAddress: caContractAddress,
    functionName: ManagerForwardCall,
  });
  console.log('>>>>>> createTransferTokenTransaction transaction', transaction);
  return transaction;
};

export type TGetBalancesProps = {
  wallet: TWallet;
  caAddress: string;
  symbol: string;
  chainId: SupportedELFChainId;
};
export const getBalance = async ({ wallet, symbol, chainId, caAddress }: TGetBalancesProps) => {
  if (!wallet.callViewMethod) return;

  const res: { balance: string } | undefined = await wallet.callViewMethod(chainId, {
    contractAddress: ADDRESS_MAP[PortkeyVersion.v2][chainId][ContractType.TOKEN],
    methodName: ContractMethodName.GetBalance,
    args: {
      symbol,
      owner: caAddress, // caAddress
    },
  });
  return res?.balance;
};
