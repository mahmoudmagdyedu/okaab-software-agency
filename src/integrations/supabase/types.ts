export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "super_admin" | "admin" | "team_leader" | "employee";
export type TaskStatus = "scheduled" | "in_progress" | "blocked" | "completed" | "cancelled";
export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Timestamps = { created_at: string; updated_at: string };

export type Profile = Timestamps & {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: AppRole;
  team_id: string | null;
  is_active: boolean;
  last_seen_at: string | null;
};

export type Team = Timestamps & {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_by: string | null;
};

export type Task = Timestamps & {
  id: string;
  team_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  status: TaskStatus;
  issuer_id: string;
  issuer_role_snapshot: AppRole;
  issuer_rank: number;
};

export type TaskAssignee = {
  task_id: string;
  profile_id: string;
  status: TaskStatus;
  assigned_by: string;
  assigned_at: string;
  updated_at: string;
};

export type Roadmap = Timestamps & {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_by: string | null;
};

export type Course = Timestamps & {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_url: string | null;
  level: string;
  is_published: boolean;
  created_by: string | null;
};

export type Lesson = Timestamps & {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  is_published: boolean;
};

export type YouTubeVideo = Timestamps & {
  id: string;
  youtube_video_id: string;
  playlist_id: string | null;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string;
  thumbnail_url: string | null;
  published_at: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_available: boolean;
  last_synced_at: string;
};

export type SlideDeck = Timestamps & {
  id: string;
  lesson_id: string;
  video_id: string | null;
  title: string;
  storage_root: string;
  entry_path: string;
  archive_name: string | null;
  archive_size_bytes: number | null;
  file_count: number;
  allow_download: boolean;
  is_published: boolean;
  sort_order: number;
  uploaded_by: string;
};

export type HealthService = Timestamps & {
  id: string;
  key: string;
  name_ar: string;
  description_ar: string;
  sort_order: number;
  is_enabled: boolean;
};

export type HealthCheck = {
  id: number;
  service_id: string;
  status: HealthStatus;
  latency_ms: number | null;
  status_code: number | null;
  summary_ar: string;
  impact_ar: string;
  likely_cause_ar: string;
  action_ar: string;
  safe_details: Json;
  deployment_version: string | null;
  checked_at: string;
};

export type HealthIncident = Timestamps & {
  id: string;
  service_id: string;
  status: HealthStatus;
  title_ar: string;
  summary_ar: string;
  impact_ar: string;
  likely_cause_ar: string;
  action_ar: string;
  started_at: string;
  resolved_at: string | null;
  last_alerted_at: string | null;
};

export type HealthDailySummary = {
  service_id: string;
  day: string;
  total_checks: number;
  healthy_checks: number;
  degraded_checks: number;
  down_checks: number;
  unknown_checks: number;
  average_latency_ms: number | null;
  maximum_latency_ms: number | null;
  created_at: string;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.15" };
  public: {
    Tables: {
      teams: Table<Team>;
      profiles: Table<Profile>;
      pending_invites: Table<{
        id: string;
        email: string;
        role: AppRole;
        team_id: string | null;
        invited_by: string;
        expires_at: string;
        accepted_at: string | null;
        created_at: string;
      }>;
      tasks: Table<Task>;
      task_assignees: Table<TaskAssignee>;
      task_comments: Table<{
        id: string;
        task_id: string;
        author_id: string;
        body: string;
        created_at: string;
        updated_at: string;
      }>;
      task_attachments: Table<{
        id: string;
        task_id: string;
        uploaded_by: string;
        storage_path: string;
        file_name: string;
        mime_type: string | null;
        size_bytes: number;
        created_at: string;
      }>;
      roadmaps: Table<Roadmap>;
      courses: Table<Course>;
      roadmap_courses: Table<{ roadmap_id: string; course_id: string; sort_order: number }>;
      course_playlists: Table<{
        id: string;
        youtube_playlist_id: string;
        course_id: string | null;
        title: string;
        thumbnail_url: string | null;
        last_synced_at: string | null;
        created_at: string;
        updated_at: string;
      }>;
      lessons: Table<Lesson>;
      youtube_videos: Table<YouTubeVideo>;
      slide_decks: Table<SlideDeck>;
      youtube_sync_state: Table<{
        channel_id: string;
        channel_title: string | null;
        last_attempt_at: string | null;
        last_success_at: string | null;
        last_webhook_at: string | null;
        last_error_code: string | null;
        last_error_summary: string | null;
        consecutive_failures: number;
        updated_at: string;
      }>;
      health_services: Table<HealthService>;
      health_checks: Table<HealthCheck>;
      health_daily_summaries: Table<HealthDailySummary>;
      health_incidents: Table<HealthIncident>;
      admin_notifications: Table<{
        id: string;
        recipient_id: string;
        incident_id: string | null;
        title_ar: string;
        body_ar: string;
        read_at: string | null;
        created_at: string;
      }>;
      audit_log: Table<{
        id: number;
        actor_id: string | null;
        action: string;
        entity_type: string;
        entity_id: string | null;
        summary_ar: string;
        metadata: Json;
        created_at: string;
      }>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      app_role: AppRole;
      task_status: TaskStatus;
      health_status: HealthStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Omit<Database, "__InternalSupabase">["public"];
export type Tables<Name extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][Name]["Row"];
export type TablesInsert<Name extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][Name]["Insert"];
export type TablesUpdate<Name extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][Name]["Update"];
export type Enums<Name extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][Name];

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "team_leader", "employee"],
      task_status: ["scheduled", "in_progress", "blocked", "completed", "cancelled"],
      health_status: ["healthy", "degraded", "down", "unknown"],
    },
  },
} as const;
