import { getAdminProfile } from "@/lib/admin-auth.server";
import { getDb, sql } from "@/lib/db.server";
import type { AppRole, Profile } from "@/integrations/supabase/types";

type Filter = { operator: "eq" | "is" | "in" | "gte" | "lt"; column: string; value: unknown };
type Order = { column: string; ascending?: boolean };
export type DataRequest = {
  operation: "select" | "insert" | "update" | "delete";
  columns?: string;
  values?: Record<string, unknown> | Record<string, unknown>[];
  filters?: Filter[];
  orders?: Order[];
  limit?: number;
  head?: boolean;
  count?: "exact";
  single?: "single" | "maybe";
};

const roleRank: Record<AppRole, number> = { super_admin: 1, admin: 2, team_leader: 3, employee: 4 };

const tables = {
  teams: [
    "id",
    "name",
    "slug",
    "description",
    "color",
    "is_active",
    "created_by",
    "created_at",
    "updated_at",
  ],
  profiles: [
    "id",
    "email",
    "display_name",
    "avatar_url",
    "role",
    "team_id",
    "is_active",
    "last_seen_at",
    "created_at",
    "updated_at",
  ],
  pending_invites: [
    "id",
    "email",
    "role",
    "team_id",
    "invited_by",
    "expires_at",
    "accepted_at",
    "created_at",
  ],
  tasks: [
    "id",
    "team_id",
    "title",
    "description",
    "starts_at",
    "ends_at",
    "status",
    "issuer_id",
    "issuer_role_snapshot",
    "issuer_rank",
    "created_at",
    "updated_at",
  ],
  task_assignees: ["task_id", "profile_id", "status", "assigned_by", "assigned_at", "updated_at"],
  task_comments: ["id", "task_id", "author_id", "body", "created_at", "updated_at"],
  roadmaps: [
    "id",
    "slug",
    "title",
    "description",
    "cover_url",
    "sort_order",
    "is_published",
    "created_by",
    "created_at",
    "updated_at",
  ],
  courses: [
    "id",
    "slug",
    "title",
    "description",
    "cover_url",
    "level",
    "is_published",
    "created_by",
    "created_at",
    "updated_at",
  ],
  roadmap_courses: ["roadmap_id", "course_id", "sort_order"],
  course_playlists: [
    "id",
    "youtube_playlist_id",
    "course_id",
    "title",
    "thumbnail_url",
    "last_synced_at",
    "created_at",
    "updated_at",
  ],
  lessons: [
    "id",
    "course_id",
    "slug",
    "title",
    "description",
    "sort_order",
    "is_published",
    "created_at",
    "updated_at",
  ],
  youtube_videos: [
    "id",
    "youtube_video_id",
    "playlist_id",
    "course_id",
    "lesson_id",
    "title",
    "description",
    "thumbnail_url",
    "published_at",
    "duration_seconds",
    "sort_order",
    "is_available",
    "last_synced_at",
    "created_at",
    "updated_at",
  ],
  slide_decks: [
    "id",
    "lesson_id",
    "video_id",
    "title",
    "storage_root",
    "entry_path",
    "archive_name",
    "archive_size_bytes",
    "file_count",
    "allow_download",
    "is_published",
    "sort_order",
    "uploaded_by",
    "created_at",
    "updated_at",
  ],
  youtube_sync_state: [
    "channel_id",
    "channel_title",
    "last_attempt_at",
    "last_success_at",
    "last_webhook_at",
    "last_error_code",
    "last_error_summary",
    "consecutive_failures",
    "updated_at",
  ],
  health_services: [
    "id",
    "key",
    "name_ar",
    "description_ar",
    "sort_order",
    "is_enabled",
    "created_at",
    "updated_at",
  ],
  health_checks: [
    "id",
    "service_id",
    "status",
    "latency_ms",
    "status_code",
    "summary_ar",
    "impact_ar",
    "likely_cause_ar",
    "action_ar",
    "safe_details",
    "deployment_version",
    "checked_at",
  ],
  health_incidents: [
    "id",
    "service_id",
    "status",
    "title_ar",
    "summary_ar",
    "impact_ar",
    "likely_cause_ar",
    "action_ar",
    "started_at",
    "resolved_at",
    "last_alerted_at",
    "created_at",
    "updated_at",
  ],
  audit_log: [
    "id",
    "actor_id",
    "action",
    "entity_type",
    "entity_id",
    "summary_ar",
    "metadata",
    "created_at",
  ],
} as const;

