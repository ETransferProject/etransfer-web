import React, { useCallback, useState } from 'react';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  getMint,
  getMetadataPointerState,
  getTokenMetadata,
  TYPE_SIZE,
  LENGTH_SIZE,
  createMintToInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { configureAndSendCurrentTransaction } from 'utils/wallet/SOL';

const SolanaCreateToken = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  const mintTo = useCallback(
    async (mintKeypair: Keypair, associatedTokenAddress: PublicKey) => {
      if (!publicKey || !signTransaction) return;
      try {
        const instruction = createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAddress,
          publicKey,
          500000000, // TODO supply count
          [],
          TOKEN_2022_PROGRAM_ID,
        );

        const transaction = new Transaction().add(instruction);

        const signature = await configureAndSendCurrentTransaction(
          transaction,
          connection,
          publicKey,
          signTransaction,
          mintKeypair,
        );

        console.log('3 mintTo Transaction successful with signature:', signature);
        console.log('3 mintTo:', `https://solana.fm/tx/${signature}?cluster=devnet-solana`);
      } catch (error) {
        console.error('3 Error mint to:', error);
      }
    },
    [connection, publicKey, signTransaction],
  );

  const buildAssociateTokenAddress = useCallback(
    async (mintKeypair: Keypair) => {
      try {
        if (!publicKey || !signTransaction) return;

        const associatedTokenAddress = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          publicKey,
          false,
          TOKEN_2022_PROGRAM_ID,
        );
        console.log(
          '2 associatedTokenAddress',
          associatedTokenAddress,
          associatedTokenAddress.toBase58(),
        );

        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAddress,
            publicKey,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID,
          ),
        );
        console.log('2 transaction', transaction);
        const signature = await configureAndSendCurrentTransaction(
          transaction,
          connection,
          publicKey,
          signTransaction,
          mintKeypair,
        );
        console.log('2 signature ', signature);

        console.log(
          '2 buildAssociateTokenAddress Transaction successful with signature:',
          signature,
        );
        console.log(
          '2 buildAssociateTokenAddress:',
          `https://solana.fm/tx/${signature}?cluster=devnet-solana`,
        );

        await mintTo(mintKeypair, associatedTokenAddress);
      } catch (error) {
        console.error('2 Error creating associated token account:', error);
      }
    },
    [connection, mintTo, publicKey, signTransaction],
  );

  const performTransaction = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      alert('Wallet not connected');
      return;
    }
    console.log('1 publicKey', publicKey.toString());
    try {
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;
      console.log('1 mintPublicKey', mintPublicKey.toString());
      const decimals = 2; // TODO

      const metaData: TokenMetadata = {
        updateAuthority: publicKey,
        mint: mintPublicKey,
        name: 'TestDemoAU1',
        symbol: 'TestDemo AU1',
        uri: '', // TODO 'https://gpt.aelf.ai/static/favicon.png',
        additionalMetadata: [
          ['additional1', '11'],
          ['additional2', '22'],
        ],
      };

      const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
      const metadataLen = pack(metaData).length;
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataExtension + metadataLen,
      );

      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintPublicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      });

      const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
        mintPublicKey,
        publicKey,
        mintPublicKey,
        TOKEN_2022_PROGRAM_ID,
      );

      const initializeMintInstruction = createInitializeMintInstruction(
        mintPublicKey,
        decimals,
        publicKey,
        null,
        TOKEN_2022_PROGRAM_ID,
      );

      const initializeMetadataInstruction = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mintPublicKey,
        updateAuthority: publicKey,
        mint: mintPublicKey,
        mintAuthority: publicKey,
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
      });

      const updateFieldInstruction = createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mintPublicKey,
        updateAuthority: publicKey,
        field: metaData.additionalMetadata[0][0],
        value: metaData.additionalMetadata[0][1],
      });

      const updateFieldInstruction1 = createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mintPublicKey,
        updateAuthority: publicKey,
        field: metaData.additionalMetadata[1][0],
        value: metaData.additionalMetadata[1][1],
      });

      const transaction = new Transaction().add(
        createAccountInstruction,
        initializeMetadataPointerInstruction,
        initializeMintInstruction,
        initializeMetadataInstruction,
        updateFieldInstruction,
        updateFieldInstruction1,
      );
      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        publicKey,
        signTransaction,
        mintKeypair,
      );
      console.log('1 signature ', signature);
      setTransactionSignature(signature);

      const mintInfo = await getMint(connection, mintPublicKey, 'confirmed', TOKEN_2022_PROGRAM_ID);
      const metadataPointer = getMetadataPointerState(mintInfo);
      console.log('1 Metadata Pointer:', JSON.stringify(metadataPointer, null, 2));

      const fetchedMetadata = await getTokenMetadata(connection, mintPublicKey);
      setMetadata(fetchedMetadata);

      await buildAssociateTokenAddress(mintKeypair);
    } catch (error) {
      console.error('1 Transaction error:', error);
    }
  }, [buildAssociateTokenAddress, connection, publicKey, signTransaction]);

  return (
    <div>
      <h1>Solana Transaction with Phantom</h1>
      <button onClick={performTransaction}>Perform Transaction</button>
      {transactionSignature && (
        <p>
          Transaction Signature:{' '}
          <a
            href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer">
            {transactionSignature}
          </a>
        </p>
      )}
      {metadata && <pre>{JSON.stringify(metadata, null, 2)}</pre>}
    </div>
  );
};

export default SolanaCreateToken;
