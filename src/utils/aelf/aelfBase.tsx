import AElf from 'aelf-sdk';
import { SupportedELFChainId } from 'constants/index';
import { AElfNodes } from 'constants/aelf';
import { AllSupportedELFChainId } from 'constants/chain';
import { AelfInstancesKey } from 'types';
import { isSymbol, isValidBase58 } from '../reg';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { TChainType } from 'types/wallet';

export function getNodeByChainId(chainId: AllSupportedELFChainId) {
  return AElfNodes[chainId as AelfInstancesKey];
}

const httpProviders: any = {};
export function getAElf(chainId: AllSupportedELFChainId) {
  const rpc = getNodeByChainId(chainId).rpcUrl;
  if (!httpProviders[rpc]) httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));
  return httpProviders[rpc];
}

export const recoverPubKey = (msg: any, signature: string) => {
  const signatureObj = {
    r: signature.slice(0, 64),
    s: signature.slice(64, 128),
    recoveryParam: Number(signature.slice(128, 130)),
  };

  const hexMsg = AElf.utils.sha256(msg);
  const publicKey = AElf.wallet.ellipticEc
    .recoverPubKey(Buffer.from(hexMsg, 'hex'), signatureObj, signatureObj.recoveryParam)
    .encode('hex', false);
  return publicKey;
};

export const pubKeyToAddress = (pubKey: string) => {
  const onceSHAResult = Buffer.from(AElf.utils.sha256(Buffer.from(pubKey, 'hex')), 'hex');
  const hash = AElf.utils.sha256(onceSHAResult).slice(0, 64);
  return AElf.utils.encodeAddressRep(hash);
};

export type TEncodedTransfer = {
  contractAddress: string;
  params: TEncodedTransferParams;
  methodName: string;
  chainId: SupportedELFChainId;
};

export type TEncodedTransferParams = {
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
}: TEncodedTransfer) => {
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

export type GetRawTx = {
  blockHeightInput: string;
  blockHashInput: string;
  packedInput: string;
  address: string;
  contractAddress: string;
  functionName: string;
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

const isWrappedBytes = (resolvedType: any, name: string) => {
  if (!resolvedType?.name || resolvedType.name !== name) {
    return false;
  }
  if (!resolvedType?.fieldsArray || resolvedType.fieldsArray.length !== 1) {
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

export const isELFChain = (chainId?: SupportedELFChainId) => {
  return !!(typeof chainId === 'string' && SupportedELFChainId[chainId]);
};

export const getELFAddress = (address?: string): void | undefined | string => {
  if (!address) return;
  const list = address.split('_');
  if (list.length === 3 && isELFAddress(list[1])) return list[1];
};

export const isELFAddress = (value: string) => {
  if (/[\u4e00-\u9fa5]/.test(value)) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
};

export function isDIDAddress(value?: string) {
  if (!value || !isValidBase58(value)) return false;
  if (value.includes('_') && value.split('_').length < 3) return false;
  try {
    return !!AElf.utils.decodeAddressRep(value);
  } catch {
    return false;
  }
}

export function isDIDAddressSuffix(value?: string) {
  if (!value) return false;
  if (isDIDAddress(value)) {
    const arr = value.split('_');

    if (arr && arr.length === 3 && Object.values(SupportedELFChainId).includes(arr[2] as any)) {
      return true;
    }
  }
  return false;
}

export const removeAddressSuffix = (address: string) => {
  const arr = address.split('_');
  if (arr.length === 3) return arr[1];

  return address;
};

export const removeELFAddressSuffix = (address: string) => {
  if (isELFAddress(address)) return removeAddressSuffix(address);

  return address;
};

/**
 * format address like "aaa...bbb" to "ELF_aaa...bbb_AELF"
 * @param address
 * @param chainId
 * @param chainType
 * @returns
 */
export const formatDIDAddress = (
  address: string,
  chainId: TChainId = SupportedELFChainId.AELF,
  chainType: TChainType = 'aelf',
): string => {
  if (chainType !== 'aelf') return address;
  const arr = address.split('_');
  if (address.includes('_') && arr.length < 3) return address;
  if (address.includes('_')) return `ELF_${arr[1]}_${chainId}`;
  return `ELF_${address}_${chainId}`;
};
