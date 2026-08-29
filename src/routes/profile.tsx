import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { OkaabStyles, SiteFooter, SiteHeader } from "@/components/okaab/SiteChrome";
import { ThemeProvider } from "@/lib/theme";

type Profile = { display_name: string; email: string; birthdate: string | null; leaderboard_visible: boolean };
type Overview = { profile: Profile; points: number; rank: number | null; streak: { current_days: number; longest_days: number }; badges: { id: string; title: string; description: string }[]; level: { name: string; minimum: number; next: number | null } };

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "حسابي — منصة عُقاب" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [message, setMessage] = useState("");
  const load = () => fetch("/api/v1/me/overview", { credentials: "same-origin" }).then(async (response) => {
    const payload = await response.json();
    if (response.status === 401) { setUnauthorized(true); return; }
    if (!response.ok) throw new Error(payload?.error?.message || "تعذّر تحميل الحساب");
    setOverview(payload.data);
  }).catch((value)=>setMessage(value instanceof Error?value.message:"تعذّر تحميل الحساب"));
  useEffect(()=>{void load();},[]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("جاري الحفظ…");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/me", { method:"PATCH",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({displayName:form.get("name"),birthdate:form.get("birthdate")||null,leaderboardVisible:form.get("visible")==="on"}) });
    const payload=await response.json();
    if(!response.ok){setMessage(payload?.error?.message||"تعذّر الحفظ");return;}
    setOverview((current)=>current?{...current,profile:payload.data}:current);setMessage("تم حفظ بياناتك.");
  }
  async function removeAccount() {
    if (window.prompt("اكتب «احذف حسابي» للتأكيد. تقدر تستعيد الحساب بتسجيل الدخول خلال 30 يومًا.") !== "احذف حسابي") return;
    setMessage("جاري حذف الحساب…");
    const response = await fetch("/api/v1/me", { method: "DELETE", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirmation: "احذف حسابي" }) });
    const payload = await response.json();
    if (!response.ok) { setMessage(payload?.error?.message || "تعذّر حذف الحساب"); return; }
    window.location.href = "/";
  }
  return <ThemeProvider><div dir="rtl" lang="ar" className="min-h-screen bg-[var(--ok-paper)] text-[var(--ok-ink)]"><OkaabStyles/><SiteHeader lang="ar"/><main className="ok-container py-12 sm:py-16"><h1 className="font-display text-4xl font-bold sm:text-6xl">حسابي</h1>{unauthorized?<div className="mt-8 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8"><h2 className="text-2xl font-bold">سجّل دخولك الأول</h2><p className="mt-2 opacity-65">نفس حساب عُقاب يفتح لك التقدّم والنقاط على الموقع والتطبيق.</p><a href="/sign-in/" className="mt-5 inline-flex rounded-full bg-[var(--ok-ink)] px-5 py-3 font-bold text-[var(--ok-paper)]">تسجيل الدخول</a></div>:!overview?<div className="mt-8 h-80 animate-pulse rounded-2xl bg-[var(--ok-card)]"/>:<><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"><strong className="text-3xl">{overview.points}</strong><p className="opacity-60">نقطة · رتبة {overview.level.name}</p></div><div className="rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"><strong className="text-3xl">{overview.streak.current_days}</strong><p className="opacity-60">يوم متواصل</p></div><div className="rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"><strong className="text-3xl">{overview.rank??"—"}</strong><p className="opacity-60">ترتيبك</p></div></div>{overview.badges.length>0&&<section className="mt-6 max-w-2xl"><h2 className="text-xl font-bold">شاراتك</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{overview.badges.map((badge)=><article key={badge.id} className="rounded-2xl bg-[var(--ok-ink)] p-4 text-[var(--ok-paper)]"><h3 className="font-bold text-[#E8A33D]">{badge.title}</h3><p className="mt-1 text-sm opacity-70">{badge.description}</p></article>)}</div></section>}<form onSubmit={save} className="mt-6 grid max-w-2xl gap-5 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6"><label className="grid gap-2 font-bold">الاسم<input name="name" required minLength={2} maxLength={40} defaultValue={overview.profile.display_name} className="min-h-12 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-4"/></label><label className="grid gap-2 font-bold">تاريخ الميلاد<input name="birthdate" type="date" defaultValue={overview.profile.birthdate?.slice(0,10)||""} className="min-h-12 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-4"/></label><label className="flex min-h-11 items-center gap-3 font-bold"><input name="visible" type="checkbox" defaultChecked={overview.profile.leaderboard_visible} className="size-5 accent-[#E8A33D]"/>أظهرني في لوحة المتصدرين</label><button className="min-h-12 rounded-full bg-[var(--ok-ink)] px-5 font-bold text-[var(--ok-paper)]">حفظ التعديلات</button>{message&&<p role="status">{message}</p>}</form><div className="mt-6 max-w-2xl rounded-2xl border-2 border-red-700 bg-[var(--ok-card)] p-6"><h2 className="font-bold text-red-700">حذف الحساب</h2><p className="mt-2 text-sm opacity-70">هيتوقف الحساب فورًا، وتقدر تستعيده بتسجيل الدخول خلال 30 يومًا.</p><button type="button" onClick={() => void removeAccount()} className="mt-4 min-h-11 rounded-xl border-2 border-red-700 px-5 font-bold text-red-700">حذف حسابي</button></div><Link to="/leaderboard" className="mt-5 inline-flex font-bold text-[var(--ok-accent-text)] underline">عرض المتصدرين</Link></>}</main><SiteFooter lang="ar"/></div></ThemeProvider>;
}
