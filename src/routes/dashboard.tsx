import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, Flame, Medal, PlayCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

type Overview = {
  profile: { display_name: string };
  points: number;
  rank: number | null;
  streak: { current_days: number };
  continueLearning: { slug: string; title: string; course_slug: string } | null;
  badges: Array<{ id: string; title: string; description: string }>;
  level: { name: string; next: number | null };
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "لوحة الطالب — عُقاب" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [state, setState] = useState<"loading" | "unauthorized" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    void fetch("/api/v1/me/overview", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) return setState("unauthorized");
        if (!response.ok) throw new Error("overview");
        const payload = (await response.json()) as { data: Overview };
        setData(payload.data);
        setState("loading");
      })
      .catch(() => setState("error"))
      .finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <ThemeProvider>
      <div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]">
        <OkaabStyles />
        <SiteHeader lang="ar" />
        <main className="ok-container py-10 sm:py-16">
          <p className="font-bold text-[var(--ok-accent-text)]">مساحة الطالب</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-6xl">
            {data ? `أهلًا، ${data.profile.display_name}` : "لوحة التعلّم"}
          </h1>
          {state === "unauthorized" ? (
            <section className="mt-8 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-7">
              <h2 className="text-2xl font-bold">سجّل دخولك للمتابعة</h2>
              <a
                href="/sign-in/"
                className="mt-5 inline-flex rounded-full bg-[var(--ok-ink)] px-6 py-3 font-bold text-[var(--ok-paper)]"
              >
                تسجيل الدخول
              </a>
            </section>
          ) : state === "error" ? (
            <section className="mt-8 rounded-3xl border-2 border-red-600 bg-[var(--ok-card)] p-7">
              <h2 className="text-xl font-bold">تعذّر تحميل بياناتك</h2>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-[var(--ok-ink)] px-5 py-3 font-bold text-[var(--ok-paper)]"
              >
                حاول مرة أخرى
              </button>
            </section>
          ) : !data ? (
            <div className="mt-8 h-72 animate-pulse rounded-3xl bg-[var(--ok-card)]" />
          ) : (
            <>
              <section className="mt-8 grid gap-4 sm:grid-cols-3">
                <Stat icon={Award} value={data.points} label={`نقطة · ${data.level.name}`} />
                <Stat icon={Flame} value={data.streak.current_days} label="يوم متواصل" />
                <Stat icon={Medal} value={data.rank ?? "—"} label="ترتيبك بين المتصدرين" />
              </section>
              {data.continueLearning && (
                <section className="mt-6 rounded-3xl border-2 border-[var(--ok-ink)] bg-[#E8A33D] p-6 text-[#181511]">
                  <p className="text-sm font-bold opacity-70">كمّل من حيث توقفت</p>
                  <h2 className="mt-2 text-2xl font-black">{data.continueLearning.title}</h2>
                  <Link
                    to="/courses/$courseSlug/$lessonSlug"
                    params={{
                      courseSlug: data.continueLearning.course_slug,
                      lessonSlug: data.continueLearning.slug,
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#181511] px-5 py-3 font-bold text-white"
                  >
                    <PlayCircle size={19} />
                    متابعة الدرس
                  </Link>
                </section>
              )}
              <section className="mt-6 grid gap-4 sm:grid-cols-2">
                <Link
                  to="/courses"
                  className="flex items-center gap-4 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 text-xl font-bold"
                >
                  <BookOpen />
                  كل الكورسات
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-4 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 text-xl font-bold"
                >
                  <UserRound />
                  حسابي وإنجازاتي
                </Link>
              </section>
              {data.badges.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-2xl font-bold">أحدث الإنجازات</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {data.badges.slice(0, 3).map((badge) => (
                      <article
                        key={badge.id}
                        className="rounded-2xl bg-[var(--ok-ink)] p-5 text-[var(--ok-paper)]"
                      >
                        <h3 className="font-bold text-[#E8A33D]">{badge.title}</h3>
                        <p className="mt-2 text-sm opacity-70">{badge.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
        <SiteFooter lang="ar" />
      </div>
    </ThemeProvider>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Award;
  value: number | string;
  label: string;
}) {
  return (
    <article className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6">
      <Icon className="text-[var(--ok-accent-text)]" />
      <strong className="mt-4 block text-4xl">{value}</strong>
      <p className="mt-1 opacity-60">{label}</p>
    </article>
  );
}