type TableName = keyof typeof tables;
const publicTables = new Set<TableName>([
  "roadmaps",
  "courses",
  "roadmap_courses",
  "lessons",
  "youtube_videos",
  "slide_decks",
]);
const healthTables = new Set<TableName>([
  "health_services",
  "health_checks",
  "health_incidents",
  "audit_log",
]);
const contentTables = new Set<TableName>([
  "roadmaps",
  "courses",
  "roadmap_courses",
  "course_playlists",
  "lessons",
  "youtube_videos",
  "slide_decks",
  "youtube_sync_state",
]);

function identifier(value: string) {
  return `[${value.replaceAll("]", "]] ").replaceAll(" ", "")}]`;
}

function validateColumn(table: TableName, column: string) {
  if (!(tables[table] as readonly string[]).includes(column))
    throw new Error(`Unknown column: ${column}`);
  return identifier(column);
}

function bind(request: sql.Request, name: string, value: unknown) {
  if (value === null) return request.input(name, null);
  if (typeof value === "boolean") return request.input(name, sql.Bit, value);
  if (typeof value === "number")
    return request.input(name, Number.isInteger(value) ? sql.BigInt : sql.Float, value);
  return request.input(name, sql.NVarChar(sql.MAX), String(value));
}

async function access(table: TableName, operation: DataRequest["operation"]) {
  const profile = await getAdminProfile();
  if (operation === "select" && publicTables.has(table)) return profile;
  if (!profile) throw new Response("Unauthorized", { status: 401 });
  if (healthTables.has(table) && !["super_admin", "admin"].includes(profile.role))
    throw new Response("Forbidden", { status: 403 });
  if (operation !== "select") {
    if (contentTables.has(table) && !["super_admin", "admin"].includes(profile.role))
      throw new Response("Forbidden", { status: 403 });
    if (table === "pending_invites" && profile.role !== "super_admin")
      throw new Response("Forbidden", { status: 403 });
    if (table === "profiles" && !["super_admin", "admin"].includes(profile.role))
      throw new Response("Forbidden", { status: 403 });
    if (table === "teams" && !["super_admin", "admin"].includes(profile.role))
      throw new Response("Forbidden", { status: 403 });
    if (
      ["tasks", "task_assignees"].includes(table) &&
      profile.role === "employee" &&
      operation !== "update"
    )
      throw new Response("Forbidden", { status: 403 });
  }
  return profile;
}

function scopedWhere(
  table: TableName,
  profile: Profile | null,
  params: sql.Request,
  parts: string[],
) {
  if (!profile) {
    if (
      table === "roadmaps" ||
      table === "courses" ||
      table === "lessons" ||
      table === "slide_decks"
    )
      parts.push("[is_published] = 1");
    if (table === "youtube_videos") parts.push("[is_available] = 1");
    return;
  }
  bind(params, "actor_id", profile.id);
  bind(params, "actor_team", profile.team_id);
  if (profile.role === "employee") {
    if (table === "profiles") parts.push("[id] = @actor_id");
    if (table === "tasks")
      parts.push(
        "exists (select 1 from okaab.task_assignees a where a.task_id = okaab.tasks.id and a.profile_id = @actor_id)",
      );
    if (table === "task_assignees") parts.push("[profile_id] = @actor_id");
  } else if (profile.role === "team_leader") {
    if (table === "profiles") parts.push("[team_id] = @actor_team");
    if (table === "tasks") parts.push("[team_id] = @actor_team");
    if (table === "task_assignees")
      parts.push(
        "exists (select 1 from okaab.tasks t where t.id = okaab.task_assignees.task_id and t.team_id = @actor_team)",
      );
  }
}

