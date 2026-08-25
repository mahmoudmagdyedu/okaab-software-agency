-- Run after storing project_url and health_monitor_secret in Supabase Vault.
-- Values are intentionally not committed. Example:
-- select vault.create_secret('https://PROJECT_REF.supabase.co', 'project_url');
-- select vault.create_secret('YOUR_RANDOM_SECRET', 'health_monitor_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname in ('okaab-health-every-5-minutes', 'okaab-youtube-every-6-hours', 'okaab-health-retention');

select cron.schedule(
  'okaab-health-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/health-monitor',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'health_monitor_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'okaab-youtube-every-6-hours',
  '17 */6 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/youtube-reconcile',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'health_monitor_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'okaab-health-retention',
  '31 2 * * *',
  $$select private.rollup_health_retention()$$
);
