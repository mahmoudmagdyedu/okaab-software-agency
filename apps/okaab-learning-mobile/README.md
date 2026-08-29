# تطبيق عُقاب للتعلّم

تطبيق Expo/React Native يستخدم نفس حساب Clerk ونفس API المنشور على `okaab.org/api/v1`.

## التشغيل المحلي

1. انسخ `.env.example` إلى `.env.local` وضع **Publishable Key** الخاص بـClerk فقط. لا تضع `CLERK_SECRET_KEY` داخل التطبيق.
2. نفّذ `npm install` داخل هذا المجلد.
3. نفّذ `npm start`، ثم افتح التطبيق على Android عبر Expo Go أو Development Build.

## الفحص والبناء

- `npm run typecheck`
- `npm run doctor`
- APK داخلي: `npx eas-cli build --platform android --profile preview`
- AAB للمتجر: `npx eas-cli build --platform android --profile production`

يلزم قبل أول بناء ربط المشروع بحساب Expo، وتفعيل Google OAuth لتطبيق Android في Clerk باستخدام package name: `org.okaab.learning`.
