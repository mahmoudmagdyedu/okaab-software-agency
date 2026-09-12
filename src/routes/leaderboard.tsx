import { createFileRoute, Link } from "@tanstack/react-router";
import { Medal } from "lucide-react";
import { useEffect, useState } from "react";

import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { learningLanguage, type LearningLanguage } from "@/lib/learning-copy";
import { ThemeProvider } from "@/lib/theme";

type Period = "weekly" | "monthly" | "all";
type Leader = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  rank: number;
};
type Board = { period: Period; leaders: Leader[]; me: Leader | null };
type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  profile: string;
  weekly: string;
  monthly: string;
  all: string;
  rank: string;
  learner: string;
  points: string;
  empty: string;
  myRank: string;
  loadError: string;
};

const COPY: Record<LearningLanguage, Copy> = {
  ar: {
    eyebrow: "منصة عُقاب",
    title: "المتصدرون",
    description: "النقاط هنا نتيجة تعلّم حقيقي: أسئلة، دروس ومهام مكتملة.",
    profile: "حسابي",
    weekly: "الأسبوع",
    monthly: "الشهر",
    all: "كل الوقت",
    rank: "الترتيب",
    learner: "المتعلّم",
    points: "النقاط",
    empty: "أول نقاط هتظهر هنا فورًا.",
    myRank: "ترتيبك أنت",
    loadError: "تعذّر تحميل الترتيب",
  },
  en: {
    eyebrow: "Okaab Learning",
    title: "Leaderboard",
    description: "Points reflect real learning: correct answers and completed lessons and tasks.",
    profile: "My profile",
    weekly: "This week",
    monthly: "This month",
    all: "All time",
    rank: "Rank",
    learner: "Learner",
    points: "Points",
    empty: "The first earned points will appear here.",
    myRank: "Your rank",
    loadError: "We couldn't load the leaderboard.",
  },
  fr: {
    eyebrow: "Okaab Learning",
    title: "Classement",
    description:
      "Les points reflètent un apprentissage réel : réponses correctes, leçons et tâches terminées.",
    profile: "Mon profil",
    weekly: "Cette semaine",
    monthly: "Ce mois",
    all: "Depuis le début",
    rank: "Rang",
    learner: "Apprenant",
    points: "Points",
    empty: "Les premiers points gagnés apparaîtront ici.",
    myRank: "Votre rang",
    loadError: "Impossible de charger le classement.",
  },
  es: {
    eyebrow: "Okaab Learning",
    title: "Clasificación",
    description:
      "Los puntos reflejan aprendizaje real: respuestas correctas, lecciones y tareas completadas.",
    profile: "Mi perfil",
    weekly: "Esta semana",
    monthly: "Este mes",
    all: "Desde siempre",
    rank: "Posición",
    learner: "Estudiante",
    points: "Puntos",
    empty: "Los primeros puntos obtenidos aparecerán aquí.",
    myRank: "Tu posición",
    loadError: "No se pudo cargar la clasificación.",
  },
};

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Okaab" },
      { name: "description", content: "Okaab learner leaderboard." },
    ],
    links: [{ rel: "canonical", href: "https://okaab.org/leaderboard" }],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LeaderboardContent />
      </I18nProvider>
    </ThemeProvider>
  );
}

function LeaderboardContent() {
  const { locale, setLocale, t } = useI18n();
  const copy = COPY[learningLanguage(locale)];
  const [period, setPeriod] = useState<Period>("weekly");
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setBoard(null);
    setError("");
    void fetch(`/api/v1/leaderboard?period=${period}`, {
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(copy.loadError);
        setBoard(payload.data);
      })
      .catch((value) => {
        if (!(value instanceof DOMException && value.name === "AbortError"))
          setError(copy.loadError);
      });
    return () => controller.abort();
  }, [copy.loadError, period]);

  const periodLabel = (value: Period) =>
    value === "weekly" ? copy.weekly : value === "monthly" ? copy.monthly : copy.all;
  return (
    <div
      dir={t.dir}
      lang={t.htmlLang}
      className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"
    >
      <OkaabStyles />
      <SiteHeader lang={locale} onLanguageChange={(next) => void setLocale(next)} />
      <main className="ok-container py-12 sm:py-16">
        <p className="font-bold text-[var(--ok-accent-text)]">{copy.eyebrow}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold sm:text-6xl">{copy.title}</h1>
            <p className="mt-3 opacity-65">{copy.description}</p>
          </div>
          <Link
            to="/profile"
            className="rounded-full border-2 border-[var(--ok-ink)] px-5 py-2.5 font-bold"
          >
            {copy.profile}
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" role="tablist">
          {(["weekly", "monthly", "all"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={period === item}
              onClick={() => setPeriod(item)}
              className={`min-h-11 rounded-full border-2 border-[var(--ok-ink)] px-4 font-bold ${period === item ? "bg-[var(--ok-ink)] text-[var(--ok-paper)]" : ""}`}
            >
              {periodLabel(item)}
            </button>
          ))}
        </div>
        {error ? (
          <p role="alert" className="mt-8 rounded-2xl border-2 border-[var(--ok-error-text)] p-5">
            {error}
          </p>
        ) : !board ? (
          <div className="mt-8 h-96 animate-pulse rounded-2xl bg-[var(--ok-card)]" />
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
            <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] border-b-2 border-[var(--ok-ink)] p-4 text-sm font-bold">
              <span>{copy.rank}</span>
              <span>{copy.learner}</span>
              <span>{copy.points}</span>
            </div>
            {board.leaders.map((leader) => (
              <div
                key={leader.id}
                className="grid min-h-16 grid-cols-[64px_minmax(0,1fr)_auto] items-center border-b border-[var(--ok-ink)]/15 px-4 last:border-0"
              >
                <span className="flex items-center gap-1 font-bold">
                  {leader.rank <= 3 && <Medal size={16} className="text-[var(--ok-accent-text)]" />}
                  {leader.rank}
                </span>
                <span className="truncate font-bold">{leader.display_name}</span>
                <span dir="ltr" className="font-mono font-bold">
                  {leader.points}
                </span>
              </div>
            ))}
            {!board.leaders.length && <p className="p-10 text-center opacity-65">{copy.empty}</p>}
          </div>
        )}
        {board?.me && board.me.rank > 20 && (
          <div className="sticky bottom-4 mt-4 grid grid-cols-[64px_minmax(0,1fr)_auto] rounded-2xl border-2 border-[var(--ok-ink)] bg-[#E8A33D] p-4 font-bold text-[#181511]">
            <span>{board.me.rank}</span>
            <span>{copy.myRank}</span>
            <span dir="ltr">{board.me.points}</span>
          </div>
        )}
      </main>
      <SiteFooter lang={locale} />
    </div>
  );
}
