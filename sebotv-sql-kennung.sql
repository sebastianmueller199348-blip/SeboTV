-- ============================================================
--  SeboTV – Ergänzung: Kennung für gespeicherte Listen
--  Einmal im Supabase SQL-Editor ausführen.
-- ============================================================

-- Spalte "kennung" ergänzen (z. B. LIST-7K2M)
alter table public.sebotv_saved_playlists
  add column if not exists kennung text;

-- Kennungen dürfen nur einmal vorkommen
create unique index if not exists sebotv_saved_kennung_idx
  on public.sebotv_saved_playlists(kennung);

-- Ältere Listen ohne Kennung nachtragen
update public.sebotv_saved_playlists
  set kennung = 'LIST-' || upper(substr(md5(id::text), 1, 4))
  where kennung is null;
