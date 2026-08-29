import { useAuth, useClerk, useUser } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { apiRequest } from "@/api";
import { Action, ErrorState, Loading, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";
import type { Overview } from "@/types";

export default function Profile() {
  const { isLoaded, isSignedIn, getToken, sessionId } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [data, setData] = useState<Overview | null>(null);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      lastActiveAt: Date;
      latestActivity: { deviceType?: string; browserName?: string };
      revoke: () => Promise<unknown>;
    }>
  >([]);
  const load = useCallback(async () => {
    try {
      const next = await apiRequest<Overview>("/me/overview", getToken);
      setData(next);
      setName(next.profile.display_name);
      setBirthdate(next.profile.birthdate?.slice(0, 10) || "");
      setVisible(Boolean(next.profile.leaderboard_visible));
      if (user) setSessions(await user.getSessions());
      setError("");
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر التحميل");
    }
  }, [getToken, user]);
  useEffect(() => {
    if (isSignedIn) void load();
  }, [isSignedIn, load]);
  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (!data && !error) return <Loading />;
  if (error && !data)
    return (
      <Screen>
        <ErrorState message={error} retry={load} />
      </Screen>
    );

  const save = async () => {
    setBusy(true);
    try {
      await apiRequest("/me", getToken, {
        method: "PATCH",
        body: JSON.stringify({
          displayName: name,
          birthdate: birthdate || null,
          leaderboardVisible: visible,
        }),
      });
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر الحفظ");
    } finally {
      setBusy(false);
    }
  };
  const pickAvatar = async () => {
    if (!user) return;
    setAvatarBusy(true);
    setError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error("اسمح للتطبيق بالوصول للصور عشان تختار صورة حسابك.");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024)
        throw new Error("الصورة أكبر من 5MB. اختَر صورة أصغر.");
      const image = await fetch(asset.uri);
      const blob = await image.blob();
      if (blob.size > 5 * 1024 * 1024) throw new Error("الصورة أكبر من 5MB. اختَر صورة أصغر.");
      if (!["image/jpeg", "image/png", "image/webp"].includes(blob.type))
        throw new Error("استخدم صورة JPG أو PNG أو WebP.");
      await user.setProfileImage({ file: blob });
      await user.reload();
      await apiRequest("/me/avatar", getToken, { method: "POST" });
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر تحديث الصورة");
    } finally {
      setAvatarBusy(false);
    }
  };
  const revokeSession = (session: (typeof sessions)[number]) =>
    Alert.alert("تسجيل خروج الجهاز؟", "الجلسة هتتقفل فورًا على الجهاز المختار.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: async () => {
          try {
            await session.revoke();
            if (user) setSessions(await user.getSessions());
          } catch (value) {
            setError(value instanceof Error ? value.message : "تعذّر إغلاق الجلسة");
          }
        },
      },
    ]);
  const levelProgress = data!.level.next
    ? Math.min(
        100,
        Math.round(
          ((data!.points - data!.level.minimum) / (data!.level.next - data!.level.minimum)) * 100,
        ),
      )
    : 100;
  const removeAccount = () =>
    Alert.alert(
      "حذف حساب عُقاب؟",
      "هيتوقف الحساب فورًا، وتقدر تستعيده بتسجيل الدخول خلال 30 يومًا. بعد المدة تُحذف بيانات الحساب نهائيًا.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف حسابي",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest("/me", getToken, {
                method: "DELETE",
                body: JSON.stringify({ confirmation: "احذف حسابي" }),
              });
              await signOut();
              router.replace("/");
            } catch (value) {
              setError(value instanceof Error ? value.message : "تعذّر حذف الحساب");
            }
          },
        },
      ],
    );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Image
            accessibilityLabel="صورة الحساب"
            source={{ uri: data!.profile.avatar_url || user?.imageUrl }}
            style={styles.avatar}
          />
          <Pressable
            accessibilityRole="button"
            disabled={avatarBusy}
            onPress={() => void pickAvatar()}
            style={styles.avatarButton}
          >
            <Text style={styles.avatarButtonText}>
              {avatarBusy ? "جاري رفع الصورة…" : "تغيير الصورة الشخصية"}
            </Text>
          </Pressable>
          <Title>{data!.profile.display_name}</Title>
          <Muted>{data!.profile.email}</Muted>
          <Text style={styles.points}>
            {data!.points} نقطة · ترتيب {data!.rank ?? "—"}
          </Text>
          <Text style={styles.level}>رتبة {data!.level.name}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${levelProgress}%` }]} />
          </View>
          {data!.level.next && (
            <Muted>فاضل {data!.level.next - data!.points} نقطة للرتبة التالية.</Muted>
          )}
        </View>
        <View style={styles.sessions}>
          <Text style={styles.label}>الأجهزة والجلسات</Text>
          <Muted>راجع الأجهزة المسجّلة، واقفل أي جلسة مش عارفها.</Muted>
          {sessions.map((item) => {
            const current = item.id === sessionId;
            const device = item.latestActivity.deviceType || "جهاز غير معروف";
            const browser = item.latestActivity.browserName || "تطبيق عُقاب";
            return (
              <View key={item.id} style={styles.sessionRow}>
                <View style={styles.sessionText}>
                  <Text style={styles.sessionTitle}>
                    {device} · {browser} {current ? "· الجهاز الحالي" : ""}
                  </Text>
                  <Muted>آخر نشاط {new Date(item.lastActiveAt).toLocaleString("ar-EG")}</Muted>
                </View>
                {!current && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => revokeSession(item)}
                    style={styles.revokeButton}
                  >
                    <Text style={styles.revokeText}>خروج</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
        {data!.badges.length > 0 && (
          <View style={styles.badges}>
            <Text style={styles.label}>الشارات</Text>
            {data!.badges.map((badge) => (
              <View key={badge.id} style={styles.badge}>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeText}>{badge.description}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.form}>
          <Text style={styles.label}>الاسم الظاهر</Text>
          <TextInput
            accessibilityLabel="الاسم الظاهر"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <Text style={styles.label}>تاريخ الميلاد (YYYY-MM-DD)</Text>
          <TextInput
            accessibilityLabel="تاريخ الميلاد"
            inputMode="numeric"
            placeholder="2000-01-31"
            maxLength={10}
            value={birthdate}
            onChangeText={setBirthdate}
            style={styles.input}
          />
          <View style={styles.switchRow}>
            <Switch
              value={visible}
              onValueChange={setVisible}
              trackColor={{ true: theme.colors.gold }}
            />
            <Text style={styles.label}>إظهاري في لوحة المتصدرين</Text>
          </View>
          <Action
            title="حفظ التغييرات"
            onPress={() => void save()}
            disabled={name.trim().length < 2}
            loading={busy}
          />
          <Action
            title="تسجيل الخروج"
            onPress={() => void signOut().then(() => router.replace("/"))}
          />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>حذف الحساب</Text>
          <Muted>
            تقدر تستعيد الحساب خلال 30 يومًا بتسجيل الدخول، وبعدها تُحذف بيانات الحساب نهائيًا.
          </Muted>
          <Pressable accessibilityRole="button" onPress={removeAccount} style={styles.deleteButton}>
            <Text style={styles.deleteText}>حذف حسابي</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 32 },
  head: { gap: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: "flex-end",
    backgroundColor: theme.colors.paperAlt,
  },
  avatarButton: { minHeight: 44, alignSelf: "flex-end", justifyContent: "center" },
  avatarButtonText: { color: theme.colors.gold, fontWeight: "800" },
  points: { color: theme.colors.gold, fontWeight: "800", textAlign: "right" },
  level: { color: theme.colors.ink, fontWeight: "800", textAlign: "right" },
  track: {
    height: 8,
    backgroundColor: `${theme.colors.ink}22`,
    borderRadius: 6,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: theme.colors.gold },
  badges: { gap: 8 },
  badge: { backgroundColor: theme.colors.darkPaper, borderRadius: 10, padding: 12 },
  badgeTitle: { color: theme.colors.gold, fontWeight: "800", textAlign: "right" },
  badgeText: { color: theme.colors.darkInk, opacity: 0.72, textAlign: "right", marginTop: 3 },
  form: {
    gap: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: `${theme.colors.ink}22`,
    padding: 16,
    borderRadius: 16,
  },
  label: { color: theme.colors.ink, fontWeight: "700", textAlign: "right" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: `${theme.colors.ink}44`,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: theme.colors.ink,
    textAlign: "right",
    backgroundColor: theme.colors.paperAlt,
  },
  switchRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessions: {
    gap: 10,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: `${theme.colors.ink}22`,
    padding: 16,
    borderRadius: 16,
  },
  sessionRow: {
    minHeight: 62,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.ink}18`,
    paddingTop: 10,
  },
  sessionText: { flex: 1, gap: 3 },
  sessionTitle: { color: theme.colors.ink, fontWeight: "800", textAlign: "right" },
  revokeButton: {
    minHeight: 44,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: 10,
  },
  revokeText: { color: theme.colors.error, fontWeight: "800" },
  danger: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  dangerTitle: { color: theme.colors.error, fontWeight: "800", textAlign: "right", fontSize: 18 },
  deleteButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: { color: theme.colors.error, fontWeight: "800" },
  error: { color: theme.colors.error, textAlign: "right" },
});
