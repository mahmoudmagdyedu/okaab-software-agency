import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/mawid/app-shell";
import { ErrorState } from "@/components/mawid/error-state";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { MonoText } from "@/components/mawid/mono-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/session";
import {
  fetchNotificationSettings,
  MAX_TEMPLATE_LENGTH,
  minuteLabel,
  parseMinuteLabel,
  REMINDER_CHOICES,
  renderPreview,
  saveNotificationSettings,
  TEMPLATE_LABELS,
  TEMPLATE_VARIABLES,
  unknownVariables,
  validateSettings,
  type NotificationSettings,
  type TemplateKey,
} from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated/app/settings/whatsapp")({
  head: () => ({
    meta: [
      { title: "إشعارات واتساب والتذكير — مَوعِد" },
      {
        name: "description",
        content: "اضبط قنوات الإشعار وتوقيت التذكير ونصوص رسائل واتساب مع معاينة قبل الحفظ.",
      },
      { property: "og:title", content: "إشعارات واتساب والتذكير — مَوعِد" },
      {
        property: "og:description",
        content: "قنوات الإشعار وتوقيت التذكير ونصوص الرسائل بمعاينة فورية.",
      },
    ],
  }),
  component: WhatsAppSettingsPage,
});

const TEMPLATE_KEYS = Object.keys(TEMPLATE_LABELS) as TemplateKey[];

