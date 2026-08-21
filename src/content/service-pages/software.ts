import type { ServicePageContent } from "@/components/okaab/ServiceLanding";

const ALTERNATES = {
  ar: "/software-development-egypt",
  en: "/en/software-development-egypt",
  fr: "/fr/software-development-egypt",
  es: "/es/software-development-egypt",
};

export const softwareAr: ServicePageContent = {
  lang: "ar",
  htmlLang: "ar",
  dir: "rtl",
  path: ALTERNATES.ar,
  alternates: ALTERNATES,
  title: "شركات برمجة في مصر — حلول برمجية متكاملة | عُقاب OKAAB",
  description:
    "عُقاب من شركات البرمجة في مصر: تطوير مواقع وتطبيقات مخصّصة، أنظمة إدارة داخلية، رفع وإدارة سيرفرات، توافق SEO من أول يوم، ودعم فني 24/7.",
  breadcrumbHome: "الرئيسية",
  breadcrumbLabel: "شركات برمجة في مصر",
  navAriaLabel: "مسار التنقل",
  hero: {
    kicker: "فريق تقني ثابت مش فريلانسر مختلف كل مرة",
    h1: "شركات برمجة",
    h1Italic: "في مصر",
    intro:
      "عُقاب فريق تطوير برمجيات في مصر بيبني مواقع وتطبيقات وأنظمة إدارة للشركات والمؤسسات — من تحليل المتطلبات لحد الإطلاق والتشغيل، بنطاق عمل ومواعيد واضحة ودعم فني 24/7.",
    ctaQuote: "اطلب عرض سعر",
    ctaWhatsapp: "تواصل على واتساب",
  },
  features: {
    kicker: "خدماتنا البرمجية",
    title: "إيه اللي بننفّذه؟",
    items: [
      {
        title: "مواقع وتطبيقات ويب مخصّصة",
        body: "منصّات ولوحات تحكم وأنظمة حجز وبوابات عملاء متبنية من الصفر على حسب سير العمل عندك، مش قوالب جاهزة.",
      },
      {
        title: "تطبيقات موبايل Android و iOS",
        body: "تطبيقات للمستخدمين أو للفرق الداخلية، بتجربة استخدام عربية واضحة وربط كامل بالأنظمة الحالية.",
      },
      {
        title: "أنظمة إدارة داخلية (ERP/CRM)",
        body: "أنظمة مخازن ومبيعات وموارد بشرية وتقارير مبنية على احتياج الشركة، بصلاحيات مستخدمين دقيقة.",
      },
      {
        title: "واجهات API وتكاملات",
        body: "ربط أنظمتك ببوابات الدفع والشحن والفوترة الإلكترونية وأي طرف تالت بواجهات موثّقة ومستقرة.",
      },
      {
        title: "رفع وإدارة سيرفرات",
        body: "إعداد السيرفرات، النسخ الاحتياطي، المراقبة، والأمان — بحيث النظام يفضل شغّال بأداء ثابت.",
      },
      {
        title: "دعم فني 24/7",
        body: "متابعة بعد الإطلاق، إصلاح سريع لأي مشكلة، وتحديثات دورية على مدار الساعة.",
      },
    ],
  },
  steps: {
    kicker: "إزاي بنشتغل؟",
    title: "خطوات التنفيذ",
    items: [
      { n: "01", title: "استكشاف وتحليل", body: "نفهم مشكلة الشغل الحقيقية ونحوّلها لمتطلبات ونطاق عمل مكتوب." },
      { n: "02", title: "تصميم وهندسة", body: "نجهّز واجهات المستخدم وبنية النظام وقاعدة البيانات قبل أي سطر كود." },
      { n: "03", title: "تطوير واختبار", body: "تسليمات على مراحل قابلة للتجربة، مع اختبار كل سيناريو قبل الإطلاق." },
      { n: "04", title: "إطلاق ومتابعة", body: "رفع على سيرفرات مضبوطة، ضبط SEO والتحليلات، ودعم مستمر بعد التشغيل." },
    ],
  },
  faq: {
    kicker: "أسئلة بتتكرر",
    title: "أسئلة شائعة",
    items: [
      {
        q: "إيه اللي يميّز عُقاب عن شركات البرمجة في مصر؟",
        a: "بنشتغل على المشاريع الكبيرة والمعقّدة بفريق تقني ثابت، بنطاق عمل ومواعيد واضحة من البداية، وبنفضل مسؤولين عن المنتج بعد الإطلاق مش بس وقت التسليم.",
      },
      {
        q: "بتشتغلوا مع شركات في محافظات مختلفة؟",
        a: "أيوة، بنشتغل مع عملاء في القاهرة والإسكندرية وباقي محافظات مصر وخارجها، والتواصل والاجتماعات بتتم أونلاين بجدول متابعة منتظم.",
      },
      {
        q: "بتستخدموا أنهي تقنيات؟",
        a: "بنختار التقنية على حسب المشروع: تطبيقات ويب حديثة، تطبيقات Android و iOS، قواعد بيانات وواجهات API، مع رفع وإدارة السيرفرات ومراقبتها.",
      },
    ],
  },
  closing: {
    title: "عندك نظام أو منتج في دماغك؟",
    body: "ابعتلنا تفاصيل مشروعك ونرجعلك بنطاق عمل ومدة تنفيذ واضحة.",
  },
  schema: { serviceName: "خدمات البرمجة وتطوير البرمجيات", serviceType: "تطوير برمجيات مخصّصة" },
};

