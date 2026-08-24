import { createFileRoute } from "@tanstack/react-router";
import { Building2, Landmark, Printer, Save, Users } from "lucide-react";
import { useState } from "react";
import { branches, company, employees, roles, type Role } from "../lib/data";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — فوترة" },
      {
        name: "description",
        content:
          "إعدادات منشأة بُنّ الديرة: بيانات الشركة والرقم الضريبي، الضريبة، سند الطباعة، والمستخدمون بأدوارهم.",
      },
      { property: "og:title", content: "الإعدادات — فوترة" },
      { property: "og:description", content: "إعدادات منشأة بُنّ الديرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

const inputCls =
  "h-11 w-full border border-border-subtle bg-bg-base px-3 text-body text-text-primary focus:border-ring focus:outline-none";

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [userRoles, setUserRoles] = useState<Record<string, Role>>(
    () => Object.fromEntries(employees.map((e) => [e.id, e.role])) as Record<string, Role>,
  );

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">الإعدادات</h1>
          <p className="mt-1 text-body-sm text-text-secondary">
            بيانات المنشأة والضريبة والطباعة والمستخدمون — متاحة لدور «مالك» فقط.
          </p>
        </div>
        <button
          onClick={save}
          className={`flex h-11 items-center gap-2 bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover ${focusRing}`}
        >
          <Save className="h-4 w-4" />
          {saved ? "حُفظت التغييرات" : "حفظ التغييرات"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* الشركة */}
        <section className="border border-border-subtle bg-bg-base p-5">
          <h2 className="flex items-center gap-2 text-h3 font-semibold text-text-primary">
            <Building2 className="h-4 w-4 text-text-muted" />
            بيانات المنشأة
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="c-name"
                className="mb-1.5 block text-body-sm font-medium text-text-primary"
              >
                اسم المنشأة
              </label>
              <input id="c-name" defaultValue={company.name} className={inputCls} />
            </div>
            <div>
              <label
                htmlFor="c-legal"
                className="mb-1.5 block text-body-sm font-medium text-text-primary"
              >
                الاسم القانوني
              </label>
              <input id="c-legal" defaultValue={company.legalName} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="c-cr"
                  className="mb-1.5 block text-body-sm font-medium text-text-primary"
                >
                  السجل التجاري
                </label>
                <input id="c-cr" defaultValue={company.cr} className={`${inputCls} num`} />
              </div>
              <div>
                <label
                  htmlFor="c-vat"
                  className="mb-1.5 block text-body-sm font-medium text-text-primary"
                >
                  الرقم الضريبي — ١٥ خانة
                </label>
                <input
                  id="c-vat"
                  defaultValue={company.vatNumber}
                  maxLength={15}
                  className={`${inputCls} num`}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="c-addr"
                className="mb-1.5 block text-body-sm font-medium text-text-primary"
              >
                العنوان الوطني
              </label>
              <input id="c-addr" defaultValue={company.address} className={inputCls} />
            </div>
          </div>
        </section>

        <div className="space-y-5">
          {/* الضريبة */}
          <section className="border border-border-subtle bg-bg-base p-5">
            <h2 className="flex items-center gap-2 text-h3 font-semibold text-text-primary">
              <Landmark className="h-4 w-4 text-text-muted" />
              الضريبة
            </h2>
            <div className="mt-4 flex items-center justify-between bg-ink px-4 py-3 text-ink-foreground">
              <div>
                <p className="text-body-sm font-medium text-ink-foreground">ضريبة القيمة المضافة</p>
                <p className="text-caption text-ink-foreground/70">
                  تُطبَّق على كل الأصناف وتظهر في الفاتورة وQR
                </p>
              </div>
              <span className="num-display text-[40px] text-ink-foreground">15%</span>
            </div>
            <p className="mt-3 text-caption text-text-muted">
              الأسعار المعروضة في الكاشير والمنيو شاملة للضريبة.
            </p>
          </section>

          {/* سند الطباعة */}
          <section className="border border-border-subtle bg-bg-base p-5">
            <h2 className="flex items-center gap-2 text-h3 font-semibold text-text-primary">
              <Printer className="h-4 w-4 text-text-muted" />
              سند الطباعة
            </h2>
            <div className="mt-4 space-y-2.5">
              {[
                "إظهار رقم الفاتورة التسلسلي",
                "إظهار رمز QR للفوترة الإلكترونية",
                "إظهار اسم الكاشير",
                "سطر شكر ختامي: «نشكر زيارتكم — بُنّ الديرة»",
              ].map((label, i) => (
                <label
                  key={label}
                  className="flex min-h-11 cursor-pointer items-center justify-between border border-border-subtle bg-bg-subtle px-4"
                >
                  <span className="text-body-sm text-text-primary">{label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={i !== 2}
                    className="h-5 w-5 accent-[var(--color-primary)]"
                  />
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* المستخدمون */}
      <section className="overflow-hidden border border-border-subtle bg-bg-base">
        <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-3.5">
          <Users className="h-4 w-4 text-text-muted" />
          <h2 className="text-h3 font-semibold text-text-primary">المستخدمون والأدوار</h2>
        </div>
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle text-micro font-semibold text-text-muted">
              <th className="px-5 py-2.5 text-start font-semibold">الموظف</th>
              <th className="px-4 py-2.5 text-start font-semibold">الفرع</th>
              <th className="px-4 py-2.5 text-start font-semibold">الدور</th>
              <th className="px-5 py-2.5 text-start font-semibold">يرى</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {employees.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-bg-subtle">
                <td className="px-5 py-2.5 font-medium text-text-primary">{e.name}</td>
                <td className="px-4 py-2.5 text-text-secondary">
                  {e.branchId
                    ? `${branches.find((b) => b.id === e.branchId)!.city} — ${branches.find((b) => b.id === e.branchId)!.name}`
                    : "كل الفروع"}
                </td>
                <td className="px-4 py-2.5">
                  <select
                    aria-label={`دور ${e.name}`}
                    value={userRoles[e.id]}
                    onChange={(ev) =>
                      setUserRoles((prev) => ({
                        ...prev,
                        [e.id]: ev.target.value as Role,
                      }))
                    }
                    className={`h-10 border border-border-subtle bg-bg-base px-2 text-body-sm text-text-primary ${focusRing}`}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-2.5 text-caption text-text-muted">
                  {userRoles[e.id] === "كاشير"
                    ? "شاشة الكاشير وفتح/إغلاق الشفت فقط"
                    : userRoles[e.id] === "مشرف فرع"
                      ? "الكاشير + فواتير الفرع وتقاريره"
                      : userRoles[e.id] === "مدير مخزون"
                        ? "الأصناف والمخزون والتحويلات والجرد"
                        : userRoles[e.id] === "محاسب"
                          ? "كل التقارير وتقرير الضريبة ومراقب الفوترة"
                          : "كل شيء في كل الفروع"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
