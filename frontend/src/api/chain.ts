import api from './client';

export interface ChainStatusResponse {
  status: 'connected' | 'disconnected' | 'error';
  network?: string;
  rpcUrl?: string;
  version?: string;
  absoluteSlot?: number;
  blockHeight?: number;
  message?: string;
}

export async function getChainStatus(): Promise<ChainStatusResponse> {
  return api.get<ChainStatusResponse>('/chain/status');
}
