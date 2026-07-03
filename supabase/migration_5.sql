-- Run after migration_4.sql. Adds idea assignment + a handoff log so the
-- team can see who an idea was passed to and when ("sharon -> alex").

alter table ideas add column if not exists assigned_to text;

create table if not exists idea_handoffs (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  from_name text,
  to_name text not null,
  changed_by text not null,
  created_at timestamptz not null default now()
);
