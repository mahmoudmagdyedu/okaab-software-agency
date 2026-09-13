import { useAuth, useClerk, useSession, useUser } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
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
import { type AppTheme, useAppTheme, useThemedStyles, useThemePreference } from "@/theme";
import { useAppLanguage } from "@/i18n";
import type { Overview } from "@/types";

const PUSH_TOKEN_KEY = "okaab-learning-fcm-token-v1";

export default function Profile() {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { preference, setPreference } = useThemePreference();
  const { language, setLanguage, tr } = useAppLanguage();
  const { isLoaded, isSignedIn, getToken, sessionId } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const [data, setData] = useState<Overview | null>(null);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationAction, setVerificationAction] = useState<"password" | "delete" | null>(null);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationHint, setVerificationHint] = useState("");
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
  useEffect(() => {
    if (!isSignedIn) return;
    void AsyncStorage.getItem(PUSH_TOKEN_KEY).then((token) => setPushEnabled(Boolean(token)));
  }, [isSignedIn]);
  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
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
  const togglePush = async (enabled: boolean) => {
    setPushBusy(true);
    setError("");
    try {
      const savedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (!enabled) {
        if (savedToken) {
          await apiRequest("/devices", getToken, {
            method: "DELETE",
            body: JSON.stringify({ token: savedToken }),
          });
        }
        await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
        setPushEnabled(false);
        return;
      }
      if (!Device.isDevice)
        throw new Error("الإشعارات تحتاج هاتفًا حقيقيًا، ولن تعمل على المحاكي.");
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("learning", {
          name: "تحديثات التعلّم",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#E8A33D",
        });
      }
      let permission = await Notifications.getPermissionsAsync();
      if (permission.status !== "granted") {
        permission = await Notifications.requestPermissionsAsync();
      }
      if (permission.status !== "granted") {
        throw new Error("لم يتم السماح بالإشعارات من إعدادات الهاتف.");
      }
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      const token = String(deviceToken.data);
      await apiRequest("/devices", getToken, {
        method: "POST",
        body: JSON.stringify({
          token,
          platform: Platform.OS === "ios" ? "ios" : "android",
          appVersion: Constants.expoConfig?.version || "1.0.0",
        }),
      });
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      setPushEnabled(true);
    } catch (value) {
      setPushEnabled(false);
      setError(value instanceof Error ? value.message : "تعذّر تغيير إعداد الإشعارات");
    } finally {
      setPushBusy(false);
    }
  };
  const levelProgress = data!.level.next
    ? Math.min(
        100,
        Math.round(
          ((data!.points - data!.level.minimum) / (data!.level.next - data!.level.minimum)) * 100,
        ),
      )
    : 100;
  const orderedSessions = [...sessions].sort((left, right) => {
    if (left.id === sessionId) return -1;
    if (right.id === sessionId) return 1;
    return right.lastActiveAt.getTime() - left.lastActiveAt.getTime();
  });
  const displayedSessions = showAllSessions ? orderedSessions : orderedSessions.slice(0, 3);
  const beginEmailVerification = async (action: "password" | "delete") => {
    if (!session) return;
    if (action === "password") {
      if (newPassword.length < 8) {
        setError("كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("تأكيد كلمة المرور غير مطابق.");
        return;
      }
    }
    setVerificationBusy(true);
    setError("");
    try {
      const verification = await session.startVerification({ level: "first_factor" });
      const factor = verification.supportedFirstFactors?.find(
        (item) => item.strategy === "email_code",
      );
      if (!factor || factor.strategy !== "email_code") {
        throw new Error("لا يوجد بريد موثّق لاستقبال رمز الأمان لهذا الحساب.");
      }
      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      });
      setVerificationHint(factor.safeIdentifier || data!.profile.email);
      setVerificationCode("");
      setVerificationAction(action);
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر إرسال رمز التحقق");
    } finally {
      setVerificationBusy(false);
    }
  };

  const confirmEmailVerification = async () => {
    if (!session || !user || !verificationAction || verificationCode.trim().length < 6) return;
    setVerificationBusy(true);
    setError("");
    try {
      const verification = await session.attemptFirstFactorVerification({
        strategy: "email_code",
        code: verificationCode.trim(),
      });
      if (verification.status !== "complete") throw new Error("رمز التحقق غير صحيح أو انتهت صلاحيته.");
      if (verificationAction === "password") {
        await user.updatePassword({
          newPassword,
          signOutOfOtherSessions: true,
        });
        setNewPassword("");
        setConfirmPassword("");
        setVerificationAction(null);
        Alert.alert("تم التحديث", "تم تغيير كلمة المرور وإغلاق الجلسات الأخرى بأمان.");
        return;
      }
      await apiRequest(
        "/me",
        () => session.getToken({ skipCache: true }),
        {
          method: "DELETE",
          body: JSON.stringify({ confirmation: "احذف حسابي" }),
        },
      );
      setVerificationAction(null);
      await signOut();
      router.replace("/");
    } catch (value) {
      setError(value instanceof Error ? value.message : "تعذّر إكمال التحقق");
    } finally {
      setVerificationBusy(false);
    }
  };

  const removeAccount = () =>
    Alert.alert(
      "حذف حساب عُقاب؟",
      "هيتوقف الحساب فورًا، وتقدر تستعيده بتسجيل الدخول خلال 30 يومًا. بعد المدة تُحذف بيانات الحساب نهائيًا.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف حسابي",
          style: "destructive",
          onPress: () => void beginEmailVerification("delete"),
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
              {avatarBusy ? tr("جاري رفع الصورة…", "Uploading photo…") : tr("📷  تغيير الصورة الشخصية", "📷  Change profile photo")}
            </Text>
          </Pressable>
          <Text style={styles.profileName}>{data!.profile.display_name}</Text>
          <Text numberOfLines={1} style={styles.email}>{data!.profile.email}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{data!.points}</Text>
              <Text style={styles.statLabel}>نقطة</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{data!.rank ?? "—"}</Text>
              <Text style={styles.statLabel}>الترتيب</Text>
            </View>
          </View>
          <Text style={styles.level}>المستوى: {data!.level.name}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${levelProgress}%` }]} />
          </View>
          {data!.level.next && (
            <Muted>فاضل {data!.level.next - data!.points} نقطة للمستوى التالي.</Muted>
          )}
        </View>
        <View style={styles.notifications}>
          <View style={styles.choiceSection}>
            <Text style={styles.label}>{tr("المظهر", "Appearance")}</Text>
            <View style={styles.choiceRow}>
              {(["system", "light", "dark"] as const).map((item) => (
                <Pressable key={item} onPress={() => void setPreference(item)} style={[styles.choice, preference === item && styles.choiceActive]}>
                  <Text style={[styles.choiceText, preference === item && styles.choiceTextActive]}>
                    {item === "system" ? tr("الجهاز", "System") : item === "light" ? tr("فاتح", "Light") : tr("داكن", "Dark")}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.choiceSection}>
            <Text style={styles.label}>{tr("لغة التطبيق", "App language")}</Text>
            <View style={styles.choiceRow}>
              <Pressable onPress={() => void setLanguage("ar")} style={[styles.choice, language === "ar" && styles.choiceActive]}>
                <Text style={[styles.choiceText, language === "ar" && styles.choiceTextActive]}>العربية</Text>
              </Pressable>
              <Pressable onPress={() => void setLanguage("en")} style={[styles.choice, language === "en" && styles.choiceActive]}>
                <Text style={[styles.choiceText, language === "en" && styles.choiceTextActive]}>English</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.switchRow}>
            <Switch
              accessibilityLabel="إشعارات التعلّم"
              disabled={pushBusy}
              value={pushEnabled}
              onValueChange={(value) => void togglePush(value)}
              trackColor={{ true: theme.colors.gold }}
            />
            <View style={styles.notificationText}>
              <Text style={styles.label}>إشعارات التعلّم</Text>
              <Muted>
                {pushEnabled
                  ? "مفعّلة لهذا الهاتف. ستصلك أهم تحديثات الكورسات."
                  : "فعّلها باختيارك؛ لن نطلب الإذن عند فتح التطبيق."}
              </Muted>
            </View>
          </View>
        </View>
        <View style={styles.sessions}>
          <Text style={styles.label}>الأجهزة والجلسات</Text>
          <Muted>راجع الأجهزة المسجّلة، واقفل أي جلسة مش عارفها.</Muted>
          {displayedSessions.map((item) => {
            const current = item.id === sessionId;
            const rawDevice = item.latestActivity.deviceType || "";
            const rawBrowser = item.latestActivity.browserName || "";
            const device = rawDevice && !/unknown/i.test(rawDevice) ? rawDevice : "هاتف Android";
            const browser = !rawBrowser || /okhttp/i.test(rawBrowser) ? "تطبيق عُقاب" : rawBrowser;
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
          {orderedSessions.length > 3 && (
            <Pressable onPress={() => setShowAllSessions((value) => !value)} style={styles.sessionsToggle}>
              <Text style={styles.sessionsToggleText}>
                {showAllSessions ? "عرض جلسات أقل" : `عرض كل الجلسات (${orderedSessions.length})`}
              </Text>
            </Pressable>
          )}
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
          <View style={styles.passwordSection}>
            <Text style={styles.label}>تغيير كلمة المرور</Text>
            <Muted>سنرسل رمز أمان إلى بريد الحساب قبل تنفيذ التغيير.</Muted>
            <TextInput
              accessibilityLabel="كلمة المرور الجديدة"
              placeholder="كلمة مرور جديدة — 8 أحرف أو أكثر"
              placeholderTextColor={`${theme.colors.ink}66`}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />
            <TextInput
              accessibilityLabel="تأكيد كلمة المرور الجديدة"
              placeholder="تأكيد كلمة المرور الجديدة"
              placeholderTextColor={`${theme.colors.ink}66`}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <Action
              title="تحقق بالبريد وغيّر كلمة المرور"
              onPress={() => void beginEmailVerification("password")}
              disabled={newPassword.length < 8 || newPassword !== confirmPassword}
              loading={verificationBusy && verificationAction === null}
            />
          </View>
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
      <Modal
        animationType="fade"
        transparent
        visible={verificationAction !== null}
        onRequestClose={() => setVerificationAction(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>تحقق أمني</Text>
            <Title>أدخل الرمز المرسل إلى بريدك</Title>
            <Muted>{verificationHint}</Muted>
            <TextInput
              accessibilityLabel="رمز التحقق"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              placeholderTextColor={`${theme.colors.ink}55`}
              style={styles.codeInput}
            />
            <Action
              title={verificationAction === "delete" ? "تحقق واحذف الحساب" : "تحقق وغيّر كلمة المرور"}
              onPress={() => void confirmEmailVerification()}
              disabled={verificationCode.trim().length < 6}
              loading={verificationBusy}
            />
            <Pressable onPress={() => setVerificationAction(null)} style={styles.cancelVerification}>
              <Text style={styles.cancelVerificationText}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const createStyles = (theme: AppTheme) => ({
  content: { width: "100%", maxWidth: 680, alignSelf: "center", gap: 16, paddingBottom: 118 },
  head: { alignItems: "center", gap: 9, backgroundColor: theme.colors.card, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, padding: 20 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: "center",
    backgroundColor: theme.colors.paperAlt,
  },
  avatarButton: { minHeight: 44, alignSelf: "center", justifyContent: "center", paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.gold, borderRadius: 22, backgroundColor: `${theme.colors.gold}12` },
  avatarButtonText: { color: theme.colors.gold, fontWeight: "800" },
  profileName: { color: theme.colors.ink, fontSize: 24, fontWeight: "900", textAlign: "center", writingDirection: "rtl" },
  email: { maxWidth: "100%", color: theme.colors.ink, opacity: 0.58, textAlign: "center", writingDirection: "ltr" },
  statsRow: { direction: "ltr", flexDirection: "row", justifyContent: "center", gap: 10 },
  statPill: { minWidth: 104, minHeight: 52, direction: "rtl", flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 5, backgroundColor: theme.colors.paperAlt, borderRadius: 15, paddingHorizontal: 12, paddingVertical: 10 },
  statValue: { color: theme.colors.gold, fontSize: 18, fontWeight: "900" },
  statLabel: { color: theme.colors.ink, opacity: 0.62, fontSize: 12, fontWeight: "700" },
  level: { alignSelf: "stretch", color: theme.colors.ink, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
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
    borderColor: theme.colors.border,
    padding: 16,
    borderRadius: 16,
  },
  passwordSection: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
    marginTop: 4,
  },
  label: { color: theme.colors.ink, fontWeight: "700", textAlign: "right", writingDirection: "rtl" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: theme.colors.ink,
    textAlign: "right",
    writingDirection: "rtl",
    backgroundColor: theme.colors.paperAlt,
  },
  switchRow: {
    minHeight: 48,
    direction: "ltr",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sessions: {
    gap: 10,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    borderRadius: 16,
  },
  notifications: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    borderRadius: 16,
  },
  choiceSection: { gap: 10 },
  choiceRow: { flexDirection: "row", gap: 8 },
  choice: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.paperAlt },
  choiceActive: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  choiceText: { color: theme.colors.ink, fontWeight: "800" },
  choiceTextActive: { color: "#181511" },
  settingDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  notificationText: { flex: 1, direction: "rtl", gap: 3, marginLeft: 14 },
  sessionRow: {
    minHeight: 62,
    direction: "ltr",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.ink}18`,
    paddingTop: 10,
  },
  sessionText: { flex: 1, direction: "rtl", gap: 3 },
  sessionTitle: { color: theme.colors.ink, fontWeight: "800", textAlign: "right", writingDirection: "rtl" },
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
  sessionsToggle: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: theme.colors.paperAlt, marginTop: 2 },
  sessionsToggleText: { color: theme.colors.gold, fontWeight: "900" },
  danger: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: 22,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000099",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.gold,
    padding: 20,
    gap: 12,
  },
  modalKicker: { color: theme.colors.gold, textAlign: "right", fontWeight: "900" },
  codeInput: {
    minHeight: 58,
    backgroundColor: theme.colors.paperAlt,
    borderWidth: 2,
    borderColor: theme.colors.ink,
    borderRadius: 14,
    textAlign: "center",
    letterSpacing: 8,
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  cancelVerification: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  cancelVerificationText: { color: theme.colors.ink, fontWeight: "800" },
});
