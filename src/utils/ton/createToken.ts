import { Address, beginCell, contractAddress, toNano } from '@ton/core';
import { buildOnchainMetadata } from './jettonHelpers';
import { SampleJetton, storeMint } from './sampleJetton';
import base64 from 'base64-js';
import { SendTransactionRequest } from '@tonconnect/ui-react';
import { timesDecimals } from 'utils/calculate';

export async function getCreateTonTokenRequest({
  ownerAddress,
  tokenInfo,
  network,
}: {
  ownerAddress: string;
  network?: SendTransactionRequest['network'];
  tokenInfo: {
    name: string;
    description: string;
    symbol: string;
    imageUri: string;
    tokenMaxSupply: number;
    decimals: string;
  };
}) {
  const workChain = 0; // workChain default 0

  const userAddress = Address.parse(ownerAddress);

  const jettonParams = {
    name: tokenInfo.name,
    description: tokenInfo.description,
    symbol: tokenInfo.symbol,
    image: tokenInfo.imageUri,
    decimals: tokenInfo.decimals,
  };

  const tokenMaxSupply = BigInt(
    timesDecimals(tokenInfo.tokenMaxSupply, tokenInfo.decimals).toFixed(0),
  );
  const content = buildOnchainMetadata(jettonParams);
  const init = await SampleJetton.init(userAddress, content, tokenMaxSupply);
  const jettonMaster = contractAddress(workChain, init);

  const packedMsg = beginCell()
    .store(
      storeMint({
        $$type: 'Mint',
        amount: tokenMaxSupply,
        receiver: userAddress,
      }),
    )
    .endCell();

  const StateInit = base64.fromByteArray(
    beginCell()
      .storeUint(0, 2)
      .storeMaybeRef(init.code)
      .storeMaybeRef(init.data)
      .storeUint(0, 1)
      .endCell()
      .toBoc(),
  );

  const Payload = base64.fromByteArray(packedMsg.toBoc());

  return {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    network,
    messages: [
      {
        address: jettonMaster.toString(),
        amount: toNano('0.25').toString(),
        stateInit: StateInit, // just for instance. Replace with your transaction initState or remove},{address: "EQDmnxDMhId6v1Ofg_h5KR5coWlFG6e86Ro3pc7Tq4CA0-Jn",amount: "60000000",//
        payload: Payload, // just for instance. Replace with your transaction payload or remove
      },
    ],
  };
}