export const softwareEn: ServicePageContent = {
  lang: "en",
  htmlLang: "en",
  dir: "ltr",
  path: ALTERNATES.en,
  alternates: ALTERNATES,
  title: "Software Development Company in Egypt — OKAAB",
  description:
    "OKAAB is a software development company in Egypt: custom web and mobile apps, internal management systems, server setup and monitoring, SEO-ready builds, and 24/7 support.",
  breadcrumbHome: "Home",
  breadcrumbLabel: "Software development in Egypt",
  navAriaLabel: "Breadcrumb",
  hero: {
    kicker: "One steady engineering team, not rotating freelancers",
    h1: "Software development",
    h1Italic: "in Egypt",
    intro:
      "OKAAB is a software team in Egypt building web apps, mobile apps and internal systems for companies — from requirements analysis to launch and operations, with a written scope, clear deadlines and 24/7 support.",
    ctaQuote: "Get a quote",
    ctaWhatsapp: "Chat on WhatsApp",
  },
  features: {
    kicker: "What we build",
    title: "Our engineering services",
    items: [
      {
        title: "Custom web apps and platforms",
        body: "Dashboards, booking systems and customer portals built from scratch around your workflow — not off-the-shelf templates.",
      },
      {
        title: "Android and iOS apps",
        body: "Customer-facing or internal apps with a clear bilingual experience and full integration with your existing systems.",
      },
      {
        title: "Internal systems (ERP/CRM)",
        body: "Inventory, sales, HR and reporting systems built to how your company actually works, with granular user permissions.",
      },
      {
        title: "APIs and integrations",
        body: "Connect your systems to payment, shipping, e-invoicing and any third party through documented, stable APIs.",
      },
      {
        title: "Server setup and operations",
        body: "Provisioning, backups, monitoring and security so the system keeps running with predictable performance.",
      },
      {
        title: "24/7 technical support",
        body: "Post-launch monitoring, fast incident response and regular updates, around the clock.",
      },
    ],
  },
  steps: {
    kicker: "How we work",
    title: "Our delivery process",
    items: [
      { n: "01", title: "Discovery and analysis", body: "We get to the real business problem and turn it into requirements and a written scope." },
      { n: "02", title: "Design and architecture", body: "Interfaces, system architecture and the data model are settled before any code is written." },
      { n: "03", title: "Build and test", body: "Staged, testable deliveries with every scenario verified before launch." },
      { n: "04", title: "Launch and support", body: "Deployment on tuned servers, SEO and analytics setup, and ongoing support after go-live." },
    ],
  },
  faq: {
    kicker: "Frequently asked",
    title: "Questions we get a lot",
    items: [
      {
        q: "What makes OKAAB different from other software companies in Egypt?",
        a: "We take on large, complex projects with a stable engineering team, a written scope and clear deadlines from day one, and we stay responsible for the product after launch — not just at handover.",
      },
      {
        q: "Do you work with companies outside Cairo?",
        a: "Yes. We work with clients in Cairo, Alexandria, across Egypt and abroad. Communication and meetings run online on a regular follow-up schedule.",
      },
      {
        q: "Which technologies do you use?",
        a: "We pick the stack per project: modern web applications, Android and iOS apps, databases and APIs, plus server provisioning and monitoring.",
      },
    ],
  },
  closing: {
    title: "Have a system or product in mind?",
    body: "Send us your project details and we'll come back with a clear scope and timeline.",
  },
  schema: { serviceName: "Software development services", serviceType: "Custom software development" },
};

