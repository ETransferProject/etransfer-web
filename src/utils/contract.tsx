import AElf from 'aelf-sdk';
import { ADDRESS_MAP, APP_NAME, SupportedELFChainId } from 'constants/index';
import { ContractMethodName, ManagerForwardCall } from 'constants/contract';
import BigNumber from 'bignumber.js';
import { timesDecimals } from './calculate';
import { AllSupportedELFChainId, ContractType } from 'constants/chain';
import { sleep } from '@portkey/utils';
import { GetRawTx, getAElf, getRawTx, removeELFAddressSuffix } from 'utils/aelf/aelfBase';
import aelfInstance from './aelf/aelfInstance';
import { handleManagerForwardCall, getContractMethods } from '@portkey/contracts';
import {
  ICallContractParams,
  TSignatureParams,
  WalletTypeEnum,
} from '@aelf-web-login/wallet-adapter-base';

type CreateHandleManagerForwardCall = {
  caContractAddress: string;
  contractAddress: string;
  args: any;
  methodName: string;
  caHash: string;
  chainId: SupportedELFChainId;
};

export const createManagerForwardCall = async ({
  caContractAddress,
  contractAddress,
  args,
  methodName,
  caHash,
  chainId,
}: CreateHandleManagerForwardCall) => {
  const instance = aelfInstance.getInstance(chainId as unknown as AllSupportedELFChainId);
  const res = await handleManagerForwardCall({
    paramsOption: {
      contractAddress,
      methodName,
      args,
      caHash,
    },
    functionName: ManagerForwardCall,
    instance,
  });
  res.args = Buffer.from(AElf.utils.uint8ArrayToHex(res.args), 'hex').toString('base64');
  const methods = await getContractMethods(instance, caContractAddress);

  const protoInputType = methods[ManagerForwardCall];

  let input = AElf.utils.transform.transformMapToArray(protoInputType, res);

  input = AElf.utils.transform.transform(
    protoInputType,
    input,
    AElf.utils.transform.INPUT_TRANSFORMERS,
  );

  const message = protoInputType.fromObject(input);

  return protoInputType.encode(message).finish();
};

type TCreateTokenTransfer = {
  contractAddress: string;
  args: any;
  chainId: SupportedELFChainId;
};

