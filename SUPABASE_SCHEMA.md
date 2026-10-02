# ISEP member feature schema

The deployed static app uses the existing Supabase project and `archive-media`
bucket. Run the following SQL in Supabase before using the member directory and
dashboard. The policies deliberately keep public profiles read-only while
allowing an authenticated member to update only their own row.

```sql
create extension if not exists pgcrypto;

alter table if exists public.thoughts add column if not exists author_id uuid references auth.users(id) on delete set null;
alter table if exists public.thoughts add column if not exists profile_photo text default '';

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  slug text unique not null,
  photo_url text default '',
  branch text default '',
  year text default '',
  bio text default '',
  skills text[] default '{}',
  github text default '',
  linkedin text default '',
  portfolio text default '',
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_projects (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  description text default '',
  project_url text default '',
  image_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.member_certificates (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  issuer text default '',
  file_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.member_achievements (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  description text default '',
  proof_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.member_activities (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  description text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.member_hackathons (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  result text default '',
  description text default '',
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;
create policy "approved members are public" on public.members for select using (approved = true);
create policy "members update own profile" on public.members for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

alter table public.member_projects enable row level security;
create policy "public projects" on public.member_projects for select using (
  exists (select 1 from public.members m where m.id = member_id and m.approved)
);

alter table public.member_certificates enable row level security;
create policy "public certificates" on public.member_certificates for select using (
  exists (select 1 from public.members m where m.id = member_id and m.approved)
);

alter table public.member_achievements enable row level security;
create policy "public achievements" on public.member_achievements for select using (
  exists (select 1 from public.members m where m.id = member_id and m.approved)
);

alter table public.member_activities enable row level security;
create policy "public activities" on public.member_activities for select using (
  exists (select 1 from public.members m where m.id = member_id and m.approved)
);

alter table public.member_hackathons enable row level security;
create policy "public hackathons" on public.member_hackathons for select using (
  exists (select 1 from public.members m where m.id = member_id and m.approved)
);
```

Create the `archive-media` bucket as public (the existing admin upload flow
already uses it). For production, add admin-only insert/update/delete policies
for the child tables and storage objects using the existing `admin_users`
approval check.
