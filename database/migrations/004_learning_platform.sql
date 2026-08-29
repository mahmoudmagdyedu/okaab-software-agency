set xact_abort on;
begin transaction;

if not exists (select 1 from sys.schemas where name = 'okaab') exec('create schema okaab');

if not exists (select 1 from okaab.schema_migrations where version = '004_learning_platform')
begin
  create table okaab.learner_profiles (
    id nvarchar(64) not null primary key,
    email nvarchar(320) not null unique,
    display_name nvarchar(160) not null,
    avatar_url nvarchar(1000) null,
    birthdate date null,
    locale nvarchar(16) not null default 'ar-EG',
    leaderboard_visible bit not null default 1,
    status nvarchar(20) not null default 'active' check (status in ('active','banned','deleted')),
    deleted_at datetimeoffset null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.quiz_questions (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    lesson_id nvarchar(64) not null references okaab.lessons(id),
    question_text nvarchar(max) not null,
    level nvarchar(20) not null default 'medium' check (level in ('easy','medium','apply')),
    sort_order int not null default 0,
    is_published bit not null default 0,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.quiz_options (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    question_id nvarchar(64) not null references okaab.quiz_questions(id),
    option_text nvarchar(max) not null,
    is_correct bit not null default 0,
    explanation nvarchar(max) not null default '',
    sort_order int not null default 0,
    created_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.quiz_attempts (
    id bigint identity(1,1) not null primary key,
    user_id nvarchar(64) not null references okaab.learner_profiles(id),
    question_id nvarchar(64) not null references okaab.quiz_questions(id),
    option_id nvarchar(64) not null references okaab.quiz_options(id),
    is_correct bit not null,
    is_first_attempt bit not null,
    idempotency_key nvarchar(100) not null,
    answered_at datetimeoffset not null default sysutcdatetime(),
    unique (user_id, idempotency_key)
  );

  create table okaab.lesson_progress (
    user_id nvarchar(64) not null references okaab.learner_profiles(id),
    lesson_id nvarchar(64) not null references okaab.lessons(id),
    status nvarchar(20) not null default 'not_started' check (status in ('not_started','in_progress','completed')),
    last_slide int not null default 0,
    video_percent decimal(5,2) not null default 0,
    quiz_score int not null default 0,
    task_passed bit not null default 0,
    started_at datetimeoffset null,
    completed_at datetimeoffset null,
    updated_at datetimeoffset not null default sysutcdatetime(),
    primary key (user_id, lesson_id)
  );

  create table okaab.lesson_events (
    id bigint identity(1,1) not null primary key,
    user_id nvarchar(64) not null references okaab.learner_profiles(id),
    lesson_id nvarchar(64) not null references okaab.lessons(id),
    event_type nvarchar(40) not null,
    idempotency_key nvarchar(100) not null,
    payload nvarchar(max) not null default '{}',
    created_at datetimeoffset not null default sysutcdatetime(),
    unique (user_id, idempotency_key)
  );

  create table okaab.points_ledger (
    id bigint identity(1,1) not null primary key,
    user_id nvarchar(64) not null references okaab.learner_profiles(id),
    amount int not null,
    reason nvarchar(40) not null,
    lesson_id nvarchar(64) null references okaab.lessons(id),
    question_id nvarchar(64) null references okaab.quiz_questions(id),
    idempotency_key nvarchar(160) not null unique,
    metadata nvarchar(max) not null default '{}',
    created_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.learner_streaks (
    user_id nvarchar(64) not null primary key references okaab.learner_profiles(id),
    current_days int not null default 0,
    longest_days int not null default 0,
    last_active_date date null,
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.learning_devices (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    user_id nvarchar(64) not null references okaab.learner_profiles(id),
    fcm_token nvarchar(500) not null unique,
    platform nvarchar(20) not null,
    app_version nvarchar(40) not null,
    last_seen_at datetimeoffset not null default sysutcdatetime(),
    created_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.remote_config (
    [key] nvarchar(100) not null primary key,
    value_json nvarchar(max) not null,
    is_public bit not null default 1,
    updated_by nvarchar(64) null,
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.announcements (
    id nvarchar(64) not null primary key default lower(convert(nvarchar(36), newid())),
    title nvarchar(240) not null,
    body nvarchar(max) not null,
    audience nvarchar(30) not null default 'all',
    starts_at datetimeoffset not null,
    ends_at datetimeoffset null,
    is_published bit not null default 0,
    created_by nvarchar(64) null,
    created_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  create index ix_okaab_quiz_questions_lesson on okaab.quiz_questions(lesson_id, is_published, sort_order);
  create index ix_okaab_quiz_options_question on okaab.quiz_options(question_id, sort_order);
  create index ix_okaab_quiz_attempts_user_question on okaab.quiz_attempts(user_id, question_id, answered_at);
  create index ix_okaab_lesson_progress_user on okaab.lesson_progress(user_id, status, updated_at desc);
  create index ix_okaab_points_user_date on okaab.points_ledger(user_id, created_at desc);
  create index ix_okaab_points_period on okaab.points_ledger(created_at desc, user_id);
  create index ix_okaab_announcements_window on okaab.announcements(is_published, starts_at, ends_at);

  insert into okaab.remote_config ([key], value_json, is_public) values
    ('points_rules', '{"quiz_first_correct":10,"video_complete":15,"interactive_complete":25,"task_passed":50,"daily_activity":5,"streak_7":50,"streak_30":250}', 1),
    ('mobile', '{"min_app_version":"1.0.0","force_update":false,"maintenance_mode":false}', 1),
    ('features', '{"leaderboard":true,"streaks":true,"signup":true}', 1);

  insert into okaab.schema_migrations(version) values ('004_learning_platform');
end;

commit transaction;
