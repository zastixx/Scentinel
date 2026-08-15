import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { env } from '../config/env';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function getKeypair(): Keypair {
  if (!env.SOLANA_KEYPAIR_SECRET) {
    throw new Error('Solana keypair secret is not configured. Please set SOLANA_KEYPAIR_SECRET.');
  }

  try {
    let secretKey: Uint8Array;
    if (env.SOLANA_KEYPAIR_SECRET.startsWith('[')) {
      secretKey = Uint8Array.from(JSON.parse(env.SOLANA_KEYPAIR_SECRET));
    } else {
      // Decode base58 secret key (standard Solana format for phantom export)
      const buffer = Buffer.from(env.SOLANA_KEYPAIR_SECRET, 'base64');
      // If it's not base64, maybe it's hex or base58. Let's try base58 using custom decoder or simple conversion.
      // Standard Node keypair format in Solana is a JSON array of 64 bytes. Let's assume JSON array is the main way.
      // If it's a raw base58 string, we can try to load it. For safety, let's parse JSON array or assume it's base64/hex.
      // A common fallback for web3.js is:
      secretKey = Uint8Array.from(Buffer.from(env.SOLANA_KEYPAIR_SECRET, 'hex'));
    }

    if (secretKey.length !== 64) {
      throw new Error(`Invalid secret key length: expected 64 bytes, got ${secretKey.length}`);
    }

    return Keypair.fromSecretKey(secretKey);
  } catch (error: any) {
    throw new Error(`Failed to parse SOLANA_KEYPAIR_SECRET: ${error.message}. It must be a valid JSON array of 64 integers (e.g. [1,2,3...]).`);
  }
}

/**
 * Connects to Solana, validates/funds the wallet, and writes match metadata to the Solana blockchain.
 */
export async function writeMatchToChain(
  matchId: string,
  sightingId: string,
  dogId: string,
  confidence: number
): Promise<{ txHash: string; explorerUrl: string }> {
  if (!env.SOLANA_RPC_URL) {
    throw new Error('Solana RPC URL is not configured. Please set SOLANA_RPC_URL.');
  }

  const connection = new Connection(env.SOLANA_RPC_URL, 'confirmed');
  const payer = getKeypair();

  console.log(`Writing match to Solana chain. Payer Address: ${payer.publicKey.toBase58()}`);

  // Request airdrop if balance is low on devnet
  try {
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Wallet Balance: ${balance / 1e9} SOL`);
    if (balance < 0.005 * 1e9) {
      console.log(`Balance is low. Requesting 0.1 SOL airdrop on devnet...`);
      const airdropSignature = await connection.requestAirdrop(payer.publicKey, 0.1 * 1e9);
      
      // Wait for airdrop confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: airdropSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      });
      console.log('Airdrop confirmed.');
    }
  } catch (airdropError: any) {
    console.warn(`Airdrop request failed (this is common if rate limited): ${airdropError.message}. Proceeding assuming wallet has funds.`);
  }

  // Create hash payload
  const timestamp = Date.now();
  const payload = {
    app: 'Scentinel',
    matchId,
    sightingId,
    dogId,
    confidence,
    timestamp
  };

  const memoData = JSON.stringify(payload);
  console.log('Memo Payload:', memoData);

  // Build Transaction with Memo instruction
  const transaction = new Transaction();
  
  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData, 'utf-8'),
    })
  );

  try {
    const txHash = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: 'confirmed' }
    );

    const explorerUrl = `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
    console.log(`Solana Transaction successful: ${txHash}`);

    return {
      txHash,
      explorerUrl
    };
  } catch (txError: any) {
    console.error('Solana transaction failed:', txError);
    if (txError.logs) {
      console.error('Transaction simulation logs:\n', txError.logs.join('\n'));
    }
    const logDetails = txError.logs ? ` Logs: [${txError.logs.join('\n')}]` : '';
    throw new Error(`Solana Transaction Write failed: ${txError.message}.${logDetails}`);
  }
}
