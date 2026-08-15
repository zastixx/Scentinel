import api from './client';

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

export interface RegisterDogPayload {
  name: string;
  photo: string;
  breed: string;
  size: string;
  homeArea: string;
  ownerContact: string;
}

export async function registerDog(payload: RegisterDogPayload): Promise<Dog> {
  return api.post<Dog>('/dogs', payload);
}

export async function getDog(id: string): Promise<Dog> {
  return api.get<Dog>(`/dogs/${id}`);
}

export async function getDogs(ownerId?: string): Promise<Dog[]> {
  const path = ownerId ? `/dogs?ownerId=${encodeURIComponent(ownerId)}` : '/dogs';
  return api.get<Dog[]>(path);
}
