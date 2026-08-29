import { useAuth, useClerk } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { apiRequest } from "@/api";
import { Action, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";
import type { Overview } from "@/types";

export default function Profile() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const [data, setData] = useState<Overview | null>(null);
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const next = await apiRequest<Overview>("/me/overview", getToken);
      setData(next);
      setName(next.profile.display_name);
      setError("");
    } catch (value) { setError(value instanceof Error ? value.message : "تعذّر التحميل"); }
  };
  useEffect(() => { if (isSignedIn) void load(); }, [isSignedIn]);
  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (!data && !error) return <Loading />;
  if (error && !data) return <Screen><ErrorState message={error} retry={load} /></Screen>;

  const save = async () => {
    setBusy(true);
    try {
      await apiRequest("/me", getToken, { method: "PATCH", body: JSON.stringify({ displayName: name, leaderboardVisible: visible }) });
      await load();
    } catch (value) { setError(value instanceof Error ? value.message : "تعذّر الحفظ"); }
    finally { setBusy(false); }
  };
  const levelProgress = data!.level.next ? Math.min(100, Math.round(((data!.points - data!.level.minimum) / (data!.level.next - data!.level.minimum)) * 100)) : 100;

  return <Screen><ScrollView contentContainerStyle={styles.content}><View style={styles.head}><Title>{data!.profile.display_name}</Title><Muted>{data!.profile.email}</Muted><Text style={styles.points}>{data!.points} نقطة · ترتيب {data!.rank ?? "—"}</Text><Text style={styles.level}>رتبة {data!.level.name}</Text><View style={styles.track}><View style={[styles.fill, { width: `${levelProgress}%` }]} /></View>{data!.level.next && <Muted>فاضل {data!.level.next - data!.points} نقطة للرتبة التالية.</Muted>}</View>{data!.badges.length > 0 && <View style={styles.badges}><Text style={styles.label}>الشارات</Text>{data!.badges.map((badge) => <View key={badge.id} style={styles.badge}><Text style={styles.badgeTitle}>{badge.title}</Text><Text style={styles.badgeText}>{badge.description}</Text></View>)}</View>}<View style={styles.form}><Text style={styles.label}>الاسم الظاهر</Text><TextInput value={name} onChangeText={setName} style={styles.input} /><View style={styles.switchRow}><Switch value={visible} onValueChange={setVisible} trackColor={{ true: theme.colors.gold }} /><Text style={styles.label}>إظهاري في لوحة المتصدرين</Text></View><Action title="حفظ التغييرات" onPress={() => void save()} disabled={busy || name.trim().length < 2} /><Action title="تسجيل الخروج" onPress={() => void signOut().then(() => router.replace("/"))} />{error && <Text style={styles.error}>{error}</Text>}</View></ScrollView></Screen>;
}

const styles = StyleSheet.create({ content: { gap: 16, paddingBottom: 32 }, head: { gap: 8 }, points: { color: theme.colors.gold, fontWeight: "800", textAlign: "right" }, level: { color: theme.colors.ink, fontWeight: "800", textAlign: "right" }, track: { height: 8, backgroundColor: `${theme.colors.ink}22`, borderRadius: 6, overflow: "hidden" }, fill: { height: "100%", backgroundColor: theme.colors.gold }, badges: { gap: 8 }, badge: { backgroundColor: theme.colors.darkPaper, borderRadius: 10, padding: 12 }, badgeTitle: { color: theme.colors.gold, fontWeight: "800", textAlign: "right" }, badgeText: { color: theme.colors.darkInk, opacity: 0.72, textAlign: "right", marginTop: 3 }, form: { gap: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: `${theme.colors.ink}22`, padding: 16, borderRadius: 16 }, label: { color: theme.colors.ink, fontWeight: "700", textAlign: "right" }, input: { minHeight: 48, borderWidth: 1, borderColor: `${theme.colors.ink}44`, borderRadius: 10, paddingHorizontal: 12, color: theme.colors.ink, textAlign: "right", backgroundColor: theme.colors.paperAlt }, switchRow: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, error: { color: theme.colors.error, textAlign: "right" } });
