import type { ServicePageContent } from "@/components/okaab/ServiceLanding";

const ALTERNATES = {
  ar: "/ecommerce-development-egypt",
  en: "/en/ecommerce-development-egypt",
  fr: "/fr/ecommerce-development-egypt",
  es: "/es/ecommerce-development-egypt",
};

export const ecommerceAr: ServicePageContent = {
  lang: "ar",
  htmlLang: "ar",
  dir: "rtl",
  path: ALTERNATES.ar,
  alternates: ALTERNATES,
  title: "إنشاء متجر إلكتروني في مصر — عُقاب OKAAB",
  description:
    "خدمة إنشاء متجر إلكتروني احترافي في مصر: تصميم مخصّص، لوحة تحكم عربية، ربط وسائل الدفع والشحن، سرعة وتوافق SEO من أول يوم، ودعم فني 24/7.",
  breadcrumbHome: "الرئيسية",
  breadcrumbLabel: "إنشاء متجر إلكتروني في مصر",
  navAriaLabel: "مسار التنقل",
  hero: {
    kicker: "متاجر إلكترونية بتبيع فعلاً",
    h1: "إنشاء متجر إلكتروني",
    h1Italic: "في مصر",
    intro:
      "بنبني متاجر إلكترونية كاملة للشركات والبراندات في مصر: تصميم مخصّص، لوحة تحكم عربية، ربط الدفع والشحن، وسرعة وتوافق مع محركات البحث من أول يوم — مع دعم فني 24/7.",
    ctaQuote: "اطلب عرض سعر",
    ctaWhatsapp: "تواصل على واتساب",
  },
  features: {
    kicker: "مميزات المتجر",
    title: "إيه اللي بتاخده في متجرك؟",
    items: [
      {
        title: "تصميم مخصّص مش قالب جاهز",
        body: "واجهة متجر متصمّمة على هوية علامتك التجارية، بتجربة شراء واضحة من الصفحة الرئيسية لحد إتمام الطلب.",
      },
      {
        title: "لوحة تحكم عربية",
        body: "إدارة المنتجات والمخزون والطلبات والكوبونات من لوحة عربية بسيطة، من غير ما تحتاج مبرمج كل شوية.",
      },
      {
        title: "دفع وشحن جاهزين للسوق المصري",
        body: "ربط بوابات الدفع الإلكتروني، المحافظ، والدفع عند الاستلام، مع شركات الشحن وتتبّع الطلب.",
      },
      {
        title: "سرعة وتوافق SEO من أول يوم",
        body: "صفحات منتجات وأقسام قابلة للأرشفة، بيانات منظّمة، وسرعة تحميل عالية على الموبايل قبل الديسكتوب.",
      },
      {
        title: "تقارير ومتابعة مبيعات",
        body: "ربط التحليلات وبكسل الإعلانات عشان تعرف مصدر كل طلب وتقيس عائد الحملات بدقة.",
      },
      {
        title: "دعم فني 24/7",
        body: "متابعة بعد الإطلاق، تحديثات، ونسخ احتياطي — المتجر شغّال طول الوقت مش بس يوم التسليم.",
      },
    ],
  },
  steps: {
    kicker: "طريقة شغلنا",
    title: "خطوات التنفيذ",
    items: [
      { n: "01", title: "استكشاف", body: "نفهم منتجاتك، شرائح عملائك، وطريقة الشحن والدفع اللي بتناسبك." },
      { n: "02", title: "تصميم", body: "نجهّز واجهة المتجر ورحلة الشراء ونراجعها معاك قبل التنفيذ." },
      { n: "03", title: "تطوير", body: "نبني المتجر ونربط الدفع والشحن والمخزون ونختبر كل السيناريوهات." },
      { n: "04", title: "إطلاق ومتابعة", body: "نرفع المتجر ونضبط الـ SEO والتحليلات ونفضل معاك بالدعم." },
    ],
  },
  faq: {
    kicker: "أسئلة بتتكرر",
    title: "أسئلة شائعة",
    items: [
      {
        q: "كام مدة تنفيذ متجر إلكتروني؟",
        a: "المتجر الأساسي بيتنفّذ خلال أسابيع قليلة، والمتاجر الأكبر بمزايا مخصّصة بتاخد وقت أطول حسب النطاق المتفق عليه.",
      },
      {
        q: "هل بتربطوا وسائل الدفع والشحن المصرية؟",
        a: "أيوة، بنربط بوابات الدفع وشركات الشحن المستخدمة في السوق المصري، بالإضافة للدفع عند الاستلام.",
      },
      {
        q: "هل المتجر بيبقى متوافق مع SEO؟",
        a: "أيوة، بننفّذ المتجر بهيكل صفحات وبيانات منظّمة وسرعة تحميل عالية عشان يظهر في نتائج البحث من أول يوم.",
      },
    ],
  },
  closing: {
    title: "جاهز تبدأ متجرك؟",
    body: "ابعتلنا تفاصيل مشروعك ونرجعلك بنطاق عمل ومدة تنفيذ واضحة.",
  },
  schema: { serviceName: "إنشاء متجر إلكتروني", serviceType: "تطوير المتاجر الإلكترونية" },
};

