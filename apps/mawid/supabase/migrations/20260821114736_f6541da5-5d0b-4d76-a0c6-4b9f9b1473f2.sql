REVOKE ALL ON FUNCTION public.list_tenant_members(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_tenant_member(uuid, text, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_member_role(uuid, uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_tenant_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_tenant_members(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_tenant_member(uuid, text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_member_role(uuid, uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_tenant_member(uuid, uuid) TO authenticated;