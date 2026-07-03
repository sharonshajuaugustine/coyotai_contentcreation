-- Run after migration_2.sql. Adds columns for the P2 roadmap pass:
-- manual tile-size override, comment reactions, comment resolve flag.

alter table ideas add column if not exists size_override text; -- 'small' | 'large' | null

alter table comments add column if not exists reactions jsonb not null default '{}'::jsonb;
alter table comments add column if not exists resolved boolean not null default false;
