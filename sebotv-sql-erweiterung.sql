-- ============================================================
--  SeboTV – Ergänzung: gespeicherte Listen und Admin-Zugang
--  Einmal im Supabase SQL-Editor ausführen.
-- ============================================================

-- 1) Dauerhaft gespeicherte Playlists -------------------------
create table if not exists public.sebotv_saved_playlists (
  id          bigserial primary key,
  name        text not null,
  items       jsonb not null default '[]'::jsonb,
  owner       text default 'Gast',
  created_at  timestamptz not null default now()
);
create index if not exists sebotv_saved_idx
  on public.sebotv_saved_playlists(created_at desc);

alter table public.sebotv_saved_playlists enable row level security;
drop policy if exists sebotv_saved_all on public.sebotv_saved_playlists;
create policy sebotv_saved_all on public.sebotv_saved_playlists
  for all to anon, authenticated using (true) with check (true);


-- 2) Admin-Zugang (genau ein Benutzer) ------------------------
--    Gespeichert werden NUR Salz und Prüfsumme, nie das Passwort.
create table if not exists public.sebotv_admin (
  id          integer primary key default 1,
  name        text not null,
  salt        text not null,
  hash        text not null,
  created_at  timestamptz not null default now()
);

-- Nur eine Zeile zulassen: die id ist auf 1 festgelegt.
alter table public.sebotv_admin enable row level security;
drop policy if exists sebotv_admin_all on public.sebotv_admin;
create policy sebotv_admin_all on public.sebotv_admin
  for all to anon, authenticated using (true) with check (true);


-- 3) Realtime für die gespeicherten Listen --------------------
alter publication supabase_realtime add table public.sebotv_saved_playlists;

-- 4) Falls die Spalte add_id in sebotv_playlist noch fehlt ----
alter table public.sebotv_playlist
  add column if not exists add_id text;
