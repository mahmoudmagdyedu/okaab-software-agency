import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const apiUrl = process.env.EXPO_PUBLIC_OKAAB_API_URL || Constants.expoConfig?.extra?.apiUrl || "https://okaab.org/api/v1";
const QUEUE_KEY = "okaab-learning-event-queue-v1";

type Envelope<T> = { data: T | null; error: { message: string } | null };
const REQUEST_TIMEOUT_MS = 12_000;

export async function apiRequest<T>(path: string, getToken?: () => Promise<string | null>, init?: RequestInit): Promise<T> {
  const token = getToken ? await getToken() : null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const callerSignal = init?.signal;
  const forwardAbort = () => controller.abort();
  callerSignal?.addEventListener("abort", forwardAbort, { once: true });

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...init?.headers },
    });
    const body = await response.text();
    let payload: Envelope<T>;
    try {
      payload = JSON.parse(body) as Envelope<T>;
    } catch {
      throw new Error("وصل رد غير متوقع من المنصة. حاول مرة أخرى بعد لحظات.");
    }
    if (!response.ok || payload.error) throw new Error(payload.error?.message || "تعذّر الاتصال بمنصة عُقاب");
    return payload.data as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("استغرق الاتصال وقتًا أطول من المعتاد. تحقق من الإنترنت ثم أعد المحاولة.");
    }
    if (error instanceof TypeError) {
      throw new Error("لا يمكن الوصول إلى منصة عُقاب الآن. تحقق من الإنترنت ثم أعد المحاولة.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", forwardAbort);
  }
}

export async function enqueueEvent(slug: string, event: Record<string, unknown>) {
  const queue = JSON.parse((await AsyncStorage.getItem(QUEUE_KEY)) || "[]") as { slug: string; event: Record<string, unknown> }[];
  queue.push({ slug, event });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-200)));
}

export async function flushEvents(getToken: () => Promise<string | null>) {
  const queue = JSON.parse((await AsyncStorage.getItem(QUEUE_KEY)) || "[]") as { slug: string; event: Record<string, unknown> }[];
  const pending: typeof queue = [];
  for (const item of queue) {
    try { await apiRequest(`/lessons/${encodeURIComponent(item.slug)}/events`, getToken, { method: "POST", body: JSON.stringify(item.event) }); }
    catch { pending.push(item); }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
}
