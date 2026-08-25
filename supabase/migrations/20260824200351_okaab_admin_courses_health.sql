create schema if not exists private;
revoke all on schema private from public;

create type public.app_role as enum ('super_admin', 'admin', 'team_leader', 'employee');
create type public.task_status as enum ('scheduled', 'in_progress', 'blocked', 'completed', 'cancelled');
create type public.health_status as enum ('healthy', 'degraded', 'down', 'unknown');

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  color text not null default '#E8A33D' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  avatar_url text,
  role public.app_role not null,
  team_id uuid references public.teams(id) on delete set null,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint super_admin_email check (
    role <> 'super_admin' or lower(email) = 'okaab@okaab.org'
  ),
  constraint team_required_for_staff check (
    role in ('super_admin', 'admin') or team_id is not null
  )
);

create unique index profiles_single_super_admin_idx
  on public.profiles ((role)) where role = 'super_admin';
create index profiles_team_role_idx on public.profiles (team_id, role) where is_active;

create table public.pending_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.app_role not null check (role <> 'super_admin'),
  team_id uuid references public.teams(id) on delete set null,
  invited_by uuid not null references public.profiles(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint invited_staff_team_required check (
    role = 'admin' or team_id is not null
  )
);
create unique index pending_invites_open_email_idx
  on public.pending_invites (lower(email)) where accepted_at is null;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 2 and 180),
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.task_status not null default 'scheduled',
  issuer_id uuid not null references public.profiles(id) on delete restrict,
  issuer_role_snapshot public.app_role not null,
  issuer_rank smallint not null check (issuer_rank between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_task_period check (ends_at > starts_at),
  constraint valid_task_issuer check (issuer_role_snapshot <> 'employee')
);
create index tasks_team_start_idx on public.tasks (team_id, starts_at, issuer_rank desc);
create index tasks_daily_queue_idx on public.tasks (starts_at, issuer_rank desc, created_at)
  where status not in ('completed', 'cancelled');

create table public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.task_status not null default 'scheduled',
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (task_id, profile_id)
);
create index task_assignees_profile_status_idx
  on public.task_assignees (profile_id, status, task_id);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index task_comments_task_created_idx on public.task_comments (task_id, created_at);

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null check (size_bytes between 0 and 52428800),
  created_at timestamptz not null default now()
);

create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 120),
  description text not null default '',
  cover_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 140),
  description text not null default '',
  cover_url text,
  level text not null default 'all',
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roadmap_courses (
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (roadmap_id, course_id)
);
create index roadmap_courses_course_idx on public.roadmap_courses (course_id, sort_order);

create table public.course_playlists (
  id uuid primary key default gen_random_uuid(),
  youtube_playlist_id text not null unique,
  course_id uuid unique references public.courses(id) on delete set null,
  title text not null,
  thumbnail_url text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);
create index lessons_course_order_idx on public.lessons (course_id, sort_order, created_at);

