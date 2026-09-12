import { useClerk } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Flame,
  LogOut,
  Medal,
  PlayCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { LEARNING_COPY, learningLanguage } from "@/lib/learning-copy";
import { ThemeProvider } from "@/lib/theme";

type Overview = {
  profile: { display_name: string };
  points: number;
  rank: number | null;
  streak: { current_days: number };
  continueLearning: { slug: string; title: string; course_slug: string } | null;
  badges: Array<{ id: string; title: string; description: string }>;
  level: { name: string; minimum: number; next: number | null };
};

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Learning Dashboard — Okaab" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ClerkBoundary>
          <DashboardContent />
        </ClerkBoundary>
      </I18nProvider>
    </ThemeProvider>
  );
}

function DashboardContent() {
  const { signOut } = useClerk();
  const { locale, setLocale, t } = useI18n();
  const language = learningLanguage(locale);
  const copy = LEARNING_COPY[language].dashboard;
  const [data, setData] = useState<Overview | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    void fetch("/api/v1/me/overview", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          setState("unauthorized");
          return;
        }
        if (!response.ok) throw new Error("overview");
        const payload = (await response.json()) as { data: Overview };
        setData(payload.data);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setState("error");
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  const levelProgress = data
    ? data.level.next === null
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            ((data.points - data.level.minimum) /
              Math.max(1, data.level.next - data.level.minimum)) *
              100,
          ),
        )
    : 0;

  return (
    <div
      dir={t.dir}
      lang={t.htmlLang}
      className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"
    >
      <OkaabStyles />
      <SiteHeader lang={language} locale={locale} onLocaleChange={setLocale} />
      <main className="ok-container py-9 sm:py-14 lg:py-16">
        <section className="relative overflow-hidden rounded-[2.25rem] border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] p-6 text-[var(--ok-paper)] sm:p-9">
          <div className="absolute -end-20 -top-24 size-64 rounded-full bg-[#E8A33D]/25 blur-3xl" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-[#E8A33D]">
                <Sparkles size={16} />
                {copy.space}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">
                {data ? `${copy.greeting}، ${data.profile.display_name}` : copy.title}
              </h1>
              <p className="mt-4 max-w-2xl leading-7 opacity-70">{copy.subtitle}</p>
            </div>
            {state === "ready" && (
              <button
                type="button"
                onClick={() => void signOut({ redirectUrl: "/" })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/25 px-5 font-bold transition-colors hover:bg-white hover:text-[#181511]"
              >
                <LogOut size={17} />
                {copy.logout}
              </button>
            )}
          </div>
        </section>

        {state === "unauthorized" ? (
          <MessageCard title={copy.signInTitle} body={copy.signInBody}>
            <a
              href="/sign-in/"
              className="inline-flex rounded-full bg-[var(--ok-ink)] px-6 py-3 font-bold text-[var(--ok-paper)]"
            >
              {copy.signIn}
            </a>
          </MessageCard>
        ) : state === "error" ? (
          <MessageCard title={copy.loadError}>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-[var(--ok-ink)] px-5 py-3 font-bold text-[var(--ok-paper)]"
            >
              {copy.retry}
            </button>
          </MessageCard>
        ) : !data ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-3xl bg-[var(--ok-card)]" />
            ))}
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat
                icon={Award}
                value={data.points}
                label={`${copy.points} · ${data.level.name}`}
              />
              <Stat icon={Flame} value={data.streak.current_days} label={copy.streak} />
              <Stat icon={Medal} value={data.rank ?? "—"} label={copy.rank} />
            </section>
            <section className="mt-4 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 text-sm font-bold">
                <span>{data.level.name}</span>
                <span className="opacity-60">
                  {data.level.next === null
                    ? copy.topLevel
                    : `${data.level.next - data.points} ${copy.nextLevel}`}
                </span>
              </div>
              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--ok-paper-2)]"
                role="progressbar"
                aria-valuenow={Math.round(levelProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-[#E8A33D] transition-[width]"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </section>
            {data.continueLearning && (
              <section className="mt-6 rounded-[2rem] border-2 border-[var(--ok-ink)] bg-[#E8A33D] p-6 text-[#181511] sm:p-8">
                <p className="text-sm font-bold opacity-65">{copy.continueEyebrow}</p>
                <h2 className="mt-2 font-display text-3xl font-black">
                  {data.continueLearning.title}
                </h2>
                <Link
                  to="/courses/$courseSlug/$lessonSlug"
                  params={{
                    courseSlug: data.continueLearning.course_slug,
                    lessonSlug: data.continueLearning.slug,
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#181511] px-5 py-3 font-bold text-white"
                >
                  <PlayCircle size={19} />
                  {copy.continue}
                </Link>
              </section>
            )}
            <section className="mt-6 grid gap-4 sm:grid-cols-2">
              <ActionCard
                to="/courses"
                icon={BookOpen}
                title={copy.explore}
                body={copy.exploreBody}
              />
              <ActionCard
                to="/profile"
                icon={UserRound}
                title={copy.profile}
                body={copy.profileBody}
              />
            </section>
            <section className="mt-9">
              <h2 className="font-display text-3xl font-bold">{copy.achievements}</h2>
              {data.badges.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {data.badges.slice(0, 3).map((badge) => (
                    <article
                      key={badge.id}
                      className="rounded-3xl bg-[var(--ok-ink)] p-6 text-[var(--ok-paper)]"
                    >
                      <Award className="text-[#E8A33D]" />
                      <h3 className="mt-4 font-bold text-[#E8A33D]">{badge.title}</h3>
                      <p className="mt-2 text-sm leading-6 opacity-70">{badge.description}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-3xl border-2 border-dashed border-[var(--ok-ink)] p-6 opacity-65">
                  {copy.noAchievements}
                </p>
              )}
            </section>
          </>
        )}
      </main>
      <SiteFooter lang={language} />
    </div>
  );
}

function MessageCard({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-7">
      <h2 className="text-2xl font-bold">{title}</h2>
      {body && <p className="mt-2 opacity-65">{body}</p>}
      <div className="mt-5">{children}</div>
    </section>
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
      <strong className="mt-4 block font-display text-4xl">{value}</strong>
      <p className="mt-1 opacity-60">{label}</p>
    </article>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: "/courses" | "/profile";
  icon: typeof BookOpen;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 transition-transform hover:-translate-y-1"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E8A33D] text-[#181511]">
        <Icon />
      </span>
      <span className="min-w-0">
        <strong className="block text-xl">{title}</strong>
        <span className="mt-1 block text-sm leading-6 opacity-60">{body}</span>
      </span>
      <ArrowUpRight className="ms-auto shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
    </Link>
  );
}
