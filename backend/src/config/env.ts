import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '4000',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  SOLANA_KEYPAIR_SECRET: process.env.SOLANA_KEYPAIR_SECRET || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Validate critical variables on startup
const warningKeys = [
  'ELEVENLABS_API_KEY',
  'SOLANA_KEYPAIR_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
] as const;

const missing = warningKeys.filter((key) => !env[key]);
if (!env.OPENROUTER_API_KEY && !env.GEMINI_API_KEY) {
  missing.push('OPENROUTER_API_KEY' as any);
}

if (missing.length > 0) {
  console.warn(
    `[WARNING] The following environment variables are missing: ${missing.join(', ')}.\n` +
    `Ensure you create a backend/.env file and fill these in. Routes requiring these integrations will return errors until configured.`
  );
}
