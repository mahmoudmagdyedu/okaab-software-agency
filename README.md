# منصة عُقاب

المستودع الموحّد لموقع `okaab.org` ولوحة الإدارة ومنصة التعلّم وتطبيق Android. التطبيق والموقع يستخدمان حساب Clerk نفسه وواجهة REST واحدة تحت `/api/v1`، بينما تبقى النقاط والتصحيح والتحقق من إكمال الدروس على الخادم.

## المكوّنات

- الموقع وAPI: TanStack Start + TypeScript على Heroku.
- الهوية: Clerk للويب وExpo.
- البيانات: MSSQL في مخطط `okaab`.
- تطبيق التعلّم: Expo/React Native داخل `apps/okaab-learning-mobile`.
- التوكنز والجسر: `packages/design-tokens` و`packages/bridge`.
- مواصفات API الحية: `https://okaab.org/api/v1/openapi.json`.
- مجموعة Postman: `docs/okaab-learning.postman_collection.json`.

## تشغيل الموقع محليًا

يتطلب Node.js 24 وnpm 11 وقيم البيئة الموجودة في `.env.example`. لا تضف مفاتيح سرية إلى Git.

```sh
npm install
npm run db:migrate
npm run dev
```

الفحص قبل النشر:

```sh
npm run build:site
npm run build:mobile
```

## تطبيق Android

من داخل `apps/okaab-learning-mobile`:

```sh
npm install
npm run typecheck
npm run doctor
npx eas-cli build --platform android --profile preview
```

بناء APK/AAB يحتاج حساب Expo مفعّلًا وبيانات Google/FCM خارج المستودع. مفتاح Clerk العام فقط مسموح به داخل التطبيق؛ مفاتيح Clerk السرية وNVIDIA وFirebase تظل على الخادم أو EAS Secrets.

## النشر

- الدفع إلى `main` يزامن المشروع مع Lovable؛ لا تستخدم force-push أو تعيد كتابة التاريخ المنشور.
- نشر الويب على Heroku يتم من نفس الفرع.
- migrations تُشغّل قبل الكود الذي يعتمد على أعمدة جديدة.
- راجع `PLAN.md` للمرحلة التنفيذية و`DECISIONS.md` للقرارات المعمارية.
