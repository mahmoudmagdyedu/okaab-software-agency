import { createFileRoute, Link } from "@tanstack/react-router";
import { Medal } from "lucide-react";
import { useEffect, useState } from "react";

import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

type Period = "weekly" | "monthly" | "all";
type Leader = { id: string; display_name: string; avatar_url: string | null; points: number; rank: number };
type Board = { period: Period; leaders: Leader[]; me: Leader | null };

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "المتصدرون — منصة عُقاب" }, { name: "description", content: "ترتيب متعلمي عُقاب حسب النقاط الأسبوعية والشهرية وكل الوقت." }], links: [{ rel: "canonical", href: "https://okaab.org/leaderboard" }] }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setBoard(null); setError("");
    void fetch(`/api/v1/leaderboard?period=${period}`, { credentials: "same-origin" }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || "تعذّر تحميل الترتيب");
      setBoard(payload.data);
    }).catch((value) => setError(value instanceof Error ? value.message : "تعذّر تحميل الترتيب"));
  }, [period]);
  return <ThemeProvider><div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"><OkaabStyles/><SiteHeader lang="ar"/><main className="ok-container py-12 sm:py-16"><p className="font-bold text-[var(--ok-accent-text)]">منصة عُقاب</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-4xl font-bold sm:text-6xl">المتصدرون</h1><p className="mt-3 opacity-65">النقاط هنا نتيجة تعلّم حقيقي: أسئلة، دروس ومهام مكتملة.</p></div><Link to="/profile" className="rounded-full border-2 border-[var(--ok-ink)] px-5 py-2.5 font-bold">حسابي</Link></div><div className="mt-8 flex gap-2" role="tablist">{(["weekly","monthly","all"] as const).map((item)=><button key={item} type="button" role="tab" aria-selected={period===item} onClick={()=>setPeriod(item)} className={`min-h-11 rounded-full border-2 border-[var(--ok-ink)] px-4 font-bold ${period===item?"bg-[var(--ok-ink)] text-[var(--ok-paper)]":""}`}>{item==="weekly"?"الأسبوع":item==="monthly"?"الشهر":"كل الوقت"}</button>)}</div>{error?<p role="alert" className="mt-8 rounded-2xl border-2 border-[var(--ok-error-text)] p-5">{error}</p>:!board?<div className="mt-8 h-96 animate-pulse rounded-2xl bg-[var(--ok-card)]"/>:<div className="mt-8 overflow-hidden rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]"><div className="grid grid-cols-[64px_1fr_auto] border-b-2 border-[var(--ok-ink)] p-4 text-sm font-bold"><span>الترتيب</span><span>المتعلّم</span><span>النقاط</span></div>{board.leaders.map((leader)=><div key={leader.id} className="grid min-h-16 grid-cols-[64px_1fr_auto] items-center border-b border-[var(--ok-ink)]/15 px-4 last:border-0"><span className="flex items-center gap-1 font-bold">{leader.rank<=3&&<Medal size={16} className="text-[var(--ok-accent-text)]"/>}{leader.rank}</span><span className="font-bold">{leader.display_name}</span><span dir="ltr" className="font-mono font-bold">{leader.points}</span></div>)}{!board.leaders.length&&<p className="p-10 text-center opacity-65">أول نقاط هتظهر هنا فورًا.</p>}</div>}{board?.me&&board.me.rank>20&&<div className="sticky bottom-4 mt-4 grid grid-cols-[64px_1fr_auto] rounded-2xl border-2 border-[var(--ok-ink)] bg-[#E8A33D] p-4 font-bold text-[#181511]"><span>{board.me.rank}</span><span>ترتيبك أنت</span><span dir="ltr">{board.me.points}</span></div>}</main><SiteFooter lang="ar"/></div></ThemeProvider>;
}
