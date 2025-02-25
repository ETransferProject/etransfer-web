import AElf from 'aelf-sdk';
import { ADDRESS_MAP, APP_NAME, NETWORK_TYPE, SupportedELFChainId } from 'constants/index';
import { ContractMethodName, ManagerForwardCall } from 'constants/contract';
import BigNumber from 'bignumber.js';
import { timesDecimals } from './calculate';
import { AllSupportedELFChainId, ContractType } from 'constants/chain';
import { sleep, zeroFill } from '@portkey/utils';
import {
  GetRawTx,
  getAElf,
  getNodeByChainId,
  getRawTx,
  removeELFAddressSuffix,
} from 'utils/aelf/aelfBase';
import aelfInstance from './aelf/aelfInstance';
import { handleManagerForwardCall, getContractMethods } from '@portkey/contracts';
import {
  ICallContractParams,
  TSignatureParams,
  WalletTypeEnum as AelfWalletTypeEnum,
  TWalletInfo,
} from '@aelf-web-login/wallet-adapter-base';
import {
  getTokenContract,
  getBalance as getBalanceOrigin,
  getAllowance,
  getTokenInfo,
} from '@etransfer/utils';
import { ExtraInfoForDiscover } from 'types/wallet';

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

export class TXError extends Error {
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
  if (error?.Error) {
    return error.Error.Details || error.Error.Message || error.Error;
  }
  return `Transaction: ${error?.Status}`;
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
    // console.log(txResult, TransactionId, 'compBalanceMetadata====txResult');
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
  walletInfo,
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
  walletInfo: TWalletInfo;
  walletType: AelfWalletTypeEnum;
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
  if (walletType === AelfWalletTypeEnum.elf) {
    // nightElf
    signInfo = AElf.utils.sha256(ser);
  } else {
    // portkey sdk and discover
    signInfo = Buffer.from(ser).toString('hex');
  }

  // signature
  let signatureStr = '';
  if (walletType === AelfWalletTypeEnum.discover) {
    // discover
    const discoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;
    if ((discoverInfo?.provider as any).methodCheck('wallet_getTransactionSignature')) {
      const sin = await discoverInfo?.provider?.request({
        method: 'wallet_getTransactionSignature',
        payload: { hexData: signInfo },
      });
      signatureStr = [zeroFill(sin.r), zeroFill(sin.s), `0${sin.recoveryParam.toString()}`].join(
        '',
      );
    } else {
      const signatureRes = await getSignature({
        appName: APP_NAME,
        address: removeELFAddressSuffix(caAddress),
        signInfo,
      });
      signatureStr = signatureRes?.signature || '';
    }
  } else {
    const signatureRes = await getSignature({
      appName: APP_NAME,
      address: removeELFAddressSuffix(caAddress),
      signInfo,
    });
    signatureStr = signatureRes?.signature || '';
  }

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
  memo,
}: {
  callSendMethod: (props: ICallContractParams<any>) => Promise<any>;
  chainId: SupportedELFChainId;
  address: string;
  symbol: string;
  amount: BigNumber | number | string;
  memo?: string;
}) => {
  const approveResult: any = await callSendMethod({
    chainId,
    contractAddress: ADDRESS_MAP[chainId][ContractType.TOKEN],
    methodName: ContractMethodName.Approve,
    args: {
      networkType: NETWORK_TYPE,
      spender: address,
      symbol,
      amount: amount.toString(),
      memo,
    },
  });
  const txRes = await getTxResult(approveResult.transactionId, chainId);
  console.log('approveResult: ', approveResult, txRes);
  return true;
};

