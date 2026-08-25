import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  Expand,
  FileCode2,
  ListVideo,
  Pause,
  Play,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type {
  Course,
  Lesson,
  Roadmap,
  SlideDeck,
  YouTubeVideo,
} from "@/integrations/supabase/types";

type RoadmapCourse = { roadmap_id: string; course_id: string; sort_order: number };

function EmptyCourses({ error }: { error?: string }) {
  return (
    <div className="rounded-[2rem] border-2 border-dashed border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center sm:p-12">
      <BookOpen className="mx-auto text-[var(--ok-accent-text)]" size={46} />
      <h2 className="mt-5 font-display text-3xl font-bold">المكتبة تجهّز أول محتواها</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 opacity-65">
        ستظهر فيديوهات قناة عُقاب هنا تلقائيًا، وستُنظّم داخل مسارات Frontend وBackend وFull Stack.
      </p>
      {error && (
        <p className="mt-4 text-xs text-[var(--ok-error-text)]">
          تعذّر تحديث المحتوى الآن. حاول لاحقًا.
        </p>
      )}
      <a
        href="https://www.youtube.com/@Okaab-Team"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-5 py-2.5 font-bold text-[var(--ok-paper)]"
      >
        زيارة قناة عُقاب
      </a>
    </div>
  );
}

