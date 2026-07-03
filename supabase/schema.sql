-- Coyot AI Idea Pool schema. Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  submitted_by text not null,
  title text not null,
  description text not null default '',
  format text, -- format tag, e.g. 'myth-bust', 'story-arc', 'ai-vs-human', 'ai-can-do-this', '60-seconds'
  status text not null default 'pool', -- pool | in_progress | done | archived
  images text[] not null default '{}', -- storage URLs
  weight numeric not null default 1, -- bento sizing score, recomputed on write
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  author text not null,
  body text not null default '',
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists performance_logs (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  logged_by text not null,
  logged_at timestamptz not null default now(),
  views integer,
  likes integer,
  saves integer,
  comments_count integer,
  note text
);

-- Storage bucket for idea/comment images. Create via Supabase dashboard:
-- Storage -> New bucket -> name: "idea-images" -> Public bucket: ON

-- Row Level Security: kept OFF (no per-user auth model — app enforces the
-- shared password at the edge via middleware). If you want DB-level
-- protection too, enable RLS and add a policy that checks a request header.
