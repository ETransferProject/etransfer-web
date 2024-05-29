import AElf from 'aelf-sdk';
import BigNumber from 'bignumber.js';
import { SupportedELFChainId } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
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
import { IContract } from '@portkey/types';
import getPortkeyWallet from 'portkeySDK/portkeyWallet';
import portkeyContractUnity from 'portkeySDK/contract/portkey';
import { ContractMethodName, ManagerForwardCall } from 'constants/contract';
import { timesDecimals } from 'utils/calculate';
import { AllSupportedELFChainId, ContractType } from 'constants/chain';
import { getAElf, getNodeByChainId, getRawTx, GetRawTx } from 'utils/aelfBase';
import aelfInstanceV1 from 'portkeySDK/v1/aelfInstance';
import aelfInstanceV2 from 'portkeySDK/v2/aelfInstance';

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

type TCreateTokenTransfer = {
  caContractAddress: string;
  args: any;
  chainId: SupportedELFChainId;
};

// only for portkey v2
export const createTokenTransfer = async ({
  caContractAddress,
  args,
  chainId,
}: TCreateTokenTransfer) => {
  const instance = aelfInstanceV2.getInstance(chainId as unknown as AllSupportedELFChainId);
  const methods = await getContractMethodsV2(instance, caContractAddress);

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

export const handleTransaction = async ({
  blockHeightInput,
  blockHashInput,
  packedInput,
  address,
  contractAddress,
  functionName,
  version = PortkeyVersion.v2,
}: GetRawTx & { version?: PortkeyVersion }) => {
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

export interface CreateTransferTransactionParams {
  caContractAddress: string;
  tokenContractAddress: string;
  caHash: string;
  symbol: string;
  toAddress: string; // owner account address
  amount: string; // with decimal
  memo?: string;
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
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
  version,
}: CreateTransferTransactionParams) => {
  // await activate();
  const managerForwardCall = await createManagerForwardCall({
    caContractAddress,
    contractAddress: tokenContractAddress,
    caHash,
    methodName: ContractMethodName.Transfer, // ContractMethodName.TransferToken,
    args: { symbol, to: toAddress, amount, memo },
    chainId,
    version,
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

export interface CreateTransferTokenTransactionParams {
  caContractAddress: string;
  eTransferContractAddress: string;
  caHash: string;
  symbol: string;
  amount: string;
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
}

export const createTransferTokenTransaction = async ({
  caContractAddress,
  eTransferContractAddress,
  caHash,
  symbol,
  amount,
  chainId,
  version,
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
  console.log('>>>>>> transaction', transaction);
  return transaction;
};

export type GetBalancesProps = {
  caAddress: string;
  symbol: string;
  chainId: SupportedELFChainId;
  version: PortkeyVersion;
};
export const getBalance = async ({ symbol, chainId, caAddress, version }: GetBalancesProps) => {
  const tokenContract = await portkeyContractUnity.getContract({
    chainId,
    contractType: ContractType.TOKEN,
    version,
  });

  const {
    data: { balance },
  } = await tokenContract.callViewMethod(ContractMethodName.GetBalance, {
    symbol,
    owner: caAddress, // caAddress
  });
  return balance;
};
