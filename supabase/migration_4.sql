-- Run after migration_3.sql. Adds "series" (a project/collection that
-- groups multiple related video ideas together, e.g. "AI Myths series").

create table if not exists series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  color text not null default 'pale-sky', -- one of the theme swatch keys, see src/lib/palette.ts
  created_by text not null,
  created_at timestamptz not null default now()
);

alter table ideas add column if not exists series_id uuid references series(id) on delete set null;
