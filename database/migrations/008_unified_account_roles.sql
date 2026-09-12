set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '008_unified_account_roles')
begin
  declare @sql nvarchar(max) = N'';

  select @sql = @sql + N'alter table okaab.profiles drop constraint [' + cc.name + N'];'
  from sys.check_constraints cc
  where cc.parent_object_id = object_id(N'okaab.profiles')
    and cc.definition like N'%role%';
  exec sp_executesql @sql;

  set @sql = N'';
  select @sql = @sql + N'alter table okaab.pending_invites drop constraint [' + cc.name + N'];'
  from sys.check_constraints cc
  where cc.parent_object_id = object_id(N'okaab.pending_invites')
    and cc.definition like N'%role%';
  exec sp_executesql @sql;

  alter table okaab.profiles add constraint ck_okaab_profiles_role
    check (role in ('student','employee','team_leader','admin','super_admin'));
  alter table okaab.pending_invites add constraint ck_okaab_pending_invites_role
    check (role in ('student','employee','team_leader','admin'));

  insert into okaab.profiles
    (id,email,display_name,avatar_url,role,team_id,is_active,last_seen_at,created_at,updated_at)
  select l.id,l.email,l.display_name,l.avatar_url,'student',null,
    case when l.status='active' then 1 else 0 end,null,l.created_at,l.updated_at
  from okaab.learner_profiles l
  where not exists (select 1 from okaab.profiles p where p.id=l.id)
    and not exists (select 1 from okaab.profiles p where lower(p.email)=lower(l.email));

  insert into okaab.learner_profiles
    (id,email,display_name,avatar_url,status,created_at,updated_at)
  select p.id,p.email,p.display_name,p.avatar_url,
    case when p.is_active=1 then 'active' else 'banned' end,p.created_at,p.updated_at
  from okaab.profiles p
  where not exists (select 1 from okaab.learner_profiles l where l.id=p.id)
    and not exists (select 1 from okaab.learner_profiles l where lower(l.email)=lower(p.email));

  insert into okaab.schema_migrations(version) values ('008_unified_account_roles');
end;

commit transaction;
