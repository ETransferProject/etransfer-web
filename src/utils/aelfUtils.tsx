import AElf from 'aelf-sdk';
import { AElfNodes } from 'constants/aelf';
import { isSymbol } from './reg';
import { ADDRESS_MAP, SupportedELFChainId } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { AelfInstancesKey, ChainId } from 'types';
import { isELFAddress } from './common';
import {
  handleManagerForwardCall as handleManagerForwardCallV1,
  getContractMethods as getContractMethodsV1,
} from '@portkey-v1/contracts';
import {
  handleManagerForwardCall as handleManagerForwardCallV2,
  getContractMethods as getContractMethodsV2,
} from '@portkey/contracts';
import aelfInstanceV1 from './aelfInstanceV1';
import aelfInstanceV2 from './aelfInstanceV2';
import { ContractMethodName, ManagerForwardCall } from 'constants/contract';
import BigNumber from 'bignumber.js';
import { timesDecimals } from './calculate';
import { AllSupportedELFChainId, ContractType } from 'constants/chain';
import { WalletType } from 'aelf-web-login';
import { IWallet } from 'contract/types';
import { sleep } from '@portkey/utils';

export function getNodeByChainId(chainId: AllSupportedELFChainId) {
  return AElfNodes[chainId as AelfInstancesKey];
}

const httpProviders: any = {};
export function getAElf(chainId: AllSupportedELFChainId) {
  const rpc = getNodeByChainId(chainId).rpcUrl;
  if (!httpProviders[rpc]) httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));
  return new AElf(new AElf.providers.HttpProvider(rpc));
}

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
  chainId: ChainId,
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

export type EncodedTransfer = {
  contractAddress: string;
  params: EncodedTransferParams;
  methodName: string;
  chainId: SupportedELFChainId;
};

export type EncodedTransferParams = {
  symbol: string;
  to: string;
  amount: string;
  memo: string;
};

export const encodedTransfer = async ({
  contractAddress,
  params,
  methodName, // 'Transfer'
  chainId,
}: EncodedTransfer) => {
  // Get the protobuf definitions related to a contract
  const fileDescriptors = await getFileDescriptorsSet({ contractAddress, chainId });
  const inputType = fileDescriptors[2].methods[methodName].resolve().resolvedRequestType;
  let input = AElf.utils.transform.transformMapToArray(inputType, params);
  input = AElf.utils.transform.transform(inputType, input, AElf.utils.transform.INPUT_TRANSFORMERS);
  const message = inputType.fromObject(input);

  return inputType.encode(message).finish();
};

export type GetFileDescriptorsSet = {
  contractAddress: string;
  chainId: SupportedELFChainId;
};

export const getFileDescriptorsSet = async ({
  contractAddress,
  chainId,
}: GetFileDescriptorsSet) => {
  const aelf = getAElf(chainId as unknown as AllSupportedELFChainId);
  const fds = await aelf.chain.getContractFileDescriptorSet(contractAddress);
  return getServicesFromFileDescriptors(fds);
};

export const getServicesFromFileDescriptors = (descriptors: any) => {
  const root = AElf.pbjs.Root.fromDescriptor(descriptors, 'proto3').resolveAll();
  return descriptors.file
    .filter((f: any) => f.service.length > 0)
    .map((f: any) => {
      const sn = f.service[0].name;
      const fullName = f.package ? `${f.package}.${sn}` : sn;
      return root.lookupService(fullName);
    });
};

type CreateHandleManagerForwardCall = {
  caContractAddress: string;
  contractAddress: string;
  args: any;
  methodName: string;
  caHash: string;
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
};

