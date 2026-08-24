import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/components/mawid/can";

/** الأدوار القابلة للتعيين من الواجهة — «مدير المنصة» و«عميل» غير قابلين للتعيين. */
export const ASSIGNABLE_ROLES: AppRole[] = ["receptionist", "provider", "branch_manager", "owner"];

/** وصف قصير لصلاحيات كل دور داخل /app. */
export const ROLE_SCOPE: Record<AppRole, string> = {
  customer: "لا وصول إلى لوحة الإدارة — الحجز العام فقط.",
  receptionist: "لوحة اليوم، التقويم، المواعيد، العملاء.",
  provider: "لوحة اليوم والتقويم لمواعيده فقط.",
  branch_manager: "كل ما سبق + الخدمات والتوفر وإشعارات واتساب وإدارة الأدوار.",
  owner: "وصول كامل لكل شاشات المنشأة والإعدادات.",
  super_admin: "وصول كامل لكل المنشآت على المنصة.",
};

export interface TenantMember {
  userId: string;
  fullName: string;
  email: string;
  role: AppRole;
  createdAt: string;
}

const ERRORS: Record<string, string> = {
  forbidden_tenant: "لا تملك صلاحية إدارة أدوار هذه المنشأة.",
  invalid_role: "دور غير مسموح بتعيينه.",
  user_not_found: "لا يوجد مستخدم مسجَّل بهذا البريد.",
  already_member: "هذا المستخدم عضو بالمنشأة بالفعل.",
  cannot_change_self: "لا يمكنك تغيير دورك أو إزالة نفسك.",
  last_owner: "لا يمكن إزالة آخر مالك للمنشأة.",
  not_member: "المستخدم ليس عضوًا بالمنشأة.",
};

/** تحويل رسائل أخطاء قاعدة البيانات إلى نص عربي واضح. */
export function roleErrorMessage(message: string): string {
  const key = Object.keys(ERRORS).find((k) => message.includes(k));
  return key ? ERRORS[key]! : "تعذّر تنفيذ الإجراء، حاول مرة أخرى.";
}

export async function fetchTenantMembers(tenantId: string): Promise<TenantMember[]> {
  const { data, error } = await supabase.rpc("list_tenant_members", { _tenant_id: tenantId });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    role: row.role as AppRole,
    createdAt: row.created_at,
  }));
}

export async function addTenantMember(tenantId: string, email: string, role: AppRole) {
  const { error } = await supabase.rpc("add_tenant_member", {
    _tenant_id: tenantId,
    _email: email,
    _role: role,
  });
  if (error) throw error;
}

export async function updateMemberRole(tenantId: string, userId: string, role: AppRole) {
  const { error } = await supabase.rpc("set_member_role", {
    _tenant_id: tenantId,
    _user_id: userId,
    _role: role,
  });
  if (error) throw error;
}

export async function removeTenantMember(tenantId: string, userId: string) {
  const { error } = await supabase.rpc("remove_tenant_member", {
    _tenant_id: tenantId,
    _user_id: userId,
  });
  if (error) throw error;
}
