-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('customer','receptionist','provider','branch_manager','owner','super_admin');
CREATE TYPE public.appointment_status AS ENUM ('confirmed','pending_deposit','completed','cancelled','no_show');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.subscription_status AS ENUM ('trialing','active','past_due','cancelled');
CREATE TYPE public.notification_status AS ENUM ('queued','sent','failed');

-- ============ SHARED TRIGGER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_own ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TENANTS ============
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  timezone text NOT NULL DEFAULT 'Africa/Cairo',
  currency text NOT NULL DEFAULT 'EGP',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id, role)
);

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships m WHERE m.user_id = auth.uid() AND m.role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid() AND m.tenant_id = _tenant_id
      AND m.role IN ('receptionist','provider','branch_manager','owner')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(_tenant_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid() AND m.tenant_id = _tenant_id AND m.role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_manager(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_tenant_role(_tenant_id, ARRAY['branch_manager','owner']::public.app_role[]);
$$;

GRANT SELECT ON public.tenants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenants_public_read ON public.tenants FOR SELECT TO anon USING (is_active);
CREATE POLICY tenants_member_read ON public.tenants FOR SELECT TO authenticated USING (is_active OR public.is_tenant_member(id));
CREATE POLICY tenants_admin_write ON public.tenants FOR ALL TO authenticated
  USING (public.is_tenant_manager(id)) WITH CHECK (public.is_tenant_manager(id));
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY memberships_self_read ON public.memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_tenant_manager(tenant_id));
CREATE POLICY memberships_manager_write ON public.memberships FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));

-- ============ BRANCHES ============
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  phone text,
  timezone text NOT NULL DEFAULT 'Africa/Cairo',
  free_cancellation_hours integer NOT NULL DEFAULT 24,
  deposit_percent integer NOT NULL DEFAULT 40,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY branches_public_read ON public.branches FOR SELECT TO anon USING (is_active);
CREATE POLICY branches_member_read ON public.branches FOR SELECT TO authenticated USING (is_active OR public.is_tenant_member(tenant_id));
CREATE POLICY branches_manager_write ON public.branches FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ STAFF ============
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  specialty text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.staff TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT ALL ON public.staff TO service_role;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_public_read ON public.staff FOR SELECT TO anon USING (is_active);
CREATE POLICY staff_member_read ON public.staff FOR SELECT TO authenticated USING (is_active OR public.is_tenant_member(tenant_id));
CREATE POLICY staff_manager_write ON public.staff FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SERVICES ============
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 30,
  buffer_minutes integer NOT NULL DEFAULT 0,
  price_cents integer NOT NULL DEFAULT 0,
  deposit_cents integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY services_public_read ON public.services FOR SELECT TO anon USING (is_active);
CREATE POLICY services_member_read ON public.services FOR SELECT TO authenticated USING (is_active OR public.is_tenant_member(tenant_id));
CREATE POLICY services_manager_write ON public.services FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.staff_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  UNIQUE (staff_id, service_id)
);
GRANT SELECT ON public.staff_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.staff_services TO authenticated;
GRANT ALL ON public.staff_services TO service_role;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_services_public_read ON public.staff_services FOR SELECT TO anon USING (true);
CREATE POLICY staff_services_member_read ON public.staff_services FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_services_manager_write ON public.staff_services FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));

-- ============ RESOURCES ============
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'room',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY resources_member_read ON public.resources FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id));
CREATE POLICY resources_manager_write ON public.resources FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));

-- ============ AVAILABILITY ============
CREATE TABLE public.availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_minute integer NOT NULL CHECK (start_minute BETWEEN 0 AND 1440),
  end_minute integer NOT NULL CHECK (end_minute BETWEEN 0 AND 1440),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_minute > start_minute)
);
GRANT SELECT ON public.availability_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.availability_rules TO authenticated;
GRANT ALL ON public.availability_rules TO service_role;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY availability_public_read ON public.availability_rules FOR SELECT TO anon USING (is_active);
CREATE POLICY availability_member_read ON public.availability_rules FOR SELECT TO authenticated USING (is_active OR public.is_tenant_member(tenant_id));
CREATE POLICY availability_manager_write ON public.availability_rules FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));

