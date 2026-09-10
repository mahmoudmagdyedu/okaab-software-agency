set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '007_slide_quiz_attempts')
begin
  create table okaab.slide_quiz_attempts (
    user_id nvarchar(64) not null references okaab.learner_profiles(id),
    attempt_id nvarchar(64) not null,
    lesson_id nvarchar(64) not null references okaab.lessons(id),
    deck_id nvarchar(64) not null,
    course_slug nvarchar(180) not null,
    lesson_slug nvarchar(180) not null,
    lesson_number int not null,
    question_set_version nvarchar(128) not null,
    correct_answers int not null check (correct_answers >= 0),
    total_questions int not null check (total_questions > 0),
    score_percent int not null check (score_percent between 0 and 100),
    awarded_xp int not null default 0 check (awarded_xp >= 0),
    completed_at datetimeoffset not null,
    created_at datetimeoffset not null default sysutcdatetime(),
    constraint pk_okaab_slide_quiz_attempts primary key (user_id, attempt_id),
    constraint ck_okaab_slide_quiz_answers check (correct_answers <= total_questions)
  );

  create index ix_okaab_slide_quiz_best
    on okaab.slide_quiz_attempts(user_id, lesson_id, question_set_version, correct_answers desc);

  insert into okaab.schema_migrations(version) values ('007_slide_quiz_attempts');
end;

commit transaction;
