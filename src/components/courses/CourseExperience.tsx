import { Link } from "@tanstack/react-router";
import { getToken } from "@clerk/tanstack-react-start";
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

import { okaab as supabase } from "@/integrations/okaab/client";
import type {
  Course,
  Lesson,
  Roadmap,
  SlideDeck,
  YouTubeVideo,
} from "@/integrations/supabase/types";
import { LEARNING_COPY, learningLanguage } from "@/lib/learning-copy";
import { trustedSlideEvent } from "@/lib/lesson-message";

type RoadmapCourse = { roadmap_id: string; course_id: string; sort_order: number };
type LearningEvent = { type: string; [key: string]: unknown };

function learningEventKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function EmptyCourses({ error, locale = "ar" }: { error?: string; locale?: string }) {
  const copy = LEARNING_COPY[learningLanguage(locale)].catalog;
  return (
    <div className="rounded-[2rem] border-2 border-dashed border-[var(--ok-ink)] bg-[var(--ok-card)] p-8 text-center sm:p-12">
      <BookOpen className="mx-auto text-[var(--ok-accent-text)]" size={46} />
      <h2 className="mt-5 font-display text-3xl font-bold">{copy.emptyTitle}</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 opacity-65">{copy.emptyBody}</p>
      {error && <p className="mt-4 text-xs text-[var(--ok-error-text)]">{copy.loadError}</p>}
      <a
        href="https://www.youtube.com/@Okaab-Team"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-5 py-2.5 font-bold text-[var(--ok-paper)]"
      >
        {copy.youtube}
      </a>
    </div>
  );
}

function CourseCard({ course, index, locale }: { course: Course; index: number; locale: string }) {
  const language = learningLanguage(locale);
  const copy = LEARNING_COPY[language].catalog;
  return (
    <Link
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
            <span className="font-display text-7xl font-bold text-[#E8A33D]">{index + 1}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="text-xs font-bold text-[var(--ok-accent-text)]">
          {course.level === "all" ? copy.allLevels : course.level}
        </span>
        <h3 className="mt-2 font-display text-2xl font-bold">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 opacity-65">{course.description}</p>
        <span className="mt-5 flex items-center gap-2 text-sm font-bold">
          {copy.start}
          <ArrowLeft
            size={16}
            className={`transition-transform ${language === "ar" ? "group-hover:-translate-x-1" : "rotate-180 group-hover:translate-x-1"}`}
          />
        </span>
      </div>
    </Link>
  );
}

