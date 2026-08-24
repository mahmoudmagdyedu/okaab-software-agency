/**
 * اختبار تزامن منع الحجز المزدوج:
 * يطلق 20 طلب حجز متوازيًا على الفتحة نفسها ويتوقع نجاح طلب واحد فقط.
 *
 * التشغيل: bun scripts/concurrency-test.ts <access_token>
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env["VITE_SUPABASE_URL"] ?? "";
const key = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "";
const token = process.argv[2] ?? "";

if (!url || !key || !token) {
  console.error("مطلوب: VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY ورمز جلسة.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: { headers: { Authorization: `Bearer ${token}` } },
});

const main = async (): Promise<void> => {
  const { data: staff } = await supabase.from("staff").select("id, tenant_id").limit(1).single();
  const { data: service } = await supabase.from("services").select("id").limit(1).single();
  const { data: customers } = await supabase.from("customers").select("id").limit(20);
  if (!staff || !service || !customers?.length) throw new Error("بيانات ناقصة");

  const startsAt = new Date(Date.now() + 40 * 24 * 3600 * 1000);
  startsAt.setUTCHours(8, 0, 0, 0);

  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      supabase.rpc("book_appointment", {
        _tenant_id: staff.tenant_id,
        _staff_id: staff.id,
        _service_id: service.id,
        _customer_id: customers[i % customers.length]!.id,
        _starts_at: startsAt.toISOString(),
        _note: "اختبار تزامن",
      }),
    ),
  );

  const ok = results.filter((r) => !r.error);
  const taken = results.filter((r) => r.error?.message.includes("slot_taken"));
  console.log(`ناجح: ${ok.length} | مرفوض بالتعارض: ${taken.length}`);
  if (ok.length !== 1) throw new Error("فشل الاختبار: أكثر من حجز واحد نجح");
  for (const row of ok) {
    await supabase
      .from("appointments")
      .delete()
      .eq("id", row.data as string);
  }
  console.log("نجح الاختبار: حجز واحد فقط تم قبوله.");
};

void main();
