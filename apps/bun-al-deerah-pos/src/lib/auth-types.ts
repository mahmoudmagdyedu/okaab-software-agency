export const systemRoles = [
  "super_admin",
  "admin",
  "manager",
  "accountant",
  "inventory",
  "cashier",
  "kitchen",
  "employee",
] as const;

export type SystemRole = (typeof systemRoles)[number];

export const roleLabels: Record<SystemRole, string> = {
  super_admin: "سوبر أدمن",
  admin: "أدمن",
  manager: "مشرف فرع",
  accountant: "محاسب",
  inventory: "مسؤول مخزون",
  cashier: "كاشير",
  kitchen: "موظف مطبخ",
  employee: "موظف",
};

export type SessionUser = {
  id: string;
  organizationId: string | null;
  fullName: string;
  email: string;
  role: SystemRole;
  status: "active" | "suspended";
  passwordResetRequired: boolean;
};

export type ManagedUser = SessionUser & {
  createdAt: string;
  lastLoginAt: string | null;
};

export type AccessRequestRow = {
  id: string;
  fullName: string;
  email: string;
  organizationName: string | null;
  requestedRole: "admin" | "employee";
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};
