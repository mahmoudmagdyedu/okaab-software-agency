begin;
select plan(16);

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'okaab@okaab.org'),
  ('10000000-0000-0000-0000-000000000002', 'admin@okaab.org'),
  ('10000000-0000-0000-0000-000000000003', 'leader@okaab.org'),
  ('10000000-0000-0000-0000-000000000004', 'employee@okaab.org'),
  ('10000000-0000-0000-0000-000000000005', 'other@okaab.org');

insert into public.teams (id, name, slug) values
  ('20000000-0000-0000-0000-000000000001', 'الفريق الأول', 'team-one'),
  ('20000000-0000-0000-0000-000000000002', 'الفريق الثاني', 'team-two');

insert into public.profiles (id, email, display_name, role, team_id) values
  ('10000000-0000-0000-0000-000000000002', 'admin@okaab.org', 'Admin', 'admin', null),
  ('10000000-0000-0000-0000-000000000003', 'leader@okaab.org', 'Leader', 'team_leader', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', 'employee@okaab.org', 'Employee', 'employee', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000005', 'other@okaab.org', 'Other', 'employee', '20000000-0000-0000-0000-000000000002');

insert into public.tasks (id, team_id, title, starts_at, ends_at, issuer_id, issuer_role_snapshot, issuer_rank) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'مهمة الأدمن', now(), now() + interval '1 hour', '10000000-0000-0000-0000-000000000002', 'employee', 1),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'مهمة الليدر', now(), now() + interval '1 hour', '10000000-0000-0000-0000-000000000003', 'employee', 1),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'مهمة فريق آخر', now(), now() + interval '1 hour', '10000000-0000-0000-0000-000000000002', 'employee', 1);

insert into public.task_assignees (task_id, profile_id, assigned_by) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002');

select is((select issuer_rank from public.tasks where id = '30000000-0000-0000-0000-000000000001'), 2::smallint, 'admin task rank is captured as 2');
select is((select issuer_rank from public.tasks where id = '30000000-0000-0000-0000-000000000002'), 1::smallint, 'team leader task rank is captured as 1');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
select results_eq($$select id from public.tasks order by id$$, array['30000000-0000-0000-0000-000000000001'::uuid], 'employee sees only assigned tasks');
select results_eq($$select id from public.profiles order by id$$, array['10000000-0000-0000-0000-000000000004'::uuid], 'employee sees only their own profile');
select lives_ok($$update public.task_assignees set status = 'in_progress' where task_id = '30000000-0000-0000-0000-000000000001'$$, 'employee can update their assignment status');
select throws_ok($$insert into public.tasks (team_id,title,starts_at,ends_at,issuer_id) values ('20000000-0000-0000-0000-000000000001','مهمة غير مسموحة',now(),now()+interval '1 hour','10000000-0000-0000-0000-000000000004')$$, 'P0001', 'Only managers can create tasks', 'employee cannot create tasks');

set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}';
select results_eq($$select id from public.tasks order by id$$, array['30000000-0000-0000-0000-000000000001'::uuid,'30000000-0000-0000-0000-000000000002'::uuid], 'team leader sees all tasks in their own team');
select throws_ok($$insert into public.tasks (team_id,title,starts_at,ends_at,issuer_id) values ('20000000-0000-0000-0000-000000000002','خارج الفريق',now(),now()+interval '1 hour','10000000-0000-0000-0000-000000000003')$$, '42501', 'new row violates row-level security policy for table "tasks"', 'team leader cannot create a task in another team');

set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}';
select is((select count(*) from public.tasks), 3::bigint, 'admin sees every task');
select is((select count(*) from public.profiles), 5::bigint, 'admin sees every profile');
select throws_ok($$update public.profiles set role = 'admin' where id = '10000000-0000-0000-0000-000000000004'$$, '42501', 'new row violates row-level security policy for table "profiles"', 'admin cannot promote another admin');

reset role;
insert into public.roadmaps (id, slug, title, is_published) values
  ('40000000-0000-0000-0000-000000000001', 'public-roadmap', 'منشور', true),
  ('40000000-0000-0000-0000-000000000002', 'draft-roadmap', 'مسودة', false);

set local role anon;
set local "request.jwt.claims" = '{}';
select results_eq($$select id from public.roadmaps order by id$$, array['40000000-0000-0000-0000-000000000001'::uuid], 'anonymous users see only published roadmaps');
select throws_ok($$insert into public.roadmaps (slug,title) values ('not-allowed','ممنوع')$$, '42501', null, 'anonymous users cannot write course content');

reset role;
select throws_ok($$update public.profiles set role = 'admin' where id = '10000000-0000-0000-0000-000000000001'$$, 'P0001', 'The primary super admin cannot be demoted or deactivated', 'primary super admin cannot be demoted');
select throws_ok($$delete from public.profiles where id = '10000000-0000-0000-0000-000000000001'$$, 'P0001', 'The primary super admin cannot be deleted', 'primary super admin cannot be deleted');
select is((select count(*) from public.profiles where role = 'super_admin'), 1::bigint, 'there is exactly one super admin');

select * from finish();
rollback;