CREATE TABLE public.blackout_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
GRANT SELECT ON public.blackout_dates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blackout_dates TO authenticated;
GRANT ALL ON public.blackout_dates TO service_role;
ALTER TABLE public.blackout_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY blackout_public_read ON public.blackout_dates FOR SELECT TO anon USING (true);
CREATE POLICY blackout_member_read ON public.blackout_dates FOR SELECT TO authenticated USING (true);
CREATE POLICY blackout_manager_write ON public.blackout_dates FOR ALL TO authenticated
  USING (public.is_tenant_manager(tenant_id)) WITH CHECK (public.is_tenant_manager(tenant_id));

-- ============ CUSTOMERS ============
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_member_read ON public.customers FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id) OR user_id = auth.uid());
CREATE POLICY customers_staff_write ON public.customers FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id)) WITH CHECK (public.is_tenant_member(tenant_id));
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending_deposit',
  price_cents integer NOT NULL DEFAULT 0,
  deposit_cents integer NOT NULL DEFAULT 0,
  deposit_paid_cents integer NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT '',
  booking_ref text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  recurrence text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  UNIQUE (resource_id, starts_at)
);
CREATE INDEX idx_appointments_tenant_time ON public.appointments (tenant_id, starts_at);
CREATE INDEX idx_appointments_staff_time ON public.appointments (staff_id, starts_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointments_read ON public.appointments FOR SELECT TO authenticated
  USING (
    public.has_tenant_role(tenant_id, ARRAY['receptionist','branch_manager','owner']::public.app_role[])
    OR staff_id IN (SELECT s.id FROM public.staff s WHERE s.user_id = auth.uid())
    OR customer_id IN (SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid())
  );
CREATE POLICY appointments_staff_write ON public.appointments FOR ALL TO authenticated
  USING (
    public.has_tenant_role(tenant_id, ARRAY['receptionist','branch_manager','owner']::public.app_role[])
    OR staff_id IN (SELECT s.id FROM public.staff s WHERE s.user_id = auth.uid())
  )
  WITH CHECK (
    public.has_tenant_role(tenant_id, ARRAY['receptionist','branch_manager','owner']::public.app_role[])
    OR staff_id IN (SELECT s.id FROM public.staff s WHERE s.user_id = auth.uid())
  );
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.appointment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointment_events_appt ON public.appointment_events (appointment_id, created_at DESC);
GRANT SELECT, INSERT ON public.appointment_events TO authenticated;
GRANT ALL ON public.appointment_events TO service_role;
ALTER TABLE public.appointment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointment_events_member_read ON public.appointment_events FOR SELECT TO authenticated USING (public.is_tenant_member(tenant_id));
CREATE POLICY appointment_events_member_insert ON public.appointment_events FOR INSERT TO authenticated WITH CHECK (public.is_tenant_member(tenant_id));

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'paymob',
  provider_ref text,
  idempotency_key text UNIQUE,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EGP',
  status public.payment_status NOT NULL DEFAULT 'pending',
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_manager_read ON public.payments FOR SELECT TO authenticated
  USING (public.has_tenant_role(tenant_id, ARRAY['receptionist','branch_manager','owner']::public.app_role[]));
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PLANS / SUBSCRIPTIONS ============
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  max_staff integer NOT NULL DEFAULT 5,
  max_appointments_month integer NOT NULL DEFAULT 500,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY plans_read ON public.plans FOR SELECT TO authenticated USING (true);
CREATE POLICY plans_admin_write ON public.plans FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  started_at timestamptz NOT NULL DEFAULT now(),
  renews_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_read ON public.subscriptions FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));
CREATE POLICY subscriptions_admin_write ON public.subscriptions FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'whatsapp',
  template_key text NOT NULL,
  to_phone text NOT NULL,
  body text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  status public.notification_status NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_due ON public.notifications_queue (status, scheduled_at);
GRANT SELECT ON public.notifications_queue TO authenticated;
GRANT ALL ON public.notifications_queue TO service_role;
ALTER TABLE public.notifications_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_manager_read ON public.notifications_queue FOR SELECT TO authenticated
  USING (public.has_tenant_role(tenant_id, ARRAY['receptionist','branch_manager','owner']::public.app_role[]));