export const checkTokenAllowanceAndApprove = async ({
  callSendMethod,
  chainId,
  symbol,
  address,
  approveTargetAddress,
  amount,
  memo,
}: {
  callSendMethod: (prams: ICallContractParams<any>) => Promise<any>;
  chainId: SupportedELFChainId;
  symbol: string;
  address: string;
  approveTargetAddress: string;
  amount: string | number;
  memo?: string;
}): Promise<boolean> => {
  const endPoint = getNodeByChainId(chainId as unknown as AllSupportedELFChainId).rpcUrl;
  const tokenContractAddress = ADDRESS_MAP[chainId][ContractType.TOKEN];
  const tokenContractOrigin = await getTokenContract(endPoint, tokenContractAddress);

  const [allowanceResult, tokenInfoResult] = await Promise.all([
    getAllowance(tokenContractOrigin, symbol, address, approveTargetAddress),
    getTokenInfo(tokenContractOrigin, symbol),
  ]);

  console.log('first check allowance and tokenInfo:', allowanceResult, tokenInfoResult);
  const bigA = timesDecimals(amount, tokenInfoResult?.decimals || 8);
  const allowanceBN = new BigNumber(allowanceResult);

  if (allowanceBN.lt(bigA)) {
    await approveELF({
      callSendMethod,
      chainId,
      address: approveTargetAddress,
      symbol,
      amount: bigA.toFixed(0),
      memo,
    });

    const allowanceNew = await getAllowance(
      tokenContractOrigin,
      symbol,
      address,
      approveTargetAddress,
    );
    console.log('second check allowance:', allowanceNew);

    return bigA.lte(allowanceNew);
  }
  return true;
};

export const checkIsEnoughAllowance = async ({
  chainId,
  symbol,
  address,
  approveTargetAddress,
  amount,
}: {
  chainId: SupportedELFChainId;
  symbol: string;
  address: string;
  approveTargetAddress: string;
  amount: string | number;
}) => {
  const endPoint = getNodeByChainId(chainId as unknown as AllSupportedELFChainId).rpcUrl;
  const tokenContractAddress = ADDRESS_MAP[chainId][ContractType.TOKEN];
  const tokenContractOrigin = await getTokenContract(endPoint, tokenContractAddress);

  const [allowanceResult, tokenInfoResult] = await Promise.all([
    getAllowance(tokenContractOrigin, symbol, address, approveTargetAddress),
    getTokenInfo(tokenContractOrigin, symbol),
  ]);

  console.log('first check allowance and tokenInfo:', allowanceResult, tokenInfoResult);
  const bigA = timesDecimals(amount, tokenInfoResult?.decimals || 8);
  const allowanceBN = new BigNumber(allowanceResult);
  if (allowanceBN.lt(bigA)) {
    return false;
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
  walletInfo: TWalletInfo;
  walletType: AelfWalletTypeEnum;
  caContractAddress: string;
  eTransferContractAddress: string;
  caHash: string;
  symbol: string;
  amount: string;
  memo?: string;
  chainId: SupportedELFChainId;
  fromManagerAddress: string;
  caAddress: string;
  getSignature: TGetSignature;
}

export const createTransferTokenTransaction = async ({
  walletInfo,
  walletType,
  caContractAddress,
  eTransferContractAddress,
  caHash,
  symbol,
  amount,
  memo,
  chainId,
  fromManagerAddress,
  caAddress,
  getSignature,
}: CreateTransferTokenTransactionParams) => {
  let transactionParams;
  if (walletType === AelfWalletTypeEnum.elf) {
    transactionParams = await createTokenTransfer({
      contractAddress: eTransferContractAddress,
      args: { symbol, amount, memo },
      chainId,
    });
  } else {
    transactionParams = await createManagerForwardCall({
      caContractAddress,
      contractAddress: eTransferContractAddress,
      caHash,
      methodName: ContractMethodName.TransferToken,
      args: { symbol, amount, memo },
      chainId,
    });
  }

  const packedInput = AElf.utils.uint8ArrayToHex(transactionParams);

  const aelf = getAElf(chainId as unknown as AllSupportedELFChainId);
  const { BestChainHeight, BestChainHash } = await aelf.chain.getChainStatus();

  if (walletType === AelfWalletTypeEnum.elf) {
    const transaction = await handleTransaction({
      walletInfo,
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
    walletInfo,
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

export type TGetBalancesProps = {
  caAddress: string;
  symbol: string;
  chainId: SupportedELFChainId;
};

export const getBalance = async ({ symbol, chainId, caAddress }: TGetBalancesProps) => {
  const endPoint = getNodeByChainId(chainId as unknown as AllSupportedELFChainId).rpcUrl;
  const tokenContractAddress = ADDRESS_MAP[chainId][ContractType.TOKEN];
  const tokenContractOrigin = await getTokenContract(endPoint, tokenContractAddress);
  const res = await getBalanceOrigin(tokenContractOrigin, symbol, caAddress);

  return res;
};
