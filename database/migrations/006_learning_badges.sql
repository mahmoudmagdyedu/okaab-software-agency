set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '006_learning_badges')
begin
  create table okaab.badges (
    id nvarchar(64) not null primary key,
    title nvarchar(120) not null,
    description nvarchar(500) not null,
    sort_order int not null default 0,
    is_active bit not null default 1,
    created_at datetimeoffset not null default sysutcdatetime()
  );

  create table okaab.user_badges (
    user_id nvarchar(64) not null references okaab.learner_profiles(id),
    badge_id nvarchar(64) not null references okaab.badges(id),
    awarded_at datetimeoffset not null default sysutcdatetime(),
    source_key nvarchar(160) null,
    constraint pk_okaab_user_badges primary key (user_id, badge_id)
  );

  insert into okaab.badges (id,title,description,sort_order) values
    ('first_lesson',N'أول درس',N'أكمل أول درس على منصة عُقاب.',10),
    ('perfect_quiz',N'أول 10/10',N'أجاب كل أسئلة درس صحيحة من أول محاولة.',20),
    ('first_task',N'أول مهمة ناجحة',N'اجتاز أول مهمة عملية بنجاح.',30),
    ('streak_7',N'٧ أيام متواصلة',N'حافظ على نشاط التعلّم سبعة أيام متتالية.',40),
    ('top_3_weekly',N'توب 3 أسبوعي',N'أنهى أسبوعًا ضمن أول ثلاثة متعلمين.',50);

  create index ix_okaab_user_badges_awarded on okaab.user_badges(user_id, awarded_at desc);
  insert into okaab.schema_migrations(version) values ('006_learning_badges');
end;

commit transaction;