create table public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text not null unique,
  playlist_id uuid references public.course_playlists(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  title text not null,
  description text not null default '',
  thumbnail_url text,
  published_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  sort_order integer not null default 0,
  is_available boolean not null default true,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index youtube_videos_course_order_idx
  on public.youtube_videos (course_id, sort_order, published_at desc) where is_available;
create index youtube_videos_latest_unclassified_idx
  on public.youtube_videos (published_at desc) where course_id is null and is_available;

create table public.slide_decks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  video_id uuid references public.youtube_videos(id) on delete set null,
  title text not null check (char_length(trim(title)) between 2 and 180),
  storage_root text not null unique,
  entry_path text not null default 'index.html',
  archive_name text,
  archive_size_bytes bigint check (archive_size_bytes is null or archive_size_bytes between 0 and 104857600),
  file_count integer not null default 1 check (file_count between 1 and 2000),
  allow_download boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index slide_decks_lesson_order_idx on public.slide_decks (lesson_id, sort_order);

create table public.youtube_sync_state (
  channel_id text primary key,
  channel_title text,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_webhook_at timestamptz,
  last_error_code text,
  last_error_summary text,
  consecutive_failures integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.health_services (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9_]+$'),
  name_ar text not null,
  description_ar text not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.health_checks (
  id bigint generated by default as identity primary key,
  service_id uuid not null references public.health_services(id) on delete cascade,
  status public.health_status not null,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  status_code integer,
  summary_ar text not null,
  impact_ar text not null default '',
  likely_cause_ar text not null default '',
  action_ar text not null default '',
  safe_details jsonb not null default '{}'::jsonb,
  deployment_version text,
  checked_at timestamptz not null default now()
);
create index health_checks_service_time_idx on public.health_checks (service_id, checked_at desc);
create index health_checks_failure_time_idx on public.health_checks (checked_at desc)
  where status <> 'healthy';

create table public.health_daily_summaries (
  service_id uuid not null references public.health_services(id) on delete cascade,
  day date not null,
  total_checks integer not null,
  healthy_checks integer not null,
  degraded_checks integer not null,
  down_checks integer not null,
  unknown_checks integer not null,
  average_latency_ms integer,
  maximum_latency_ms integer,
  created_at timestamptz not null default now(),
  primary key (service_id, day)
);
create index health_daily_summaries_day_idx
  on public.health_daily_summaries (day desc, service_id);

create table public.health_incidents (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.health_services(id) on delete restrict,
  status public.health_status not null,
  title_ar text not null,
  summary_ar text not null,
  impact_ar text not null,
  likely_cause_ar text not null,
  action_ar text not null,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  last_alerted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index health_incidents_open_service_idx
  on public.health_incidents (service_id) where resolved_at is null;
create index health_incidents_started_idx on public.health_incidents (started_at desc);

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  incident_id uuid references public.health_incidents(id) on delete cascade,
  title_ar text not null,
  body_ar text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index admin_notifications_recipient_idx
  on public.admin_notifications (recipient_id, created_at desc);

create table public.audit_log (
  id bigint generated by default as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary_ar text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_idx on public.audit_log (created_at desc, id desc);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc);

create function private.rollup_health_retention()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.health_daily_summaries (
    service_id, day, total_checks, healthy_checks, degraded_checks,
    down_checks, unknown_checks, average_latency_ms, maximum_latency_ms
  )
  select
    service_id,
    checked_at::date,
    count(*)::integer,
    count(*) filter (where status = 'healthy')::integer,
    count(*) filter (where status = 'degraded')::integer,
    count(*) filter (where status = 'down')::integer,
    count(*) filter (where status = 'unknown')::integer,
    round(avg(latency_ms))::integer,
    max(latency_ms)
  from public.health_checks
  where checked_at < now() - interval '90 days'
  group by service_id, checked_at::date
  on conflict (service_id, day) do update
  set total_checks = excluded.total_checks,
      healthy_checks = excluded.healthy_checks,
      degraded_checks = excluded.degraded_checks,
      down_checks = excluded.down_checks,
      unknown_checks = excluded.unknown_checks,
      average_latency_ms = excluded.average_latency_ms,
      maximum_latency_ms = excluded.maximum_latency_ms;

  delete from public.health_checks where checked_at < now() - interval '90 days';
end;
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'teams', 'profiles', 'tasks', 'task_assignees', 'task_comments',
    'roadmaps', 'courses', 'course_playlists', 'lessons', 'youtube_videos',
    'slide_decks', 'youtube_sync_state', 'health_services', 'health_incidents'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at', table_name
    );
  end loop;
end;
$$;

create function private.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active
$$;

create function private.current_team_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.team_id
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role in ('super_admin', 'admin')
     from public.profiles p
     where p.id = (select auth.uid()) and p.is_active),
    false
  )
$$;

create function private.can_read_task(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when (select auth.uid()) is null then false
    when exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.is_active
        and p.role in ('super_admin', 'admin')
    ) then true
    when exists (
      select 1
      from public.profiles p
      join public.tasks t on t.team_id = p.team_id
      where p.id = (select auth.uid()) and p.is_active
        and p.role = 'team_leader' and t.id = target_task_id
    ) then true
    else exists (
      select 1 from public.task_assignees a
      where a.task_id = target_task_id and a.profile_id = (select auth.uid())
    )
  end
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pending public.pending_invites%rowtype;
  normalized_email text := lower(coalesce(new.email, ''));
begin
  if normalized_email = 'okaab@okaab.org' then
    insert into public.profiles (id, email, display_name, role, is_active)
    values (
      new.id,
      normalized_email,
      coalesce(new.raw_user_meta_data ->> 'full_name', 'Okaab Super Admin'),
      'super_admin',
      true
    )
    on conflict (id) do nothing;
    return new;
  end if;

  select * into pending
  from public.pending_invites
  where lower(email) = normalized_email
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if pending.id is not null then
    insert into public.profiles (id, email, display_name, role, team_id, is_active)
    values (
      new.id,
      normalized_email,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(normalized_email, '@', 1)),
      pending.role,
      pending.team_id,
      true
    )
    on conflict (id) do nothing;

    update public.pending_invites set accepted_at = now() where id = pending.id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- The project may already contain the fixed owner account before this migration.
