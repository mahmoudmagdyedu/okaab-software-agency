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

## تفعيل إشعارات Firebase

1. أنشئ Android app داخل Firebase بالاسم `org.okaab.learning`، ثم ضع `google-services.json` داخل مجلد التطبيق بجوار `app.json`.
2. أضف `"googleServicesFile": "./google-services.json"` داخل إعداد `expo.android` قبل بناء النسخة الأصلية. الملف سري وغير مضاف إلى Git.
3. صدّر Service Account من Firebase، واحفظ JSON كاملًا أو Base64 منه في متغير Heroku الخادمي `FIREBASE_SERVICE_ACCOUNT_JSON`.
4. ابنِ Development Build أو APK/AAB؛ رموز FCM الأصلية لا تعمل عبر Expo Go أو المحاكي.

التطبيق لا يطلب إذن الإشعارات تلقائيًا. المستخدم يفعّلها أو يوقفها من صفحة الحساب، بينما الإرسال الموجّه يتم من لوحة إدارة منصة التعلّم مع تأكيد وحد أقصى ثلاث رسائل خلال سبعة أيام.
