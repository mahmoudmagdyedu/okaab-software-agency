import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Stethoscope, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/mawid/app-shell";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { MonoText } from "@/components/mawid/mono-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fetchBranches } from "@/lib/branches";
import {
  createService,
  deleteService,
  DURATION_PRESETS,
  fetchServices,
  formatMoney,
  serviceErrorMessage,
  toggleService,
  updateService,
  type ServiceInput,
  type ServiceRecord,
} from "@/lib/services";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/app/settings/services")({
  head: () => ({
    meta: [
      { title: "إدارة الخدمات — مَوعِد" },
      {
        name: "description",
        content:
          "أنشئ خدمات المنشأة وعدّلها واحذفها: القسم (الفرع)، المدة، الحاجز الزمني، السعر، والعربون.",
      },
      { property: "og:title", content: "إدارة الخدمات — مَوعِد" },
      {
        property: "og:description",
        content: "خدمات كل فرع مع المدة والسعر والعربون، مرتبطة مباشرة بصفحة الحجز والتقويم.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicesSettingsPage,
});

const EMPTY_FORM: ServiceInput = {
  branchId: "",
  name: "",
  description: "",
  durationMinutes: 30,
  bufferMinutes: 0,
  priceCents: 0,
  depositCents: 0,
  isActive: true,
};

function ServicesSettingsPage() {
  const { session, role, tenantId, loading } = useSession();
  const queryClient = useQueryClient();
  const canEdit = role === "owner" || role === "branch_manager" || role === "super_admin";

  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [creating, setCreating] = useState(false);

  const branchesQuery = useQuery({
    queryKey: ["branches", tenantId],
    queryFn: () => fetchBranches(tenantId as string),
    enabled: Boolean(tenantId) && canEdit,
  });

  const servicesQuery = useQuery({
    queryKey: ["services", tenantId],
    queryFn: () => fetchServices(tenantId as string),
    enabled: Boolean(tenantId) && canEdit,
  });

  const branches = branchesQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  const grouped = useMemo(() => {
    return branches.map((branch) => ({
      branch,
      items: services.filter((s) => s.branchId === branch.id),
    }));
  }, [branches, services]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["services", tenantId] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: { id: string | null; input: ServiceInput }) =>
      payload.id
        ? updateService(payload.id, payload.input)
        : createService(tenantId as string, payload.input),
    onSuccess: (_data, payload) => {
      toast.success(payload.id ? "تم تحديث الخدمة." : "تمت إضافة الخدمة.");
      setEditing(null);
      setCreating(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(serviceErrorMessage(error.message)),
  });

  const toggleMutation = useMutation({
    mutationFn: (payload: { id: string; isActive: boolean }) =>
      toggleService(payload.id, payload.isActive),
    onSuccess: () => invalidate(),
    onError: (error: Error) => toast.error(serviceErrorMessage(error.message)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      toast.success("تم حذف الخدمة.");
      invalidate();
    },
    onError: (error: Error) => toast.error(serviceErrorMessage(error.message)),
  });

  const shellProps = {
    title: "إدارة الخدمات",
    role,
    userName: session?.user.email ?? "",
    tenantName: "مَوعِد",
  };

  if (loading) {
    return (
      <AppShell {...shellProps}>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!canEdit) {
    return (
      <AppShell {...shellProps}>
        <InlineAlert tone="warning" title="صلاحية غير كافية">
          إدارة الخدمات متاحة لمدير الفرع والمالك فقط.
        </InlineAlert>
      </AppShell>
    );
  }

  const isPending = servicesQuery.isPending || branchesQuery.isPending;

  return (
    <AppShell {...shellProps}>
      <div className="space-y-6">
        <InlineAlert tone="info" title="مرتبطة بصفحة الحجز والتقويم">
          مدة الخدمة والحاجز الزمني يحددان طول الفتحة في التقويم، والسعر والعربون يظهران للعميل في
          صفحة الحجز. الخدمة غير المفعّلة تختفي من الحجز العام دون التأثير على المواعيد القائمة.
        </InlineAlert>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">خدمات المنشأة</h2>
          <Button
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
            disabled={branches.length === 0}
          >
            <Plus className="size-4" />
            خدمة جديدة
          </Button>
        </div>

        {creating ? (
          <ServiceForm
            title="خدمة جديدة"
            branches={branches}
            initial={{ ...EMPTY_FORM, branchId: branches[0]?.id ?? "" }}
            saving={saveMutation.isPending}
            onCancel={() => setCreating(false)}
            onSubmit={(input) => saveMutation.mutate({ id: null, input })}
          />
        ) : null}

        {isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : servicesQuery.isError || branchesQuery.isError ? (
          <ErrorState
            title="تعذّر تحميل الخدمات"
            message="حدث خطأ أثناء جلب بيانات الخدمات."
            onRetry={() => {
              void servicesQuery.refetch();
              void branchesQuery.refetch();
            }}
          />
        ) : services.length === 0 && !creating ? (
          <EmptyState
            icon={Stethoscope}
            title="لا خدمات بعد"
            hint="أضف أول خدمة لتظهر في صفحة الحجز العامة."
          />
        ) : (
          <div className="space-y-8">
            {grouped.map(({ branch, items }) => (
              <section key={branch.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-primary">{branch.name}</h3>
                  <span className="rounded-full border border-subtle bg-subtle px-2 py-0.5 text-xs text-secondary">
                    <MonoText>{items.length}</MonoText> خدمة
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-lg border border-subtle bg-subtle px-4 py-3 text-sm text-muted">
                    لا خدمات في هذا الفرع بعد.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((service) =>
                      editing?.id === service.id ? (
                        <ServiceForm
                          key={service.id}
                          title={`تعديل: ${service.name}`}
                          branches={branches}
                          initial={service}
                          saving={saveMutation.isPending}
                          onCancel={() => setEditing(null)}
                          onSubmit={(input) => saveMutation.mutate({ id: service.id, input })}
                        />
                      ) : (
                        <article
                          key={service.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-subtle bg-base p-4"
                        >
                          <div className="min-w-56 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-primary">{service.name}</p>
                              {!service.isActive ? (
                                <span className="rounded-full bg-subtle px-2 py-0.5 text-xs text-muted">
                                  غير مفعّلة
                                </span>
                              ) : null}
                            </div>
                            {service.description ? (
                              <p className="text-sm text-secondary">{service.description}</p>
                            ) : null}
                          </div>

                          <dl className="flex flex-wrap gap-6 text-sm">
                            <div>
                              <dt className="text-xs text-muted">المدة</dt>
                              <dd className="text-primary">
                                <MonoText>{service.durationMinutes}</MonoText> د
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted">الحاجز</dt>
                              <dd className="text-primary">
                                <MonoText>{service.bufferMinutes}</MonoText> د
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted">السعر</dt>
                              <dd className="text-primary">
                                <MonoText>{formatMoney(service.priceCents)}</MonoText>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted">العربون</dt>
                              <dd className="text-primary">
                                <MonoText>{formatMoney(service.depositCents)}</MonoText>
                              </dd>
                            </div>
                          </dl>

                          <div className="flex items-center gap-3">
                            <Switch
                              checked={service.isActive}
                              onCheckedChange={(checked) =>
                                toggleMutation.mutate({ id: service.id, isActive: checked })
                              }
                              aria-label="تفعيل الخدمة"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCreating(false);
                                setEditing(service);
                              }}
                            >
                              <Pencil className="size-4" />
                              تعديل
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`حذف خدمة «${service.name}»؟`)) {
                                  deleteMutation.mutate(service.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                              حذف
                            </Button>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

interface ServiceFormProps {
  title: string;
  branches: { id: string; name: string }[];
  initial: ServiceInput | ServiceRecord;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (input: ServiceInput) => void;
}

function ServiceForm({ title, branches, initial, saving, onCancel, onSubmit }: ServiceFormProps) {
  const [form, setForm] = useState<ServiceInput>({
    branchId: initial.branchId,
    name: initial.name,
    description: initial.description,
    durationMinutes: initial.durationMinutes,
    bufferMinutes: initial.bufferMinutes,
    priceCents: initial.priceCents,
    depositCents: initial.depositCents,
    isActive: initial.isActive,
  });

  useEffect(() => {
    setForm({
      branchId: initial.branchId,
      name: initial.name,
      description: initial.description,
      durationMinutes: initial.durationMinutes,
      bufferMinutes: initial.bufferMinutes,
      priceCents: initial.priceCents,
      depositCents: initial.depositCents,
      isActive: initial.isActive,
    });
  }, [
    initial.branchId,
    initial.name,
    initial.description,
    initial.durationMinutes,
    initial.bufferMinutes,
    initial.priceCents,
    initial.depositCents,
    initial.isActive,
  ]);

  return (
    <form
      className="space-y-6 rounded-xl border border-subtle bg-base p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="size-4" />
          إلغاء
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="service-name">اسم الخدمة</Label>
          <Input
            id="service-name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="تنظيف أسنان"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-branch">القسم (الفرع)</Label>
          <select
            id="service-branch"
            value={form.branchId}
            onChange={(event) => setForm((prev) => ({ ...prev, branchId: event.target.value }))}
            className="h-10 w-full rounded-lg border border-subtle bg-base px-3 text-sm text-primary"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="service-description">الوصف</Label>
          <Textarea
            id="service-description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="وصف قصير يظهر للعميل في صفحة الحجز."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-duration">المدة (دقيقة)</Label>
          <Input
            id="service-duration"
            type="number"
            min={5}
            max={480}
            step={5}
            className="mono-ltr"
            value={form.durationMinutes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))
            }
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, durationMinutes: preset }))}
                className={
                  form.durationMinutes === preset
                    ? "rounded-md border border-accent-600 bg-accent-50 px-2 py-1 text-xs text-accent-700"
                    : "rounded-md border border-subtle bg-base px-2 py-1 text-xs text-secondary hover:bg-subtle"
                }
              >
                <MonoText>{preset}</MonoText> د
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-buffer">الحاجز الزمني بعد الخدمة (دقيقة)</Label>
          <Input
            id="service-buffer"
            type="number"
            min={0}
            max={120}
            step={5}
            className="mono-ltr"
            value={form.bufferMinutes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, bufferMinutes: Number(event.target.value) }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-price">السعر</Label>
          <Input
            id="service-price"
            type="number"
            min={0}
            step={1}
            className="mono-ltr"
            value={form.priceCents / 100}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                priceCents: Math.round(Number(event.target.value) * 100),
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-deposit">العربون</Label>
          <Input
            id="service-deposit"
            type="number"
            min={0}
            step={1}
            className="mono-ltr"
            value={form.depositCents / 100}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                depositCents: Math.round(Number(event.target.value) * 100),
              }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-subtle pt-4">
        <div className="flex items-center gap-3">
          <Switch
            id="service-active"
            checked={form.isActive}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="service-active" className="text-sm text-secondary">
            خدمة مفعّلة وقابلة للحجز
          </Label>
        </div>
        <Button type="submit" loading={saving}>
          حفظ الخدمة
        </Button>
      </div>
    </form>
  );
}
