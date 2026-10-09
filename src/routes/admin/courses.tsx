import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  AlertTriangle,
  ExternalLink,
  ListTree,
  PlaySquare,
  Plus,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminLayout, useAdminAuth } from "@/components/admin/AdminShell";
import { SlideUploader } from "@/components/admin/SlideUploader";
import { okaab as supabase } from "@/integrations/okaab/client";
import type {
  Course,
  Lesson,
  Roadmap,
  SlideDeck,
  YouTubeVideo,
} from "@/integrations/supabase/types";

// Optimization: Cache DateTimeFormat to avoid slow re-instantiation in map
const arEGDateTimeFormat = new Intl.DateTimeFormat("ar-EG", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});
const arEGDateFormat = new Intl.DateTimeFormat("ar-EG");

export const Route = createFileRoute("/admin/courses")({
  head: () => ({
    meta: [{ title: "إدارة الكورسات — عُقاب" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: CoursesAdminRoute,
});

type Playlist = {
  id: string;
  youtube_playlist_id: string;
  course_id: string | null;
  title: string;
  thumbnail_url: string | null;
  last_synced_at: string | null;
};
type SyncState = {
  last_success_at: string | null;
  last_error_summary: string | null;
  consecutive_failures: number;
};
type RoadmapCourseLink = { roadmap_id: string; course_id: string; sort_order: number };

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function CourseAdminContent() {
  const { profile } = useAdminAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [roadmapCourses, setRoadmapCourses] = useState<RoadmapCourseLink[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [decks, setDecks] = useState<SlideDeck[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [publishingDeckId, setPublishingDeckId] = useState<string | null>(null);

  async function load() {
    const [
      roadmapResult,
      courseResult,
      roadmapCourseResult,
      lessonResult,
      videoResult,
      deckResult,
      playlistResult,
      syncResult,
    ] = await Promise.all([
      supabase.from("roadmaps").select("*").order("sort_order"),
      supabase.from("courses").select("*").order("created_at"),
      supabase.from("roadmap_courses").select("*").order("sort_order"),
      supabase.from("lessons").select("*").order("course_id").order("sort_order"),
      supabase.from("youtube_videos").select("*").order("published_at", { ascending: false }),
      supabase.from("slide_decks").select("*").order("created_at", { ascending: false }),
      supabase.from("course_playlists").select("*").order("title"),
      supabase
        .from("youtube_sync_state")
        .select("last_success_at,last_error_summary,consecutive_failures")
        .maybeSingle(),
    ]);
    setRoadmaps((roadmapResult.data ?? []) as Roadmap[]);
    setCourses((courseResult.data ?? []) as Course[]);
    setRoadmapCourses((roadmapCourseResult.data ?? []) as RoadmapCourseLink[]);
    setLessons((lessonResult.data ?? []) as Lesson[]);
    setVideos((videoResult.data ?? []) as YouTubeVideo[]);
    setDecks((deckResult.data ?? []) as SlideDeck[]);
    setPlaylists((playlistResult.data ?? []) as Playlist[]);
    setSyncState(syncResult.data as SyncState | null);
  }
  useEffect(() => {
    void load();
  }, []);

  async function createRoadmap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title"));
    const result = await supabase.from("roadmaps").insert({
      title,
      slug: slugify(String(form.get("slug")) || title),
      description: String(form.get("description") ?? ""),
      sort_order: Number(form.get("sortOrder") || 0),
      is_published: form.get("published") === "on",
      created_by: profile.id,
    });
    if (result.error) toast.error("تعذّر إنشاء الـRoadmap", { description: result.error.message });
    else {
      toast.success("تم إنشاء الـRoadmap");
      formElement.reset();
      await load();
    }
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title"));
    const created = await supabase
      .from("courses")
      .insert({
        title,
        slug: slugify(String(form.get("slug")) || title),
        description: String(form.get("description") ?? ""),
        level: String(form.get("level") || "all"),
        is_published: form.get("published") === "on",
        created_by: profile.id,
      })
      .select("id")
      .single();
    if (created.error) {
      toast.error("تعذّر إنشاء الكورس", { description: created.error.message });
      return;
    }
    const createdCourse = created.data as Pick<Course, "id">;
    const roadmapId = String(form.get("roadmapId") || "");
    if (roadmapId)
      await supabase.from("roadmap_courses").insert({
        roadmap_id: roadmapId,
        course_id: createdCourse.id,
        sort_order: Number(form.get("sortOrder") || 0),
      });
    toast.success("تم إنشاء الكورس");
    formElement.reset();
    await load();
  }

  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("title"));
    const result = await supabase.from("lessons").insert({
      course_id: String(form.get("courseId")),
      title,
      slug: slugify(String(form.get("slug")) || title),
      description: String(form.get("description") ?? ""),
      sort_order: Number(form.get("sortOrder") || 0),
      is_published: form.get("published") === "on",
    });
    if (result.error) toast.error("تعذّر إنشاء الدرس", { description: result.error.message });
    else {
      toast.success("تم إنشاء الدرس");
      formElement.reset();
      await load();
    }
  }

  async function syncYouTube() {
    setSyncing(true);
    setSyncError(null);
    try {
      const response = await fetch("/api/admin/youtube/sync", {
        method: "POST",
      });
      const responseText = await response.text();
      let payload: {
        error?: string;
        message?: string;
        videos?: number;
        playlists?: number;
      } = {};
      try {
        payload = responseText ? (JSON.parse(responseText) as typeof payload) : {};
      } catch {
        payload = {};
      }
      if (!response.ok) {
        const description =
          response.status === 404
            ? "مسار مزامنة YouTube غير متاح على خادم Heroku."
            : response.status === 401
              ? "انتهت جلسة الدخول. سجّل الدخول مرة أخرى."
              : payload.error || payload.message || `تعذّرت المزامنة (HTTP ${response.status}).`;
        setSyncError(description);
        toast.error("فشلت مزامنة YouTube", { description });
        return;
      }
      toast.success(
        `تمت المزامنة: ${payload.videos ?? 0} فيديو و${payload.playlists ?? 0} Playlist`,
      );
      await load();
    } catch (error) {
      const description = error instanceof Error ? error.message : "تعذّر الاتصال بخدمة YouTube.";
      setSyncError(description);
      toast.error("فشلت مزامنة YouTube", { description });
    } finally {
      setSyncing(false);
    }
  }

  async function mapPlaylist(playlistId: string, courseId: string | null) {
    const result = await supabase
      .from("course_playlists")
      .update({ course_id: courseId })
      .eq("id", playlistId);
    if (result.error) toast.error("تعذّر ربط الـPlaylist");
    else {
      toast.success("تم حفظ الربط");
      await load();
    }
  }

  async function attachVideo(videoId: string, lessonId: string | null) {
    const lesson = lessons.find((item) => item.id === lessonId);
    const result = await supabase
      .from("youtube_videos")
      .update({ lesson_id: lessonId, course_id: lesson?.course_id ?? null })
      .eq("id", videoId);
    if (result.error) toast.error("تعذّر ربط الفيديو");
    else await load();
  }

  async function toggleDeckPublished(deck: SlideDeck) {
    setPublishingDeckId(deck.id);
    try {
      const nextPublished = !deck.is_published;
      const response = await fetch(`/api/admin/slides/${deck.id}/publication`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublished }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "تعذّر تغيير حالة النشر");
      toast.success(
        nextPublished
          ? "تم نشر الـSlides والدرس والكورس والمسارات المرتبطة"
          : "تم إلغاء نشر الـSlides مع إبقاء المحتوى الأب منشورًا",
      );
      await load();
    } catch (error) {
      toast.error("تعذّر تغيير حالة النشر", {
        description: error instanceof Error ? error.message : "خطأ غير متوقع",
      });
    } finally {
      setPublishingDeckId(null);
    }
  }

  async function createHierarchyForUpload(input: {
    roadmapTitle: string;
    courseTitle: string;
    lessonTitle: string;
    published: boolean;
  }) {
    const response = await fetch("/api/admin/courses/bootstrap", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      lessonId?: string;
      error?: string;
    };
    if (!response.ok || !payload.lessonId)
      throw new Error(payload.error || "تعذّر إنشاء الـRoadmap والكورس والدرس");
    return payload.lessonId;
  }

  if (!profile || !["super_admin", "admin"].includes(profile.role))
    return (
      <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center">
        <Shield className="mx-auto" size={42} />
        <h2 className="mt-4 font-display text-2xl font-bold">
          إدارة الكورسات للأدمن والسوبر أدمن فقط
        </h2>
      </div>
    );

  const input = "h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3";
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border-2 border-[var(--ok-ink)] bg-[#181511] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#E8A33D] text-[#181511]">
            <PlaySquare size={24} />
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold">قناة Okaab على YouTube</h2>
            <p className="mt-1 text-sm text-white/60">
              {syncState?.last_success_at
                ? `آخر مزامنة ناجحة: ${arEGDateTimeFormat.format(new Date(syncState.last_success_at))}`
                : "لم تُنفذ أول مزامنة بعد"}
            </p>
            {syncState?.last_error_summary && (
              <p className="mt-1 text-xs text-red-300">{syncState.last_error_summary}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="https://www.youtube.com/@Okaab-Team"
            target="_blank"
            rel="noreferrer"
            className="grid size-11 place-items-center rounded-xl border border-white/25"
          >
            <ExternalLink size={18} />
          </a>
          <button
            type="button"
            disabled={syncing}
            onClick={() => void syncYouTube()}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#E8A33D] px-5 font-bold text-[#181511] disabled:opacity-60"
          >
            <RefreshCw size={17} className={syncing ? "animate-spin" : ""} />
            {syncing ? "جاري المزامنة…" : "مزامنة الآن"}
          </button>
        </div>
      </section>

      {syncError && (
        <section
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border-2 border-[#d65d4a] bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-[#d65d4a]" size={21} />
            <div className="min-w-0">
              <h3 className="font-display font-bold">فشلت مزامنة YouTube</h3>
              <p className="mt-1 break-words text-sm leading-6 opacity-70">{syncError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSyncError(null)}
            className="shrink-0 self-start rounded-full border border-current px-4 py-2 text-sm font-bold sm:self-center"
          >
            إخفاء
          </button>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-3">
        <form
          onSubmit={createRoadmap}
          className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"
        >
          <div className="flex items-center gap-2">
            <ListTree size={21} />
            <h2 className="font-display text-2xl font-bold">Roadmap</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <input name="title" required placeholder="Frontend" className={input} />
            <input name="slug" dir="ltr" placeholder="frontend" className={input} />
            <textarea
              name="description"
              rows={2}
              placeholder="وصف المسار"
              className={`${input} h-auto py-3`}
            />
            <input name="sortOrder" type="number" defaultValue="0" className={input} />
            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="published" type="checkbox" /> منشور
            </label>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]">
              <Plus size={17} />
              إضافة
            </button>
          </div>
        </form>
        <form
          onSubmit={createCourse}
          className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={21} />
            <h2 className="font-display text-2xl font-bold">كورس</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <input name="title" required placeholder="JavaScript" className={input} />
            <input name="slug" dir="ltr" placeholder="javascript" className={input} />
            <textarea
              name="description"
              rows={2}
              placeholder="وصف الكورس"
              className={`${input} h-auto py-3`}
            />
            <select name="roadmapId" className={input}>
              <option value="">بدون Roadmap</option>
              {roadmaps.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <select name="level" className={input}>
              <option value="all">كل المستويات</option>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="published" type="checkbox" /> منشور
            </label>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]">
              <Plus size={17} />
              إضافة
            </button>
          </div>
        </form>
        <form
          onSubmit={createLesson}
          className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5"
        >
          <div className="flex items-center gap-2">
            <PlaySquare size={21} />
            <h2 className="font-display text-2xl font-bold">درس</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <select name="courseId" required className={input}>
              <option value="">اختر الكورس</option>
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <input name="title" required placeholder="مقدمة JavaScript" className={input} />
            <input name="slug" dir="ltr" placeholder="introduction" className={input} />
            <textarea
              name="description"
              rows={2}
              placeholder="وصف الدرس"
              className={`${input} h-auto py-3`}
            />
            <input name="sortOrder" type="number" defaultValue="0" className={input} />
            <label className="flex items-center gap-2 text-sm font-bold">
              <input name="published" type="checkbox" /> منشور
            </label>
            <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)]">
              <Plus size={17} />
              إضافة
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold">ربط Playlists بالكورسات</h2>
          <p className="mt-1 text-sm opacity-60">أي فيديو خارج الربط يبقى في أحدث الفيديوهات.</p>
          <div className="mt-4 space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="grid gap-2 rounded-2xl border border-[var(--ok-ink)]/20 p-3 sm:grid-cols-[1fr_200px] sm:items-center"
              >
                <span className="line-clamp-1 text-sm font-bold">{playlist.title}</span>
                <select
                  value={playlist.course_id ?? ""}
                  onChange={(event) => void mapPlaylist(playlist.id, event.target.value || null)}
                  className="h-10 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-2 text-sm"
                >
                  <option value="">غير مصنفة</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {playlists.length === 0 && (
              <p className="rounded-2xl border-2 border-dashed border-[var(--ok-ink)] p-6 text-center text-sm opacity-60">
                نفّذ المزامنة لاستيراد Playlists.
              </p>
            )}
          </div>
        </div>
        <SlideUploader
          roadmaps={roadmaps}
          courses={courses}
          roadmapCourses={roadmapCourses}
          lessons={lessons}
          videos={videos}
          profile={profile}
          onCreateHierarchy={createHierarchyForUpload}
          onUploaded={load}
        />
      </section>

      <section className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
        <div className="border-b-2 border-[var(--ok-ink)] p-5">
          <h2 className="font-display text-2xl font-bold">الفيديوهات والدروس</h2>
          <p className="mt-1 text-sm opacity-60">
            اربط كل فيديو بالدرس المناسب، أو اتركه فارغًا حتى يصبح جاهزًا.
          </p>
        </div>
        <div className="divide-y divide-[var(--ok-ink)]/15">
          {videos.slice(0, 100).map((video) => (
            <div
              key={video.id}
              className="grid gap-3 p-4 sm:grid-cols-[90px_1fr_240px] sm:items-center"
            >
              <img
                src={
                  video.thumbnail_url ??
                  `https://i.ytimg.com/vi/${video.youtube_video_id}/default.jpg`
                }
                alt=""
                className="aspect-video w-24 rounded-xl object-cover"
              />
              <div>
                <h3 className="line-clamp-2 text-sm font-bold">{video.title}</h3>
                <p className="mt-1 text-xs opacity-50">
                  {video.published_at
                    ? arEGDateFormat.format(new Date(video.published_at))
                    : "بدون تاريخ"}
                </p>
              </div>
              <select
                value={video.lesson_id ?? ""}
                onChange={(event) => void attachVideo(video.id, event.target.value || null)}
                className="h-10 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-2 text-sm"
              >
                <option value="">بدون درس</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {courses.find((course) => course.id === lesson.course_id)?.title} —{" "}
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="p-8 text-center opacity-60">لا توجد فيديوهات بعد.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Slides المرفوعة</h2>
          <Link to="/courses" className="text-sm font-bold text-[var(--ok-accent-text)]">
            معاينة الصفحة العامة
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {decks.map((deck) => (
            <article
              key={deck.id}
              className="rounded-2xl border border-[var(--ok-ink)]/20 bg-[var(--ok-paper)]/45 p-4"
            >
              <h3 className="font-bold">{deck.title}</h3>
              <p className="mt-1 text-xs font-bold text-[var(--ok-accent-text)]">
                {(() => {
                  const lesson = lessons.find((item) => item.id === deck.lesson_id);
                  const course = courses.find((item) => item.id === lesson?.course_id);
                  return (
                    [course?.title, lesson?.title].filter(Boolean).join(" — ") || "درس غير محدد"
                  );
                })()}
              </p>
              <p className="mt-2 text-xs opacity-55">
                تم الرفع {arEGDateTimeFormat.format(new Date(deck.created_at))} · {deck.file_count}{" "}
                ملف · {deck.is_published ? "منشور" : "مسودة"} ·{" "}
                {deck.allow_download ? "التنزيل متاح" : "عرض فقط"}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  disabled={publishingDeckId === deck.id}
                  onClick={() => void toggleDeckPublished(deck)}
                  className={`h-9 rounded-xl border-2 border-[var(--ok-ink)] px-4 text-xs font-bold disabled:opacity-50 ${
                    deck.is_published ? "bg-[var(--ok-paper)]" : "bg-[#E8A33D] text-[#181511]"
                  }`}
                >
                  {publishingDeckId === deck.id
                    ? "جاري الحفظ…"
                    : deck.is_published
                      ? "إلغاء نشر الـSlides"
                      : "نشر المحتوى كاملًا"}
                </button>
                {deck.is_published && (
                  <a
                    href={`/slides/${deck.id}/index.html`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[var(--ok-accent-text)] underline"
                  >
                    معاينة
                  </a>
                )}
              </div>
            </article>
          ))}
          {decks.length === 0 && <p className="text-sm opacity-60">لم تُرفع Slides بعد.</p>}
        </div>
      </section>
    </div>
  );
}

function CoursesAdminRoute() {
  return (
    <AdminLayout title="إدارة الكورسات">
      <CourseAdminContent />
    </AdminLayout>
  );
}
