CREATE OR REPLACE FUNCTION public.list_tenant_members(_tenant_id uuid)
RETURNS TABLE(user_id uuid, full_name text, email text, role app_role, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT m.user_id,
         COALESCE(NULLIF(p.full_name, ''), split_part(u.email, '@', 1)) AS full_name,
         u.email::text,
         m.role,
         m.created_at
  FROM public.memberships m
  JOIN auth.users u ON u.id = m.user_id
  LEFT JOIN public.profiles p ON p.id = m.user_id
  WHERE m.tenant_id = _tenant_id
    AND public.is_tenant_manager(_tenant_id)
  ORDER BY m.created_at;
$$;

CREATE OR REPLACE FUNCTION public.add_tenant_member(_tenant_id uuid, _email text, _role app_role)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid uuid;
BEGIN
  IF NOT public.is_tenant_manager(_tenant_id) THEN RAISE EXCEPTION 'forbidden_tenant'; END IF;
  IF _role NOT IN ('receptionist','provider','branch_manager','owner') THEN RAISE EXCEPTION 'invalid_role'; END IF;
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF v_uid IS NULL THEN RAISE EXCEPTION 'user_not_found'; END IF;
  IF EXISTS (SELECT 1 FROM public.memberships WHERE tenant_id = _tenant_id AND user_id = v_uid) THEN
    RAISE EXCEPTION 'already_member';
  END IF;
  INSERT INTO public.memberships (user_id, tenant_id, role) VALUES (v_uid, _tenant_id, _role);
  RETURN v_uid;
END; $$;

CREATE OR REPLACE FUNCTION public.set_member_role(_tenant_id uuid, _user_id uuid, _role app_role)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_tenant_manager(_tenant_id) THEN RAISE EXCEPTION 'forbidden_tenant'; END IF;
  IF _role NOT IN ('receptionist','provider','branch_manager','owner') THEN RAISE EXCEPTION 'invalid_role'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'cannot_change_self'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE tenant_id = _tenant_id AND user_id = _user_id) THEN
    RAISE EXCEPTION 'not_member';
  END IF;
  IF _role <> 'owner' AND EXISTS (
    SELECT 1 FROM public.memberships WHERE tenant_id = _tenant_id AND user_id = _user_id AND role = 'owner'
  ) AND (SELECT count(*) FROM public.memberships WHERE tenant_id = _tenant_id AND role = 'owner') <= 1 THEN
    RAISE EXCEPTION 'last_owner';
  END IF;
  DELETE FROM public.memberships WHERE tenant_id = _tenant_id AND user_id = _user_id;
  INSERT INTO public.memberships (user_id, tenant_id, role) VALUES (_user_id, _tenant_id, _role);
  RETURN _user_id;
END; $$;

CREATE OR REPLACE FUNCTION public.remove_tenant_member(_tenant_id uuid, _user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_tenant_manager(_tenant_id) THEN RAISE EXCEPTION 'forbidden_tenant'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'cannot_change_self'; END IF;
  IF EXISTS (SELECT 1 FROM public.memberships WHERE tenant_id = _tenant_id AND user_id = _user_id AND role = 'owner')
     AND (SELECT count(*) FROM public.memberships WHERE tenant_id = _tenant_id AND role = 'owner') <= 1 THEN
    RAISE EXCEPTION 'last_owner';
  END IF;
  DELETE FROM public.memberships WHERE tenant_id = _tenant_id AND user_id = _user_id;
  RETURN _user_id;
END; $$;

REVOKE ALL ON FUNCTION public.list_tenant_members(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.add_tenant_member(uuid, text, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.set_member_role(uuid, uuid, app_role) FROM anon;
REVOKE ALL ON FUNCTION public.remove_tenant_member(uuid, uuid) FROM anon;