export const ecommerceEn: ServicePageContent = {
  lang: "en",
  htmlLang: "en",
  dir: "ltr",
  path: ALTERNATES.en,
  alternates: ALTERNATES,
  title: "Ecommerce Development in Egypt — OKAAB",
  description:
    "Custom ecommerce development in Egypt: bespoke storefront design, Arabic admin panel, local payment and shipping integrations, SEO-ready performance, and 24/7 support.",
  breadcrumbHome: "Home",
  breadcrumbLabel: "Ecommerce development in Egypt",
  navAriaLabel: "Breadcrumb",
  hero: {
    kicker: "Online stores that actually sell",
    h1: "Ecommerce development",
    h1Italic: "in Egypt",
    intro:
      "We build complete online stores for brands and companies in Egypt: bespoke design, an Arabic admin panel, payment and shipping integrations, and search-ready speed from day one — backed by 24/7 support.",
    ctaQuote: "Get a quote",
    ctaWhatsapp: "Chat on WhatsApp",
  },
  features: {
    kicker: "What you get",
    title: "Everything your store needs",
    items: [
      {
        title: "Bespoke design, no templates",
        body: "A storefront designed around your brand, with a clear buying journey from the homepage to checkout.",
      },
      {
        title: "Arabic admin panel",
        body: "Manage products, stock, orders and coupons from a simple Arabic dashboard — no developer needed for daily work.",
      },
      {
        title: "Payments and shipping for Egypt",
        body: "Card gateways, mobile wallets and cash on delivery, connected to local couriers with order tracking.",
      },
      {
        title: "Speed and SEO from day one",
        body: "Indexable product and category pages, structured data, and fast loads on mobile before desktop.",
      },
      {
        title: "Sales analytics",
        body: "Analytics and ad pixels wired in, so you know where every order comes from and can measure campaign ROI.",
      },
      {
        title: "24/7 technical support",
        body: "Post-launch monitoring, updates and backups — your store stays online, not just on delivery day.",
      },
    ],
  },
  steps: {
    kicker: "How we work",
    title: "Our delivery process",
    items: [
      { n: "01", title: "Discovery", body: "We map your products, customer segments and the payment and shipping setup that fits." },
      { n: "02", title: "Design", body: "We design the storefront and buying journey and review it with you before development." },
      { n: "03", title: "Development", body: "We build the store, connect payments, shipping and inventory, and test every scenario." },
      { n: "04", title: "Launch and support", body: "We deploy, configure SEO and analytics, and stay with you after go-live." },
    ],
  },
  faq: {
    kicker: "Frequently asked",
    title: "Questions we get a lot",
    items: [
      {
        q: "How long does an online store take?",
        a: "A core store ships in a few weeks; larger stores with custom features take longer depending on the agreed scope.",
      },
      {
        q: "Do you integrate Egyptian payment and shipping providers?",
        a: "Yes. We connect the payment gateways and courier companies used in the Egyptian market, plus cash on delivery.",
      },
      {
        q: "Will the store be SEO-friendly?",
        a: "Yes. We build it with a clean page structure, structured data and fast load times so it can rank from launch.",
      },
    ],
  },
  closing: {
    title: "Ready to launch your store?",
    body: "Send us your project details and we'll come back with a clear scope and timeline.",
  },
  schema: { serviceName: "Ecommerce development", serviceType: "Ecommerce website development" },
};

