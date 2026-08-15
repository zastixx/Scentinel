import api from './client';
import type { Dog } from './dogs';

export interface Alert {
  id: string;
  dog_id: string;
  created_at: string;
  last_seen_location: string;
  last_seen_time: string;
  notes?: string;
  alert_text: string;
  audio_url?: string;
  dog?: Dog;
}

export interface ReportLostPayload {
  lastSeenLocation: string;
  lastSeenTime: string;
  notes: string;
}

export interface ReportLostResponse {
  alertId: string;
  text: string;
  audioUrl: string | null;
}

export async function reportLost(dogId: string, payload: ReportLostPayload): Promise<ReportLostResponse> {
  return api.post<ReportLostResponse>(`/dogs/${dogId}/lost`, payload);
}

export async function getAlert(id: string): Promise<Alert> {
  return api.get<Alert>(`/alerts/${id}`);
}

export async function getActiveAlerts(): Promise<Alert[]> {
  return api.get<Alert[]>('/alerts');
}
