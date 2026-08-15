-- Supabase Database Schema for Scentinel

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Dogs Table
create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  photo_url text not null,
  breed text not null,
  size text not null,
  home_area text not null,
  owner_contact text not null,
  status text not null default 'active' check (status in ('active', 'lost'))
);

-- Alerts Table (Lost reports)
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references public.dogs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_location text not null,
  last_seen_time timestamp with time zone not null,
  notes text,
  alert_text text not null,
  audio_url text
);

-- Sightings Table (Anonymous uploads)
create table if not exists public.sightings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  photo_url text not null,
  location text not null,
  notes text
);

-- Matches Table
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sighting_id uuid references public.sightings(id) on delete cascade not null,
  dog_id uuid references public.dogs(id) on delete cascade not null,
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  reasoning text not null,
  confirmed boolean not null default false,
  tx_hash text,
  explorer_url text
);

-- Disable Row Level Security (RLS) for testing or enable public access
alter table public.dogs disable row level security;
alter table public.alerts disable row level security;
alter table public.sightings disable row level security;
alter table public.matches disable row level security;

-- Initialize Storage Buckets
insert into storage.buckets (id, name, public)
values 
  ('dog-photos', 'dog-photos', true),
  ('sighting-photos', 'sighting-photos', true),
  ('voice-alerts', 'voice-alerts', true)
on conflict (id) do nothing;

-- Set up Storage Policies to allow public read and write access
drop policy if exists "Allow public uploads to dog-photos" on storage.objects;
drop policy if exists "Allow public uploads to sighting-photos" on storage.objects;
drop policy if exists "Allow public uploads to voice-alerts" on storage.objects;
drop policy if exists "Allow public read from dog-photos" on storage.objects;
drop policy if exists "Allow public read from sighting-photos" on storage.objects;
drop policy if exists "Allow public read from voice-alerts" on storage.objects;

-- Allow anyone to read files from public buckets
create policy "Allow public read from dog-photos" 
on storage.objects for select 
to public 
using (bucket_id = 'dog-photos');

create policy "Allow public read from sighting-photos" 
on storage.objects for select 
to public 
using (bucket_id = 'sighting-photos');

create policy "Allow public read from voice-alerts" 
on storage.objects for select 
to public 
using (bucket_id = 'voice-alerts');

-- Allow public anonymous uploads to buckets
create policy "Allow public uploads to dog-photos" 
on storage.objects for insert 
to public 
with check (bucket_id = 'dog-photos');

create policy "Allow public uploads to sighting-photos" 
on storage.objects for insert 
to public 
with check (bucket_id = 'sighting-photos');

create policy "Allow public uploads to voice-alerts" 
on storage.objects for insert 
to public 
with check (bucket_id = 'voice-alerts');

