-- ============================================================
--  SeboTV – Nutzerverwaltung
--  Einmal im Supabase SQL-Editor ausführen.
--
--  Hier liegen die Nutzer, die der Admin (mueseb) anlegt.
--  Gespeichert werden NUR Salz und Prüfsumme – nie das Passwort.
-- ============================================================

create table if not exists public.sebotv_users (
  id           bigserial primary key,
  name         text not null,
  salt         text not null,
  hash         text not null,
  rechte       text default 'speichern',
  erstellt_von text,
  created_at   timestamptz not null default now()
);

-- Namen dürfen nur einmal vorkommen (Groß/Klein egal)
create unique index if not exists sebotv_users_name_idx
  on public.sebotv_users(lower(name));

alter table public.sebotv_users enable row level security;

drop policy if exists sebotv_users_all on public.sebotv_users;
create policy sebotv_users_all on public.sebotv_users
  for all to anon, authenticated using (true) with check (true);
