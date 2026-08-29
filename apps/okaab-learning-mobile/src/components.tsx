import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "./theme";

export function Screen({ children }: PropsWithChildren) { return <View style={styles.screen}>{children}</View>; }
export function Title({ children }: PropsWithChildren) { return <Text style={styles.title}>{children}</Text>; }
export function Muted({ children }: PropsWithChildren) { return <Text style={styles.muted}>{children}</Text>; }
export function Card({ children }: PropsWithChildren) { return <View style={styles.card}>{children}</View>; }
export function Action({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed, disabled && styles.disabled]}><Text style={styles.actionText}>{disabled ? "جارٍ التنفيذ…" : title}</Text></Pressable>; }
export function Loading() { return <View style={styles.center}><ActivityIndicator color={theme.colors.gold} size="large" /><Muted>بنجهّز المحتوى ليك…</Muted></View>; }
export function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <Card><Title>تعذّر تحميل الصفحة</Title><Muted>{message}</Muted><Action title="حاول مرة أخرى" onPress={retry} /></Card>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.paper, paddingHorizontal: 16, paddingTop: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { color: theme.colors.ink, fontSize: 22, fontWeight: "700", textAlign: "right", writingDirection: "rtl" },
  muted: { color: theme.colors.ink, opacity: 0.68, fontSize: 14, lineHeight: 22, textAlign: "right", writingDirection: "rtl" },
  card: { backgroundColor: theme.colors.card, borderColor: `${theme.colors.ink}22`, borderWidth: 1, borderRadius: theme.radius.md, padding: 16, gap: 8 },
  action: { minHeight: 48, backgroundColor: theme.colors.gold, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  actionText: { color: theme.colors.ink, fontWeight: "700", fontSize: 15 },
  pressed: { opacity: 0.82 }, disabled: { opacity: 0.55 },
});
