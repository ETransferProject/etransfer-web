import { WalletTypeEnum } from 'context/Wallet/types';
import { useMemo } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
// import { usePrepareTransactionRequest, useSignTypedData } from 'wagmi';
// import { createWalletClient, custom, parseEther } from 'viem';
// import { mainnet, sepolia } from 'viem/chains';

export default function useEVM() {
  const { disconnect } = useDisconnect();
  const accountInfo = useAccount();
  // const result = useBalance({
  //   address: "0xB464a49eF0b1096f6ed3BA88E5890E5E0aF7E6fc",
  //   // token: "0xd38E5c25935291fFD51C9d66C3B7384494bb099A", // '0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab'
  //   token: "0x8adD57b8aD6C291BC3E3ffF89F767fcA08e0E7Ab",
  // });

  //   const prepareTransactionRequest = usePrepareTransactionRequest({
  //     account: accountInfo.address,
  //     chainId: sepolia.id,
  //     to: "0x4e88a23f1cc61366b7bb76d9d2cce9cfc817c491", // cobo token pool address
  //     value: parseEther("1"),
  //     // data: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // A contract hashed method call with encoded args.
  //   });
  //   console.log(
  //     ">>>>>> prepareTransactionRequest",
  //     prepareTransactionRequest
  //   );

  // const createRawTransactionByViem = useCallback(async () => {
  //   try {
  //     const walletClient = createWalletClient({
  //       chain: mainnet,
  //       transport: custom(window.ethereum!),
  //     });
  //     const request = await walletClient.prepareTransactionRequest({
  //       account: accountInfo.address,
  //       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  //       value: 1000n, //BigInt(100),
  //     });

  //     const signature = await walletClient.signTransaction(request);
  //     return {
  //       type: 'success',
  //       signature,
  //     };
  //   } catch (error) {
  //     return {
  //       type: 'error',
  //       signature: '',
  //       error,
  //     };
  //   }
  // }, [accountInfo.address]);

  // const prepareTransactionRequest = usePrepareTransactionRequest({
  //   account: accountInfo.address,
  //   chainId: sepolia.id,
  //   to: '0x4e88a23f1cc61366b7bb76d9d2cce9cfc817c491', // cobo token pool address
  //   value: parseEther('0.000001'),
  //   // data: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // A contract hashed method call with encoded args.
  // });
  // console.log(">>>>>> prepareTransactionRequest", prepareTransactionRequest);
  // const chainId = useChainId();
  // console.log(">>>>>> chainId", chainId);
  // const { signTypedData } = useSignTypedData();

  // const evmClient = useClient({ chainId: sepolia.id });
  // console.log(">>>>>> evmClient", evmClient);
  // const testTransitionRaw = useCallback(async () => {
  //   try {
  // const provider = await accountInfo.connector?.getProvider();
  // if (!accountInfo?.address || !provider) return;
  // const walletClient = createWalletClient({
  //   chain: sepolia,
  //   transport: custom(window.ethereum), //(window.ethereum!),
  // });
  // console.log('>>>>>> EVM walletClient', walletClient);
  // const request = await walletClient.prepareTransactionRequest({
  //   chainId: sepolia.id,
  //   account: accountInfo.address,
  //   from: accountInfo.address,
  //   to: '0x4e88a23f1cc61366b7bb76d9d2cce9cfc817c491',
  //   value: 1000000000000n, //BigInt(1000000000000),
  // });
  // console.log('>>>>>> EVM request', request);
  // const signature = await walletClient.signTransaction(
  //   request.data
  // prepareTransactionRequest.data
  // {
  //   account: accountInfo.address, //"0xB464a49eF0b1096f6ed3BA88E5890E5E0aF7E6fc",
  //   // chainId: 11155111,
  //   from: accountInfo.address, //"0xB464a49eF0b1096f6ed3BA88E5890E5E0aF7E6fc",
  //   // gas: BigInt(21000),
  //   // maxFeePerGas: BigInt(12762930647),
  //   // maxPriorityFeePerGas: BigInt(159935258),
  //   // nonce: 2,
  //   to: "0x4e88a23f1cc61366b7bb76d9d2cce9cfc817c491",
  //   // type: "eip1559",
  //   value: BigInt(1000000000000),
  // }
  // );
  // console.log(">>>>>> signature", signature);
  // return {
  //   type: "success",
  //   signature,
  // };
  //   } catch (error) {
  //     console.log('EVM onTransitionRaw error', error);
  //     return {
  //       type: 'error',
  //       signature: '',
  //       error,
  //     };
  //   }
  // }, []);

  const evmContext = useMemo(() => {
    return {
      isConnected: accountInfo.isConnected,
      walletType: WalletTypeEnum.EVM,
      chainId: accountInfo.chain,
      provider: accountInfo.connector?.getProvider(),

      account: accountInfo.address,
      accounts: accountInfo.addresses,
      connector: accountInfo.connector,
      disconnect: disconnect,
      getAccountInfo: () => accountInfo,
      // createRawTransaction: createRawTransactionByViem,
      testTransitionRaw: () => [], // testTransitionRaw
    };
  }, [accountInfo, disconnect]);

  return evmContext;
}