export const ecommerceFr: ServicePageContent = {
  lang: "fr",
  htmlLang: "fr",
  dir: "ltr",
  path: ALTERNATES.fr,
  alternates: ALTERNATES,
  title: "Création de boutique en ligne en Égypte — OKAAB",
  description:
    "Développement e-commerce en Égypte : design sur mesure, back-office en arabe, intégration des paiements et de la livraison, performance et SEO dès le premier jour, support 24/7.",
  breadcrumbHome: "Accueil",
  breadcrumbLabel: "Création de boutique en ligne en Égypte",
  navAriaLabel: "Fil d'Ariane",
  hero: {
    kicker: "Des boutiques qui vendent vraiment",
    h1: "Création de boutique en ligne",
    h1Italic: "en Égypte",
    intro:
      "Nous construisons des boutiques en ligne complètes pour les marques et entreprises en Égypte : design sur mesure, back-office en arabe, intégration des paiements et de la livraison, et une performance optimisée pour le référencement dès le lancement — avec un support 24/7.",
    ctaQuote: "Demander un devis",
    ctaWhatsapp: "Écrire sur WhatsApp",
  },
  features: {
    kicker: "Ce que vous obtenez",
    title: "Tout ce dont votre boutique a besoin",
    items: [
      {
        title: "Design sur mesure, sans template",
        body: "Une vitrine conçue autour de votre marque, avec un parcours d'achat clair de l'accueil au paiement.",
      },
      {
        title: "Back-office en arabe",
        body: "Gérez produits, stock, commandes et codes promo depuis un tableau de bord simple, sans développeur au quotidien.",
      },
      {
        title: "Paiement et livraison adaptés à l'Égypte",
        body: "Passerelles bancaires, portefeuilles mobiles et paiement à la livraison, connectés aux transporteurs locaux avec suivi des commandes.",
      },
      {
        title: "Vitesse et SEO dès le départ",
        body: "Pages produits et catégories indexables, données structurées et chargement rapide, mobile d'abord.",
      },
      {
        title: "Suivi des ventes",
        body: "Analytics et pixels publicitaires intégrés pour connaître l'origine de chaque commande et mesurer le ROI.",
      },
      {
        title: "Support technique 24/7",
        body: "Suivi après le lancement, mises à jour et sauvegardes — la boutique reste en ligne, pas seulement le jour de la livraison.",
      },
    ],
  },
  steps: {
    kicker: "Notre méthode",
    title: "Les étapes du projet",
    items: [
      { n: "01", title: "Découverte", body: "Nous analysons vos produits, vos clients et la logistique de paiement et de livraison adaptée." },
      { n: "02", title: "Design", body: "Nous concevons la vitrine et le parcours d'achat, validés avec vous avant le développement." },
      { n: "03", title: "Développement", body: "Nous développons la boutique, connectons paiement, livraison et stock, et testons chaque scénario." },
      { n: "04", title: "Lancement et suivi", body: "Mise en ligne, configuration SEO et analytics, puis accompagnement continu." },
    ],
  },
  faq: {
    kicker: "Questions fréquentes",
    title: "Vos questions",
    items: [
      {
        q: "Combien de temps prend une boutique en ligne ?",
        a: "Une boutique standard est livrée en quelques semaines ; les projets plus complexes prennent plus de temps selon le périmètre convenu.",
      },
      {
        q: "Intégrez-vous les moyens de paiement et transporteurs égyptiens ?",
        a: "Oui. Nous intégrons les passerelles de paiement et transporteurs utilisés en Égypte, ainsi que le paiement à la livraison.",
      },
      {
        q: "La boutique sera-t-elle optimisée pour le SEO ?",
        a: "Oui. Structure de pages propre, données structurées et temps de chargement rapides pour être visible dès le lancement.",
      },
    ],
  },
  closing: {
    title: "Prêt à lancer votre boutique ?",
    body: "Envoyez-nous les détails de votre projet et nous revenons vers vous avec un périmètre et un calendrier clairs.",
  },
  schema: { serviceName: "Création de boutique en ligne", serviceType: "Développement e-commerce" },
};

