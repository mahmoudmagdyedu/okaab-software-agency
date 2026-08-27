set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '003_quote_rate_limits')
begin
  if object_id('okaab.quote_rate_limits', 'U') is null
  begin
    create table okaab.quote_rate_limits (
      identity_hash varbinary(32) not null primary key,
      hit_count int not null,
      expires_at datetimeoffset not null,
      updated_at datetimeoffset not null default sysutcdatetime(),
      constraint ck_okaab_quote_rate_limit_count check (hit_count > 0)
    );

    create index ix_okaab_quote_rate_limits_expires_at
      on okaab.quote_rate_limits (expires_at);
  end;

  insert into okaab.schema_migrations (version) values ('003_quote_rate_limits');
end;

commit transaction;
