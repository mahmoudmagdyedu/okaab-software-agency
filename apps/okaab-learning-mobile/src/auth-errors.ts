type ClerkErrorItem = {
  code?: string;
  message?: string;
  longMessage?: string;
  meta?: { paramName?: string };
};

type ClerkErrorLike = {
  code?: string;
  message?: string;
  longMessage?: string;
  errors?: ClerkErrorItem[];
};

export type AuthFieldErrors = {
  email?: string;
  password?: string;
  code?: string;
};

export function clerkCode(value: unknown) {
  const error = value as ClerkErrorLike | undefined;
  return error?.errors?.[0]?.code || error?.code || "";
}

function translate(item: ClerkErrorItem | ClerkErrorLike) {
  switch (item.code) {
    case "form_password_incorrect":
      return "كلمة المرور غير صحيحة. حاول مرة أخرى أو استعد حسابك.";
    case "form_identifier_not_found":
      return "لا يوجد حساب بهذا البريد الإلكتروني.";
    case "form_identifier_exists":
      return "يوجد حساب بهذا البريد بالفعل. سجّل الدخول بدلًا من إنشاء حساب جديد.";
    case "form_password_pwned":
      return "اختر كلمة مرور أقوى لم تظهر في تسريبات سابقة.";
    case "form_password_length_too_short":
      return "يجب أن تتكون كلمة المرور من 15 حرفًا على الأقل.";
    case "form_code_incorrect":
    case "verification_failed":
      return "رمز التحقق غير صحيح. راجع الرمز وحاول مرة أخرى.";
    case "verification_expired":
      return "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.";
    case "session_exists":
      return "وجدنا جلسة سابقة، لكن تعذّر فتحها تلقائيًا. أغلق التطبيق وافتحه ثم حاول مجددًا.";
    default:
      return item.longMessage || item.message || "راجع البيانات وحاول مرة أخرى.";
  }
}

export function authErrorMessage(value: unknown) {
  const error = value as ClerkErrorLike | undefined;
  const item = error?.errors?.[0] || error;
  const raw = `${error?.errors?.[0]?.longMessage || ""} ${error?.errors?.[0]?.message || ""} ${error?.message || ""}`;
  if (/authorized redirect|redirect uri|redirect_url/i.test(raw)) {
    return "تعذّر الرجوع إلى تطبيق عُقاب بعد تسجيل Google. أعد المحاولة بعد تحديث إعدادات الدخول.";
  }
  return item ? translate(item) : "تعذّر إكمال الطلب. حاول مرة أخرى.";
}

export function splitFieldErrors(value: unknown): AuthFieldErrors {
  const error = value as ClerkErrorLike | undefined;
  const result: AuthFieldErrors = {};
  for (const item of error?.errors || []) {
    const param = item.meta?.paramName || "";
    const text = translate(item);
    if (/identifier|email/i.test(param) || item.code === "form_identifier_not_found" || item.code === "form_identifier_exists") result.email = text;
    else if (/password/i.test(param) || /password/i.test(item.code || "")) result.password = text;
    else if (/code/i.test(param) || /code|verification/i.test(item.code || "")) result.code = text;
  }
  return result;
}

export function isCancelledAuth(value: unknown) {
  const code = (value as { code?: string } | undefined)?.code;
  return code === "SIGN_IN_CANCELLED" || code === "-5" || code === "ERR_CANCELED";
}