export const createManagerForwardCall = async ({
  caContractAddress,
  contractAddress,
  args,
  methodName,
  caHash,
  chainId,
  version,
}: CreateHandleManagerForwardCall) => {
  let instance, res, methods;
  if (version === PortkeyVersion.v1) {
    instance = aelfInstanceV1.getInstance(chainId as unknown as AllSupportedELFChainId);
    res = await handleManagerForwardCallV1({
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
    methods = await getContractMethodsV1(instance, caContractAddress);
  } else {
    instance = aelfInstanceV2.getInstance(chainId as unknown as AllSupportedELFChainId);
    res = await handleManagerForwardCallV2({
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
    methods = await getContractMethodsV2(instance, caContractAddress);
  }

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

export type GetRawTx = {
  blockHeightInput: string;
  blockHashInput: string;
  packedInput: string;
  address: string;
  contractAddress: string;
  functionName: string;
  version: PortkeyVersion;
};

export const getRawTx = ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
}: GetRawTx) => {
  console.log(blockHashInput, '=====blockHashInput');

  const rawTx = AElf.pbUtils.getTransaction(address, contractAddress, functionName, packedInput);
  rawTx.refBlockNumber = blockHeightInput;
  const blockHash = blockHashInput.match(/^0x/) ? blockHashInput.substring(2) : blockHashInput;
  rawTx.refBlockPrefix = Buffer.from(blockHash, 'hex').slice(0, 4);
  return rawTx;
};

export const handleTransaction = async ({
  wallet,
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
  version,
}: GetRawTx & {
  wallet: IWallet;
}) => {
  console.log(
    {
      wallet,
      blockHeightInput,
      blockHashInput,
      packedInput,
      address,
      contractAddress,
      functionName,
      version,
    },
    '=====1',
  );

  // Create transaction
  const rawTx = getRawTx({
    blockHeightInput,
    blockHashInput,
    packedInput,
    address,
    contractAddress,
    functionName,
    version,
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
  console.log(signatureRes, '=====signatureRes');

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

const isWrappedBytes = (resolvedType: any, name: string) => {
  if (!resolvedType.name || resolvedType.name !== name) {
    return false;
  }
  if (!resolvedType.fieldsArray || resolvedType.fieldsArray.length !== 1) {
    return false;
  }
  return resolvedType.fieldsArray[0].type === 'bytes';
};
const isAddress = (resolvedType: any) => isWrappedBytes(resolvedType, 'Address');

const isHash = (resolvedType: any) => isWrappedBytes(resolvedType, 'Hash');
export function transformArrayToMap(inputType: any, origin: any[]) {
  if (!origin) return '';
  if (!Array.isArray(origin)) return origin;
  if (origin.length === 0) return '';
  if (isAddress(inputType) || isHash(inputType)) return origin[0];

  const { fieldsArray } = inputType || {};
  const fieldsLength = (fieldsArray || []).length;

  if (fieldsLength === 0) return origin;

  if (fieldsLength === 1) {
    const i = fieldsArray[0];
    return { [i.name]: origin[0] };
  }

  let result = origin;
  Array.isArray(fieldsArray) &&
    Array.isArray(origin) &&
    fieldsArray.forEach((i, k) => {
      result = {
        ...result,
        [i.name]: origin[k],
      };
    });
  return result;
}

export const isElfChainSymbol = (symbol?: string | null) => {
  if (symbol && symbol.length >= 2 && symbol.length <= 10 && isSymbol(symbol)) return symbol;
  return false;
};

export const isELFChain = (chainId?: ChainId) => {
  return !!(typeof chainId === 'string' && SupportedELFChainId[chainId as SupportedELFChainId]);
};

export const getELFAddress = (address?: string): void | undefined | string => {
  if (!address) return;
  const list = address.split('_');
  if (list.length === 3 && isELFAddress(list[1])) return list[1];
};

export const approveELF = async ({
  wallet,
  chainId,
  address,
  symbol,
  amount,
  version,
}: {
  wallet: IWallet;
  chainId: ChainId;
  address: string;
  symbol: string;
  amount: BigNumber | number | string;
  version: PortkeyVersion;
}) => {
  const approveResult: any = await wallet.callSendMethod(chainId, {
    contractAddress: ADDRESS_MAP[version][chainId][ContractType.TOKEN],
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
  version,
}: {
  wallet: IWallet;
  chainId: ChainId;
  symbol: string;
  address: string;
  approveTargetAddress: string;
  amount: string | number;
  version: PortkeyVersion;
}): Promise<boolean> => {
  const [allowanceResult, tokenInfoResult] = await Promise.all([
    wallet.callViewMethod<any, any>(chainId, {
      contractAddress: ADDRESS_MAP[version][chainId][ContractType.TOKEN],
      methodName: ContractMethodName.GetAllowance,
      args: {
        symbol,
        owner: address, // owner caAddress
        spender: approveTargetAddress,
      },
    }),
    wallet.callViewMethod<any, any>(chainId, {
      contractAddress: ADDRESS_MAP[version][chainId][ContractType.TOKEN],
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
      version,
    });

    const allowanceNew = await wallet.callViewMethod<any, any>(chainId, {
      contractAddress: ADDRESS_MAP[version][chainId][ContractType.TOKEN],
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
  wallet: IWallet;
  caContractAddress: string;
  eTransferContractAddress: string;
  caHash: string;
  symbol: string;
  amount: string;
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
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
  version,
  fromManagerAddress,
}: CreateTransferTokenTransactionParams) => {
  const managerForwardCall = await createManagerForwardCall({
    caContractAddress,
    contractAddress: eTransferContractAddress,
    caHash,
    methodName: ContractMethodName.TransferToken,
    args: { symbol, amount },
    chainId,
    version,
  });

  const transactionParams = AElf.utils.uint8ArrayToHex(managerForwardCall);

  const aelf = getAElf(chainId as unknown as AllSupportedELFChainId);
  const { BestChainHeight, BestChainHash } = await aelf.chain.getChainStatus();

  console.log(
    { BestChainHeight, BestChainHash },
    {
      wallet,
      blockHeightInput: BestChainHeight,
      blockHashInput: BestChainHash,
      packedInput: transactionParams,
      address: fromManagerAddress,
      contractAddress: caContractAddress,
      functionName: ManagerForwardCall,
      version,
    },
    '=====handleTransaction',
  );

  const transaction = await handleTransaction({
    wallet,
    blockHeightInput: BestChainHeight,
    blockHashInput: BestChainHash,
    packedInput: transactionParams,
    address: fromManagerAddress,
    contractAddress: caContractAddress,
    functionName: ManagerForwardCall,
    version,
  });
  console.log('🌈 🌈 🌈 🌈 🌈 🌈 transaction', transaction);
  return transaction;
};

export type GetBalancesProps = {
  wallet: IWallet;
  caAddress: string;
  symbol: string;
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
};
export const getBalance = async ({
  wallet,
  symbol,
  chainId,
  caAddress,
  version,
}: GetBalancesProps) => {
  if (!wallet.callViewMethod) return;

  const res: { balance: string } | undefined = await wallet.callViewMethod(chainId, {
    contractAddress: ADDRESS_MAP[version][chainId][ContractType.TOKEN],
    methodName: ContractMethodName.GetBalance,
    args: {
      symbol,
      owner: caAddress, // caAddress
    },
  });
  return res?.balance;
};

export const pubKeyToAddress = (pubKey: string) => {
  const onceSHAResult = Buffer.from(AElf.utils.sha256(Buffer.from(pubKey, 'hex')), 'hex');
  const hash = AElf.utils.sha256(onceSHAResult).slice(0, 64);
  return AElf.utils.encodeAddressRep(hash);
};
