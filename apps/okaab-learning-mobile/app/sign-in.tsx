import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Action, Muted, Screen, Title } from "@/components";
import { theme } from "@/theme";

function message(value: unknown) { const error = value as { errors?: { message?: string; longMessage?: string }[] }; return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || "راجع البيانات وحاول مرة أخرى"; }

export default function SignInScreen() {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [code,setCode]=useState(""); const [verify,setVerify]=useState(false); const [error,setError]=useState("");
  const busy=signInStatus==="fetching"||signUpStatus==="fetching";
  const done=()=>router.replace("/");
  const submit=async()=>{setError("");const result=await signIn.password({emailAddress:email.trim(),password});if(!result.error&&signIn.status==="complete"){await signIn.finalize({navigate:done});return;}if(result.error?.code==="form_identifier_not_found"){const created=await signUp.password({emailAddress:email.trim(),password});if(created.error){setError(message(created.error));return;}await signUp.verifications.sendEmailCode();setVerify(true);return;}if(result.error)setError(message(result.error));};
  const confirm=async()=>{setError("");const result=await signUp.verifications.verifyEmailCode({code});if(result.error){setError(message(result.error));return;}if(signUp.status==="complete")await signUp.finalize({navigate:done});};
  const google=async()=>{setError("");try{const {createdSessionId,setActive}=await startSSOFlow({strategy:"oauth_google",redirectUrl:"okaab://"});if(createdSessionId){await setActive?.({session:createdSessionId});done();}}catch(e){setError(message(e));}};
  return <Screen><View style={s.hero}><Text style={s.brand}>عُقاب</Text><Title>{verify?"أكد بريدك":"سجّل أو أنشئ حسابًا"}</Title><Muted>{verify?`بعثنا رمزًا إلى ${email}`:"حساب واحد يحفظ تقدّمك على الموقع والموبايل."}</Muted></View><View style={s.form} nativeID="clerk-captcha">{!verify&&<><TextInput accessibilityLabel="البريد الإلكتروني" autoCapitalize="none" inputMode="email" placeholder="name@example.com" value={email} onChangeText={setEmail} style={s.input}/><TextInput accessibilityLabel="كلمة المرور" secureTextEntry placeholder="كلمة المرور" value={password} onChangeText={setPassword} style={s.input}/><Action title="متابعة" onPress={()=>void submit()} disabled={busy||!email||password.length<8}/><Pressable onPress={()=>void google()} style={s.google}><Text style={s.googleText}>المتابعة بحساب Google</Text></Pressable></>}{verify&&<><TextInput accessibilityLabel="رمز التحقق" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChangeText={setCode} style={s.input}/><Action title="تأكيد البريد" onPress={()=>void confirm()} disabled={busy||code.length<6}/><Pressable onPress={()=>setVerify(false)}><Text style={s.back}>تغيير البريد</Text></Pressable></>}{error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}</View></Screen>;
}
const s=StyleSheet.create({hero:{marginTop:24,marginBottom:24,gap:8},brand:{color:theme.colors.gold,fontSize:34,fontWeight:"900",textAlign:"right"},form:{gap:12,backgroundColor:theme.colors.card,borderWidth:1,borderColor:`${theme.colors.ink}22`,borderRadius:16,padding:16},input:{minHeight:50,borderWidth:1,borderColor:`${theme.colors.ink}44`,borderRadius:10,paddingHorizontal:14,color:theme.colors.ink,textAlign:"right",backgroundColor:theme.colors.paperAlt},google:{minHeight:48,borderWidth:1,borderColor:theme.colors.ink,borderRadius:10,alignItems:"center",justifyContent:"center"},googleText:{color:theme.colors.ink,fontWeight:"700"},back:{color:theme.colors.gold,textAlign:"center",padding:12},error:{color:theme.colors.error,textAlign:"right",lineHeight:21}});
