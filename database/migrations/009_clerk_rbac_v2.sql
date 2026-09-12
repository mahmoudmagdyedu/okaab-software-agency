set xact_abort on;
begin transaction;

if not exists (select 1 from okaab.schema_migrations where version = '009_clerk_rbac_v2')
begin
  create table okaab.rbac_roles (
    [key] nvarchar(32) not null primary key,
    display_name_ar nvarchar(80) not null,
    hierarchy_level int not null unique,
    can_access_admin bit not null,
    mobile_effective_role nvarchar(32) not null default 'student'
      check (mobile_effective_role='student')
  );

  create table okaab.rbac_permissions (
    [key] nvarchar(80) not null primary key,
    description_ar nvarchar(240) not null
  );

  create table okaab.rbac_role_permissions (
    role_key nvarchar(32) not null references okaab.rbac_roles([key]),
    permission_key nvarchar(80) not null references okaab.rbac_permissions([key]),
    primary key (role_key,permission_key)
  );

  create table okaab.account_roles (
    user_id nvarchar(64) not null primary key references okaab.profiles(id),
    role_key nvarchar(32) not null references okaab.rbac_roles([key]),
    assigned_by nvarchar(64) null references okaab.profiles(id),
    assigned_at datetimeoffset not null default sysutcdatetime(),
    updated_at datetimeoffset not null default sysutcdatetime()
  );

  insert into okaab.rbac_roles ([key],display_name_ar,hierarchy_level,can_access_admin) values
    ('student',N'طالب',0,0),
    ('employee',N'موظف',1,1),
    ('team_leader',N'تيم ليدر',2,1),
    ('admin',N'أدمن',3,1),
    ('super_admin',N'سوبر أدمن',4,1);

  insert into okaab.rbac_permissions ([key],description_ar) values
    ('learning.read',N'عرض الكورسات والدروس'),
    ('learning.progress.write',N'حفظ التقدم والدرجات والإنجازات'),
    ('profile.self.manage',N'إدارة الملف الشخصي'),
    ('leaderboard.read',N'عرض المتصدرين'),
    ('admin.dashboard.read',N'دخول لوحة الإدارة'),
    ('tasks.self.manage',N'عرض وتحديث المهام الشخصية'),
    ('team.read',N'عرض أعضاء الفريق'),
    ('team.tasks.read',N'عرض مهام الفريق'),
    ('accounts.manage_below',N'إدارة حسابات الأدوار الأقل'),
    ('content.manage',N'إدارة الكورسات والمحتوى'),
    ('learning.admin',N'إدارة منصة التعلم'),
    ('health.read',N'عرض حالة النظام'),
    ('admins.manage',N'إدارة حسابات الأدمن'),
    ('tasks.all.manage',N'إدارة كل المهام'),
    ('system.manage',N'إدارة إعدادات النظام');

  insert into okaab.rbac_role_permissions (role_key,permission_key) values
    ('student','learning.read'),('student','learning.progress.write'),
    ('student','profile.self.manage'),('student','leaderboard.read'),
    ('employee','admin.dashboard.read'),('employee','tasks.self.manage'),
    ('team_leader','team.read'),('team_leader','team.tasks.read'),
    ('admin','accounts.manage_below'),('admin','content.manage'),
    ('admin','learning.admin'),('admin','health.read'),
    ('super_admin','admins.manage'),('super_admin','tasks.all.manage'),
    ('super_admin','system.manage');

  insert into okaab.account_roles (user_id,role_key)
  select id,role from okaab.profiles;

  insert into okaab.schema_migrations(version) values ('009_clerk_rbac_v2');
end;

commit transaction;
