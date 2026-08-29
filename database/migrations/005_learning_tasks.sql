set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '005_learning_tasks')
begin
  if col_length('okaab.lessons', 'task_prompt') is null
    alter table okaab.lessons add task_prompt nvarchar(max) null;
  if col_length('okaab.lessons', 'task_enabled') is null
    alter table okaab.lessons add task_enabled bit not null constraint df_okaab_lessons_task_enabled default 0;
  if col_length('okaab.lessons', 'required_slide_index') is null
    alter table okaab.lessons add required_slide_index int null;

  insert into okaab.schema_migrations(version) values ('005_learning_tasks');
end;

commit transaction;