export function CoursesCatalog() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [links, setLinks] = useState<RoadmapCourse[]>([]);
  const [latest, setLatest] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      supabase.from("roadmaps").select("*").eq("is_published", true).order("sort_order"),
      supabase.from("courses").select("*").eq("is_published", true).order("created_at"),
      supabase.from("roadmap_courses").select("*").order("sort_order"),
      supabase
        .from("youtube_videos")
        .select("*")
        .is("course_id", null)
        .eq("is_available", true)
        .order("published_at", { ascending: false })
        .limit(8),
    ]).then(([roadmapResult, courseResult, linkResult, videoResult]) => {
      if (roadmapResult.error || courseResult.error || linkResult.error || videoResult.error) {
        console.error("Courses catalog query failed", {
          roadmaps: roadmapResult.error?.message,
          courses: courseResult.error?.message,
          links: linkResult.error?.message,
          videos: videoResult.error?.message,
        });
      }
      setRoadmaps((roadmapResult.data ?? []) as Roadmap[]);
      setCourses((courseResult.data ?? []) as Course[]);
      setLinks((linkResult.data ?? []) as RoadmapCourse[]);
      setLatest((videoResult.data ?? []) as YouTubeVideo[]);
      setError(roadmapResult.error?.message ?? courseResult.error?.message ?? "");
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-3xl border-2 border-[var(--ok-ink)]/20 bg-[var(--ok-card)]"
          />
        ))}
      </div>
    );
  if (!roadmaps.length && !courses.length && !latest.length) return <EmptyCourses error={error} />;

  return (
    <div className="space-y-14">
      {roadmaps.map((roadmap, roadmapIndex) => {
        const roadmapCourses = links
          .filter((link) => link.roadmap_id === roadmap.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((link) => courses.find((course) => course.id === link.course_id))
          .filter(Boolean) as Course[];
        if (!roadmapCourses.length) return null;
        return (
          <section key={roadmap.id} aria-labelledby={`roadmap-${roadmap.id}`}>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--ok-accent-text)]">
                  المسار {String(roadmapIndex + 1).padStart(2, "0")}
                </p>
                <h2
                  id={`roadmap-${roadmap.id}`}
                  className="mt-1 font-display text-3xl font-bold sm:text-4xl"
                >
                  {roadmap.title}
                </h2>
                <p className="mt-2 max-w-2xl leading-7 opacity-65">{roadmap.description}</p>
              </div>
              <span className="text-sm font-bold opacity-55">{roadmapCourses.length} كورس</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roadmapCourses.map((course, index) => (
                <Link
                  key={course.id}
                  to="/courses/$courseSlug"
                  params={{ courseSlug: course.slug }}
                  className="group overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/8] overflow-hidden bg-[#181511]">
                    {course.cover_url ? (
                      <img
                        src={course.cover_url}
                        alt=""
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid size-full place-items-center paper-grain">
                        <span className="font-display text-7xl font-bold text-[#E8A33D]">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold text-[var(--ok-accent-text)]">
                      {course.level === "all" ? "لكل المستويات" : course.level}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-bold">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-65">
                      {course.description}
                    </p>
                    <span className="mt-5 flex items-center gap-2 text-sm font-bold">
                      ابدأ الكورس{" "}
                      <ArrowLeft
                        size={16}
                        className="transition-transform group-hover:-translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {latest.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="text-sm font-bold text-[var(--ok-accent-text)]">
              يصل تلقائيًا من YouTube
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold">أحدث الفيديوهات</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {latest.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]"
              >
                <img
                  src={
                    video.thumbnail_url ??
                    `https://i.ytimg.com/vi/${video.youtube_video_id}/hqdefault.jpg`
                  }
                  alt=""
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <h3 className="line-clamp-2 font-bold leading-6">{video.title}</h3>
                  <p className="mt-2 text-xs opacity-55">غير مصنف بعد</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function CourseOverview({ slug }: { slug: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [slides, setSlides] = useState<SlideDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(async (result) => {
        const found = result.data as Course | null;
        setCourse(found);
        if (!found) {
          setLoading(false);
          return;
        }
        const [lessonResult, videoResult] = await Promise.all([
          supabase
            .from("lessons")
            .select("*")
            .eq("course_id", found.id)
            .eq("is_published", true)
            .order("sort_order"),
          supabase
            .from("youtube_videos")
            .select("*")
            .eq("course_id", found.id)
            .eq("is_available", true)
            .order("sort_order"),
        ]);
        const lessonRows = (lessonResult.data ?? []) as Lesson[];
        setLessons(lessonRows);
        setVideos((videoResult.data ?? []) as YouTubeVideo[]);
        if (lessonRows.length) {
          const slideResult = await supabase
            .from("slide_decks")
            .select("*")
            .in(
              "lesson_id",
              lessonRows.map((lesson) => lesson.id),
            )
            .eq("is_published", true)
            .order("sort_order");
          setSlides((slideResult.data ?? []) as SlideDeck[]);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading)
    return (
      <div className="h-80 animate-pulse rounded-3xl border-2 border-[var(--ok-ink)]/20 bg-[var(--ok-card)]" />
    );
  if (!course) return <EmptyCourses />;

  return (
    <div>
      <section className="grid gap-8 rounded-[2rem] border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 sm:p-9 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <Link to="/courses" className="text-sm font-bold text-[var(--ok-accent-text)]">
            كل الكورسات
          </Link>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">{course.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 opacity-70">{course.description}</p>
        </div>
        <div className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[#181511]">
          {course.cover_url ? (
            <img src={course.cover_url} alt="" className="aspect-video size-full object-cover" />
          ) : (
            <div className="grid aspect-video place-items-center paper-grain">
              <BookOpen size={56} className="text-[#E8A33D]" />
            </div>
          )}
        </div>
      </section>
      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold">دروس الكورس</h2>
          <span className="text-sm font-bold opacity-55">{lessons.length} درس</span>
        </div>
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const videoCount = videos.filter((video) => video.lesson_id === lesson.id).length;
            const slideCount = slides.filter((deck) => deck.lesson_id === lesson.id).length;
            return (
              <Link
                key={lesson.id}
                to="/courses/$courseSlug/$lessonSlug"
                params={{ courseSlug: slug, lessonSlug: lesson.slug }}
                className="group grid gap-4 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-4 transition-transform hover:-translate-x-1 sm:grid-cols-[58px_1fr_auto] sm:items-center"
              >
                <span className="grid size-12 place-items-center rounded-full bg-[#E8A33D] font-display text-xl font-bold text-[#181511]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold">{lesson.title}</h3>
                  <p className="mt-1 line-clamp-1 text-sm opacity-60">{lesson.description}</p>
                </div>
                <div className="flex gap-2 text-xs font-bold opacity-60">
                  {videoCount > 0 && (
                    <span className="flex items-center gap-1">
                      <ListVideo size={14} />
                      {videoCount}
                    </span>
                  )}
                  {slideCount > 0 && (
                    <span className="flex items-center gap-1">
                      <FileCode2 size={14} />
                      {slideCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          {lessons.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-[var(--ok-ink)] p-8 text-center opacity-60">
              سيُضاف أول درس قريبًا.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayerInstance;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YouTubePlayerOptions = {
  host: string;
  videoId: string;
  playerVars: Record<string, number>;
  events: {
    onReady: () => void;
    onStateChange: (event: { data: number }) => void;
  };
};

type YouTubePlayerInstance = {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  getIframe: () => HTMLIFrameElement;
};

let youtubeApiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (typeof window === "undefined" || window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

function OkaabVideoPlayer({ video, onEnded }: { video: YouTubeVideo; onEnded: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const onEndedRef = useRef(onEnded);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    let cancelled = false;
    void loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId: video.youtube_video_id,
        playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            setReady(true);
            playerRef.current?.setVolume(80);
          },
          onStateChange: (event: { data: number }) => {
            setPlaying(event.data === 1);
            if (event.data === 0) onEndedRef.current();
          },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [video.youtube_video_id]);

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[#0d0c0b] text-white">
      <div className="aspect-video w-full" ref={hostRef} />
      <div className="flex flex-wrap items-center gap-2 border-t border-white/15 p-3">
        <button
          disabled={!ready}
          type="button"
          aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
          onClick={() =>
            playing ? playerRef.current?.pauseVideo() : playerRef.current?.playVideo()
          }
          className="grid size-10 place-items-center rounded-full bg-[#E8A33D] text-[#181511]"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          disabled={!ready}
          type="button"
          aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
          onClick={() => {
            if (muted) playerRef.current?.unMute();
            else playerRef.current?.mute();
            setMuted(!muted);
          }}
          className="grid size-10 place-items-center rounded-full border border-white/25"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          aria-label="مستوى الصوت"
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(event) => {
            const next = Number(event.target.value);
            setVolume(next);
            playerRef.current?.setVolume(next);
          }}
          className="w-24 accent-[#E8A33D]"
        />
        <select
          aria-label="سرعة التشغيل"
          defaultValue="1"
          onChange={(event) => playerRef.current?.setPlaybackRate(Number(event.target.value))}
          className="h-9 rounded-lg border border-white/25 bg-[#181511] px-2 text-xs"
        >
          <option value="0.5">0.5×</option>
          <option value="0.75">0.75×</option>
          <option value="1">1×</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2×</option>
        </select>
        <button
          type="button"
          aria-label="ملء الشاشة"
          onClick={() => playerRef.current?.getIframe?.()?.requestFullscreen?.()}
          className="mr-auto grid size-10 place-items-center rounded-full border border-white/25"
        >
          <Expand size={18} />
        </button>
      </div>
    </div>
  );
}

function SlideViewer({ deck }: { deck: SlideDeck }) {
  const supabaseUrl =
    import.meta.env["VITE_SUPABASE_URL"] || "https://cqxloxfxxwuhdkppjcpr.supabase.co";
  const base = `${supabaseUrl}/storage/v1/object/public/course-slides/${deck.storage_root}`;
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ok-ink)] p-4">
        <div className="flex items-center gap-2">
          <FileCode2 size={19} className="text-[var(--ok-accent-text)]" />
          <strong>{deck.title}</strong>
        </div>
        {deck.allow_download && deck.archive_name && (
          <a
            href={`${base}/${deck.archive_name}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border-2 border-[var(--ok-ink)] px-4 py-2 text-xs font-bold"
          >
            <Download size={15} />
            تنزيل الملفات
          </a>
        )}
      </div>
      <iframe
        title={deck.title}
        src={`${base}/${deck.entry_path}`}
        sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups-to-escape-sandbox allow-downloads"
        allowFullScreen
        className="h-[70vh] min-h-[520px] w-full bg-white"
      />
    </div>
  );
}

export function LessonExperience({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [slides, setSlides] = useState<SlideDeck[]>([]);
  const [stage, setStage] = useState<"video" | "slides">("video");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("courses")
      .select("*")
      .eq("slug", courseSlug)
      .maybeSingle()
      .then(async (courseResult) => {
        const foundCourse = courseResult.data as Course | null;
        setCourse(foundCourse);
        if (!foundCourse) {
          setLoading(false);
          return;
        }
        const lessonResult = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", foundCourse.id)
          .eq("slug", lessonSlug)
          .maybeSingle();
        const foundLesson = lessonResult.data as Lesson | null;
        setLesson(foundLesson);
        if (!foundLesson) {
          setLoading(false);
          return;
        }
        const [videoResult, slideResult] = await Promise.all([
          supabase
            .from("youtube_videos")
            .select("*")
            .eq("lesson_id", foundLesson.id)
            .eq("is_available", true)
            .order("sort_order"),
          supabase
            .from("slide_decks")
            .select("*")
            .eq("lesson_id", foundLesson.id)
            .eq("is_published", true)
            .order("sort_order"),
        ]);
        const videoRows = (videoResult.data ?? []) as YouTubeVideo[];
        setVideos(videoRows);
        setSlides((slideResult.data ?? []) as SlideDeck[]);
        setStage(videoRows.length ? "video" : "slides");
        setLoading(false);
      });
  }, [courseSlug, lessonSlug]);

  const firstVideo = videos[0];
  const hasSlides = slides.length > 0;
  const heading = useMemo(() => lesson?.title ?? "الدرس", [lesson]);
  if (loading) return <div className="h-[60vh] animate-pulse rounded-3xl bg-[var(--ok-card)]" />;
  if (!course || !lesson) return <EmptyCourses />;

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/courses/$courseSlug"
          params={{ courseSlug }}
          className="text-sm font-bold text-[var(--ok-accent-text)]"
        >
          {course.title}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{heading}</h1>
        <p className="mt-3 max-w-3xl leading-7 opacity-65">{lesson.description}</p>
      </div>
      {stage === "video" && firstVideo ? (
        <div className="space-y-4">
          <OkaabVideoPlayer video={firstVideo} onEnded={() => hasSlides && setStage("slides")} />
          {hasSlides && (
            <button
              type="button"
              onClick={() => setStage("slides")}
              className="flex items-center gap-2 rounded-full border-2 border-[var(--ok-ink)] bg-[#E8A33D] px-5 py-2.5 font-bold text-[#181511]"
            >
              <SkipForward size={17} />
              تخطي الفيديو وفتح الـSlides
            </button>
          )}
        </div>
      ) : hasSlides ? (
        <div className="space-y-5">
          {slides.map((deck) => (
            <SlideViewer key={deck.id} deck={deck} />
          ))}
          {firstVideo && (
            <button
              type="button"
              onClick={() => setStage("video")}
              className="flex items-center gap-2 rounded-full border-2 border-[var(--ok-ink)] px-5 py-2.5 font-bold"
            >
              <Play size={17} />
              العودة للفيديو
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-[var(--ok-ink)] p-10 text-center">
          <CheckCircle2 className="mx-auto text-[var(--ok-accent-text)]" size={42} />
          <h2 className="mt-4 font-display text-2xl font-bold">محتوى الدرس قيد الإعداد</h2>
        </div>
      )}
    </div>
  );
}