function addFilters(
  table: TableName,
  request: sql.Request,
  filters: Filter[] | undefined,
  parts: string[],
) {
  (filters || []).forEach((filter, index) => {
    const column = validateColumn(table, filter.column);
    if (filter.operator === "is" && filter.value === null) {
      parts.push(`${column} is null`);
      return;
    }
    if (filter.operator === "in") {
      const values = Array.isArray(filter.value) ? filter.value : [];
      if (!values.length) {
        parts.push("1 = 0");
        return;
      }
      const names = values.map((value, itemIndex) => {
        const name = `f${index}_${itemIndex}`;
        bind(request, name, value);
        return `@${name}`;
      });
      parts.push(`${column} in (${names.join(",")})`);
      return;
    }
    const name = `f${index}`;
    bind(request, name, filter.value);
    const operator = { eq: "=", is: "=", gte: ">=", lt: "<" }[filter.operator];
    parts.push(`${column} ${operator} @${name}`);
  });
}

function selectColumns(table: TableName, columns = "*") {
  if (columns === "*") return "*";
  return columns
    .split(",")
    .map((column) => validateColumn(table, column.trim()))
    .join(",");
}

async function select(table: TableName, input: DataRequest, profile: Profile | null) {
  const pool = await getDb();
  const request = pool.request();
  const where: string[] = [];
  scopedWhere(table, profile, request, where);
  addFilters(table, request, input.filters, where);
  const whereSql = where.length ? ` where ${where.join(" and ")}` : "";
  const orderSql = (input.orders || []).length
    ? ` order by ${(input.orders || []).map((order) => `${validateColumn(table, order.column)} ${order.ascending === false ? "desc" : "asc"}`).join(",")}`
    : input.limit
      ? " order by (select null)"
      : "";
  const limit = Math.max(0, Math.min(Number(input.limit || 0), 1000));
  const pageSql = limit ? ` offset 0 rows fetch next ${limit} rows only` : "";
  const countResult =
    input.count === "exact"
      ? await request.query<{ total: number }>(
          `select count_big(*) as total from okaab.${identifier(table)}${whereSql}`,
        )
      : null;
  if (input.head)
    return { data: null, count: Number(countResult?.recordset[0]?.total || 0), error: null };
  const result = await request.query<Record<string, unknown>>(
    `select ${selectColumns(table, input.columns)} from okaab.${identifier(table)}${whereSql}${orderSql}${pageSql}`,
  );
  const data = input.single ? (result.recordset[0] ?? null) : result.recordset;
  return {
    data,
    count: countResult ? Number(countResult.recordset[0]?.total || 0) : null,
    error: null,
  };
}

function protectedValues(table: TableName, values: Record<string, unknown>, profile: Profile) {
  const clean = { ...values };
  for (const key of Object.keys(clean))
    if (!(tables[table] as readonly string[]).includes(key)) delete clean[key];
  delete clean["id"];
  delete clean["created_at"];
  delete clean["updated_at"];
  if (table === "teams" || table === "roadmaps" || table === "courses")
    clean["created_by"] = profile.id;
  if (table === "tasks") {
    if (profile.role === "team_leader") clean["team_id"] = profile.team_id;
    clean["issuer_id"] = profile.id;
    clean["issuer_role_snapshot"] = profile.role;
    clean["issuer_rank"] = roleRank[profile.role];
  }
  if (table === "task_assignees") clean["assigned_by"] = profile.id;
  if (table === "task_comments") clean["author_id"] = profile.id;
  if (table === "slide_decks") clean["uploaded_by"] = profile.id;
  if (table === "profiles") {
    delete clean["email"];
    if (
      values["id"] === profile.id ||
      values["email"]?.toString().toLowerCase() ===
        (process.env["SUPER_ADMIN_EMAIL"] || "okaab@okaab.org").toLowerCase()
    ) {
      delete clean["role"];
      delete clean["is_active"];
    }
  }
  return clean;
}

