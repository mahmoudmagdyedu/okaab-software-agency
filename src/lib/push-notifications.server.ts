import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

import { ApiProblem } from "@/lib/api-response.server";
import { getDb, sql } from "@/lib/db.server";

export type PushAudience = "all" | "active" | "inactive_7d";

function serviceAccount() {
  const configured = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"]?.trim();
  if (!configured) {
    throw new ApiProblem(
      "خدمة الإشعارات غير مفعّلة بعد. أضف اعتماد Firebase إلى إعدادات الخادم.",
      503,
    );
  }
  try {
    const decoded = configured.startsWith("{")
      ? configured
      : Buffer.from(configured, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) throw new Error();
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    throw new ApiProblem("اعتماد Firebase المحفوظ غير صالح. راجع JSON ثم حاول مرة أخرى.", 503);
  }
}

function firebaseApp(): App {
  const existing = getApps().find((app) => app.name === "okaab-push");
  return existing ?? initializeApp({ credential: cert(serviceAccount()) }, "okaab-push");
}

export async function sendLearningPush(input: {
  actorId: string;
  title: string;
  body: string;
  audience: PushAudience;
}) {
  const messaging = getMessaging(firebaseApp());
  const pool = await getDb();
  const recent = await pool.request().query<{ sends: number }>(`
    select count(*) sends from okaab.audit_log
    where action='learning.push.send' and created_at>=dateadd(day,-7,sysutcdatetime())
  `);
  if (Number(recent.recordset[0]?.sends ?? 0) >= 3) {
    throw new ApiProblem("وصلت المنصة إلى الحد الآمن: 3 رسائل Push خلال 7 أيام.", 429);
  }

  const audienceClause =
    input.audience === "active"
      ? "and exists (select 1 from okaab.lesson_events e where e.user_id=p.id and e.created_at>=dateadd(day,-7,sysutcdatetime()))"
      : input.audience === "inactive_7d"
        ? "and not exists (select 1 from okaab.lesson_events e where e.user_id=p.id and e.created_at>=dateadd(day,-7,sysutcdatetime()))"
        : "";
  const devices = await pool.request().query<{ fcm_token: string }>(`
    select distinct d.fcm_token
    from okaab.learning_devices d
    join okaab.learner_profiles p on p.id=d.user_id
    where p.status='active' ${audienceClause}
  `);
  const tokens = devices.recordset.map((row) => row.fcm_token);
  if (tokens.length === 0) {
    return { sent: 0, failed: 0, devices: 0, message: "لا توجد أجهزة مسجّلة لهذه الفئة." };
  }

  let sent = 0;
  let failed = 0;
  const invalidTokens: string[] = [];
  for (let index = 0; index < tokens.length; index += 500) {
    const batch = tokens.slice(index, index + 500);
    const response = await messaging.sendEachForMulticast({
      tokens: batch,
      notification: { title: input.title, body: input.body },
      android: {
        priority: "high",
        notification: { channelId: "learning", color: "#E8A33D" },
      },
      data: { destination: "/" },
    });
    sent += response.successCount;
    failed += response.failureCount;
    response.responses.forEach((item, responseIndex) => {
      if (
        item.error?.code === "messaging/registration-token-not-registered" ||
        item.error?.code === "messaging/invalid-registration-token"
      ) {
        const invalidToken = batch[responseIndex];
        if (invalidToken) invalidTokens.push(invalidToken);
      }
    });
  }

  if (invalidTokens.length > 0) {
    const request = pool.request();
    const placeholders = invalidTokens.map((token, index) => {
      request.input(`token${index}`, sql.NVarChar(500), token);
      return `@token${index}`;
    });
    await request.query(
      `delete from okaab.learning_devices where fcm_token in (${placeholders.join(",")})`,
    );
  }
  await pool
    .request()
    .input("actor", sql.NVarChar(64), input.actorId)
    .input("summary", sql.NVarChar(1000), `تم إرسال إشعار: ${input.title}`)
    .input(
      "metadata",
      sql.NVarChar(sql.MAX),
      JSON.stringify({ audience: input.audience, sent, failed, devices: tokens.length }),
    ).query(`
      insert into okaab.audit_log (actor_id,action,entity_type,entity_id,summary_ar,metadata)
      values (@actor,'learning.push.send','push_notification',null,@summary,@metadata)
    `);
  return { sent, failed, devices: tokens.length };
}
