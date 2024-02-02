import AElf from 'aelf-sdk';
import { AElfNodes } from 'constants/aelf';
import { isSymbol } from './reg';
import { SupportedELFChainId } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { AelfInstancesKey, ChainId } from 'types';
import { isELFAddress } from './common';
import {
  handleManagerForwardCall as handleManagerForwardCallV1,
  getContractMethods as getContractMethodsV1,
  getTxResult as getTxResultV1,
} from '@portkey-v1/contracts';
import {
  handleManagerForwardCall as handleManagerForwardCallV2,
  getContractMethods as getContractMethodsV2,
  getTxResult as getTxResultV2,
} from '@portkey/contracts';
import aelfInstanceV1 from './aelfInstanceV1';
import aelfInstanceV2 from './aelfInstanceV2';
import { ContractMethodName, ManagerForwardCall } from 'constants/contract';
import BigNumber from 'bignumber.js';
import { timesDecimals } from './calculate';
import { IContract } from '@portkey/types';
import { AllSupportedELFChainId } from 'constants/chain';
import getPortkeyWallet from 'wallet/portkeyWallet';

export function getNodeByChainId(chainId: AllSupportedELFChainId) {
  return AElfNodes[chainId as AelfInstancesKey];
}

// const httpProviders: any = {};
export function getAElf(chainId: AllSupportedELFChainId) {
  const rpc = getNodeByChainId(chainId).rpcUrl;
  // if (!httpProviders[rpc]) httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));
  return new AElf(new AElf.providers.HttpProvider(rpc));
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
  version?: PortkeyVersion;
};

export const createManagerForwardCall = async ({
  caContractAddress,
  contractAddress,
  args,
  methodName,
  caHash,
  chainId,
  version = PortkeyVersion.v2,
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
  version?: PortkeyVersion;
};

export const getRawTx = ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
}: GetRawTx) => {
  const rawTx = AElf.pbUtils.getTransaction(address, contractAddress, functionName, packedInput);
  rawTx.refBlockNumber = blockHeightInput;
  const blockHash = blockHashInput.match(/^0x/) ? blockHashInput.substring(2) : blockHashInput;
  rawTx.refBlockPrefix = Buffer.from(blockHash, 'hex').slice(0, 4);
  return rawTx;
};

export const handleTransaction = async ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
  version = PortkeyVersion.v2,
}: GetRawTx) => {
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

  const m = AElf.utils.sha256(ser);
  // signature
  let signatureStr = '';
  const portkeyWallet = getPortkeyWallet(version);
  const signatureRes = await portkeyWallet.getSignature(m);
  signatureStr = signatureRes.signatureStr || '';
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

export interface CreateTransferTransactionParams {
  caContractAddress: string;
  tokenContractAddress: string;
  caHash: string;
  symbol: string;
  toAddress: string; // owner account address
  amount: string; // with decimal
  memo?: string;
  chainId: SupportedELFChainId;
  version?: PortkeyVersion;
}
export const createTransferTransaction = async ({
  caContractAddress,
  tokenContractAddress,
  caHash,
  symbol,
  toAddress,
  amount,
  memo,
  chainId,
  version = PortkeyVersion.v2,
}: CreateTransferTransactionParams) => {
  // await activate();
  const managerForwardCall = await createManagerForwardCall({
    caContractAddress,
    contractAddress: tokenContractAddress,
    caHash,
    methodName: ContractMethodName.Transfer, // ContractMethodName.TransferToken,
    args: { symbol, to: toAddress, amount, memo },
    chainId,
  });

  const transactionParams = AElf.utils.uint8ArrayToHex(managerForwardCall);

  const aelf = getAElf(chainId as unknown as AllSupportedELFChainId);
  const { BestChainHeight, BestChainHash } = await aelf.chain.getChainStatus();

  const portkeyWallet = getPortkeyWallet(version);
  const fromManagerAddress = await portkeyWallet.getManagerAddress();
  const transaction = await handleTransaction({
    blockHeightInput: BestChainHeight,
    blockHashInput: BestChainHash,
    packedInput: transactionParams,
    address: fromManagerAddress,
    contractAddress: caContractAddress,
    functionName: ManagerForwardCall,
    version,
  });

  const rpcUrl = getNodeByChainId(chainId as unknown as AllSupportedELFChainId).rpcUrl;
  const aelfI = aelf.getAelfInstance(rpcUrl);
  const send = await aelfI.chain.sendTransaction(transaction);
  const req =
    version === PortkeyVersion.v1
      ? await getTxResultV1(aelfI, send.TransactionId)
      : await getTxResultV2(aelfI, send.TransactionId);
  console.log('TxResult:', req);
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
  address,
  tokenContract,
  symbol,
  amount,
}: {
  address: string;
  tokenContract: IContract;
  symbol: string;
  amount: BigNumber | number | string;
}) => {
  const approveResult = await tokenContract.callSendMethod(ContractMethodName.Approve, '', {
    spender: address,
    symbol,
    amount: amount.toString(),
  });
  console.log('approveResult: ', approveResult);
  return true;
};

