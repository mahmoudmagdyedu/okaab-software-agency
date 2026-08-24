# بُنّ الديرة POS

منصة نقاط بيع وإدارة تشغيل عربية تعمل بـ TanStack Start وSQL Server، وتشمل:

- صلاحيات Super Admin وAdmin وأدوار الموظفين.
- طلبات الوصول وموافقة السوبر أدمن.
- إنشاء الموظفين وإيقاف أو إعادة تفعيل حساباتهم.
- كلمة مرور مؤقتة مع تغيير إلزامي عند أول دخول.
- محاكاة عامة آمنة للأدوار لا تغيّر البيانات الحقيقية.
- فحوصات تشغيل `/health/live` وقاعدة بيانات `/health`.

## تشغيل Heroku

متغيرات البيئة المطلوبة:

- `MSSQL_TCP_URL`: سلسلة اتصال SQL Server التي يوفرها Heroku MSSQL.
- `SUPER_ADMIN_EMAIL`: بريد أول حساب Super Admin.
- `SUPER_ADMIN_PASSWORD`: كلمة مرور مؤقتة قوية لأول دخول.
- `NITRO_PRESET=node-server`

يتم إنشاء الجداول وحساب السوبر أدمن الأول تلقائيًا عند أول اتصال ناجح بقاعدة البيانات.

## التطوير المحلي

This project was built with [Lovable](https://lovable.dev).

```sh
npm install
npm run dev
```
