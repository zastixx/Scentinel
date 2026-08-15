import { Router, Request, Response, NextFunction } from 'express';
import { Connection } from '@solana/web3.js';
import { env } from '../config/env';

const router = Router();

// GET /chain/status - Check Solana network status and configuration
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.SOLANA_RPC_URL) {
      res.status(503).json({
        status: 'disconnected',
        error: 'Solana RPC URL not configured'
      });
      return;
    }

    const connection = new Connection(env.SOLANA_RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    const epochInfo = await connection.getEpochInfo();

    res.json({
      status: 'connected',
      network: 'devnet',
      rpcUrl: env.SOLANA_RPC_URL,
      version: version['solana-core'],
      absoluteSlot: epochInfo.absoluteSlot,
      blockHeight: epochInfo.blockHeight
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: `Failed to connect to Solana: ${error.message}`
    });
  }
});

export default router;