export const checkTokenAllowanceAndApprove = async ({
  tokenContract,
  symbol,
  address,
  approveTargetAddress,
  amount,
}: {
  tokenContract: IContract;
  symbol: string;
  address: string;
  approveTargetAddress: string;
  amount: string | number;
}): Promise<boolean> => {
  const [allowance, tokenInfo] = await Promise.all([
    tokenContract.callViewMethod(ContractMethodName.GetAllowance, {
      symbol,
      owner: address, // owner caAddress
      spender: approveTargetAddress,
    }),
    tokenContract.callViewMethod(ContractMethodName.GetTokenInfo, {
      symbol,
    }),
  ]);
  const allowanceResult = allowance.data;
  const tokenInfoResult = tokenInfo.data;
  console.log('first check allowance and tokenInfo:', allowanceResult, tokenInfoResult);
  const bigA = timesDecimals(amount, tokenInfoResult?.decimals ?? 8);
  const allowanceBN = new BigNumber(allowanceResult?.allowance);

  if (allowanceBN.lt(bigA)) {
    await approveELF({
      address: approveTargetAddress,
      tokenContract,
      symbol,
      amount: bigA.toFixed(0),
    });

    const allowance = await tokenContract.callViewMethod(ContractMethodName.GetAllowance, {
      symbol,
      owner: address, // owner caAddress
      spender: approveTargetAddress,
    });
    console.log('second check allowance:', allowance.data);

    return bigA.lte(allowance.data?.allowance);
  }
  return true;
};

export interface CreateTransferTokenTransactionParams {
  caContractAddress: string;
  eTransferContractAddress: string;
  caHash: string;
  symbol: string;
  amount: string;
  chainId: SupportedELFChainId;
  version?: PortkeyVersion;
}

export const createTransferTokenTransaction = async ({
  caContractAddress,
  eTransferContractAddress,
  caHash,
  symbol,
  amount,
  chainId,
  version = PortkeyVersion.v2,
}: CreateTransferTokenTransactionParams) => {
  const managerForwardCall = await createManagerForwardCall({
    caContractAddress,
    contractAddress: eTransferContractAddress,
    caHash,
    methodName: ContractMethodName.TransferToken,
    args: { symbol, amount },
    chainId,
  });

  const transactionParams = AElf.utils.uint8ArrayToHex(managerForwardCall);

  const aelf = getAElf(chainId as unknown as AllSupportedELFChainId);
  const { BestChainHeight, BestChainHash } = await aelf.chain.getChainStatus();

  const portkeyWallet = getPortkeyWallet(version);
  const fromManagerAddress = await portkeyWallet.getManagerAddress();
  const transaction = await handleTransaction({
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