-- Backfill it so the bootstrap rule works for both existing and future users.
insert into public.profiles (id, email, display_name, role, is_active)
select
  id,
  lower(email),
  coalesce(raw_user_meta_data ->> 'full_name', 'Okaab Super Admin'),
  'super_admin'::public.app_role,
  true
from auth.users
where lower(email) = 'okaab@okaab.org'
on conflict (id) do update
set email = excluded.email,
    display_name = excluded.display_name,
    role = 'super_admin',
    is_active = true,
    updated_at = now();

create function private.protect_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and old.role = 'super_admin' then
    raise exception 'The primary super admin cannot be deleted';
  end if;
  if tg_op = 'UPDATE' and old.role = 'super_admin' and (
    new.role <> 'super_admin' or lower(new.email) <> 'okaab@okaab.org' or not new.is_active
  ) then
    raise exception 'The primary super admin cannot be demoted or deactivated';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger profiles_protect_super_admin
  before update or delete on public.profiles
  for each row execute function private.protect_super_admin();

create function private.set_task_issuer_priority()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  issuer_role public.app_role;
begin
  select p.role into issuer_role
  from public.profiles p
  where p.id = new.issuer_id and p.is_active;

  if issuer_role not in ('super_admin', 'admin', 'team_leader') then
    raise exception 'Only managers can create tasks';
  end if;

  new.issuer_role_snapshot = issuer_role;
  new.issuer_rank = case issuer_role
    when 'super_admin' then 3
    when 'admin' then 2
    else 1
  end;
  return new;
end;
$$;

create trigger tasks_set_issuer_priority
  before insert on public.tasks
  for each row execute function private.set_task_issuer_priority();

create function private.keep_task_issuer_priority()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.issuer_id = old.issuer_id;
  new.issuer_role_snapshot = old.issuer_role_snapshot;
  new.issuer_rank = old.issuer_rank;
  return new;
end;
$$;

create trigger tasks_keep_issuer_priority
  before update on public.tasks
  for each row execute function private.keep_task_issuer_priority();

create function private.protect_assignment_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  editor_role public.app_role;
begin
  select p.role into editor_role
  from public.profiles p
  where p.id = (select auth.uid()) and p.is_active;

  if editor_role = 'employee' then
    new.task_id = old.task_id;
    new.profile_id = old.profile_id;
    new.assigned_by = old.assigned_by;
    new.assigned_at = old.assigned_at;
  end if;
  return new;
end;
$$;

create trigger task_assignees_protect_identity
  before update on public.task_assignees
  for each row execute function private.protect_assignment_identity();

grant usage on schema private to anon, authenticated;
revoke all on all functions in schema private from public;
grant execute on function private.current_role(), private.current_team_id(), private.is_admin(), private.can_read_task(uuid)
  to authenticated;
grant execute on function private.is_admin() to anon;

alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.pending_invites enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.roadmaps enable row level security;
alter table public.courses enable row level security;
alter table public.roadmap_courses enable row level security;
alter table public.course_playlists enable row level security;
alter table public.lessons enable row level security;
alter table public.youtube_videos enable row level security;
alter table public.slide_decks enable row level security;
alter table public.youtube_sync_state enable row level security;
alter table public.health_services enable row level security;
alter table public.health_checks enable row level security;
alter table public.health_daily_summaries enable row level security;
alter table public.health_incidents enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.audit_log enable row level security;

revoke all on public.teams, public.profiles, public.pending_invites, public.tasks,
  public.task_assignees, public.task_comments, public.task_attachments, public.roadmaps,
  public.courses, public.roadmap_courses, public.course_playlists, public.lessons,
  public.youtube_videos, public.slide_decks, public.youtube_sync_state,
  public.health_services, public.health_checks, public.health_daily_summaries,
  public.health_incidents,
  public.admin_notifications, public.audit_log from anon, authenticated;

grant select on public.roadmaps, public.courses, public.roadmap_courses, public.lessons,
  public.youtube_videos, public.slide_decks to anon;
grant select on public.teams, public.profiles, public.pending_invites, public.tasks,
  public.task_assignees, public.task_comments, public.task_attachments, public.roadmaps,
  public.courses, public.roadmap_courses, public.course_playlists, public.lessons,
  public.youtube_videos, public.slide_decks, public.youtube_sync_state,
  public.health_services, public.health_checks, public.health_daily_summaries,
  public.health_incidents,
  public.admin_notifications, public.audit_log to authenticated;
