import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { apiRequest } from "@/api";
import { ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";
import type { Overview } from "@/types";

type Period = "weekly" | "monthly" | "all";
type Row = { id: string; display_name: string; points: number; rank: number };
type Leaderboard = { leaders: Row[]; me: Row | null };

export default function AchievementsScreen() {
  const { getToken } = useAuth();
  const [period, setPeriod] = useState<Period>("weekly");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const [nextOverview, nextBoard] = await Promise.all([
        apiRequest<Overview>("/me/overview", getToken),
        apiRequest<Leaderboard>(`/leaderboard?period=${period}`, getToken),
      ]);
      setOverview(nextOverview);
      setBoard(nextBoard);
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تحميل الإنجازات");
    } finally {
      setRefreshing(false);
    }
  }, [getToken, period]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!overview && !error) return <Loading />;
  if (error && !overview)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );

  return (
    <Screen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>رحلتك في عُقاب</Text>
          <Text style={styles.points}>{overview!.points}</Text>
          <Text style={styles.pointsLabel}>نقطة مكتسبة</Text>
          <View style={styles.metrics}>
            <Metric value={String(overview!.rank ?? "—")} label="ترتيبك" />
            <Metric value={String(overview!.streak.current_days)} label="أيام متواصلة" />
            <Metric value={String(overview!.badges.length)} label="شارات" />
          </View>
          <Text style={styles.level}>رتبتك الحالية: {overview!.level.name}</Text>
        </View>

        <Title>شاراتك</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badges}>
          {overview!.badges.length ? overview!.badges.map((badge) => (
            <View key={badge.id} style={styles.badge}>
              <Text style={styles.badgeIcon}>★</Text>
              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text numberOfLines={2} style={styles.badgeDescription}>{badge.description}</Text>
            </View>
          )) : (
            <View style={styles.emptyBadge}><Muted>أكمل أول درس لتحصل على أول شارة.</Muted></View>
          )}
        </ScrollView>

        <View style={styles.boardHeader}>
          <Title>لوحة المتصدرين</Title>
          <Muted>نعرض الاسم الأول وحرفًا من الاسم الأخير احترامًا للخصوصية.</Muted>
          <View style={styles.tabs}>
            {(["weekly", "monthly", "all"] as Period[]).map((item) => (
              <Pressable key={item} onPress={() => setPeriod(item)} style={[styles.tab, period === item && styles.activeTab]}>
                <Text style={styles.tabText}>{item === "weekly" ? "أسبوعي" : item === "monthly" ? "شهري" : "كل الوقت"}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.board}>
          {board?.leaders.map((item, index) => (
            <View key={item.id} style={[styles.row, index < 3 && styles.topRow]}>
              <Text style={styles.rank}>{item.rank}</Text>
              <Text style={styles.name}>{privateName(item.display_name)}</Text>
              <Text style={styles.rowPoints}>{item.points} نقطة</Text>
            </View>
          ))}
          {!board?.leaders.length && <Muted>أول نقاط مكتسبة ستظهر هنا.</Muted>}
          {board?.me && board.me.rank > 20 ? (
            <View style={[styles.row, styles.myRow]}>
              <Text style={styles.rank}>{board.me.rank}</Text>
              <Text style={styles.name}>ترتيبك الحالي</Text>
              <Text style={styles.rowPoints}>{board.me.points} نقطة</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}
function privateName(name: string) {
  return name.split(" ").filter(Boolean).map((part, index) => index === 0 ? part : `${part[0]}.`).join(" ");
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 118 },
  hero: { backgroundColor: theme.colors.darkPaper, borderRadius: 28, padding: 22, alignItems: "center", gap: 5, borderWidth: 1, borderColor: `${theme.colors.gold}55` },
  kicker: { color: theme.colors.gold, fontWeight: "900" },
  points: { color: "#FFF", fontSize: 48, fontWeight: "900" },
  pointsLabel: { color: "#FFF", opacity: 0.66, fontWeight: "700" },
  metrics: { flexDirection: "row-reverse", gap: 8, width: "100%", marginTop: 12 },
  metric: { flex: 1, backgroundColor: "#2B251F", borderRadius: 14, padding: 10, alignItems: "center", gap: 3 },
  metricValue: { color: theme.colors.gold, fontWeight: "900", fontSize: 19 },
  metricLabel: { color: "#FFF", opacity: 0.65, fontSize: 11, textAlign: "center" },
  level: { color: theme.colors.gold, fontWeight: "900", marginTop: 10 },
  badges: { gap: 10, paddingBottom: 4 },
  badge: { width: 150, minHeight: 145, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: `${theme.colors.ink}22`, borderRadius: 18, padding: 14, alignItems: "center", gap: 6 },
  badgeIcon: { width: 42, height: 42, lineHeight: 42, borderRadius: 21, backgroundColor: theme.colors.gold, color: theme.colors.ink, textAlign: "center", fontSize: 20 },
  badgeTitle: { color: theme.colors.ink, fontWeight: "900", textAlign: "center" },
  badgeDescription: { color: theme.colors.ink, opacity: 0.6, textAlign: "center", fontSize: 12, lineHeight: 17 },
  emptyBadge: { minWidth: 260, padding: 20, backgroundColor: theme.colors.card, borderRadius: 16 },
  boardHeader: { gap: 8, marginTop: 8 },
  tabs: { flexDirection: "row-reverse", gap: 7 },
  tab: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: `${theme.colors.ink}40`, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.card },
  activeTab: { backgroundColor: theme.colors.gold, borderColor: theme.colors.ink },
  tabText: { color: theme.colors.ink, fontWeight: "800" },
  board: { gap: 8 },
  row: { minHeight: 58, flexDirection: "row-reverse", alignItems: "center", gap: 10, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: `${theme.colors.ink}20`, borderRadius: 14, padding: 10 },
  topRow: { borderColor: `${theme.colors.gold}99` },
  rank: { width: 34, height: 34, lineHeight: 34, borderRadius: 17, backgroundColor: theme.colors.darkPaper, color: theme.colors.gold, textAlign: "center", fontWeight: "900" },
  name: { flex: 1, color: theme.colors.ink, textAlign: "right", fontWeight: "800" },
  rowPoints: { color: theme.colors.ink, opacity: 0.66, fontWeight: "700" },
  myRow: { borderColor: theme.colors.gold, borderWidth: 2, marginTop: 8 },
});
