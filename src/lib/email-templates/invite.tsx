import * as React from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

interface InviteEmailProps {
  siteName: string;
  siteUrl: string;
  confirmationUrl: string;
  roleLabel?: string;
  expiresInDays?: number;
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
  roleLabel = "عضو فريق",
  expiresInDays = 7,
}: InviteEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>دعوة للانضمام إلى فريق {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>مرحبًا بك في فريق عُقاب</Heading>
        <Text style={text}>
          تمت دعوتك للانضمام إلى{" "}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>{" "}
          بصلاحية <strong>{roleLabel}</strong>. اضغط الزر التالي لقبول الدعوة وإنشاء حسابك الآمن.
        </Text>
        <Button style={button} href={confirmationUrl}>
          قبول الدعوة والدخول
        </Button>
        <Text style={footer}>
          تنتهي صلاحية الرابط خلال {expiresInDays} أيام. إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل
          الرسالة بأمان.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default InviteEmail;

const main = {
  backgroundColor: "#f8f2e6",
  fontFamily: "Arial, sans-serif",
  direction: "rtl" as const,
};
const container = {
  margin: "36px auto",
  maxWidth: "540px",
  padding: "32px",
  backgroundColor: "#ffffff",
  border: "2px solid #181511",
  borderRadius: "20px",
};
const h1 = {
  fontSize: "22px",
  fontWeight: "bold" as const,
  color: "#181511",
  margin: "0 0 20px",
};
const text = {
  fontSize: "14px",
  color: "#4f493f",
  lineHeight: "1.8",
  margin: "0 0 25px",
};
const link = { color: "inherit", textDecoration: "underline" };
const button = {
  backgroundColor: "#E8A33D",
  color: "#141414",
  fontSize: "14px",
  borderRadius: "12px",
  padding: "14px 24px",
  textDecoration: "none",
};
const footer = { fontSize: "12px", color: "#7a7164", lineHeight: "1.7", margin: "30px 0 0" };