export function CoursesCatalog({ locale = "ar" }: { locale?: string }) {
  const copy = LEARNING_COPY[learningLanguage(locale)].catalog;
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [links, setLinks] = useState<RoadmapCourse[]>([]);
  const [latest, setLatest] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/v1/catalog", { credentials: "same-origin" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          data?: {
            roadmaps: Roadmap[];
            courses: Course[];
            roadmapCourses: RoadmapCourse[];
            videos: YouTubeVideo[];
          };
          error?: { message?: string };
        };
        if (!response.ok || !payload.data)
          throw new Error(payload.error?.message || "تعذّر تحميل الكتالوج");
        setRoadmaps(payload.data.roadmaps);
        setCourses(payload.data.courses);
        setLinks(payload.data.roadmapCourses);
        setLatest(payload.data.videos.filter((video) => !video.course_id).slice(0, 8));
      })
      .catch((value) => setError(value instanceof Error ? value.message : "تعذّر تحميل الكتالوج"))
      .finally(() => setLoading(false));
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
  if (!roadmaps.length && !courses.length && !latest.length)
    return <EmptyCourses error={error} locale={locale} />;

  const linkedCourseIds = new Set(links.map((link) => link.course_id));
  const standaloneCourses = courses.filter((course) => !linkedCourseIds.has(course.id));

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
                  {copy.roadmap} {String(roadmapIndex + 1).padStart(2, "0")}
                </p>
                <h2
                  id={`roadmap-${roadmap.id}`}
                  className="mt-1 font-display text-3xl font-bold sm:text-4xl"
                >
                  {roadmap.title}
                </h2>
                <p className="mt-2 max-w-2xl leading-7 opacity-65">{roadmap.description}</p>
              </div>
              <span className="text-sm font-bold opacity-55">
                {roadmapCourses.length} {copy.courseCount}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roadmapCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}

      {standaloneCourses.length > 0 && (
        <section aria-labelledby="standalone-courses">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--ok-accent-text)]">{copy.choose}</p>
              <h2
                id="standalone-courses"
                className="mt-1 font-display text-3xl font-bold sm:text-4xl"
              >
                {copy.standalone}
              </h2>
              <p className="mt-2 max-w-2xl leading-7 opacity-65">{copy.standaloneBody}</p>
            </div>
            <span className="text-sm font-bold opacity-55">
              {standaloneCourses.length} {copy.courseCount}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {standaloneCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="text-sm font-bold text-[var(--ok-accent-text)]">YouTube</p>
            <h2 className="mt-1 font-display text-3xl font-bold">{copy.latest}</h2>
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
                  <p className="mt-2 text-xs opacity-55">{copy.unclassified}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function CourseOverview({ slug, locale = "ar" }: { slug: string; locale?: string }) {
  const copy = LEARNING_COPY[learningLanguage(locale)].course;
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [slides, setSlides] = useState<SlideDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const result = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle();
        if (result.error) throw result.error;
        const found = result.data as Course | null;
        if (cancelled) return;
        setCourse(found);
        if (!found) return;
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
        if (lessonResult.error) throw lessonResult.error;
        if (videoResult.error) throw videoResult.error;
        if (cancelled) return;
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
          if (slideResult.error) throw slideResult.error;
          if (cancelled) return;
          setSlides((slideResult.data ?? []) as SlideDeck[]);
        }
      } catch {
        if (!cancelled) setError(LEARNING_COPY[learningLanguage(locale)].catalog.loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, slug]);

  // Optimization: Pre-aggregate video and slide counts by lesson_id into O(1) Map lookups
  // outside render loop to reduce per-lesson filtering overhead from O(N * (V + S)) to O(V + S + N).
  const videoCountsByLesson = useMemo(() => {
    const counts = new Map<string, number>();
    for (const video of videos) {
      if (video.lesson_id) {
        counts.set(video.lesson_id, (counts.get(video.lesson_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [videos]);

  const slideCountsByLesson = useMemo(() => {
    const counts = new Map<string, number>();
    for (const deck of slides) {
      if (deck.lesson_id) {
        counts.set(deck.lesson_id, (counts.get(deck.lesson_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [slides]);

  if (loading)
    return (
      <div className="h-80 animate-pulse rounded-3xl border-2 border-[var(--ok-ink)]/20 bg-[var(--ok-card)]" />
    );
  if (!course) return <EmptyCourses error={error} locale={locale} />;

  return (
    <div>
      <section className="grid gap-8 rounded-[2rem] border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-6 sm:p-9 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <Link to="/courses" className="text-sm font-bold text-[var(--ok-accent-text)]">
            {copy.all}
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
          <h2 className="font-display text-3xl font-bold">{copy.lessons}</h2>
          <span className="text-sm font-bold opacity-55">
            {lessons.length} {copy.lessonCount}
          </span>
        </div>
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const videoCount = videoCountsByLesson.get(lesson.id) ?? 0;
            const slideCount = slideCountsByLesson.get(lesson.id) ?? 0;
            return (
              <Link
                key={lesson.id}
                to="/courses/$courseSlug/$lessonSlug"
                params={{ courseSlug: slug, lessonSlug: lesson.slug }}
                className="group grid gap-4 rounded-2xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-4 transition-transform hover:-translate-y-0.5 sm:grid-cols-[58px_1fr_auto] sm:items-center"
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
              {copy.soon}
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
  playerVars: Record<string, number | string>;
  events: {
    onReady: () => void;
    onStateChange: (event: { data: number }) => void;
    onError: (event: { data: number }) => void;
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
  getCurrentTime: () => number;
  getDuration: () => number;
};

let youtubeApiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (typeof window === "undefined" || window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => {
      youtubeApiPromise = null;
      reject(new Error("youtube-player-timeout"));
    }, 15_000);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.referrerPolicy = "strict-origin-when-cross-origin";
      script.onerror = () => {
        window.clearTimeout(timeout);
        script.remove();
        youtubeApiPromise = null;
        reject(new Error("youtube-player-download"));
      };
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

function OkaabVideoPlayer({
  video,
  onEnded,
  onProgress,
  locale,
}: {
  video: YouTubeVideo;
  onEnded: () => void;
  onProgress: (percent: number) => void;
  locale: string;
}) {
  const copy = LEARNING_COPY[learningLanguage(locale)].lesson;
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [failure, setFailure] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);
  const [privacyHost, setPrivacyHost] = useState(true);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onProgressRef.current = onProgress;
  }, [onEnded, onProgress]);

  useEffect(() => {
    let cancelled = false;
    let createdPlayer: YouTubePlayerInstance | null = null;
    const host = hostRef.current;
    setReady(false);
    setFailure("");
    void loadYouTubeApi()
      .then(() => {
        if (cancelled || !host || !window.YT?.Player) return;
        // YouTube replaces its mount element with an iframe. Keep that mutable DOM
        // subtree outside React's ownership so retries cannot make React remove a
        // node that the IFrame API has already replaced.
        const mount = document.createElement("div");
        mount.style.width = "100%";
        mount.style.height = "100%";
        host.replaceChildren(mount);
        createdPlayer = new window.YT.Player(mount, {
          host: privacyHost ? "https://www.youtube-nocookie.com" : "https://www.youtube.com",
          videoId: video.youtube_video_id,
          playerVars: {
            rel: 0,
            playsinline: 1,
            controls: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            widget_referrer: window.location.href,
          },
          events: {
            onReady: () => {
              setReady(true);
              setFailure("");
              playerRef.current?.setVolume(80);
              playerRef.current
                ?.getIframe()
                .setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            },
            onStateChange: (event: { data: number }) => {
              setPlaying(event.data === 1);
              if (event.data === 0) onEndedRef.current();
            },
            onError: (event: { data: number }) => {
              if (privacyHost && [101, 150, 153].includes(event.data)) {
                setReady(false);
                setPlaying(false);
                setPrivacyHost(false);
                setFailure("");
                return;
              }
              setReady(false);
              setPlaying(false);
              setFailure(copy.playerError);
            },
          },
        });
        playerRef.current = createdPlayer;
      })
      .catch(() => {
        if (!cancelled) {
          setFailure(copy.playerError);
        }
      });
    const progressTimer = window.setInterval(() => {
      const duration = playerRef.current?.getDuration?.() ?? 0;
      const current = playerRef.current?.getCurrentTime?.() ?? 0;
      if (duration > 0 && current > 0)
        onProgressRef.current(Math.min(100, (current / duration) * 100));
    }, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      try {
        createdPlayer?.destroy();
      } catch {
        // The YouTube iframe may already have been replaced after an embed error.
      }
      if (playerRef.current === createdPlayer) playerRef.current = null;
      host?.replaceChildren();
    };
  }, [copy.playerError, privacyHost, retryNonce, video.youtube_video_id]);

  const runPlayerCommand = (command: (player: YouTubePlayerInstance) => void) => {
    const player = playerRef.current;
    if (!player) return;
    try {
      command(player);
    } catch {
      setReady(false);
      setPlaying(false);
      setFailure(copy.playerError);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-[var(--ok-ink)] bg-[#0d0c0b] text-white">
      <div className="relative aspect-video w-full">
        <div className="size-full" ref={hostRef} />
        {!ready && !failure && (
          <div
            className="pointer-events-none absolute inset-0 grid place-items-center bg-[#0d0c0b]"
            role="status"
          >
            <span className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white/75">
              {copy.preparingVideo}
            </span>
          </div>
        )}
        {failure && (
          <div className="absolute inset-0 grid place-items-center bg-[#0d0c0b] p-6 text-center">
            <div>
              <p role="alert" className="font-bold text-white">
                {failure}
              </p>
              <button
                type="button"
                onClick={() => setRetryNonce((value) => value + 1)}
                className="mt-4 min-h-11 rounded-full bg-[#E8A33D] px-5 font-bold text-[#181511]"
              >
                {copy.retry}
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block text-sm font-bold text-[#E8A33D] underline underline-offset-4"
              >
                {copy.youtubeVerify}
              </a>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/15 p-3">
        <button
          disabled={!ready}
          type="button"
          aria-label={playing ? copy.pause : copy.play}
          onClick={() =>
            runPlayerCommand((player) => (playing ? player.pauseVideo() : player.playVideo()))
          }
          className="grid size-10 place-items-center rounded-full bg-[#E8A33D] text-[#181511]"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          disabled={!ready}
          type="button"
          aria-label={muted ? copy.unmute : copy.mute}
          onClick={() => {
            runPlayerCommand((player) => {
              if (muted) player.unMute();
              else player.mute();
            });
            setMuted(!muted);
          }}
          className="grid size-10 place-items-center rounded-full border border-white/25"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          aria-label={copy.volume}
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(event) => {
            const next = Number(event.target.value);
            setVolume(next);
            runPlayerCommand((player) => player.setVolume(next));
          }}
          className="w-24 accent-[#E8A33D]"
        />
        <select
          aria-label={copy.speed}
          defaultValue="1"
          onChange={(event) =>
            runPlayerCommand((player) => player.setPlaybackRate(Number(event.target.value)))
          }
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
          aria-label={copy.fullscreen}
          onClick={() => playerRef.current?.getIframe?.()?.requestFullscreen?.()}
          className="mr-auto grid size-10 place-items-center rounded-full border border-white/25"
        >
          <Expand size={18} />
        </button>
      </div>
    </div>
  );
}

function SlideViewer({
  deck,
  onEvent,
  locale,
}: {
  deck: SlideDeck;
  onEvent: (event: LearningEvent, deck: SlideDeck) => void;
  locale: string;
}) {
  const copy = LEARNING_COPY[learningLanguage(locale)].lesson;
  const base = `/slides/${deck.id}`;
  const slideUrl = `${base}/${deck.entry_path}`;
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const receive = (message: MessageEvent) => {
      const event = trustedSlideEvent(
        message,
        frameRef.current?.contentWindow,
        window.location.origin,
      );
      if (event) onEvent(event, deck);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [deck, onEvent]);

  async function openFullscreen() {
    try {
      await frameRef.current?.requestFullscreen?.();
    } catch {
      window.open(slideUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] shadow-[0_18px_60px_rgba(24,21,17,0.12)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ok-ink)] p-4">
        <div className="flex items-center gap-2">
          <FileCode2 size={19} className="text-[var(--ok-accent-text)]" />
          <strong>{deck.title}</strong>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openFullscreen}
            className="flex items-center gap-2 rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-4 py-2 text-xs font-bold text-[var(--ok-paper)] transition-transform hover:-translate-y-0.5"
          >
            <Expand size={15} />
            {copy.fullscreen}
          </button>
          {deck.allow_download && deck.archive_name && (
            <a
              href={`/api/slides/${deck.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border-2 border-[var(--ok-ink)] px-4 py-2 text-xs font-bold transition-colors hover:bg-[var(--ok-paper-2)]"
            >
              <Download size={15} />
              {copy.download}
            </a>
          )}
        </div>
      </div>
      <iframe
        ref={frameRef}
        title={deck.title}
        src={slideUrl}
        sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups-to-escape-sandbox allow-downloads"
        allowFullScreen
        className="block w-full border-0 bg-[#050505]"
        style={{
          height: "clamp(360px, min(72vh, 56.25vw), 820px)",
          minHeight: "360px",
        }}
      />
    </div>
  );
}

export function LessonExperience({
  courseSlug,
  lessonSlug,
  locale = "ar",
}: {
  courseSlug: string;
  lessonSlug: string;
  locale?: string;
}) {
  const copy = LEARNING_COPY[learningLanguage(locale)].lesson;
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [slides, setSlides] = useState<SlideDeck[]>([]);
  const [stage, setStage] = useState<"video" | "slides">("video");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const courseResult = await supabase
          .from("courses")
          .select("*")
          .eq("slug", courseSlug)
          .maybeSingle();
        if (courseResult.error) throw courseResult.error;
        const foundCourse = courseResult.data as Course | null;
        if (cancelled) return;
        setCourse(foundCourse);
        if (!foundCourse) return;
        const lessonResult = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", foundCourse.id)
          .eq("slug", lessonSlug)
          .maybeSingle();
        if (lessonResult.error) throw lessonResult.error;
        const foundLesson = lessonResult.data as Lesson | null;
        if (cancelled) return;
        setLesson(foundLesson);
        if (!foundLesson) return;
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
        if (videoResult.error) throw videoResult.error;
        if (slideResult.error) throw slideResult.error;
        if (cancelled) return;
        const videoRows = (videoResult.data ?? []) as YouTubeVideo[];
        setVideos(videoRows);
        setSlides((slideResult.data ?? []) as SlideDeck[]);
        setStage(videoRows.length ? "video" : "slides");
      } catch {
        if (!cancelled) setError(LEARNING_COPY[learningLanguage(locale)].catalog.loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseSlug, lessonSlug, locale]);

  const firstVideo = videos[0];
  const hasSlides = slides.length > 0;
  const heading = useMemo(() => lesson?.title ?? copy.fallback, [copy.fallback, lesson]);
  if (loading) return <div className="h-[60vh] animate-pulse rounded-3xl bg-[var(--ok-card)]" />;
  if (!course || !lesson) return <EmptyCourses error={error} locale={locale} />;

  async function sendLearningEvent(event: LearningEvent, endpoint = "events") {
    const url = `/api/v1/lessons/${encodeURIComponent(lessonSlug)}/${endpoint}`;
    const body = JSON.stringify({
      ...event,
      idempotencyKey: event["idempotencyKey"] ?? learningEventKey(event.type),
    });
    const post = async (skipCache = false) => {
      const token = await getToken(skipCache ? { skipCache: true } : undefined).catch(() => null);
      return fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body,
      });
    };
    let response = await post();
    if (response.status === 401) {
      const refreshed = await getToken({ skipCache: true }).catch(() => null);
      if (refreshed) {
        response = await fetch(url, {
          method: "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json", authorization: `Bearer ${refreshed}` },
          body,
        });
      }
    }
    const payload = await response.json().catch(() => null);
    if (response.status === 401) {
      setProgressMessage(copy.signInToSave);
      return null;
    }
    if (!response.ok) {
      const missing = Array.isArray(payload?.error?.missing)
        ? (payload.error.missing as string[])
        : [];
      const missingLabels: Record<string, string> = {
        video: copy.missingVideo,
        slides: copy.missingSlides,
        quiz: copy.missingQuiz,
        task: copy.missingTask,
      };
      const preciseMessage = missing
        .map((key) => missingLabels[key])
        .filter(Boolean)
        .join(" · ");
      setProgressMessage(
        preciseMessage ||
          (learningLanguage(locale) === "ar"
            ? payload?.error?.message || copy.saveFailed
            : copy.saveFailed),
      );
      return null;
    }
    setProgressMessage(endpoint === "complete" ? copy.completed : copy.saved);
    if (endpoint === "complete" && payload?.data?.completed === true) setLessonCompleted(true);
    return payload?.data ?? {};
  }

  async function handleSlideEvent(event: LearningEvent, deck: SlideDeck) {
    if (event.type !== "quiz_finished") {
      await sendLearningEvent(event);
      return;
    }
    const correctAnswers = Number(event["correctAnswers"]);
    const totalQuestions = Number(event["totalQuestions"]);
    const scorePercent = Number(event["scorePercent"]);
    if (
      !Number.isInteger(correctAnswers) ||
      !Number.isInteger(totalQuestions) ||
      totalQuestions < 1 ||
      correctAnswers < 0 ||
      correctAnswers > totalQuestions ||
      scorePercent !== Math.round((correctAnswers / totalQuestions) * 100)
    ) {
      await sendLearningEvent(event);
      return;
    }
    const attemptId = crypto.randomUUID();
    const saved = await sendLearningEvent({
      type: "quiz_completed",
      attemptId,
      deckId: deck.id,
      courseSlug,
      lessonSlug,
      lessonNumber: Number(lesson?.sort_order ?? 0) + 1,
      questionSetVersion: `deck:${deck.id}:v1`,
      correctAnswers,
      totalQuestions,
      scorePercent,
      completedAt: new Date().toISOString(),
      idempotencyKey: `quiz:${attemptId}`,
    });
    if (saved) await sendLearningEvent({ type: "lesson_finished" }, "complete");
  }

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
          <OkaabVideoPlayer
            video={firstVideo}
            locale={locale}
            onProgress={(percent) => void sendLearningEvent({ type: "video_progress", percent })}
            onEnded={() => {
              void sendLearningEvent({ type: "video_progress", percent: 100 });
              if (hasSlides) setStage("slides");
            }}
          />
          {hasSlides && (
            <button
              type="button"
              onClick={() => setStage("slides")}
              className="flex items-center gap-2 rounded-full border-2 border-[var(--ok-ink)] bg-[#E8A33D] px-5 py-2.5 font-bold text-[#181511]"
            >
              <SkipForward size={17} />
              {copy.skip}
            </button>
          )}
        </div>
      ) : hasSlides ? (
        <div className="space-y-5">
          {slides.map((deck) => (
            <SlideViewer
              key={deck.id}
              deck={deck}
              locale={locale}
              onEvent={(event, activeDeck) => void handleSlideEvent(event, activeDeck)}
            />
          ))}
          {firstVideo && (
            <button
              type="button"
              onClick={() => setStage("video")}
              className="flex items-center gap-2 rounded-full border-2 border-[var(--ok-ink)] px-5 py-2.5 font-bold"
            >
              <Play size={17} />
              {copy.backVideo}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-[var(--ok-ink)] p-10 text-center">
          <CheckCircle2 className="mx-auto text-[var(--ok-accent-text)]" size={42} />
          <h2 className="mt-4 font-display text-2xl font-bold">{copy.preparing}</h2>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void sendLearningEvent({ type: "lesson_finished" }, "complete")}
          disabled={lessonCompleted}
          className="min-h-11 rounded-full border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] px-5 py-2.5 font-bold text-[var(--ok-paper)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {copy.finish}
        </button>
        {progressMessage && (
          <p role="status" className="text-sm font-medium">
            {progressMessage}{" "}
            {progressMessage === copy.signInToSave && (
              <a className="font-bold text-[var(--ok-accent-text)] underline" href="/sign-in/">
                {copy.signIn}
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
