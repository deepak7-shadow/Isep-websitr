# ISEP deployed app: Supabase migration and setup

The deployed target is the repository root static SPA. Run this migration in
Supabase SQL Editor against the existing project before using registration,
member portfolios, or the admin content tabs. It is safe to rerun because
policies are dropped before they are recreated.

```sql
create extension if not exists pgcrypto;

alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users add column if not exists full_name text;
alter table public.admin_users add column if not exists description text default '';
alter table public.admin_users add column if not exists image_url text default '';
alter table public.admin_users add column if not exists is_main_admin boolean not null default false;
alter table public.thoughts add column if not exists author_id uuid references auth.users(id) on delete set null;
alter table public.thoughts add column if not exists profile_photo text default '';

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text,
  full_name text not null,
  slug text unique not null,
  photo_url text default '', branch text default '', year text default '',
  bio text default '', skills text[] default '{}', github text default '',
  linkedin text default '', portfolio text default '',
  role text not null default 'member',
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  is_approved boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.members add column if not exists email text;
alter table public.members add column if not exists role text not null default 'member';
alter table public.members add column if not exists approval_status text not null default 'pending';
alter table public.members add column if not exists is_approved boolean not null default false;
alter table public.members add column if not exists approved boolean not null default false;

create table if not exists public.member_projects (id uuid primary key default gen_random_uuid(), member_id uuid not null references public.members(id) on delete cascade, title text not null, description text default '', project_url text default '', image_url text default '', created_at timestamptz not null default now());
create table if not exists public.member_certificates (id uuid primary key default gen_random_uuid(), member_id uuid not null references public.members(id) on delete cascade, title text not null, issuer text default '', file_url text default '', created_at timestamptz not null default now());
create table if not exists public.member_achievements (id uuid primary key default gen_random_uuid(), member_id uuid not null references public.members(id) on delete cascade, title text not null, description text default '', proof_url text default '', created_at timestamptz not null default now());
create table if not exists public.member_activities (id uuid primary key default gen_random_uuid(), member_id uuid not null references public.members(id) on delete cascade, title text not null, description text default '', created_at timestamptz not null default now());
create table if not exists public.member_hackathons (id uuid primary key default gen_random_uuid(), member_id uuid not null references public.members(id) on delete cascade, title text not null, result text default '', description text default '', created_at timestamptz not null default now());

-- Shared admin-managed archive sections. `status` is pending until an admin publishes it.
do $$ declare _table text; begin
  foreach _table in array array['activities','memories','hackathons','mock_interviews','tcs_meetings'] loop
    execute format('create table if not exists public.%I (id uuid primary key default gen_random_uuid(), title text not null, description text default '''', event_date date, extra text default '''', image_url text default '''', status text not null default ''pending'', created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', _table);
  end loop;
end $$;

create or replace function public.is_approved_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users a where a.user_id = auth.uid() and a.is_approved = true and a.role in ('head','admin','mentor')); $$;

alter table public.members enable row level security;
alter table public.admin_users enable row level security;
drop policy if exists "approved heads are public" on public.admin_users;
create policy "approved heads are public" on public.admin_users for select using (role = 'head' and is_approved = true);
drop policy if exists "approved members are public" on public.members;
drop policy if exists "members update own profile" on public.members;
drop policy if exists "members view own registration" on public.members;
drop policy if exists "admins manage members" on public.members;
create policy "approved members are public" on public.members for select using (is_approved = true or approved = true or public.is_approved_admin() or auth.uid() = auth_user_id);
create policy "members view own registration" on public.members for select using (auth.uid() = auth_user_id);
create policy "members update own profile" on public.members for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id and role = 'member');
create policy "members register own row" on public.members for insert with check (auth.uid() = auth_user_id and role = 'member');
create policy "admins manage members" on public.members for all using (public.is_approved_admin()) with check (public.is_approved_admin());

do $$ declare t text; begin
  foreach t in array array['member_projects','member_certificates','member_achievements','member_activities','member_hackathons'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public portfolio records" on public.%I', t);
    execute format('drop policy if exists "members manage portfolio records" on public.%I', t);
    execute format('create policy "public portfolio records" on public.%I for select using (exists (select 1 from public.members m where m.id = member_id and (m.is_approved or m.approved)))', t);
    execute format('create policy "members manage portfolio records" on public.%I for all using (exists (select 1 from public.members m where m.id = member_id and m.auth_user_id = auth.uid())) with check (exists (select 1 from public.members m where m.id = member_id and m.auth_user_id = auth.uid()))', t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['activities','memories','hackathons','mock_interviews','tcs_meetings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "approved archive records are public" on public.%I', t);
    execute format('drop policy if exists "admins manage archive records" on public.%I', t);
    execute format('create policy "approved archive records are public" on public.%I for select using (status = ''approved'' or public.is_approved_admin())', t);
    execute format('create policy "admins manage archive records" on public.%I for all using (public.is_approved_admin()) with check (public.is_approved_admin())', t);
  end loop;
end $$;

drop policy if exists "thought authors edit own" on public.thoughts;
drop policy if exists "thought authors delete own" on public.thoughts;
create policy "thought authors edit own" on public.thoughts for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "thought authors delete own" on public.thoughts for delete using (author_id = auth.uid());
```

## Storage and seed/link checklist

Create a **public** Storage bucket named `archive-media`. Add Storage policies
that allow authenticated users to insert objects under their own
`auth.uid() || '/'` folder and approved admins to update/delete objects. The
browser uses only the public anon key; never put a service-role key in
`app.js`, Vercel, or client HTML.

Create/approve the two ISEP Head records after their Auth accounts exist:

```sql
update public.admin_users set role = 'mentor', is_main_admin = true, full_name = 'Ganesh Mani Bhaiya', is_approved = true
where lower(email) = lower('GANESH_AUTH_EMAIL');
update public.admin_users set role = 'mentor', is_main_admin = true, full_name = 'Amrutha Didi', is_approved = true
where lower(email) = lower('AMRUTHA_AUTH_EMAIL');
```

Do not invent member names. Link each of the 18 real Auth users by inserting or
updating `members.auth_user_id`, `full_name`, `email`, and a unique slug, then
set `approval_status = 'approved'`, `is_approved = true`, and `approved = true`
only after the ISEP Head verifies the record. New dashboard registrations
insert as pending and are approved from **Admin Portal → Member Records**.

The static app has no Vite build-time environment variables: the existing
Supabase URL and public anon key are read in `app.js`. Verify the anon key is
present in the deployed file or replace it with the project’s public anon key.
Never expose `SUPABASE_SERVICE_ROLE_KEY`.
