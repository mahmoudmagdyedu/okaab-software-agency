import { unzipSync } from "fflate";
import { AlertCircle, FileArchive, LoaderCircle, UploadCloud } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import type { Course, Lesson, Profile, Roadmap, YouTubeVideo } from "@/integrations/supabase/types";

const MAX_ARCHIVE = 100 * 1024 * 1024;
const MAX_EXPANDED = 300 * 1024 * 1024;
const MAX_FILES = 750;
const MAX_REQUEST_BYTES = 40 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "html",
  "htm",
  "css",
  "js",
  "mjs",
  "json",
  "map",
  "txt",
  "md",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "svg",
  "ico",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  "mp4",
  "webm",
  "mp3",
  "ogg",
  "wav",
  "pdf",
]);

const MIME: Record<string, string> = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "application/javascript; charset=utf-8",
  mjs: "application/javascript; charset=utf-8",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  wav: "audio/wav",
  pdf: "application/pdf",
};

type PreparedFile = { path: string; bytes: Uint8Array; contentType: string };

function safePath(raw: string) {
  const path = raw.replaceAll("\\", "/").replace(/^\.\//, "");
  if (
    !path ||
    path.startsWith("/") ||
    path.includes("\0") ||
    path.split("/").some((part) => part === "..")
  )
    throw new Error(`مسار غير آمن داخل ZIP: ${raw}`);
  return path;
}

function extension(path: string) {
  return path.split(".").pop()?.toLowerCase() ?? "";
}
function contentType(path: string) {
  return MIME[extension(path)] ?? "application/octet-stream";
}

function findRelativeAssets(html: string) {
  const matches = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map(
    (match) => match[1] ?? "",
  );
  return matches.filter(
    (value) => value && !/^(?:https?:|data:|blob:|#|mailto:|tel:|\/\/)/i.test(value),
  );
}

async function prepare(
  file: File,
): Promise<{ files: PreparedFile[]; source: PreparedFile; sourceName: string }> {
  if (file.size > MAX_ARCHIVE) throw new Error("الملف أكبر من الحد المسموح 100MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (/\.html?$/i.test(file.name)) {
    const html = new TextDecoder().decode(bytes);
    const assets = findRelativeAssets(html);
    if (assets.length)
      throw new Error("ملف HTML يعتمد على ملفات خارجية. ضعه مع مجلد الأصول داخل ZIP ثم ارفعه.");
    return {
      files: [{ path: "index.html", bytes, contentType: "text/html; charset=utf-8" }],
      source: { path: "source.html", bytes, contentType: "text/html; charset=utf-8" },
      sourceName: file.name,
    };
  }
  if (!/\.zip$/i.test(file.name)) throw new Error("الصيغ المدعومة هي HTML وZIP فقط");

  let archive: Record<string, Uint8Array>;
  try {
    archive = unzipSync(bytes);
  } catch {
    throw new Error("ملف ZIP تالف أو غير قابل للقراءة");
  }
  const entries = Object.entries(archive).filter(([name]) => !name.endsWith("/"));
  if (!entries.length || entries.length > MAX_FILES)
    throw new Error(`يجب أن يحتوي ZIP بين ملف واحد و${MAX_FILES} ملف`);
  const safeEntries = entries.map(([name, value]) => [safePath(name), value] as const);
  const expanded = safeEntries.reduce((total, [, value]) => total + value.byteLength, 0);
  if (expanded > MAX_EXPANDED) throw new Error("الحجم بعد فك الضغط يتجاوز 300MB");

  const indexCandidates = safeEntries
    .map(([name]) => name)
    .filter((name) => /(^|\/)index\.html?$/i.test(name))
    .sort((a, b) => a.split("/").length - b.split("/").length);
  if (!indexCandidates.length) throw new Error("ZIP يجب أن يحتوي على index.html");
  const entry = indexCandidates[0]!;
  const prefix = entry.includes("/") ? entry.slice(0, entry.lastIndexOf("/") + 1) : "";
  const selected = safeEntries
    .filter(([name]) => name.startsWith(prefix))
    .map(([name, value]) => ({
      path: name.slice(prefix.length),
      bytes: value,
      contentType: contentType(name),
    }));
  for (const item of selected) {
    const ext = extension(item.path);
    if (!ALLOWED_EXTENSIONS.has(ext))
      throw new Error(`امتداد غير مسموح داخل ZIP: .${ext || "بدون امتداد"}`);
  }
  const normalizedEntry = selected.find((item) => /^index\.html?$/i.test(item.path));
  if (!normalizedEntry) throw new Error("تعذّر تحديد صفحة البداية");
  normalizedEntry.path = "index.html";
  return {
    files: selected,
    source: { path: "source.zip", bytes, contentType: "application/zip" },
    sourceName: file.name,
  };
}

export function SlideUploader({
  roadmaps,
  courses,
  roadmapCourses,
  lessons,
  videos,
  profile,
  onCreateHierarchy,
  onUploaded,
}: {
  roadmaps: Roadmap[];
  courses: Course[];
  roadmapCourses: { roadmap_id: string; course_id: string }[];
  lessons: Lesson[];
  videos: YouTubeVideo[];
  profile: Profile;
  onCreateHierarchy: (input: {
    roadmapTitle: string;
    courseTitle: string;
    lessonTitle: string;
    published: boolean;
  }) => Promise<string>;
  onUploaded: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [roadmapId, setRoadmapId] = useState("");
  const [courseId, setCourseId] = useState("");

  const filteredCourses = useMemo(() => {
    if (!roadmapId) return courses;
    const ids = new Set(
      roadmapCourses.filter((link) => link.roadmap_id === roadmapId).map((link) => link.course_id),
    );
    return courses.filter((course) => ids.has(course.id));
  }, [courses, roadmapCourses, roadmapId]);
  const filteredLessons = courseId
    ? lessons.filter((lesson) => lesson.course_id === courseId)
    : lessons;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      toast.error("اختر ملف HTML أو ZIP");
      return;
    }
    setUploading(true);
    setProgress(2);
    try {
      const prepared = await prepare(file);
      let lessonId = String(form.get("lessonId") || "");
      const allowDownload = form.get("allowDownload") === "on";
      const publishNow = form.get("published") === "on";
      if (!lessonId) {
        setProgress(8);
        lessonId = await onCreateHierarchy({
          roadmapTitle: String(form.get("quickRoadmapTitle") || ""),
          courseTitle: String(form.get("quickCourseTitle") || ""),
          lessonTitle: String(form.get("quickLessonTitle") || ""),
          published: publishNow,
        });
      }
      const uploadList = allowDownload ? [...prepared.files, prepared.source] : prepared.files;
      const requestBytes = uploadList.reduce((total, item) => total + item.bytes.byteLength, 0);
      if (requestBytes > MAX_REQUEST_BYTES)
        throw new Error(
          "الحزمة بعد التجهيز أكبر من 40MB. قلّل حجم الصور أو ألغِ تنزيل الملف الأصلي.",
        );
      const upload = new FormData();
      upload.set(
        "metadata",
        JSON.stringify({
          lessonId,
          videoId: String(form.get("videoId") || "") || null,
          title: String(form.get("title")),
          archiveName: allowDownload ? prepared.sourceName : null,
          archiveSizeBytes: allowDownload ? file.size : null,
          fileCount: prepared.files.length,
          allowDownload,
          isPublished: publishNow,
          sortOrder: Number(form.get("sortOrder") || 0),
        }),
      );
      uploadList.forEach((item) =>
        upload.append(
          `asset:${encodeURIComponent(item.path)}`,
          new Blob([item.bytes.slice().buffer as ArrayBuffer], { type: item.contentType }),
          item.path.split("/").pop(),
        ),
      );
      setProgress(35);
      const response = await fetch("/api/admin/slides/upload", { method: "POST", body: upload });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "تعذّر رفع الحزمة");
      setProgress(100);
      toast.success("تم رفع الـSlides وفحصها بنجاح", {
        description: `${prepared.files.length} ملف — ${prepared.sourceName}`,
      });
      event.currentTarget.reset();
      await onUploaded();
    } catch (error) {
      toast.error("لم يكتمل رفع الـSlides", {
        description: error instanceof Error ? error.message : "خطأ غير متوقع",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 700);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border-2 border-[var(--ok-ink)] bg-[var(--ok-card)] p-5 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#E8A33D] text-[#181511]">
          <UploadCloud size={22} />
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold">رفع Slides</h2>
          <p className="text-sm opacity-60">HTML مستقل أو ZIP يحتوي index.html.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input
          name="title"
          required
          placeholder="عنوان الـSlides"
          className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3 sm:col-span-2"
        />
        <select
          name="roadmapId"
          value={roadmapId}
          onChange={(event) => {
            setRoadmapId(event.target.value);
            setCourseId("");
          }}
          className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
        >
          <option value="">كل الـRoadmaps</option>
          {roadmaps.map((roadmap) => (
            <option key={roadmap.id} value={roadmap.id}>
              {roadmap.title}
            </option>
          ))}
        </select>
        <select
          name="courseId"
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
        >
          <option value="">اختر الكورس</option>
          {filteredCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <select
          name="lessonId"
          required={lessons.length > 0}
          className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
        >
          <option value="">اختر الدرس</option>
          {filteredLessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {courses.find((course) => course.id === lesson.course_id)?.title} — {lesson.title}
            </option>
          ))}
        </select>
        <select
          name="videoId"
          className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
        >
          <option value="">بدون فيديو مرتبط</option>
          {videos.map((video) => (
            <option key={video.id} value={video.id}>
              {video.title}
            </option>
          ))}
        </select>
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--ok-ink)] bg-[var(--ok-paper)] p-4 text-center sm:col-span-2">
          <FileArchive size={25} />
          <span className="mt-2 text-sm font-bold">اختر HTML أو ZIP</span>
          <input
            name="file"
            type="file"
            required
            accept=".html,.htm,.zip,text/html,application/zip"
            className="mt-2 max-w-full text-xs"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-[var(--ok-ink)]/20 p-3 text-sm font-bold">
          <input name="published" type="checkbox" /> نشر فورًا
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-[var(--ok-ink)]/20 p-3 text-sm font-bold">
          <input name="allowDownload" type="checkbox" /> السماح بتنزيل الأصل
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-bold">الترتيب</span>
          <input
            name="sortOrder"
            type="number"
            defaultValue="0"
            className="h-10 w-full rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
          />
        </label>
      </div>
      {lessons.length === 0 && (
        <div
          role="status"
          className="mt-4 rounded-2xl border border-[#E8A33D]/45 bg-[#E8A33D]/10 p-4"
        >
          <div className="flex items-start gap-3 text-sm leading-6">
            <AlertCircle className="mt-0.5 shrink-0 text-[#D88C20]" size={19} />
            <p>
              لا يوجد محتوى تعليمي بعد. اكتب الأسماء التالية وسينشئ النظام الـRoadmap والكورس والدرس
              تلقائيًا ثم يرفع الملف في خطوة واحدة.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              name="quickRoadmapTitle"
              required
              placeholder="اسم الـRoadmap"
              className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            />
            <input
              name="quickCourseTitle"
              required
              placeholder="اسم الكورس"
              className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            />
            <input
              name="quickLessonTitle"
              required
              placeholder="اسم الدرس"
              className="h-11 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-paper)] px-3"
            />
          </div>
        </div>
      )}
      {progress > 0 && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--ok-paper)]">
          <div className="h-full bg-[#E8A33D] transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <button
        disabled={uploading}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--ok-ink)] bg-[var(--ok-ink)] font-bold text-[var(--ok-paper)] disabled:opacity-50"
      >
        {uploading ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <UploadCloud size={18} />
        )}
        {uploading ? `جاري الرفع ${progress}%` : "فحص ورفع الملف"}
      </button>
    </form>
  );
}
