do $$
begin
  if to_regclass('public."User_data"') is not null
    and to_regclass('public.user_data') is null then
    alter table public."User_data" rename to user_data;
  end if;

  if to_regclass('public."Reported_data"') is not null
    and to_regclass('public.reported_data') is null then
    alter table public."Reported_data" rename to reported_data;
  end if;
end
$$;

create table if not exists public.user_data (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  email text,
  organisation text,
  role text,
  created_at timestamptz not null default now()
);

create table if not exists public.reported_data (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  status text default 'open',
  location_text text,
  latitude double precision,
  longitude double precision,
  media_url text,
  user_id uuid references auth.users(id) on delete set null,
  reporter_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;
alter table public.reported_data enable row level security;

revoke all on table public.user_data from anon, authenticated;
revoke all on table public.reported_data from anon;
grant select on table public.user_data to authenticated;
grant select, insert on table public.reported_data to authenticated;
grant all on table public.user_data, public.reported_data to service_role;

drop policy if exists "Users can view their own user data" on public.user_data;
create policy "Users can view their own user data"
  on public.user_data for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own reports" on public.reported_data;
create policy "Users can insert their own reports"
  on public.reported_data for insert to authenticated
  with check (auth.uid() = user_id and auth.uid() = reporter_id);

drop policy if exists "Users can view their own reports" on public.reported_data;
create policy "Users can view their own reports"
  on public.reported_data for select to authenticated
  using (auth.uid() = user_id or auth.uid() = reporter_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_role text := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'citizen');
begin
  insert into public.profiles (id, full_name, organisation)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'organisation')
  on conflict (id) do update set
    full_name = excluded.full_name,
    organisation = excluded.organisation;

  insert into public.user_roles (user_id, role)
  values (new.id, signup_role::public.app_role)
  on conflict (user_id, role) do nothing;

  insert into public.user_data (id, user_id, full_name, email, organisation, role)
  values (
    new.id,
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'organisation',
    signup_role
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    organisation = excluded.organisation,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists update_reported_data_updated_at on public.reported_data;
create trigger update_reported_data_updated_at
  before update on public.reported_data
  for each row execute function public.update_updated_at_column();