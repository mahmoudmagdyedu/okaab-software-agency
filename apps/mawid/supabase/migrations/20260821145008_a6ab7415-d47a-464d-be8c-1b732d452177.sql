-- 1. Remove unrestricted public/anon exposure of blackout_dates and staff_services
DROP POLICY IF EXISTS blackout_public_read ON public.blackout_dates;
DROP POLICY IF EXISTS staff_services_public_read ON public.staff_services;
REVOKE SELECT ON public.blackout_dates FROM anon;
REVOKE SELECT ON public.staff_services FROM anon;

-- 2. Scope signed-in reads to the caller's own tenant
DROP POLICY IF EXISTS blackout_member_read ON public.blackout_dates;
CREATE POLICY blackout_member_read ON public.blackout_dates
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS staff_services_member_read ON public.staff_services;
CREATE POLICY staff_services_member_read ON public.staff_services
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

-- 3. Move SECURITY DEFINER permission helpers out of the exposed API schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.memberships m WHERE m.user_id = auth.uid() AND m.role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION private.has_tenant_role(_tenant_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid() AND m.tenant_id = _tenant_id AND m.role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION private.is_tenant_member(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid() AND m.tenant_id = _tenant_id
      AND m.role IN ('receptionist','provider','branch_manager','owner')
  );
$$;

CREATE OR REPLACE FUNCTION private.is_tenant_manager(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.has_tenant_role(_tenant_id, ARRAY['branch_manager','owner']::public.app_role[]);
$$;

-- Public names become thin SECURITY INVOKER wrappers (policies keep working)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT private.is_super_admin();
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(_tenant_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT private.has_tenant_role(_tenant_id, _roles);
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT private.is_tenant_member(_tenant_id);
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_manager(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT private.is_tenant_manager(_tenant_id);
$$;

-- 4. No anonymous/public execution of privileged routines
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION private.is_super_admin(), private.has_tenant_role(uuid, public.app_role[]),
  private.is_tenant_member(uuid), private.is_tenant_manager(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_super_admin(), private.has_tenant_role(uuid, public.app_role[]),
  private.is_tenant_member(uuid), private.is_tenant_manager(uuid) TO authenticated, service_role;