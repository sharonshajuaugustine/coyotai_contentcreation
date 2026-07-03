-- Run after schema.sql. Adds columns needed for the P1 roadmap pass:
-- pin-to-top, edit attribution, and comment threading.

alter table ideas add column if not exists pinned boolean not null default false;
alter table ideas add column if not exists last_edited_by text;

alter table comments add column if not exists parent_id uuid references comments(id) on delete cascade;
alter table comments add column if not exists edited_at timestamptz;
