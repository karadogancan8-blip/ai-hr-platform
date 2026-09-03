-- Nexus HR: Auth + multi-tenant
-- Supabase SQL Editor'de çalıştırın.

create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete restrict,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee text not null,
  department text not null,
  type text not null check (type in ('yillik', 'mazeret', 'hastalik', 'ucretsiz')),
  start_date date not null,
  end_date date not null,
  days integer,
  reason text not null,
  status text not null default 'beklemede' check (status in ('beklemede', 'onaylandi', 'reddedildi')),
  created_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_name text not null,
  match_score integer not null check (match_score >= 0 and match_score <= 100),
  summary text,
  analysis_summary text,
  role text,
  skills text[] not null default '{}',
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.leave_requests add column if not exists company_id uuid references public.companies (id) on delete cascade;
alter table public.resumes add column if not exists company_id uuid references public.companies (id) on delete cascade;

alter table public.companies add column if not exists plan_type text not null default 'free';
alter table public.companies add column if not exists subscription_status text not null default 'free';

alter table public.resumes add column if not exists interview_score integer;
alter table public.resumes add column if not exists interview_notes text;

create index if not exists leave_requests_company_id_idx on public.leave_requests (company_id);
create index if not exists resumes_company_id_idx on public.resumes (company_id);
create index if not exists profiles_company_id_idx on public.profiles (company_id);

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
  company_name text;
begin
  company_name := nullif(trim(coalesce(new.raw_user_meta_data->>'company_name', '')), '');
  if company_name is null then
    company_name := 'Yeni Şirket';
  end if;

  insert into public.companies (name, plan_type, subscription_status)
  values (company_name, 'free', 'free')
  returning id into new_company_id;

  insert into public.profiles (id, company_id, email)
  values (new.id, new_company_id, new.email)
  on conflict (id) do update
    set company_id = excluded.company_id,
        email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.leave_requests enable row level security;
alter table public.resumes enable row level security;

grant usage on schema public to anon, authenticated;
grant all on table public.companies to authenticated, service_role;
grant all on table public.profiles to authenticated, service_role;
grant all on table public.leave_requests to authenticated, service_role;
grant all on table public.resumes to authenticated, service_role;

drop policy if exists "leave_requests_anon_all" on public.leave_requests;
drop policy if exists "resumes_anon_all" on public.resumes;
drop policy if exists "companies_select_own" on public.companies;
drop policy if exists "companies_insert_auth" on public.companies;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "companies_update_own" on public.companies;
drop policy if exists "leave_requests_company" on public.leave_requests;
drop policy if exists "resumes_company" on public.resumes;

create policy "companies_select_own"
  on public.companies for select
  to authenticated
  using (id = public.current_company_id());

create policy "companies_insert_auth"
  on public.companies for insert
  to authenticated
  with check (true);

create policy "companies_update_own"
  on public.companies for update
  to authenticated
  using (id = public.current_company_id())
  with check (id = public.current_company_id());

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "leave_requests_company"
  on public.leave_requests for all
  to authenticated
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

create policy "resumes_company"
  on public.resumes for all
  to authenticated
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());