function WhatsAppSettingsPage() {
  const { session, role, tenantId, loading } = useSession();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<NotificationSettings | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("template_reminder");
  const [quietStartText, setQuietStartText] = useState("");
  const [quietEndText, setQuietEndText] = useState("");

  const query = useQuery({
    queryKey: ["notification-settings", tenantId],
    queryFn: () => fetchNotificationSettings(tenantId as string),
    enabled: Boolean(tenantId),
  });

  useEffect(() => {
    if (!query.data) return;
    setDraft(query.data);
    setQuietStartText(minuteLabel(query.data.quietStartMinute));
    setQuietEndText(minuteLabel(query.data.quietEndMinute));
  }, [query.data]);

  const save = useMutation({
    mutationFn: () => saveNotificationSettings(draft as NotificationSettings),
    onSuccess: () => {
      toast.success("حُفظت إعدادات الإشعارات");
      void queryClient.invalidateQueries({ queryKey: ["notification-settings", tenantId] });
    },
    onError: (error: Error) => toast.error(error.message || "تعذّر الحفظ"),
  });

  const userName =
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    session?.user.email ||
    "مستخدم";

  const canEdit = role === "owner" || role === "branch_manager" || role === "super_admin";
  const invalid = draft ? validateSettings(draft) : null;
  const patch = (next: Partial<NotificationSettings>) =>
    setDraft((current) => (current ? { ...current, ...next } : current));

  return (
    <AppShell
      title="الإعدادات — واتساب والتذكير"
      role={role}
      userName={userName}
      tenantName="مَوعِد"
    >
      {loading || query.isPending || !draft ? (
        <Skeleton className="h-[520px] rounded-[6px]" />
      ) : query.isError ? (
        <ErrorState
          title="تعذّر تحميل الإعدادات"
          message="حدث خلل أثناء جلب إعدادات الإشعارات. أعد المحاولة."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <div className="space-y-6">
          {!canEdit ? (
            <InlineAlert tone="info">
              <strong className="font-medium">عرض فقط:</strong> تعديل الإشعارات متاح لمدير الفرع
              والمالك.
            </InlineAlert>
          ) : null}

          <section className="space-y-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <h2 className="text-h3 font-semibold text-[var(--text-primary)]">القنوات</h2>

            <div className="flex items-center justify-between gap-4 rounded-[6px] border border-[var(--border-subtle)] p-3">
              <div className="flex items-center gap-3">
                <MessageSquare
                  className="size-[18px] text-[var(--accent-700)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div>
                  <p className="text-body font-medium text-[var(--text-primary)]">واتساب</p>
                  <p className="text-caption text-[var(--text-muted)]">
                    القناة الأساسية للتأكيد والتذكير
                  </p>
                </div>
              </div>
              <Switch
                aria-label="تشغيل إشعارات واتساب"
                checked={draft.whatsappEnabled}
                disabled={!canEdit}
                onCheckedChange={(value) => patch({ whatsappEnabled: value })}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[6px] border border-[var(--border-subtle)] p-3">
              <div className="flex items-center gap-3">
                <Smartphone
                  className="size-[18px] text-[var(--text-secondary)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div>
                  <p className="text-body font-medium text-[var(--text-primary)]">رسالة نصية SMS</p>
                  <p className="text-caption text-[var(--text-muted)]">
                    قناة بديلة عند تعذّر واتساب
                  </p>
                </div>
              </div>
              <Switch
                aria-label="تشغيل الرسائل النصية"
                checked={draft.smsEnabled}
                disabled={!canEdit}
                onCheckedChange={(value) => patch({ smsEnabled: value })}
              />
            </div>

            <div className="max-w-[320px] space-y-1.5">
              <Label htmlFor="sender">اسم المُرسِل</Label>
              <Input
                id="sender"
                maxLength={60}
                value={draft.senderName}
                disabled={!canEdit}
                onChange={(event) => patch({ senderName: event.target.value })}
              />
            </div>
          </section>

          <section className="space-y-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <div>
              <h2 className="text-h3 font-semibold text-[var(--text-primary)]">تكرار التذكير</h2>
              <p className="mt-1 text-caption text-[var(--text-muted)]">
                يُرسَل التذكير قبل الموعد بالساعات المختارة
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {REMINDER_CHOICES.map((hours) => {
                const on = draft.reminderOffsetsHours.includes(hours);
                return (
                  <button
                    key={hours}
                    type="button"
                    disabled={!canEdit}
                    aria-pressed={on}
                    onClick={() =>
                      patch({
                        reminderOffsetsHours: on
                          ? draft.reminderOffsetsHours.filter((h) => h !== hours)
                          : [...draft.reminderOffsetsHours, hours],
                      })
                    }
                    className={`min-h-9 rounded-[6px] border px-3 text-body-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)] ${
                      on
                        ? "border-[var(--accent-600)] bg-[var(--accent-50)] text-[var(--accent-700)]"
                        : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    قبل <MonoText>{String(hours)}</MonoText> ساعة
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:max-w-[420px]">
              <div className="space-y-1.5">
                <Label htmlFor="quiet-start">بداية ساعات الهدوء</Label>
                <Input
                  id="quiet-start"
                  className="mono-ltr"
                  value={quietStartText}
                  disabled={!canEdit}
                  onChange={(event) => {
                    setQuietStartText(event.target.value);
                    const minute = parseMinuteLabel(event.target.value);
                    if (minute !== null) patch({ quietStartMinute: minute });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quiet-end">نهاية ساعات الهدوء</Label>
                <Input
                  id="quiet-end"
                  className="mono-ltr"
                  value={quietEndText}
                  disabled={!canEdit}
                  onChange={(event) => {
                    setQuietEndText(event.target.value);
                    const minute = parseMinuteLabel(event.target.value);
                    if (minute !== null) patch({ quietEndMinute: minute });
                  }}
                />
              </div>
            </div>
            <p className="text-caption text-[var(--text-muted)]">
              لا تُرسَل رسائل بين <MonoText>{minuteLabel(draft.quietStartMinute)}</MonoText> و{" "}
              <MonoText>{minuteLabel(draft.quietEndMinute)}</MonoText> بتوقيت الفرع؛ تُؤجَّل لأول
              وقت مسموح.
            </p>
          </section>

          <section className="space-y-4 rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
            <h2 className="text-h3 font-semibold text-[var(--text-primary)]">نصوص الرسائل</h2>

            <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
              {TEMPLATE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTemplate(key)}
                  className={`min-h-9 rounded-[6px] px-3 text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-600)] ${
                    activeTemplate === key
                      ? "bg-[var(--accent-50)] font-medium text-[var(--accent-700)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  {TEMPLATE_LABELS[key]}
                </button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="template">{TEMPLATE_LABELS[activeTemplate]}</Label>
                <Textarea
                  id="template"
                  className="min-h-[180px]"
                  maxLength={MAX_TEMPLATE_LENGTH}
                  value={draft[activeTemplate]}
                  disabled={!canEdit}
                  onChange={(event) => patch({ [activeTemplate]: event.target.value })}
                />
                <p className="text-caption text-[var(--text-muted)]">
                  <MonoText>{`${draft[activeTemplate].length}/${MAX_TEMPLATE_LENGTH}`}</MonoText>{" "}
                  حرفًا
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      disabled={!canEdit}
                      onClick={() =>
                        patch({ [activeTemplate]: `${draft[activeTemplate]}{{${variable}}}` })
                      }
                      className="mono-ltr rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2 py-1 text-caption text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {`{{${variable}}}`}
                    </button>
                  ))}
                </div>
                {unknownVariables(draft[activeTemplate]).length > 0 ? (
                  <InlineAlert tone="danger">
                    <strong className="font-medium">متغير غير معروف:</strong>{" "}
                    <span className="mono-ltr">{`{{${unknownVariables(draft[activeTemplate])[0]}}}`}</span>{" "}
                    غير مدعوم؛ استخدم المتغيرات المتاحة أعلاه.
                  </InlineAlert>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-body-sm font-medium text-[var(--text-primary)]">
                  معاينة قبل الحفظ
                </p>
                <div className="rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4">
                  <p className="text-caption text-[var(--text-muted)]">
                    {draft.senderName.trim() || "اسم المُرسِل"} — واتساب
                  </p>
                  <div className="mt-3 max-w-[320px] rounded-[10px] rounded-tr-[2px] bg-[var(--accent-50)] p-3">
                    <p className="whitespace-pre-wrap text-body text-[var(--text-primary)]">
                      {renderPreview(draft[activeTemplate]) || "اكتب نص الرسالة لتظهر المعاينة."}
                    </p>
                    <MonoText className="mt-2 block text-left text-caption text-[var(--text-muted)]">
                      14:30
                    </MonoText>
                  </div>
                  <p className="mt-3 text-caption text-[var(--text-muted)]">
                    المعاينة ببيانات نموذجية — لا تُرسَل أي رسالة فعلية.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {invalid ? (
            <InlineAlert tone="warning">
              <strong className="font-medium">تعذّر الحفظ:</strong> {invalid}
            </InlineAlert>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={!canEdit || Boolean(invalid)}
              loading={save.isPending}
              onClick={() => save.mutate()}
            >
              حفظ الإعدادات
            </Button>
            <Button
              variant="secondary"
              disabled={!query.data}
              onClick={() => {
                if (!query.data) return;
                setDraft(query.data);
                setQuietStartText(minuteLabel(query.data.quietStartMinute));
                setQuietEndText(minuteLabel(query.data.quietEndMinute));
              }}
            >
              استرجاع المحفوظ
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
