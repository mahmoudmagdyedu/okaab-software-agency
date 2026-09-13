set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '011_slide_quiz_best_by_deck')
begin
  if col_length('okaab.slide_quiz_attempts', 'improved') is null
    alter table okaab.slide_quiz_attempts
      add improved bit not null constraint df_okaab_slide_quiz_improved default 0;

  if exists (select 1 from sys.indexes where object_id=object_id('okaab.slide_quiz_attempts') and name='ix_okaab_slide_quiz_best')
    drop index ix_okaab_slide_quiz_best on okaab.slide_quiz_attempts;

  create index ix_okaab_slide_quiz_best
    on okaab.slide_quiz_attempts(user_id, lesson_id, deck_id, score_percent desc, completed_at asc);

  ;with first_best as (
    select user_id,attempt_id,
      row_number() over (
        partition by user_id,lesson_id,deck_id
        order by score_percent desc,completed_at asc,attempt_id asc
      ) as best_rank
    from okaab.slide_quiz_attempts
  )
  update a set improved=case when b.best_rank=1 and a.score_percent>0 then 1 else 0 end
  from okaab.slide_quiz_attempts a
  join first_best b on b.user_id=a.user_id and b.attempt_id=a.attempt_id;

  update p set quiz_score=coalesce(best.best_score,0),updated_at=sysutcdatetime()
  from okaab.lesson_progress p
  outer apply (
    select max(a.score_percent) best_score
    from okaab.slide_quiz_attempts a
    where a.user_id=p.user_id and a.lesson_id=p.lesson_id
  ) best
  where best.best_score is not null and best.best_score>coalesce(p.quiz_score,0);

  insert into okaab.schema_migrations(version) values ('011_slide_quiz_best_by_deck');
end;

commit transaction;
