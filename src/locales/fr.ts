import type { Dict } from "./ar-EG";

const dict: Dict = {
  code: "fr",
  htmlLang: "fr",
  dir: "ltr",
  label: "Français",
  nav: {
    courses: "Cours",
    dashboard: "Tableau de bord",
    services: "Services",
    projects: "Projets",
    why: "Pourquoi Okaab",
    process: "Notre méthode",
    cta: "Découvrir nos offres",
  },
  hero: {
    kicker: "← oui, l'équipe qui livre à l'heure",
    h1a: "Développement web et",
    h1b: "développement d\u2019applications",
    h1italic: "pour l\u2019Égypte et le Golfe.",
    sub: "Okaab est une société de développement web et de développement d\u2019applications pour l\u2019Égypte et le Golfe : plateformes web complètes sur toutes les technologies, des applications Android et iOS, nous déployons et administrons vos serveurs, nos sites sont optimisés SEO dès le premier jour, et notre support répond en quelques minutes, 24h/24 — avec la même qualité que nous réservons à nos plus grands clients.",
    primary: "Découvrez nos offres",
    secondary: "Voir les offres et services",
    badgeRing: "DISPONIBLES ✦ DISPONIBLES ✦ ",
    badgeNum: "24/7",
  },
  stats: [
    "Plus de 40 projets livrés",
    "Première réponse en moins de 15 minutes",
    "Support technique 24h/24",
    "5 langues",
    "Plus de 40 projets livrés",
    "Première réponse en moins de 15 minutes",
    "Support technique 24h/24",
    "5 langues",
  ],
  testimonialsKicker: "ils nous font confiance",
  testimonials: [
    {
      quote:
        "La plateforme a été livrée avec une semaine d'avance, et chaque remarque trouve une réponse en quelques minutes.",
      name: "Mohamed Shaaban",
      role: "Fondateur, plateforme éducative — Le Caire",
      tag: "Plateforme éducative",
    },
    {
      quote:
        "Un suivi très professionnel, des délais tenus, et une boutique nettement plus rapide qu'avant.",
      name: "Noura Al-Otaibi",
      role: "Directrice marketing — Riyad",
      tag: "E-commerce",
    },
    {
      quote:
        "Équipe organisée, communication limpide : l'application est sortie sur les deux stores en moins de deux mois.",
      name: "Lukas Berger",
      role: "CTO — Berlin",
      tag: "Application mobile",
    },
  ],
  projects: {
    kicker: "projets sélectionnés",
    title: "Des produits conçus et mis en ligne",
    name: "Maw'id",
    description:
      "Une plateforme arabe de gestion des rendez-vous pour les cliniques et prestataires, avec réservation publique, calendrier hebdomadaire, clients et rôles d’équipe.",
    badge: "Démo interactive",
    cta: "Essayer le projet",
    tags: ["SaaS", "React", "Supabase", "Rendez-vous"],
    pos: {
      name: "Bun Al Deerah POS",
      description:
        "Une plateforme arabe de point de vente et d’opérations avec factures, stock, équipes, succursales et accès par rôle, plus des simulations interactives super admin, admin et employé.",
      badge: "Nouveau projet interactif",
      cta: "Tester la simulation",
      tags: ["POS", "React", "SQL Server", "Heroku"],
    },
  },
  servicesSection: {
    kicker: "ce que nous faisons",
    titleA: "Des services livrés",
    titleItalic: "sans détour",
  },
  services: [
    {
      title: "Développement web complet",
      copy: "Nous travaillons sur toutes les stacks : React/Next.js, Vue, Laravel, Node.js et WordPress, selon ce qui sert le mieux votre projet.",
    },
    {
      title: "Applications Android et iOS",
      copy: "Des applications mobiles performantes, du design jusqu'à la publication sur Google Play et l'App Store.",
    },
    {
      title: "Support 24h/24, réactif",
      copy: "Une équipe qui répond en quelques minutes, tous les jours, et intervient dès qu'un incident survient.",
    },
    {
      title: "Déploiement des serveurs",
      copy: "Installation et supervision, sauvegardes, certificats SSL et montée en charge quand le trafic augmente.",
    },
    {
      title: "Optimisé SEO dès le départ",
      copy: "Une structure technique saine, des temps de chargement excellents et des Core Web Vitals maîtrisés avant le lancement.",
    },
    {
      title: "La même qualité, sans surprise",
      copy: "Un périmètre et une livraison clairs, avec la même attention que nous réservons à nos plus grands clients.",
    },
  ],
  catalog: {
    kicker: "choisissez votre formule",
    title: "Les services en détail",
    depts: ["Tous les services", "Web", "Mobile", "Exploitation", "SEO"],
    note: "Le périmètre et le délai sont confirmés après un court appel de cadrage — nous envoyons un devis écrit, sans engagement.",
    rows: [
      { title: "Site vitrine ou portfolio", stack: "Next.js / WordPress", time: "1–2 semaines" },
      { title: "Boutique e-commerce complète", stack: "Laravel / Next.js", time: "3–5 semaines" },
      {
        title: "Plateforme SaaS ou tableau de bord",
        stack: "React / Node.js",
        time: "6–10 semaines",
      },
      {
        title: "Application Android et iOS",
        stack: "Flutter / React Native",
        time: "4–8 semaines",
      },
      { title: "APIs et back-office mobile", stack: "Node.js / Laravel", time: "1–3 semaines" },
      {
        title: "Configuration et supervision serveurs",
        stack: "AWS / VPS / Cloudflare",
        time: "en ligne sous 48 h",
      },
      {
        title: "Maintenance et mises à jour de sécurité",
        stack: "Remote",
        time: "forfait mensuel",
      },
      { title: "SEO technique et performance", stack: "Core Web Vitals", time: "1–2 semaines" },
    ],
  },
  about: {
    kicker: "qui sommes-nous",
    titleLines: ["Notre", "façon de", "travailler"],
    paragraph:
      "Okaab est une petite équipe de développeurs et de designers basée en Égypte, qui accompagne des entreprises et des fondateurs en Égypte, dans le Golfe et en Europe. Nous écoutons d'abord, nous comprenons votre métier, puis nous construisons quelque chose qui dure et qui grandit avec vous.",
    steps: [
      {
        title: "Découverte",
        copy: "Un échange court pour cerner l'objectif, le public et le budget — vous repartez avec un plan et un périmètre écrits.",
      },
      {
        title: "Design",
        copy: "Des interfaces claires et rapides, validées avec vous étape par étape avant la moindre ligne de code.",
      },
      {
        title: "Développement et tests",
        copy: "Un code propre et évolutif, testé sur plusieurs appareils et navigateurs avant livraison.",
      },
      {
        title: "Lancement et support",
        copy: "Nous déployons, réglons le serveur et le SEO, puis restons à vos côtés avec un support 24h/24.",
      },
    ],
  },
  quote: {
    note: "un projet différent ? parlez-nous-en ↓",
    titleA: "Parlez-nous de",
    titleItalic: "votre projet",
    sub: "Remplissez ce formulaire et nous vous envoyons un devis écrit avec un calendrier clair. Première réponse en moins de 15 minutes.",
    fields: {
      name: "Nom",
      email: "E-mail",
      phone: "Numéro de mobile",
      service: "Type de service",
      details: "Détails du projet",
    },
    servicePlaceholder: "Choisissez un type de service",
    serviceOptions: [
      "Site web",
      "Boutique e-commerce",
      "Plateforme ou tableau de bord",
      "Application mobile",
      "Serveurs et support",
      "SEO technique",
    ],
    submit: "Devis gratuit",
    whatsapp: "Écrire sur WhatsApp",
    sending: "Envoi…",
    sent: "Demande reçue ✅ — notre équipe la traite et vous répond en quelques minutes par e-mail ou WhatsApp.",
    failed:
      "Échec de l'envoi — nous avons ouvert WhatsApp et votre messagerie avec les détails, envoyez-le et nous répondrons aussitôt.",
  },
  footer: {
    links: ["Services en détail", "Notre méthode", "Projets", "Devis"],
    copyright: "© 2026 Okaab — Performance. Vision. Rapidité.",
  },
  servicesIntro:
    "Okaab est une équipe de développement web et de développement d\u2019applications qui travaille avec des entreprises en Égypte et dans le Golfe. Nous construisons des sites complets, des boutiques en ligne et des plateformes SaaS avec un code propre et évolutif, et nous publions des applications Android et iOS sur les deux stores. Chaque projet est livré avec un périmètre écrit et des dates claires, puis suivi après le lancement avec un support 24h/24.",
  catalogIntro:
    "Ce tableau présente les types de projets de développement web et de développement d\u2019applications que nous réalisons, les technologies utilisées et un délai réaliste. Si votre projet n\u2019y figure pas, contactez-nous : nous revenons vers vous avec un plan sur mesure.",
  aboutIntro:
    "Notre méthode repose sur la clarté dès le premier jour : nous comprenons votre activité et votre audience, puis nous les traduisons en un plan de conception et de développement par étapes que vous pouvez suivre. Nos clients en Égypte, en Arabie saoudite, aux Émirats et en Europe travaillent avec la même équipe du début à la fin, sans intermédiaire ni surprise sur le budget ou les délais.",
  closing: {
    title: "Une société de développement web et mobile pensée pour la durée",
    body: "Site vitrine, boutique en ligne, plateforme SaaS ou application mobile en Égypte ou dans le Golfe : Okaab couvre tout le cycle — analyse, conception, développement, tests et déploiement sur des serveurs stables, puis SEO, suivi des performances et support 24h/24. Envoyez-nous les détails de votre projet et recevez un devis écrit et un calendrier en moins de 15 minutes.",
  },
  faq: {
    kicker: "FAQ",
    title: "Questions fréquentes",
    items: [
      {
        q: "Travaillez-vous avec des clients hors d\u2019Égypte ?",
        a: "Oui. Nous travaillons avec des entreprises en Égypte, dans le Golfe (Arabie saoudite, Émirats, Koweït, Qatar) et en Europe, à distance, en arabe ou en anglais.",
      },
      {
        q: "Combien de temps dure un projet de développement web ?",
        a: "Un site vitrine prend 1 à 2 semaines, une boutique en ligne 3 à 5 semaines, une plateforme SaaS ou un tableau de bord 6 à 10 semaines.",
      },
      {
        q: "Développez-vous des applications Android et iOS ?",
        a: "Oui, en Flutter ou React Native, avec backend, APIs et panneau d\u2019administration, publiées sur Google Play et l\u2019App Store.",
      },
      {
        q: "Gérez-vous l\u2019hébergement et les serveurs ?",
        a: "Nous déployons sur AWS, VPS ou Cloudflare et configurons sauvegardes, certificats SSL, supervision et montée en charge.",
      },
      {
        q: "Quand le support est-il disponible ?",
        a: "Le support fonctionne 24h/24 avec une première réponse en moins de 15 minutes.",
      },
    ],
  },
  tagline: "Performance. Vision. Rapidité.",
};

export default dict;