export const softwareFr: ServicePageContent = {
  lang: "fr",
  htmlLang: "fr",
  dir: "ltr",
  path: ALTERNATES.fr,
  alternates: ALTERNATES,
  title: "Société de développement logiciel en Égypte — OKAAB",
  description:
    "OKAAB, société de développement logiciel en Égypte : applications web et mobiles sur mesure, systèmes de gestion interne, infogérance de serveurs, SEO dès le départ et support 24/7.",
  breadcrumbHome: "Accueil",
  breadcrumbLabel: "Développement logiciel en Égypte",
  navAriaLabel: "Fil d'Ariane",
  hero: {
    kicker: "Une équipe technique stable, pas des freelances qui changent",
    h1: "Développement logiciel",
    h1Italic: "en Égypte",
    intro:
      "OKAAB est une équipe de développement logiciel en Égypte qui conçoit des applications web, des applications mobiles et des systèmes de gestion pour les entreprises — de l'analyse des besoins à la mise en production, avec un périmètre écrit, des délais clairs et un support 24/7.",
    ctaQuote: "Demander un devis",
    ctaWhatsapp: "Écrire sur WhatsApp",
  },
  features: {
    kicker: "Nos services",
    title: "Ce que nous développons",
    items: [
      {
        title: "Applications web sur mesure",
        body: "Plateformes, tableaux de bord, systèmes de réservation et portails clients développés selon vos processus, sans template.",
      },
      {
        title: "Applications Android et iOS",
        body: "Applications pour vos clients ou vos équipes internes, avec une expérience claire et une intégration complète à vos systèmes.",
      },
      {
        title: "Systèmes internes (ERP/CRM)",
        body: "Stocks, ventes, RH et reporting conçus selon le fonctionnement réel de l'entreprise, avec des droits utilisateurs précis.",
      },
      {
        title: "API et intégrations",
        body: "Connexion de vos systèmes aux paiements, à la logistique, à la facturation électronique et à tout tiers via des API stables et documentées.",
      },
      {
        title: "Infogérance de serveurs",
        body: "Installation, sauvegardes, supervision et sécurité pour garantir des performances constantes.",
      },
      {
        title: "Support technique 24/7",
        body: "Supervision après le lancement, résolution rapide des incidents et mises à jour régulières.",
      },
    ],
  },
  steps: {
    kicker: "Notre méthode",
    title: "Les étapes du projet",
    items: [
      { n: "01", title: "Découverte et analyse", body: "Nous identifions le vrai besoin métier et le traduisons en exigences et périmètre écrit." },
      { n: "02", title: "Design et architecture", body: "Interfaces, architecture système et modèle de données validés avant la première ligne de code." },
      { n: "03", title: "Développement et tests", body: "Livraisons par étapes testables, chaque scénario vérifié avant la mise en production." },
      { n: "04", title: "Lancement et suivi", body: "Déploiement sur des serveurs optimisés, configuration SEO et analytics, support continu." },
    ],
  },
  faq: {
    kicker: "Questions fréquentes",
    title: "Vos questions",
    items: [
      {
        q: "Qu'est-ce qui distingue OKAAB des autres sociétés en Égypte ?",
        a: "Nous prenons en charge des projets complexes avec une équipe technique stable, un périmètre écrit et des délais clairs dès le départ, et nous restons responsables du produit après le lancement.",
      },
      {
        q: "Travaillez-vous avec des entreprises hors du Caire ?",
        a: "Oui. Nous travaillons avec des clients au Caire, à Alexandrie, partout en Égypte et à l'étranger, avec des échanges et réunions en ligne à rythme régulier.",
      },
      {
        q: "Quelles technologies utilisez-vous ?",
        a: "Nous choisissons la stack selon le projet : applications web modernes, applications Android et iOS, bases de données et API, ainsi que l'hébergement et la supervision.",
      },
    ],
  },
  closing: {
    title: "Un système ou un produit en tête ?",
    body: "Envoyez-nous les détails de votre projet et nous revenons avec un périmètre et un calendrier clairs.",
  },
  schema: { serviceName: "Services de développement logiciel", serviceType: "Développement logiciel sur mesure" },
};

