set xact_abort on;
begin transaction;

if not exists (select 1 from sys.schemas where name = 'okaab') exec('create schema okaab');

if object_id('okaab.schema_migrations', 'U') is null
create table okaab.schema_migrations (
  version nvarchar(64) not null primary key,
  applied_at datetimeoffset not null default sysutcdatetime()
);

if not exists (select 1 from okaab.schema_migrations where version = '001_okaab_core')
begin
  create table okaab.teams (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    name nvarchar(160) not null,
    slug nvarchar(160) not null unique,
    description nvarchar(max) null,
    color nvarchar(16) not null default '#E8A33D',
    is_active bit not null default 1,
    created_by nvarchar(64) null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.profiles (
    id nvarchar(64) not null primary key,
    email nvarchar(320) not null unique,
    display_name nvarchar(160) not null,
    avatar_url nvarchar(1000) null,
    role nvarchar(32) not null check (role in ('super_admin','admin','team_leader','employee')),
    team_id nvarchar(64) null references okaab.teams(id),
    is_active bit not null default 1,
    last_seen_at datetimeoffset null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.pending_invites (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    email nvarchar(320) not null,
    role nvarchar(32) not null check (role in ('admin','team_leader','employee')),
    team_id nvarchar(64) null references okaab.teams(id),
    invited_by nvarchar(64) not null,
    expires_at datetimeoffset not null,
    accepted_at datetimeoffset null,
    created_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.tasks (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    team_id nvarchar(64) not null references okaab.teams(id),
    title nvarchar(300) not null,
    description nvarchar(max) not null default '',
    starts_at datetimeoffset not null,
    ends_at datetimeoffset not null,
    status nvarchar(32) not null default 'scheduled' check (status in ('scheduled','in_progress','blocked','completed','cancelled')),
    issuer_id nvarchar(64) not null references okaab.profiles(id),
    issuer_role_snapshot nvarchar(32) not null,
    issuer_rank int not null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime(),
    constraint ck_okaab_task_time check (ends_at > starts_at)
  );

  create table okaab.task_assignees (
    task_id nvarchar(64) not null references okaab.tasks(id),
    profile_id nvarchar(64) not null references okaab.profiles(id),
    status nvarchar(32) not null default 'scheduled' check (status in ('scheduled','in_progress','blocked','completed','cancelled')),
    assigned_by nvarchar(64) not null references okaab.profiles(id),
    assigned_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime(),
    primary key (task_id, profile_id)
  );

  create table okaab.task_comments (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    task_id nvarchar(64) not null references okaab.tasks(id),
    author_id nvarchar(64) not null references okaab.profiles(id),
    body nvarchar(max) not null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.roadmaps (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    slug nvarchar(180) not null unique,
    title nvarchar(220) not null,
    description nvarchar(max) not null default '',
    cover_url nvarchar(1000) null,
    sort_order int not null default 0,
    is_published bit not null default 0,
    created_by nvarchar(64) null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.courses (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    slug nvarchar(180) not null unique,
    title nvarchar(220) not null,
    description nvarchar(max) not null default '',
    cover_url nvarchar(1000) null,
    level nvarchar(80) not null default 'all',
    is_published bit not null default 0,
    created_by nvarchar(64) null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.roadmap_courses (
    roadmap_id nvarchar(64) not null references okaab.roadmaps(id),
    course_id nvarchar(64) not null references okaab.courses(id),
    sort_order int not null default 0,
    primary key (roadmap_id, course_id)
  );

  create table okaab.course_playlists (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    youtube_playlist_id nvarchar(128) not null unique,
    course_id nvarchar(64) null references okaab.courses(id),
    title nvarchar(300) not null,
    thumbnail_url nvarchar(1000) null,
    last_synced_at datetimeoffset null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.lessons (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    course_id nvarchar(64) not null references okaab.courses(id),
    slug nvarchar(180) not null,
    title nvarchar(300) not null,
    description nvarchar(max) not null default '',
    sort_order int not null default 0,
    is_published bit not null default 0,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime(),
    unique (course_id, slug)
  );

  create table okaab.youtube_videos (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    youtube_video_id nvarchar(64) not null unique,
    playlist_id nvarchar(64) null references okaab.course_playlists(id),
    course_id nvarchar(64) null references okaab.courses(id),
    lesson_id nvarchar(64) null references okaab.lessons(id),
    title nvarchar(500) not null,
    description nvarchar(max) not null default '',
    thumbnail_url nvarchar(1000) null,
    published_at datetimeoffset null,
    duration_seconds int null,
    sort_order int not null default 0,
    is_available bit not null default 1,
    last_synced_at datetimeoffset not null default sysutcdatetime(),
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.slide_decks (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    lesson_id nvarchar(64) not null references okaab.lessons(id),
    video_id nvarchar(64) null references okaab.youtube_videos(id),
    title nvarchar(300) not null,
    storage_root nvarchar(200) not null unique,
    entry_path nvarchar(600) not null default 'index.html',
    archive_name nvarchar(300) null,
    archive_size_bytes bigint null,
    file_count int not null default 0,
    allow_download bit not null default 0,
    is_published bit not null default 0,
    sort_order int not null default 0,
    uploaded_by nvarchar(64) not null references okaab.profiles(id),
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.slide_assets (
    deck_id nvarchar(64) not null references okaab.slide_decks(id),
    path nvarchar(600) not null,
    content_type nvarchar(160) not null,
    content varbinary(max) not null,
    size_bytes bigint not null,
    is_source bit not null default 0,
    created_at datetimeoffset not null default sysutcdatetime(),
    primary key (deck_id, path)
  );

  create table okaab.youtube_sync_state (
    channel_id nvarchar(128) not null primary key,
    channel_title nvarchar(300) null,
    last_attempt_at datetimeoffset null,
    last_success_at datetimeoffset null,
    last_webhook_at datetimeoffset null,
    last_error_code nvarchar(120) null,
    last_error_summary nvarchar(1000) null,
    consecutive_failures int not null default 0,
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.health_services (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    [key] nvarchar(100) not null unique,
    name_ar nvarchar(200) not null,
    description_ar nvarchar(1000) not null,
    sort_order int not null default 0,
    is_enabled bit not null default 1,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.health_checks (
    id bigint identity(1,1) not null primary key,
    service_id nvarchar(64) not null references okaab.health_services(id),
    status nvarchar(20) not null check (status in ('healthy','degraded','down','unknown')),
    latency_ms int null,
    status_code int null,
    summary_ar nvarchar(1000) not null,
    impact_ar nvarchar(1000) not null,
    likely_cause_ar nvarchar(1000) not null,
    action_ar nvarchar(1000) not null,
    safe_details nvarchar(max) not null default '{}',
    deployment_version nvarchar(120) null,
    checked_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.health_incidents (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    service_id nvarchar(64) not null references okaab.health_services(id),
    status nvarchar(20) not null,
    title_ar nvarchar(300) not null,
    summary_ar nvarchar(1000) not null,
    impact_ar nvarchar(1000) not null,
    likely_cause_ar nvarchar(1000) not null,
    action_ar nvarchar(1000) not null,
    started_at datetimeoffset not null default sysutcdatetime(),
    resolved_at datetimeoffset null,
    last_alerted_at datetimeoffset null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.audit_log (
    id bigint identity(1,1) not null primary key,
    actor_id nvarchar(64) null,
    action nvarchar(120) not null,
    entity_type nvarchar(100) not null,
    entity_id nvarchar(64) null,
    summary_ar nvarchar(1000) not null,
    metadata nvarchar(max) not null default '{}',
    created_at datetimeoffset not null default sysutcdatetime()
  );

  create index ix_okaab_tasks_day on okaab.tasks(starts_at, team_id, issuer_rank);
  create index ix_okaab_assignees_profile on okaab.task_assignees(profile_id, status);
  create index ix_okaab_lessons_course on okaab.lessons(course_id, sort_order);
  create index ix_okaab_videos_course on okaab.youtube_videos(course_id, published_at desc);
  create index ix_okaab_health_checked on okaab.health_checks(service_id, checked_at desc);

  insert into okaab.health_services ([key], name_ar, description_ar, sort_order) values
    ('website', N'الموقع الرئيسي', N'يتأكد أن الصفحة الرئيسية تعمل بسرعة وبشكل صحيح.', 10),
    ('courses', N'منصة الكورسات', N'يتأكد أن صفحة الكورسات والدروس متاحة للزوار.', 20),
    ('admin', N'لوحة الإدارة', N'يتأكد أن شاشة الدخول تعمل دون كشف بيانات الإدارة.', 30),
    ('database', N'قاعدة البيانات', N'يتأكد أن Heroku يستطيع قراءة قاعدة البيانات.', 40),
    ('authentication', N'تسجيل الدخول', N'يتأكد من توفر خدمة Clerk للمصادقة.', 50),
    ('storage', N'ملفات الكورسات', N'يتأكد من إمكانية قراءة ملفات Slides.', 60),
    ('youtube', N'مزامنة YouTube', N'يتأكد من استمرار جلب فيديوهات القناة.', 70),
    ('email', N'البريد الإلكتروني', N'يتأكد من جاهزية خدمة Resend للتنبيهات.', 80),
    ('tls', N'DNS وHTTPS', N'يتأكد من أن النطاق والشهادة صالحان.', 90);

  insert into okaab.youtube_sync_state (channel_id) values ('UCBAEq8qb5_yvj6_Ef96agOg');
  insert into okaab.schema_migrations(version) values ('001_okaab_core');
end;

commit transaction;