async function mutate(table: TableName, input: DataRequest, profile: Profile) {
  const pool = await getDb();
  const rows = (Array.isArray(input.values) ? input.values : [input.values || {}]).map((row) =>
    protectedValues(table, row, profile),
  );
  if (table === "profiles") {
    if (input.operation !== "update") throw new Response("Forbidden", { status: 403 });
    const targetId = input.filters?.find(
      (item) => item.operator === "eq" && item.column === "id",
    )?.value;
    if (typeof targetId !== "string") throw new Error("Profile update requires one user");
    const targetResult = await pool
      .request()
      .input("target", sql.NVarChar(64), targetId)
      .query<{ role: AppRole; email: string }>(
        "select top (1) role,email from okaab.profiles where id=@target",
      );
    const target = targetResult.recordset[0];
    if (!target) throw new Error("User not found");
    const requestedRole = rows[0]?.["role"] as AppRole | undefined;
    if (
      target.role === "super_admin" ||
      target.email.toLowerCase() ===
        (process.env["SUPER_ADMIN_EMAIL"] || "okaab@okaab.org").toLowerCase()
    ) {
      throw new Response("لا يمكن تعديل أو خفض صلاحية السوبر أدمن", { status: 403 });
    }
    if (
      profile.role === "admin" &&
      (["super_admin", "admin"].includes(target.role) ||
        (requestedRole && ["super_admin", "admin"].includes(requestedRole)))
    ) {
      throw new Response("السوبر أدمن فقط يمكنه إدارة الأدمن", { status: 403 });
    }
  }
  if (input.operation === "insert") {
    const inserted: Record<string, unknown>[] = [];
    for (const row of rows) {
      const request = pool.request();
      const columns = Object.keys(row);
      if (!columns.length) throw new Error("No values supplied");
      columns.forEach((column, index) => bind(request, `v${index}`, row[column]));
      const result = await request.query<Record<string, unknown>>(
        `insert into okaab.${identifier(table)} (${columns.map(identifier).join(",")}) output inserted.* values (${columns.map((_, index) => `@v${index}`).join(",")})`,
      );
      inserted.push(...result.recordset);
    }
    return {
      data: input.single ? (inserted[0] ?? null) : inserted,
      count: inserted.length,
      error: null,
    };
  }

  const row = rows[0] || {};
  const request = pool.request();
  const assignments = Object.keys(row).map((column, index) => {
    bind(request, `v${index}`, row[column]);
    return `${identifier(column)} = @v${index}`;
  });
  if (assignments.length && (tables[table] as readonly string[]).includes("updated_at"))
    assignments.push("[updated_at] = sysutcdatetime()");
  const where: string[] = [];
  scopedWhere(table, profile, request, where);
  addFilters(table, request, input.filters, where);
  if (!where.length) throw new Error("Mutation requires a filter");
  if (input.operation === "delete") {
    const result = await request.query(
      `delete from okaab.${identifier(table)} output deleted.* where ${where.join(" and ")}`,
    );
    return { data: result.recordset, count: result.rowsAffected[0] || 0, error: null };
  }
  if (!assignments.length) throw new Error("No values supplied");
  const result = await request.query(
    `update okaab.${identifier(table)} set ${assignments.join(",")} output inserted.* where ${where.join(" and ")}`,
  );
  return {
    data: input.single ? (result.recordset[0] ?? null) : result.recordset,
    count: result.rowsAffected[0] || 0,
    error: null,
  };
}

export async function handleDataRequest(tableValue: string, input: DataRequest) {
  if (!(tableValue in tables)) throw new Response("Not found", { status: 404 });
  const table = tableValue as TableName;
  const profile = await access(table, input.operation);
  return input.operation === "select"
    ? select(table, input, profile)
    : mutate(table, input, profile!);
}
