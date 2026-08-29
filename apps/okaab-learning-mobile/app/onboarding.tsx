import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Action, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";

const slides = [
  { number: "01", title: "اتعلّم من ناس بتبني فعلًا", body: "عُقاب فريق برمجيات مصري بيحوّل الخبرة العملية لدروس عربية واضحة ومشروعات تقدر تطبقها." },
  { number: "02", title: "تقدّمك معاك في كل مكان", body: "ابدأ من الموقع وكمّل من الموبايل. الشريحة والاختبار والنقاط بيتحفظوا على حساب واحد." },
  { number: "03", title: "كل خطوة ليها قيمة", body: "جاوب، نفّذ المهمة، واجمع نقاطك. ترتيبك في لوحة المتصدرين نتيجة تعلّم حقيقي، مش مجرد مشاهدة." },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const finish = async () => { await AsyncStorage.setItem("okaab-onboarding-v1", "seen"); router.replace("/"); };
  const slide = slides[index];
  return <Screen><View style={styles.top}><Text style={styles.brand}>عُقاب</Text><Pressable accessibilityRole="button" onPress={() => void finish()}><Text style={styles.skip}>تخطي</Text></Pressable></View><View style={styles.stage}><Text style={styles.number}>{slide.number}</Text><Title>{slide.title}</Title><Muted>{slide.body}</Muted><View accessibilityLabel={`الشريحة ${index + 1} من ${slides.length}`} style={styles.dots}>{slides.map((_, itemIndex) => <View key={itemIndex} style={[styles.dot, itemIndex === index && styles.dotActive]} />)}</View></View><Action title={index === slides.length - 1 ? "ابدأ التعلّم" : "التالي"} onPress={() => index === slides.length - 1 ? void finish() : setIndex(index + 1)} /></Screen>;
}

const styles = StyleSheet.create({ top: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", minHeight: 56 }, brand: { color: theme.colors.gold, fontSize: 28, fontWeight: "900" }, skip: { color: theme.colors.ink, padding: 12, fontWeight: "700" }, stage: { flex: 1, justifyContent: "center", gap: 18 }, number: { color: theme.colors.gold, fontSize: 64, fontWeight: "900", textAlign: "right", opacity: 0.9 }, dots: { flexDirection: "row-reverse", gap: 8, justifyContent: "center", marginTop: 12 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: `${theme.colors.ink}33` }, dotActive: { width: 28, backgroundColor: theme.colors.gold } });
