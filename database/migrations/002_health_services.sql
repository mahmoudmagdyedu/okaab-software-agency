set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '002_health_services')
begin
  if not exists (select 1 from okaab.health_services where [key] = 'runtime')
    insert into okaab.health_services ([key],name_ar,description_ar,sort_order) values ('runtime',N'خادم Heroku',N'يتابع الذاكرة وإصدار التشغيل الحالي.',100);
  if not exists (select 1 from okaab.health_services where [key] = 'scheduler')
    insert into okaab.health_services ([key],name_ar,description_ar,sort_order) values ('scheduler',N'المهام المجدولة',N'يتابع انتظام الفحص والمزامنة الخلفية.',110);
  insert into okaab.schema_migrations(version) values ('002_health_services');
end;

commit transaction;
