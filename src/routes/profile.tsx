import { useClerk } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { LEARNING_COPY, learningLanguage } from "@/lib/learning-copy";
import { ThemeProvider } from "@/lib/theme";

type Profile = {
  display_name: string;
  email: string;
  birthdate: string | null;
  leaderboard_visible: boolean;
};
type Overview = {
  profile: Profile;
  points: number;
  rank: number | null;
  streak: { current_days: number; longest_days: number };
  badges: { id: string; title: string; description: string }[];
  level: { name: string; minimum: number; next: number | null };
};

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — Okaab" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ClerkBoundary>
          <ProfileContent />
        </ClerkBoundary>
      </I18nProvider>
    </ThemeProvider>
  );
}

function ProfileContent() {
  const { signOut } = useClerk();
  const { locale, setLocale, t } = useI18n();
  const language = learningLanguage(locale);
  const copy = LEARNING_COPY[language].profile;
  const [overview, setOverview] = useState<Overview | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/v1/me/overview", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          setUnauthorized(true);
          return;
        }
        const payload = await response.json();
        if (!response.ok)
          throw new Error(
            language === "ar" ? payload?.error?.message || copy.loadError : copy.loadError,
          );
        setOverview(payload.data);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          setMessage(error instanceof Error ? error.message : copy.loadError);
      });
    return () => controller.abort();
  }, [copy.loadError, language]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(copy.saving);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/me", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("name"),
        birthdate: form.get("birthdate") || null,
        leaderboardVisible: form.get("visible") === "on",
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(language === "ar" ? payload?.error?.message || copy.saveError : copy.saveError);
      return;
    }
    setOverview((current) => (current ? { ...current, profile: payload.data } : current));
    setMessage(copy.saved);
  }

  async function removeAccount() {
    if (window.prompt(copy.deletePrompt) !== copy.deletePhrase) return;
    setMessage(copy.deleting);
    const response = await fetch("/api/v1/me", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmation: "احذف حسابي" }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(
        language === "ar" ? payload?.error?.message || copy.deleteError : copy.deleteError,
      );
      return;
    }
    await signOut({ redirectUrl: "/" });
  }

  return (
    <div
      dir={t.dir}
      lang={t.htmlLang}
      className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"
    >
      <OkaabStyles />
      <SiteHeader lang={language} locale={locale} onLocaleChange={setLocale} />
      <main className="ok-container py-9 sm:py-14 lg:py-16">
        <h1 className="font-display text-4xl font-bold sm:text-6xl">{copy.title}</h1>
        {unauthorized ? (
          <div className="mt-8 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8">
            <h2 className="text-2xl font-bold">{copy.signInTitle}</h2>
            <p className="mt-2 opacity-65">{copy.signInBody}</p>
            <a
              href="/sign-in/"
              className="mt-5 inline-flex rounded-full bg-[var(--ok-ink)] px-5 py-3 font-bold text-[var(--ok-paper)]"
            >
              {copy.signIn}
            </a>
          </div>
        ) : !overview ? (
          <div className="mt-8 h-80 animate-pulse rounded-2xl bg-[var(--ok-card)]" />
        ) : (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat
                value={overview.points}
                label={`${copy.points} · ${copy.rank} ${overview.level.name}`}
              />
              <Stat value={overview.streak.current_days} label={copy.streak} />
              <Stat value={overview.rank ?? "—"} label={copy.leaderboardRank} />
            </div>
            {overview.badges.length > 0 && (
              <section className="mt-6 max-w-2xl">
                <h2 className="text-xl font-bold">{copy.badges}</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {overview.badges.map((badge) => (
                    <article
                      key={badge.id}
                      className="rounded-2xl bg-[var(--ok-ink)] p-4 text-[var(--ok-paper)]"
                    >
                      <h3 className="font-bold text-[#E8A33D]">{badge.title}</h3>
                      <p className="mt-1 text-sm opacity-70">{badge.description}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
            <form
              onSubmit={save}
              className="mt-6 grid max-w-2xl gap-5 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 sm:p-6"
            >
              <label className="grid gap-2 font-bold">
                {copy.name}
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={40}
                  defaultValue={overview.profile.display_name}
                  className="min-h-12 min-w-0 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-4"
                />
              </label>
              <label className="grid gap-2 font-bold">
                {copy.birthdate}
                <input
                  name="birthdate"
                  type="date"
                  defaultValue={overview.profile.birthdate?.slice(0, 10) || ""}
                  className="min-h-12 min-w-0 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-4"
                />
              </label>
              <label className="flex min-h-11 items-center gap-3 font-bold">
                <input
                  name="visible"
                  type="checkbox"
                  defaultChecked={overview.profile.leaderboard_visible}
                  className="size-5 accent-[#E8A33D]"
                />
                {copy.visible}
              </label>
              <button className="min-h-12 rounded-full bg-[var(--ok-ink)] px-5 font-bold text-[var(--ok-paper)]">
                {copy.save}
              </button>
              {message && (
                <p role="status" className="break-words">
                  {message}
                </p>
              )}
            </form>
            <div className="mt-6 max-w-2xl rounded-2xl border-2 border-red-700 bg-[var(--ok-card)] p-5 sm:p-6">
              <h2 className="font-bold text-red-700">{copy.dangerTitle}</h2>
              <p className="mt-2 text-sm opacity-70">{copy.dangerBody}</p>
              <button
                type="button"
                onClick={() => void removeAccount()}
                className="mt-4 min-h-11 rounded-xl border-2 border-red-700 px-5 font-bold text-red-700"
              >
                {copy.delete}
              </button>
            </div>
            <Link
              to="/leaderboard"
              className="mt-5 inline-flex font-bold text-[var(--ok-accent-text)] underline"
            >
              {copy.leaderboard}
            </Link>
          </>
        )}
        {!overview && message && (
          <p role="alert" className="mt-5">
            {message}
          </p>
        )}
      </main>
      <SiteFooter lang={language} />
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
      <strong className="text-3xl">{value}</strong>
      <p className="opacity-60">{label}</p>
    </div>
  );
}