export const createTokenTransfer = async ({
  contractAddress,
  args,
  chainId,
}: TCreateTokenTransfer) => {
  const instance = aelfInstance.getInstance(chainId as unknown as AllSupportedELFChainId);
  const methods = await getContractMethods(instance, contractAddress);

  const protoInputType = methods['TransferToken'];

  let input = AElf.utils.transform.transformMapToArray(protoInputType, args);

  input = AElf.utils.transform.transform(
    protoInputType,
    input,
    AElf.utils.transform.INPUT_TRANSFORMERS,
  );

  const message = protoInputType.fromObject(input);

  return protoInputType.encode(message).finish();
};

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
  walletType,
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
  caAddress,
  getSignature,
}: GetRawTx & {
  walletType: WalletTypeEnum;
  caAddress: string;
  getSignature: TGetSignature;
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
  if (walletType !== WalletTypeEnum.aa) {
    // nightElf or discover
    signInfo = AElf.utils.sha256(ser);
  } else {
    // portkey sdk
    signInfo = Buffer.from(ser).toString('hex');
  }

  // signature
  const signatureRes = await getSignature({
    appName: APP_NAME,
    address: removeELFAddressSuffix(caAddress),
    signInfo,
  });

  const signatureStr = signatureRes?.signature || '';
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
  callSendMethod,
  chainId,
  address,
  symbol,
  amount,
}: {
  callSendMethod: (props: ICallContractParams<any>) => Promise<any>;
  chainId: SupportedELFChainId;
  address: string;
  symbol: string;
  amount: BigNumber | number | string;
}) => {
  const approveResult: any = await callSendMethod({
    chainId,
    contractAddress: ADDRESS_MAP[chainId][ContractType.TOKEN],
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
  callViewMethod,
  callSendMethod,
  chainId,
  symbol,
  address,
  approveTargetAddress,
  amount,
}: {
  callViewMethod: (prams: ICallContractParams<any>) => Promise<any>;
  callSendMethod: (prams: ICallContractParams<any>) => Promise<any>;
  chainId: SupportedELFChainId;
  symbol: string;
  address: string;
  approveTargetAddress: string;
  amount: string | number;
}): Promise<boolean> => {
  const [allowanceResult, tokenInfoResult] = await Promise.all([
    callViewMethod({
      chainId,
      contractAddress: ADDRESS_MAP[chainId][ContractType.TOKEN],
      methodName: ContractMethodName.GetAllowance,
      args: {
        symbol,
        owner: address, // owner caAddress
        spender: approveTargetAddress,
      },
    }),
    callViewMethod({
      chainId,
      contractAddress: ADDRESS_MAP[chainId][ContractType.TOKEN],
      methodName: ContractMethodName.GetTokenInfo,
      args: {
        symbol,
      },
    }),
  ]);

  console.log('first check allowance and tokenInfo:', allowanceResult, tokenInfoResult);
  const bigA = timesDecimals(amount, tokenInfoResult?.data?.decimals || 8);
  const allowanceBN = new BigNumber(allowanceResult?.data?.allowance);

  if (allowanceBN.lt(bigA)) {
    await approveELF({
      callSendMethod,
      chainId,
      address: approveTargetAddress,
      symbol,
      amount: bigA.toFixed(0),
    });

    const allowanceNew = await callViewMethod({
      chainId,
      contractAddress: ADDRESS_MAP[chainId][ContractType.TOKEN],
      methodName: ContractMethodName.GetAllowance,
      args: {
        symbol,
        owner: address, // owner caAddress
        spender: approveTargetAddress,
      },
    });
    console.log('second check allowance:', allowanceNew);

    return bigA.lte(allowanceNew?.data.allowance);
  }
  return true;
};

export type TGetSignature = (params: TSignatureParams) => Promise<TGetSignatureResult | null>;

export type TGetSignatureResult = {
  error: number;
  errorMessage: string;
  signature: string;
  from: string;
};

export interface CreateTransferTokenTransactionParams {
  walletType: WalletTypeEnum;
  caContractAddress: string;
  eTransferContractAddress: string;
  caHash: string;
  symbol: string;
  amount: string;
  chainId: SupportedELFChainId;
  fromManagerAddress: string;
  caAddress: string;
  getSignature: TGetSignature;
}

export const createTransferTokenTransaction = async ({
  walletType,
  caContractAddress,
  eTransferContractAddress,
  caHash,
  symbol,
  amount,
  chainId,
  fromManagerAddress,
  caAddress,
  getSignature,
}: CreateTransferTokenTransactionParams) => {
  let transactionParams;
  if (walletType === WalletTypeEnum.elf) {
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

  if (walletType === WalletTypeEnum.elf) {
    const transaction = await handleTransaction({
      walletType,
      blockHeightInput: BestChainHeight,
      blockHashInput: BestChainHash,
      packedInput,
      address: fromManagerAddress,
      contractAddress: eTransferContractAddress,
      functionName: 'TransferToken',
      caAddress,
      getSignature,
    });
    console.log('>>>>>> createTransferTokenTransaction transaction', transaction);
    return transaction;
  }

  const transaction = await handleTransaction({
    walletType,
    blockHeightInput: BestChainHeight,
    blockHashInput: BestChainHash,
    packedInput,
    address: fromManagerAddress,
    contractAddress: caContractAddress,
    functionName: ManagerForwardCall,
    caAddress,
    getSignature,
  });
  console.log('>>>>>> createTransferTokenTransaction transaction', transaction);
  return transaction;
};

export type TCallViewMethodForGetBalance = (
  prams: ICallContractParams<{
    symbol: string;
    owner: string;
  }>,
) => Promise<
  | {
      data: {
        balance: string;
      };
    }
  | undefined
>;

export type TGetBalancesProps = {
  callViewMethod: TCallViewMethodForGetBalance;
  caAddress: string;
  symbol: string;
  chainId: SupportedELFChainId;
};

export const getBalance = async ({
  callViewMethod,
  symbol,
  chainId,
  caAddress,
}: TGetBalancesProps) => {
  const res = await callViewMethod({
    contractAddress: ADDRESS_MAP[chainId][ContractType.TOKEN],
    methodName: ContractMethodName.GetBalance,
    chainId,
    args: {
      symbol,
      owner: caAddress,
    },
  });

  return res?.data?.balance;
};
