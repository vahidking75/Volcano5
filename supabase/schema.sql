-- Volcano Virtuoso schema (minimal)

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists prompt_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade,
  prompt text not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;
alter table prompt_versions enable row level security;

create policy if not exists "user projects only"
on projects for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "user prompt versions"
on prompt_versions for all
using (
  auth.uid() = (
    select user_id from projects where id = project_id
  )
);
