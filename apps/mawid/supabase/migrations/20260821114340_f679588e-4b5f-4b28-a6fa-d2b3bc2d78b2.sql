CREATE TABLE public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  whatsapp_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  sender_name text NOT NULL DEFAULT '',
  reminder_offsets_hours integer[] NOT NULL DEFAULT ARRAY[24, 2],
  quiet_start_minute integer NOT NULL DEFAULT 1320,
  quiet_end_minute integer NOT NULL DEFAULT 480,
  template_confirmation text NOT NULL DEFAULT 'مرحبًا {{customer_name}}، تم تأكيد موعدك لـ {{service_name}} مع {{staff_name}} يوم {{date}} الساعة {{time}} في {{branch_name}}. رقم الحجز: {{booking_ref}}',
  template_reminder text NOT NULL DEFAULT 'تذكير: موعدك لـ {{service_name}} غدًا {{date}} الساعة {{time}} في {{branch_name}}. للتأجيل اتصل بنا.',
  template_cancellation text NOT NULL DEFAULT 'تم إلغاء موعدك لـ {{service_name}} يوم {{date}} الساعة {{time}}. نتشرف بخدمتك في موعد آخر.',
  template_deposit text NOT NULL DEFAULT 'لتثبيت موعدك لـ {{service_name}} يوم {{date}} الساعة {{time}} يرجى سداد العربون {{deposit}}. رقم الحجز: {{booking_ref}}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_settings TO authenticated;
GRANT ALL ON public.notification_settings TO service_role;

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read notification settings"
ON public.notification_settings FOR SELECT TO authenticated
USING (public.is_tenant_member(tenant_id));

CREATE POLICY "managers insert notification settings"
ON public.notification_settings FOR INSERT TO authenticated
WITH CHECK (public.is_tenant_manager(tenant_id));

CREATE POLICY "managers update notification settings"
ON public.notification_settings FOR UPDATE TO authenticated
USING (public.is_tenant_manager(tenant_id))
WITH CHECK (public.is_tenant_manager(tenant_id));

CREATE TRIGGER trg_notification_settings_updated
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.notification_settings (tenant_id, sender_name)
SELECT id, name FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;