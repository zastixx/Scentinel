import api from './client';
import type { Dog } from './dogs';

export interface Sighting {
  id: string;
  created_at: string;
  photo_url: string;
  location: string;
  notes?: string;
}

export interface Match {
  id: string;
  created_at: string;
  sighting_id: string;
  dog_id: string;
  confidence: number;
  reasoning: string;
  confirmed: boolean;
  tx_hash?: string;
  explorer_url?: string;
  dog?: Dog;
  sighting?: Sighting;
}

export interface ReportSightingPayload {
  photo: string;
  location: string;
  notes?: string;
}

export interface SightingResponse {
  sightingId: string;
  matches: Match[];
}

export interface ConfirmMatchResponse {
  txHash: string;
  explorerUrl: string;
  match: Match;
}

export async function reportSighting(payload: ReportSightingPayload): Promise<SightingResponse> {
  return api.post<SightingResponse>('/sightings', payload);
}

export async function confirmMatch(matchId: string): Promise<ConfirmMatchResponse> {
  return api.post<ConfirmMatchResponse>(`/matches/${matchId}/confirm`);
}

export async function getMatch(matchId: string): Promise<Match> {
  return api.get<Match>(`/matches/${matchId}`);
}
