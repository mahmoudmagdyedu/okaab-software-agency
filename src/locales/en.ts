import type { Dict } from "./ar-EG";

const dict: Dict = {
  code: "en",
  htmlLang: "en",
  dir: "ltr",
  label: "English",
  nav: {
    courses: "Courses",
    dashboard: "Dashboard",
    services: "Services",
    projects: "Projects",
    why: "Why Okaab",
    process: "How we work",
    cta: "Explore our services",
  },
  hero: {
    kicker: "← yes, the team that ships on time",
    h1a: "Web development and",
    h1b: "app development",
    h1italic: "for Egypt and the Gulf.",
    sub: "Okaab is a web development and app development company serving Egypt and the Gulf: full web platforms across every stack, Android and iOS apps, we deploy and manage your servers, our sites are SEO-ready from day one, and support answers in minutes, 24/7 — with the same quality we give our largest clients.",
    primary: "Explore our services",
    secondary: "Browse packages and services",
    badgeRing: "OPEN FOR PROJECTS ✦ OPEN FOR PROJECTS ✦ ",
    badgeNum: "24/7",
  },
  stats: [
    "40+ projects delivered",
    "First reply under 15 minutes",
    "24/7 technical support",
    "5 languages",
    "40+ projects delivered",
    "First reply under 15 minutes",
    "24/7 technical support",
    "5 languages",
  ],
  testimonialsKicker: "what clients say",
  testimonials: [
    {
      quote:
        "They handed over the platform a week early, and any note gets answered within minutes.",
      name: "Mohamed Shaaban",
      role: "Founder, learning platform — Cairo",
      tag: "Learning platform",
    },
    {
      quote:
        "Professional throughout, delivery right on schedule, and the store is far faster than before.",
      name: "Noura Al-Otaibi",
      role: "Marketing Director — Riyadh",
      tag: "E-commerce",
    },
    {
      quote:
        "Organised team, clear communication — the app shipped to both stores in under two months.",
      name: "Lukas Berger",
      role: "CTO — Berlin",
      tag: "Mobile app",
    },
  ],
  projects: {
    kicker: "selected work",
    title: "Products we built and shipped",
    name: "Maw'id",
    description:
      "An Arabic appointment and booking platform for clinics and service teams, with public booking, a weekly calendar, customer management and team roles.",
    badge: "Interactive demo",
    cta: "Try the project",
    tags: ["SaaS", "React", "Supabase", "Scheduling"],
    pos: {
      name: "Bun Al Deerah POS",
      description:
        "An Arabic point-of-sale and operations platform covering invoices, inventory, shifts, branches and real role-based access, with interactive super admin, admin and employee simulations.",
      badge: "New interactive project",
      cta: "Try the simulation",
      tags: ["POS", "React", "SQL Server", "Heroku"],
    },
  },
  servicesSection: {
    kicker: "what we do",
    titleA: "Services we deliver",
    titleItalic: "without the runaround",
  },
  services: [
    {
      title: "Full web development",
      copy: "We work across stacks — React/Next.js, Vue, Laravel, Node.js and WordPress — picking whatever fits your project best.",
    },
    {
      title: "Android & iOS apps",
      copy: "High-performance mobile apps, from design through to release on Google Play and the App Store.",
    },
    {
      title: "24/7 fast support",
      copy: "A team that replies in minutes, every day of the week, and acts on any incident the moment it happens.",
    },
    {
      title: "Server deployment",
      copy: "Provisioning and monitoring, backups, SSL certificates, and scaling resources when traffic spikes.",
    },
    {
      title: "SEO-ready from day one",
      copy: "Clean technical structure, excellent load times, and Core Web Vitals dialled in before you launch.",
    },
    {
      title: "Same quality, no surprises",
      copy: "Clear scope and delivery, with the same attention we give our largest clients.",
    },
  ],
  catalog: {
    kicker: "pick what fits",
    title: "Services in detail",
    depts: ["All services", "Web", "Mobile", "Ops & support", "SEO"],
    note: "Scope and timeline are confirmed after a short discovery call — we send a written quote with no obligation.",
    rows: [
      { title: "Company or portfolio site", stack: "Next.js / WordPress", time: "1–2 weeks" },
      { title: "Full e-commerce store", stack: "Laravel / Next.js", time: "3–5 weeks" },
      { title: "SaaS platform or dashboard", stack: "React / Node.js", time: "6–10 weeks" },
      { title: "Android & iOS application", stack: "Flutter / React Native", time: "4–8 weeks" },
      { title: "APIs and mobile admin panel", stack: "Node.js / Laravel", time: "1–3 weeks" },
      {
        title: "Cloud server setup & monitoring",
        stack: "AWS / VPS / Cloudflare",
        time: "live in 48 hours",
      },
      {
        title: "Ongoing maintenance & security updates",
        stack: "Remote",
        time: "monthly retainer",
      },
      { title: "Technical SEO & speed tuning", stack: "Core Web Vitals", time: "1–2 weeks" },
    ],
  },
  about: {
    kicker: "who we are",
    titleLines: ["How we", "actually", "work"],
    paragraph:
      "Okaab is a small team of developers and designers based in Egypt, working with companies and founders across Egypt, the Gulf and Europe. We listen first, learn how your business runs, then build something that keeps working and grows with you.",
    steps: [
      {
        title: "Discovery",
        copy: "A short call to understand your goal, audience and budget — you leave with a written plan and scope.",
      },
      {
        title: "Design",
        copy: "Clear, fast interfaces reviewed with you step by step before a single line of code is written.",
      },
      {
        title: "Build & test",
        copy: "Clean, scalable code, tested across devices and browsers before anything is handed over.",
      },
      {
        title: "Launch & support",
        copy: "We deploy, tune the server and SEO, and stay with you afterwards with 24/7 support.",
      },
    ],
  },
  quote: {
    note: "different kind of project? tell us ↓",
    titleA: "Tell us about",
    titleItalic: "your project",
    sub: "Fill this in and we'll send a written quote with a clear timeline. First reply in under 15 minutes.",
    fields: {
      name: "Name",
      email: "Email",
      phone: "Mobile number",
      service: "Service type",
      details: "Project details",
    },
    servicePlaceholder: "Choose a service type",
    serviceOptions: [
      "Website",
      "E-commerce store",
      "Platform or dashboard",
      "Mobile app",
      "Servers & support",
      "Technical SEO",
    ],
    submit: "Get a free quote",
    whatsapp: "Chat on WhatsApp",
    sending: "Sending…",
    sent: "Request received ✅ — our team will review it and reply within minutes by email or WhatsApp.",
    failed:
      "Sending failed — we opened WhatsApp and your email with the details, send it and we'll reply right away.",
  },
  footer: {
    links: ["Services in detail", "How we work", "Projects", "Get a quote"],
    copyright: "© 2026 Okaab — Performance. Vision. Speed.",
  },
  servicesIntro:
    "Okaab is a web development and app development team working with companies across Egypt and the Gulf. We build full websites, e-commerce stores and SaaS platforms on clean, scalable code, and ship Android and iOS apps to both stores. Every project comes with a written scope and clear dates, and we stay on after launch with 24/7 support plus performance and security monitoring.",
  catalogIntro:
    "This table shows the kinds of web development and app development projects we deliver, the stack we use for each, and a realistic timeline. If your project is not on the list, talk to us and we will come back with a tailored plan and scope.",
  aboutIntro:
    "Our process is built on clarity from day one: we learn how your business and audience work, then turn that into a design and development plan with stages you can follow step by step. Clients in Egypt, Saudi Arabia, the UAE and Europe work with the same team throughout — from discovery to launch and support — with no middlemen and no surprises on budget or dates.",
  closing: {
    title: "A web and app development company built for the long term",
    body: "Whether you need a company site, an e-commerce store, a SaaS platform or a mobile app in Egypt or the Gulf, Okaab covers the whole lifecycle: analysis, design, development, testing and deployment on stable servers, then SEO work, speed monitoring and 24/7 support. Send us your project details and you get a written quote and timeline in under 15 minutes.",
  },
  faq: {
    kicker: "FAQ",
    title: "Questions we get a lot",
    items: [
      {
        q: "Do you work with clients outside Egypt?",
        a: "Yes. We work with companies in Egypt, the Gulf (Saudi Arabia, UAE, Kuwait, Qatar) and Europe, remotely, in Arabic or English, with meetings scheduled in your timezone.",
      },
      {
        q: "How long does a web development project take?",
        a: "A company or portfolio site takes 1–2 weeks, an e-commerce store 3–5 weeks, and a SaaS platform or dashboard 6–10 weeks — confirmed after a short discovery call.",
      },
      {
        q: "Do you build Android and iOS apps?",
        a: "Yes, with Flutter or React Native, including backend, APIs and an admin panel, published to Google Play and the App Store with post-launch monitoring.",
      },
      {
        q: "Do you handle hosting and servers?",
        a: "We deploy on AWS, VPS or Cloudflare and set up backups, SSL certificates, monitoring and scaling when traffic spikes.",
      },
      {
        q: "When is support available?",
        a: "Support runs 24/7 with a first reply in under 15 minutes, and we act on any incident immediately.",
      },
    ],
  },
  tagline: "Performance. Vision. Speed.",
};

export default dict;
