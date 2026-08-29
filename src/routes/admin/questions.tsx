import { createFileRoute } from "@tanstack/react-router";
import { CircleHelp, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminShell";

type Lesson = { id: string; title: string; course_title: string };
type Option = {
  id?: string;
  option_text: string;
  is_correct: boolean;
  explanation: string;
};
type Question = {
  id: string;
  lesson_id: string;
  question_text: string;
  level: "easy" | "medium" | "apply";
  sort_order: number;
  is_published: boolean;
  attempt_count: number;
  options: Option[];
};
type FormState = {
  questionId?: string;
  lessonId: string;
  text: string;
  level: "easy" | "medium" | "apply";
  sortOrder: number;
  published: boolean;
  options: Array<{ text: string; explanation: string; correct: boolean }>;
};

const emptyOption = () => ({ text: "", explanation: "", correct: false });
const emptyForm = (): FormState => ({
  lessonId: "",
  text: "",
  level: "medium",
  sortOrder: 0,
  published: false,
  options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
});
const field =
  "min-h-11 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 outline-none focus:ring-2 focus:ring-[#E8A33D]";

export const Route = createFileRoute("/admin/questions")({
  head: () => ({
    meta: [
      { title: "بنك أسئلة الكورسات — عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: QuestionsRoute,
});

function QuestionsContent() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");

  const load = async () => {
    try {
      const response = await fetch("/api/v1/admin/questions", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload.error) throw new Error(payload.error?.message || "تعذّر التحميل");
      setLessons(payload.data.lessons);
      setQuestions(payload.data.questions);
      setForm((current) => ({
        ...current,
        lessonId: current.lessonId || payload.data.lessons[0]?.id || "",
      }));
      setError("");
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تحميل بنك الأسئلة");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (value: FormState) => {
    const response = await fetch("/api/v1/admin/questions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(value),
    });
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(payload.error?.message || "تعذّر الحفظ");
    return payload.data as { revised?: boolean };
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.options.filter((option) => option.correct).length !== 1) {
      toast.error("حدد إجابة صحيحة واحدة فقط");
      return;
    }
    setBusy(true);
    try {
      const result = await save(form);
      toast.success(
        result.revised ? "تم إنشاء نسخة جديدة وحفظ المحاولات القديمة" : "تم حفظ السؤال",
      );
      setForm({ ...emptyForm(), lessonId: form.lessonId });
      await load();
    } catch (value) {
      toast.error("تعذّر حفظ السؤال", {
        description: value instanceof Error ? value.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const edit = (question: Question) => {
    setForm({
      questionId: question.id,
      lessonId: question.lesson_id,
      text: question.question_text,
      level: question.level,
      sortOrder: question.sort_order,
      published: question.is_published,
      options: question.options.map((option) => ({
        text: option.option_text,
        explanation: option.explanation,
        correct: option.is_correct,
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (question: Question) => {
    if (!window.confirm("حذف السؤال؟ الأسئلة التي لها محاولات سابقة ستُخفى بدل حذف نتائج الطلاب."))
      return;
    const response = await fetch(`/api/v1/admin/questions?id=${encodeURIComponent(question.id)}`, {
      method: "DELETE",
    });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      toast.error("تعذّر حذف السؤال", { description: payload.error?.message });
      return;
    }
    toast.success(
      payload.data.archived ? "تم إخفاء السؤال مع الحفاظ على النتائج" : "تم حذف السؤال",
    );
    await load();
  };

  const importQuestions = async () => {
    setBusy(true);
    try {
      const parsed = JSON.parse(importText) as unknown;
      if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 100)
        throw new Error("الملف يجب أن يكون مصفوفة من 1 إلى 100 سؤال");
      for (const item of parsed) {
        if (!item || typeof item !== "object") throw new Error("صيغة أحد الأسئلة غير صحيحة");
        const row = item as Record<string, unknown>;
        await save({
          lessonId: String(row["lessonId"] || form.lessonId),
          text: String(row["text"] || row["question"] || ""),
          level: ["easy", "medium", "apply"].includes(String(row["level"]))
            ? (String(row["level"]) as FormState["level"])
            : "medium",
          sortOrder: Number(row["sortOrder"] || 0),
          published: Boolean(row["published"]),
          options: Array.isArray(row["options"])
            ? row["options"].map((option) => {
                const value = option as Record<string, unknown>;
                return {
                  text: String(value["text"] || ""),
                  explanation: String(value["explanation"] || value["why"] || ""),
                  correct: Boolean(value["correct"]),
                };
              })
            : [],
        });
      }
      toast.success(`تم استيراد ${parsed.length} سؤال`);
      setImportText("");
      await load();
    } catch (value) {
      toast.error("تعذّر استيراد بنك الأسئلة", {
        description: value instanceof Error ? value.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  const lessonName = (id: string) => {
    const lesson = lessons.find((item) => item.id === id);
    return lesson ? `${lesson.course_title} — ${lesson.title}` : "درس غير معروف";
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.72fr)_minmax(0,1.28fr)]">
      <div className="space-y-5">
        <form
          onSubmit={submit}
          className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"
        >
          <div className="flex items-center gap-2">
            <CircleHelp />
            <h2 className="font-display text-2xl font-bold">
              {form.questionId ? "تعديل السؤال" : "سؤال جديد"}
            </h2>
          </div>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold">
              الدرس
              <select
                required
                value={form.lessonId}
                onChange={(event) => setForm({ ...form, lessonId: event.target.value })}
                className={field}
              >
                <option value="">اختر الدرس</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.course_title} — {lesson.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              نص السؤال
              <textarea
                required
                minLength={3}
                value={form.text}
                onChange={(event) => setForm({ ...form, text: event.target.value })}
                className={`${field} min-h-24 py-3`}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">
                المستوى
                <select
                  value={form.level}
                  onChange={(event) =>
                    setForm({ ...form, level: event.target.value as FormState["level"] })
                  }
                  className={field}
                >
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="apply">تطبيق</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                الترتيب
                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })}
                  className={field}
                />
              </label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <strong>الاختيارات</strong>
                <button
                  type="button"
                  disabled={form.options.length >= 8}
                  onClick={() => setForm({ ...form, options: [...form.options, emptyOption()] })}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--ok-ink)] px-3 font-bold"
                >
                  <Plus size={16} /> اختيار
                </button>
              </div>
              {form.options.map((option, index) => (
                <div key={index} className="rounded-2xl border border-[var(--ok-ink)]/25 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      aria-label={`الإجابة ${index + 1} صحيحة`}
                      type="radio"
                      name="correctOption"
                      checked={option.correct}
                      onChange={() =>
                        setForm({
                          ...form,
                          options: form.options.map((item, itemIndex) => ({
                            ...item,
                            correct: itemIndex === index,
                          })),
                        })
                      }
                    />
                    <input
                      required
                      placeholder={`الاختيار ${index + 1}`}
                      value={option.text}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          options: form.options.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, text: event.target.value } : item,
                          ),
                        })
                      }
                      className={field}
                    />
                    {form.options.length > 2 && (
                      <button
                        type="button"
                        aria-label={`حذف الاختيار ${index + 1}`}
                        onClick={() =>
                          setForm({
                            ...form,
                            options: form.options.filter((_, itemIndex) => itemIndex !== index),
                          })
                        }
                        className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-700 text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <textarea
                    required
                    placeholder="تعليل يظهر للمتعلّم بعد الإجابة"
                    value={option.explanation}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        options: form.options.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, explanation: event.target.value } : item,
                        ),
                      })
                    }
                    className={`${field} mt-2 min-h-20 py-3`}
                  />
                </div>
              ))}
            </div>
            <label className="flex min-h-11 items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm({ ...form, published: event.target.checked })}
              />
              نشر السؤال فورًا
            </label>
            <div className="flex gap-2">
              <button
                disabled={busy}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#E8A33D] font-bold text-[#181511]"
              >
                <Save size={17} /> حفظ السؤال
              </button>
              {form.questionId && (
                <button
                  type="button"
                  onClick={() => setForm({ ...emptyForm(), lessonId: form.lessonId })}
                  className="h-11 rounded-xl border-2 border-[var(--ok-ink)] px-4 font-bold"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </form>
        <section className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
          <div className="flex items-center gap-2">
            <Upload size={19} />
            <h2 className="font-display text-xl font-bold">استيراد JSON</h2>
          </div>
          <p className="mt-2 text-sm opacity-65">
            مصفوفة تحتوي text وlevel وoptions، وكل اختيار يحتوي text وexplanation وcorrect.
          </p>
          <textarea
            dir="ltr"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder='[{"text":"...","level":"easy","options":[...]}]'
            className={`${field} mt-3 min-h-36 py-3 font-mono text-xs`}
          />
          <button
            type="button"
            disabled={busy || !importText.trim() || !form.lessonId}
            onClick={() => void importQuestions()}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]"
          >
            <Upload size={17} /> استيراد للدرس المحدد
          </button>
        </section>
      </div>
      <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
        <div className="border-b-2 border-[var(--ok-ink)] p-5">
          <h2 className="font-display text-2xl font-bold">الأسئلة الحالية</h2>
          <p className="mt-1 text-sm opacity-60">الإجابة الصحيحة لا تظهر إلا داخل لوحة الإدارة.</p>
        </div>
        {error && <p className="border-b border-red-700 bg-red-50 p-4 text-red-800">{error}</p>}
        <div className="divide-y divide-[var(--ok-ink)]/15">
          {questions.map((question) => (
            <article key={question.id} className="p-5">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#A96700]">
                    {lessonName(question.lesson_id)}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold">{question.question_text}</h3>
                  <p className="mt-1 text-xs opacity-55">
                    {question.is_published ? "منشور" : "مسودة"} · {question.attempt_count} محاولة
                  </p>
                </div>
                <button
                  aria-label="تعديل السؤال"
                  onClick={() => edit(question)}
                  className="grid size-10 place-items-center rounded-xl border border-[var(--ok-ink)]"
                >
                  <Pencil size={16} />
                </button>
                <button
                  aria-label="حذف السؤال"
                  onClick={() => void remove(question)}
                  className="grid size-10 place-items-center rounded-xl border border-red-700 text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => (
                  <li
                    key={option.id}
                    className={`rounded-xl border p-3 text-sm ${
                      option.is_correct
                        ? "border-green-700 bg-green-50 text-green-950"
                        : "border-[var(--ok-ink)]/20"
                    }`}
                  >
                    <strong>{option.option_text}</strong>
                    <span className="mt-1 block text-xs opacity-65">{option.explanation}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
          {questions.length === 0 && !error && (
            <div className="p-10 text-center">
              <CircleHelp className="mx-auto opacity-40" size={34} />
              <p className="mt-3 font-bold">لا توجد أسئلة بعد</p>
              <p className="mt-1 text-sm opacity-60">اختر درسًا وأضف أول سؤال من النموذج.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function QuestionsRoute() {
  return (
    <AdminLayout title="بنك الأسئلة">
      <QuestionsContent />
    </AdminLayout>
  );
}
