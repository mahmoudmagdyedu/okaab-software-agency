import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/components/mawid/can";

export interface Membership {
  tenant_id: string | null;
  role: AppRole;
}

export interface SessionState {
  session: Session | null;
  memberships: Membership[];
  role: AppRole | null;
  tenantId: string | null;
  loading: boolean;
}

/** حالة الجلسة والعضويات — تُقرأ من المتصفح فقط. */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (next: Session | null) => {
      if (!active) return;
      setSession(next);
      if (!next) {
        setMemberships([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("memberships").select("tenant_id, role");
      if (!active) return;
      setMemberships((data ?? []) as Membership[]);
      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void load(next);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const primary = memberships.find((m) => m.role !== "customer") ?? memberships[0] ?? null;

  return {
    session,
    memberships,
    role: primary?.role ?? null,
    tenantId: primary?.tenant_id ?? null,
    loading,
  };
}

export const ROLE_LABELS: Record<AppRole, string> = {
  customer: "عميل",
  receptionist: "موظف استقبال",
  provider: "مقدم خدمة",
  branch_manager: "مدير فرع",
  owner: "مالك المنشأة",
  super_admin: "مدير المنصة",
};
