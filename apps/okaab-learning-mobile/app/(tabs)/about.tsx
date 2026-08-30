import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { Action, Card, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";

const steps = ["اكتشاف المشكلة والهدف", "تصميم تجربة واضحة", "تطوير واختبار المنتج", "إطلاق ودعم مستمر"];

export default function About() {
  return <Screen><ScrollView contentContainerStyle={styles.content}><View style={styles.hero}><Text style={styles.brand}>عُقاب</Text><Title>فريق بيحوّل الأفكار لمنتجات شغّالة</Title><Muted>نصمّم ونطوّر مواقع وتطبيقات وأنظمة أعمال، ونشارك خبرتنا في كورسات عربية عملية.</Muted></View><Card><Title>طريقة شغلنا</Title>{steps.map((step, index) => <View key={step} style={styles.step}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepText}>{step}</Text></View>)}</Card><Card><Title>إيه اللي بنقدّمه؟</Title><Muted>تطوير مواقع وتطبيقات، متاجر إلكترونية، أنظمة إدارة، وتجارب رقمية متجاوبة وسريعة.</Muted></Card><Action title="اطلب عرض سعر" onPress={() => void Linking.openURL("https://okaab.org/#contact")} /><Text style={styles.footer}>من فريق عُقاب — okaab.org</Text></ScrollView></Screen>;
}

const styles = StyleSheet.create({ content: { gap: 16, paddingBottom: 36 }, hero: { backgroundColor: theme.colors.darkPaper, borderRadius: theme.radius.lg, padding: 20, gap: 10 }, brand: { color: theme.colors.gold, fontSize: 32, fontWeight: "900", textAlign: "right" }, step: { minHeight: 44, flexDirection: "row-reverse", alignItems: "center", gap: 12 }, stepNumber: { width: 32, height: 32, lineHeight: 32, textAlign: "center", borderRadius: theme.radius.sm, backgroundColor: theme.colors.gold, color: theme.colors.ink, fontWeight: "900" }, stepText: { flex: 1, color: theme.colors.ink, textAlign: "right", fontWeight: "700" }, footer: { color: theme.colors.ink, opacity: 0.6, textAlign: "center", marginTop: 8 } });
