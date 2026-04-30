-- Digital Pet File - Step 1 (Supabase/Postgres)
-- Stack choices for this implementation:
-- Frontend: React + Vite + React Router v6
-- Backend: Node.js + Express (API under /digital-file only)
-- Database & Auth: Supabase PostgreSQL + custom app JWT/session auth
-- Storage: Supabase Storage
-- Styling: Tailwind CSS

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('parent', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'pet_gender') then
    create type public.pet_gender as enum ('male', 'female');
  end if;

  if not exists (select 1 from pg_type where typname = 'medical_file_type') then
    create type public.medical_file_type as enum ('prescription', 'lab_report', 'media');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  role public.user_role not null,
  username varchar(100) not null unique,
  password_hash varchar(255) not null,
  parent_name varchar(150) not null,
  phone_number varchar(30) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users(id) on delete cascade,
  dog_name varchar(120) not null,
  breed varchar(120) not null,
  dob date not null,
  gender public.pet_gender not null,
  profile_photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  file_url text not null,
  file_name varchar(255) not null,
  file_type public.medical_file_type not null,
  uploaded_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_pets_parent_id on public.pets(parent_id);
create index if not exists idx_medical_records_pet_id on public.medical_records(pet_id);
create index if not exists idx_medical_records_uploaded_by on public.medical_records(uploaded_by);
create index if not exists idx_pets_created_at on public.pets(created_at desc);
create index if not exists idx_medical_records_created_at on public.medical_records(created_at desc);

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'user_id', '')::uuid
$$;

create or replace function public.current_app_user_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'role', '')
$$;

create or replace function public.enforce_admin_uploader()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.users u
    where u.id = new.uploaded_by
      and u.role = 'admin'
  ) then
    raise exception 'uploaded_by must reference an admin user';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_medical_records_admin_uploader on public.medical_records;
create trigger trg_medical_records_admin_uploader
before insert or update of uploaded_by on public.medical_records
for each row
execute function public.enforce_admin_uploader();

alter table public.users enable row level security;
alter table public.pets enable row level security;
alter table public.medical_records enable row level security;

drop policy if exists users_select_own_or_admin on public.users;
create policy users_select_own_or_admin
on public.users
for select
using (
  public.current_app_user_role() = 'admin'
  or id = public.current_app_user_id()
);

drop policy if exists users_insert_admin_only on public.users;
create policy users_insert_admin_only
on public.users
for insert
with check (public.current_app_user_role() = 'admin');

drop policy if exists users_update_own_or_admin on public.users;
create policy users_update_own_or_admin
on public.users
for update
using (
  public.current_app_user_role() = 'admin'
  or id = public.current_app_user_id()
)
with check (
  public.current_app_user_role() = 'admin'
  or id = public.current_app_user_id()
);

drop policy if exists users_delete_admin_only on public.users;
create policy users_delete_admin_only
on public.users
for delete
using (public.current_app_user_role() = 'admin');

drop policy if exists pets_select_owner_or_admin on public.pets;
create policy pets_select_owner_or_admin
on public.pets
for select
using (
  public.current_app_user_role() = 'admin'
  or parent_id = public.current_app_user_id()
);

drop policy if exists pets_insert_owner_or_admin on public.pets;
create policy pets_insert_owner_or_admin
on public.pets
for insert
with check (
  public.current_app_user_role() = 'admin'
  or parent_id = public.current_app_user_id()
);

drop policy if exists pets_update_owner_or_admin on public.pets;
create policy pets_update_owner_or_admin
on public.pets
for update
using (
  public.current_app_user_role() = 'admin'
  or parent_id = public.current_app_user_id()
)
with check (
  public.current_app_user_role() = 'admin'
  or parent_id = public.current_app_user_id()
);

drop policy if exists pets_delete_admin_only on public.pets;
create policy pets_delete_admin_only
on public.pets
for delete
using (public.current_app_user_role() = 'admin');

drop policy if exists medical_records_select_parent_or_admin on public.medical_records;
create policy medical_records_select_parent_or_admin
on public.medical_records
for select
using (
  public.current_app_user_role() = 'admin'
  or exists (
    select 1
    from public.pets p
    where p.id = medical_records.pet_id
      and p.parent_id = public.current_app_user_id()
  )
);

drop policy if exists medical_records_insert_admin_only on public.medical_records;
create policy medical_records_insert_admin_only
on public.medical_records
for insert
with check (
  public.current_app_user_role() = 'admin'
  and uploaded_by = public.current_app_user_id()
);

drop policy if exists medical_records_update_admin_only on public.medical_records;
create policy medical_records_update_admin_only
on public.medical_records
for update
using (public.current_app_user_role() = 'admin')
with check (
  public.current_app_user_role() = 'admin'
  and uploaded_by = public.current_app_user_id()
);

drop policy if exists medical_records_delete_admin_only on public.medical_records;
create policy medical_records_delete_admin_only
on public.medical_records
for delete
using (public.current_app_user_role() = 'admin');