export const ecommerceEs: ServicePageContent = {
  lang: "es",
  htmlLang: "es",
  dir: "ltr",
  path: ALTERNATES.es,
  alternates: ALTERNATES,
  title: "Desarrollo de tiendas online en Egipto — OKAAB",
  description:
    "Desarrollo de ecommerce en Egipto: diseño a medida, panel de administración en árabe, integración de pagos y envíos, velocidad y SEO desde el primer día, y soporte 24/7.",
  breadcrumbHome: "Inicio",
  breadcrumbLabel: "Desarrollo de tiendas online en Egipto",
  navAriaLabel: "Ruta de navegación",
  hero: {
    kicker: "Tiendas online que venden de verdad",
    h1: "Desarrollo de tiendas online",
    h1Italic: "en Egipto",
    intro:
      "Creamos tiendas online completas para marcas y empresas en Egipto: diseño a medida, panel en árabe, integración de pagos y envíos, y rendimiento preparado para buscadores desde el primer día — con soporte 24/7.",
    ctaQuote: "Pedir presupuesto",
    ctaWhatsapp: "Escríbenos por WhatsApp",
  },
  features: {
    kicker: "Qué incluye",
    title: "Todo lo que tu tienda necesita",
    items: [
      {
        title: "Diseño a medida, sin plantillas",
        body: "Una tienda diseñada según tu marca, con un recorrido de compra claro desde la portada hasta el pago.",
      },
      {
        title: "Panel de administración en árabe",
        body: "Gestiona productos, stock, pedidos y cupones desde un panel sencillo, sin depender de un programador cada semana.",
      },
      {
        title: "Pagos y envíos para el mercado egipcio",
        body: "Pasarelas de pago, monederos móviles y contra reembolso, conectados con transportistas locales y seguimiento de pedidos.",
      },
      {
        title: "Velocidad y SEO desde el inicio",
        body: "Páginas de producto y categoría indexables, datos estructurados y carga rápida, primero en móvil.",
      },
      {
        title: "Analítica de ventas",
        body: "Analítica y píxeles publicitarios integrados para saber de dónde viene cada pedido y medir el retorno.",
      },
      {
        title: "Soporte técnico 24/7",
        body: "Seguimiento tras el lanzamiento, actualizaciones y copias de seguridad — la tienda sigue funcionando siempre.",
      },
    ],
  },
  steps: {
    kicker: "Cómo trabajamos",
    title: "Fases del proyecto",
    items: [
      { n: "01", title: "Descubrimiento", body: "Analizamos tus productos, tus clientes y la logística de pago y envío adecuada." },
      { n: "02", title: "Diseño", body: "Diseñamos la tienda y el recorrido de compra y lo revisamos contigo antes de desarrollar." },
      { n: "03", title: "Desarrollo", body: "Construimos la tienda, conectamos pagos, envíos e inventario y probamos cada escenario." },
      { n: "04", title: "Lanzamiento y soporte", body: "Publicamos, configuramos SEO y analítica y seguimos contigo tras el lanzamiento." },
    ],
  },
  faq: {
    kicker: "Preguntas frecuentes",
    title: "Dudas habituales",
    items: [
      {
        q: "¿Cuánto tarda una tienda online?",
        a: "Una tienda estándar se entrega en pocas semanas; los proyectos con funciones a medida tardan más según el alcance acordado.",
      },
      {
        q: "¿Integráis pagos y envíos de Egipto?",
        a: "Sí. Integramos las pasarelas de pago y transportistas del mercado egipcio, además del pago contra reembolso.",
      },
      {
        q: "¿La tienda estará optimizada para SEO?",
        a: "Sí. Estructura de páginas limpia, datos estructurados y carga rápida para posicionar desde el lanzamiento.",
      },
    ],
  },
  closing: {
    title: "¿Listo para lanzar tu tienda?",
    body: "Envíanos los detalles de tu proyecto y te respondemos con un alcance y un calendario claros.",
  },
  schema: { serviceName: "Desarrollo de tiendas online", serviceType: "Desarrollo ecommerce" },
};