grant insert, update, delete on public.teams, public.tasks, public.task_assignees,
  public.task_comments, public.task_attachments, public.roadmaps, public.courses,
  public.roadmap_courses, public.course_playlists, public.lessons, public.youtube_videos,
  public.slide_decks to authenticated;
grant update, delete on public.profiles to authenticated;
grant update (status) on public.task_assignees to authenticated;

create policy teams_read on public.teams for select to authenticated
using (
  private.is_admin()
  or id = private.current_team_id()
);
create policy teams_admin_insert on public.teams for insert to authenticated
with check (private.is_admin());
create policy teams_admin_update on public.teams for update to authenticated
using (private.is_admin()) with check (private.is_admin());
create policy teams_admin_delete on public.teams for delete to authenticated
using (private.current_role() = 'super_admin');

create policy profiles_read on public.profiles for select to authenticated
using (
  private.is_admin()
  or id = (select auth.uid())
  or (private.current_role() = 'team_leader' and team_id = private.current_team_id())
);
create policy profiles_super_update on public.profiles for update to authenticated
using (private.current_role() = 'super_admin')
with check (private.current_role() = 'super_admin');
create policy profiles_admin_update_staff on public.profiles for update to authenticated
using (private.current_role() = 'admin' and role in ('team_leader', 'employee'))
with check (private.current_role() = 'admin' and role in ('team_leader', 'employee'));
create policy profiles_super_delete on public.profiles for delete to authenticated
using (private.current_role() = 'super_admin' and role <> 'super_admin');

create policy pending_invites_admin_read on public.pending_invites for select to authenticated
using (private.is_admin());

create policy tasks_read on public.tasks for select to authenticated
using (private.can_read_task(id));
create policy tasks_manager_insert on public.tasks for insert to authenticated
with check (
  issuer_id = (select auth.uid())
  and (
    private.is_admin()
    or (private.current_role() = 'team_leader' and team_id = private.current_team_id())
  )
);
create policy tasks_manager_update on public.tasks for update to authenticated
using (
  private.is_admin()
  or (private.current_role() = 'team_leader' and team_id = private.current_team_id())
)
with check (
  private.is_admin()
  or (private.current_role() = 'team_leader' and team_id = private.current_team_id())
);
create policy tasks_manager_delete on public.tasks for delete to authenticated
using (
  private.is_admin()
  or (private.current_role() = 'team_leader' and team_id = private.current_team_id())
);

create policy task_assignees_read on public.task_assignees for select to authenticated
using (private.can_read_task(task_id));
create policy task_assignees_manager_insert on public.task_assignees for insert to authenticated
with check (
  private.is_admin()
  or (
    private.current_role() = 'team_leader'
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.team_id = private.current_team_id() and p.is_active
    )
    and exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id = private.current_team_id()
    )
  )
);
create policy task_assignees_employee_status on public.task_assignees for update to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_admin()
  or private.current_role() = 'team_leader'
)
with check (
  profile_id = (select auth.uid())
  or private.is_admin()
  or private.current_role() = 'team_leader'
);
create policy task_assignees_manager_delete on public.task_assignees for delete to authenticated
using (
  private.is_admin()
  or (
    private.current_role() = 'team_leader'
    and exists (
      select 1 from public.tasks t
      where t.id = task_id and t.team_id = private.current_team_id()
    )
  )
);

create policy task_comments_read on public.task_comments for select to authenticated
using (private.can_read_task(task_id));
create policy task_comments_create on public.task_comments for insert to authenticated
with check (author_id = (select auth.uid()) and private.can_read_task(task_id));
create policy task_comments_update_own on public.task_comments for update to authenticated
using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy task_comments_delete_own on public.task_comments for delete to authenticated
using (author_id = (select auth.uid()) or private.is_admin());

create policy task_attachments_read on public.task_attachments for select to authenticated
using (private.can_read_task(task_id));
create policy task_attachments_create on public.task_attachments for insert to authenticated
with check (uploaded_by = (select auth.uid()) and private.can_read_task(task_id));
create policy task_attachments_delete on public.task_attachments for delete to authenticated
using (uploaded_by = (select auth.uid()) or private.is_admin());

