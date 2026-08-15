export interface Dog {
  id: string;
  created_at: string;
  name: string;
  photo_url: string;
  breed: string;
  size: string;
  home_area: string;
  owner_contact: string;
  status: 'active' | 'lost';
}

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
