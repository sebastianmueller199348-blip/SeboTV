-- ============================================================
--  SeboTV – Sammlung: private Listen mit Freigabe
--  Einmal im Supabase SQL-Editor ausführen.
-- ============================================================

-- Freigabe-Liste: Namen, die die Liste ebenfalls laden dürfen
alter table public.sebotv_saved_playlists
  add column if not exists freigabe jsonb not null default '[]'::jsonb;

-- Besitzer-Spalte sicherstellen (falls noch nicht vorhanden)
alter table public.sebotv_saved_playlists
  add column if not exists owner text default 'Gast';

-- Kennung sicherstellen
alter table public.sebotv_saved_playlists
  add column if not exists kennung text;

-- Suche nach Besitzer beschleunigen
create index if not exists sebotv_saved_owner_idx
  on public.sebotv_saved_playlists(owner);