create policy roadmaps_public_read on public.roadmaps for select to anon, authenticated
using (is_published or private.is_admin());
create policy courses_public_read on public.courses for select to anon, authenticated
using (is_published or private.is_admin());
create policy roadmap_courses_public_read on public.roadmap_courses for select to anon, authenticated
using (
  exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.is_published)
  and exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  or private.is_admin()
);
create policy playlists_admin_read on public.course_playlists for select to authenticated
using (private.is_admin());
create policy lessons_public_read on public.lessons for select to anon, authenticated
using (
  (is_published and exists (select 1 from public.courses c where c.id = course_id and c.is_published))
  or private.is_admin()
);
create policy videos_public_read on public.youtube_videos for select to anon, authenticated
using (
  (is_available and (
    course_id is null
    or exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  ))
  or private.is_admin()
);
create policy slide_decks_public_read on public.slide_decks for select to anon, authenticated
using (
  (is_published and exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and l.is_published and c.is_published
  ))
  or private.is_admin()
);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'roadmaps', 'courses', 'roadmap_courses', 'course_playlists',
    'lessons', 'youtube_videos', 'slide_decks'
  ] loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.is_admin()) with check (private.is_admin())',
      target_table || '_admin_write', target_table
    );
  end loop;
end;
$$;

create policy youtube_sync_admin_read on public.youtube_sync_state for select to authenticated
using (private.is_admin());
create policy health_services_admin_read on public.health_services for select to authenticated
using (private.is_admin());
create policy health_checks_admin_read on public.health_checks for select to authenticated
using (private.is_admin());
create policy health_daily_summaries_admin_read on public.health_daily_summaries for select to authenticated
using (private.is_admin());
create policy health_incidents_admin_read on public.health_incidents for select to authenticated
using (private.is_admin());
create policy notifications_read_own on public.admin_notifications for select to authenticated
using (recipient_id = (select auth.uid()));
create policy notifications_update_own on public.admin_notifications for update to authenticated
using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy audit_admin_read on public.audit_log for select to authenticated
using (private.is_admin());

insert into public.health_services (key, name_ar, description_ar, sort_order) values
  ('website', 'الموقع الرئيسي', 'يتأكد من أن الصفحة الرئيسية تعمل بسرعة وبشكل صحيح.', 10),
  ('courses', 'منصة الكورسات', 'يتأكد من أن صفحة الكورسات والدروس متاحة للزوار.', 20),
  ('admin', 'لوحة الإدارة', 'يتأكد من تحميل شاشة الدخول دون كشف بيانات الإدارة.', 30),
  ('database', 'قاعدة البيانات', 'يتأكد من إمكانية قراءة وكتابة بيانات الفحص.', 40),
  ('auth', 'تسجيل الدخول', 'يتأكد من استجابة خدمة تسجيل الدخول.', 50),
  ('storage', 'ملفات الكورسات', 'يتأكد من توفر مساحة تخزين ملفات Slides.', 60),
  ('youtube', 'مزامنة YouTube', 'يتأكد من استمرار وصول الفيديوهات الجديدة.', 70),
  ('email', 'البريد والتنبيهات', 'يتأكد من جاهزية خدمة إرسال التنبيهات.', 80),
  ('tls', 'شهادة الأمان', 'يتابع DNS وHTTPS وتاريخ انتهاء شهادة الموقع.', 90),
  ('runtime', 'الخادم ونسخة النشر', 'يتابع الذاكرة ونسخة الكود العاملة على Heroku.', 100),
  ('scheduler', 'المهام المجدولة', 'يتأكد من أن فحص الصحة ومزامنة YouTube يعملان في مواعيدهما.', 110);

insert into public.youtube_sync_state (channel_id, channel_title)
values ('UCBAEq8qb5_yvj6_Ef96agOg', 'Okaab');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-slides',
  'course-slides',
  true,
  104857600,
  array[
    'text/html', 'text/css', 'text/javascript', 'application/javascript',
    'application/json', 'application/zip', 'image/png', 'image/jpeg',
    'image/webp', 'image/gif', 'image/svg+xml', 'font/woff', 'font/woff2',
    'application/vnd.ms-fontobject', 'application/octet-stream', 'video/mp4',
    'audio/mpeg', 'audio/ogg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy course_slides_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'course-slides' and private.is_admin());
create policy course_slides_admin_update on storage.objects for update to authenticated
using (bucket_id = 'course-slides' and private.is_admin())
with check (bucket_id = 'course-slides' and private.is_admin());
create policy course_slides_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'course-slides' and private.is_admin());
create policy course_slides_admin_list on storage.objects for select to authenticated
using (bucket_id = 'course-slides' and private.is_admin());