export const softwareEs: ServicePageContent = {
  lang: "es",
  htmlLang: "es",
  dir: "ltr",
  path: ALTERNATES.es,
  alternates: ALTERNATES,
  title: "Empresa de desarrollo de software en Egipto — OKAAB",
  description:
    "OKAAB es una empresa de desarrollo de software en Egipto: aplicaciones web y móviles a medida, sistemas de gestión interna, administración de servidores, SEO desde el inicio y soporte 24/7.",
  breadcrumbHome: "Inicio",
  breadcrumbLabel: "Desarrollo de software en Egipto",
  navAriaLabel: "Ruta de navegación",
  hero: {
    kicker: "Un equipo técnico estable, no freelancers rotativos",
    h1: "Desarrollo de software",
    h1Italic: "en Egipto",
    intro:
      "OKAAB es un equipo de desarrollo de software en Egipto que construye aplicaciones web, apps móviles y sistemas de gestión para empresas — desde el análisis de requisitos hasta el lanzamiento y la operación, con alcance escrito, plazos claros y soporte 24/7.",
    ctaQuote: "Pedir presupuesto",
    ctaWhatsapp: "Escríbenos por WhatsApp",
  },
  features: {
    kicker: "Nuestros servicios",
    title: "Qué desarrollamos",
    items: [
      {
        title: "Aplicaciones web a medida",
        body: "Plataformas, paneles de control, sistemas de reservas y portales de clientes creados según tu flujo de trabajo, sin plantillas.",
      },
      {
        title: "Apps Android e iOS",
        body: "Apps para clientes o equipos internos, con una experiencia clara e integración completa con tus sistemas actuales.",
      },
      {
        title: "Sistemas internos (ERP/CRM)",
        body: "Inventario, ventas, RR. HH. e informes diseñados según cómo funciona tu empresa, con permisos de usuario detallados.",
      },
      {
        title: "APIs e integraciones",
        body: "Conectamos tus sistemas con pagos, logística, facturación electrónica y cualquier tercero mediante APIs estables y documentadas.",
      },
      {
        title: "Servidores y operación",
        body: "Configuración, copias de seguridad, monitorización y seguridad para un rendimiento constante.",
      },
      {
        title: "Soporte técnico 24/7",
        body: "Monitorización tras el lanzamiento, respuesta rápida ante incidencias y actualizaciones periódicas.",
      },
    ],
  },
  steps: {
    kicker: "Cómo trabajamos",
    title: "Fases del proyecto",
    items: [
      { n: "01", title: "Descubrimiento y análisis", body: "Identificamos el problema real del negocio y lo convertimos en requisitos y alcance escrito." },
      { n: "02", title: "Diseño y arquitectura", body: "Interfaces, arquitectura y modelo de datos definidos antes de escribir código." },
      { n: "03", title: "Desarrollo y pruebas", body: "Entregas por fases probables, con cada escenario verificado antes del lanzamiento." },
      { n: "04", title: "Lanzamiento y soporte", body: "Despliegue en servidores optimizados, configuración de SEO y analítica y soporte continuo." },
    ],
  },
  faq: {
    kicker: "Preguntas frecuentes",
    title: "Dudas habituales",
    items: [
      {
        q: "¿Qué diferencia a OKAAB de otras empresas en Egipto?",
        a: "Asumimos proyectos grandes y complejos con un equipo técnico estable, alcance escrito y plazos claros desde el principio, y seguimos siendo responsables del producto tras el lanzamiento.",
      },
      {
        q: "¿Trabajáis con empresas fuera de El Cairo?",
        a: "Sí. Trabajamos con clientes en El Cairo, Alejandría, todo Egipto y el extranjero, con comunicación y reuniones online de forma periódica.",
      },
      {
        q: "¿Qué tecnologías usáis?",
        a: "Elegimos la tecnología según el proyecto: aplicaciones web modernas, apps Android e iOS, bases de datos y APIs, además de servidores y monitorización.",
      },
    ],
  },
  closing: {
    title: "¿Tienes un sistema o producto en mente?",
    body: "Envíanos los detalles de tu proyecto y te respondemos con un alcance y un calendario claros.",
  },
  schema: { serviceName: "Servicios de desarrollo de software", serviceType: "Desarrollo de software a medida" },
};
