set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '010_clerk_identity_links')
begin
  create table okaab.clerk_user_links (
    clerk_user_id nvarchar(64) not null primary key,
    profile_id nvarchar(64) not null references okaab.profiles(id),
    linked_email nvarchar(320) not null,
    linked_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime(),
    constraint uq_clerk_user_links_profile unique (profile_id)
  );

  create index ix_clerk_user_links_email on okaab.clerk_user_links(linked_email);
  insert into okaab.schema_migrations(version) values ('010_clerk_identity_links');
end;

commit transaction;
