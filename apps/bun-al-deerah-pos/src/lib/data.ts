/*
 * مصدر بيانات «مقهى بُنّ الديرة» الواحد لكل شاشات «فوترة».
 * كل التوليد حتمي (seeded) وكسول — لا يعمل شيء عند تحميل الوحدة،
 * لضمان ثبات SSR والنشر على بيئة Worker.
 */

export const VAT_RATE = 0.15;

const round2 = (n: number) => Math.round(n * 100) / 100;

/* مولّد أرقام شبه عشوائية حتمي — نفس الناتج في كل تشغيل */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- الفروع ---------------- */

export type Branch = { id: string; name: string; city: string };

export const branches: Branch[] = [
  { id: "narjes", name: "حي النرجس", city: "الرياض" },
  { id: "rawdah", name: "حي الروضة", city: "جدة" },
];

export const branchById = (id: string): Branch => branches.find((b) => b.id === id) ?? branches[0]!;

/* ---------------- الفئات والأصناف (80 صنفًا) ---------------- */

export type Category = { id: string; label: string; dot: string };

export const categories: Category[] = [
  { id: "hot", label: "مشروبات ساخنة", dot: "bg-accent-400" },
  { id: "iced", label: "مثلجة", dot: "bg-info" },
  { id: "tea", label: "شاي وكرك", dot: "bg-warning" },
  { id: "dessert", label: "حلويات", dot: "bg-error" },
  { id: "sandwich", label: "سندويتشات", dot: "bg-success" },
];

export const dotByCategory = Object.fromEntries(categories.map((c) => [c.id, c.dot])) as Record<
  string,
  string
>;

export const categoryLabel = (id: string): string =>
  categories.find((c) => c.id === id)?.label ?? id;

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  barcode: string;
  out?: boolean;
};

const rawProducts: Array<[string, number, string, boolean?]> = [
  // مشروبات ساخنة — 16
  ["لاتيه", 16.5, "hot"],
  ["كورتادو", 15.0, "hot"],
  ["كابتشينو", 15.5, "hot"],
  ["فلات وايت", 16.0, "hot"],
  ["إسبريسو", 11.0, "hot"],
  ["أمريكانو", 13.0, "hot"],
  ["سبانيش لاتيه", 18.0, "hot"],
  ["موكا", 17.5, "hot"],
  ["لاتيه البندق", 18.5, "hot"],
  ["لاتيه التمر", 17.0, "hot"],
  ["قهوة عربية — دلة", 12.0, "hot"],
  ["قهوة تركية", 10.0, "hot"],
  ["هوت شوكليت", 15.0, "hot"],
  ["ماتشا لاتيه", 19.0, "hot"],
  ["تشاي لاتيه", 14.5, "hot"],
  ["إسبريسو دوبيو", 13.5, "hot"],
  // مثلجة — 16
  ["آيس لاتيه", 17.0, "iced"],
  ["آيس أمريكانو", 14.0, "iced"],
  ["فرابتشينو كراميل", 19.5, "iced", true],
  ["آيس موكا", 18.5, "iced"],
  ["كولد برو", 16.5, "iced"],
  ["آيس سبانيش لاتيه", 19.0, "iced"],
  ["آيس ماتشا", 20.0, "iced"],
  ["فرابتشينو فانيلا", 19.0, "iced"],
  ["آيس شاي خوخ", 12.5, "iced"],
  ["آيس شاي ليمون ونعناع", 12.0, "iced"],
  ["سموذي مانجو", 16.0, "iced"],
  ["سموذي فراولة", 16.0, "iced"],
  ["عصير برتقال طازج", 14.0, "iced"],
  ["عصير أفوكادو", 18.0, "iced"],
  ["ميلك شيك أوريو", 17.5, "iced"],
  ["آيس تشاي لاتيه", 15.5, "iced"],
  // شاي وكرك — 14
  ["شاي كرك", 8.5, "tea"],
  ["كرك بالزعفران", 12.0, "tea"],
  ["شاي أخضر بالنعناع", 10.0, "tea"],
  ["شاي مغربي", 11.0, "tea"],
  ["كرك بالهيل", 10.5, "tea"],
  ["شاي أحمر كلاسيك", 7.0, "tea"],
  ["شاي بالحليب", 9.0, "tea"],
  ["كرك دلة — ٤ أكواب", 30.0, "tea"],
  ["شاي كرك زنجبيل", 10.0, "tea"],
  ["شاي أعشاب مهدئ", 11.5, "tea"],
  ["شاي مثلج بالليمون", 9.5, "tea"],
  ["كرك زنجبيل وهيل", 11.0, "tea"],
  ["شاي أبيض", 13.0, "tea"],
  ["كرك خاص الديرة", 14.0, "tea"],
  // حلويات — 18
  ["كيكة تمر", 13.5, "dessert"],
  ["تشيز كيك زعفران", 18.0, "dessert"],
  ["كرواسون زبدة", 9.5, "dessert"],
  ["براوني", 12.5, "dessert"],
  ["معمول", 7.5, "dessert"],
  ["كيكة العسل", 14.0, "dessert"],
  ["سنبون قرفة", 11.0, "dessert"],
  ["كوكيز الشوكولاتة", 8.5, "dessert"],
  ["تشيز كيك توت", 17.0, "dessert"],
  ["كليجا", 9.0, "dessert"],
  ["مافن توت أزرق", 10.5, "dessert"],
  ["كرواسون جبن", 12.0, "dessert"],
  ["كيكة ليمون", 12.5, "dessert"],
  ["تيراميسو", 16.5, "dessert"],
  ["أم علي", 13.0, "dessert"],
  ["بسبوسة", 10.0, "dessert"],
  ["كنافة ميني", 15.0, "dessert"],
  ["دونات لوتس", 11.5, "dessert", true],
  // سندويتشات — 16
  ["هالومي مشوي", 16.0, "sandwich"],
  ["دجاج مشوي", 17.5, "sandwich"],
  ["لبنة وزعتر", 10.5, "sandwich"],
  ["تونة بالجبن", 14.0, "sandwich"],
  ["تركي بالجبن", 15.5, "sandwich"],
  ["جبنة شيدر مثلثة", 12.0, "sandwich"],
  ["فلافل كلاسيك", 11.0, "sandwich"],
  ["بيض بالأفوكادو", 16.5, "sandwich"],
  ["كرواسون دجاج", 18.0, "sandwich"],
  ["روبيان مقلي", 19.5, "sandwich"],
  ["ستيك بقري", 22.0, "sandwich"],
  ["خضار مشوية", 13.5, "sandwich"],
  ["مرتديلا", 12.5, "sandwich"],
  ["كلوب ساندويتش الديرة", 20.0, "sandwich"],
  ["لبنة بالعسل", 12.0, "sandwich"],
  ["صاج دجاج", 15.0, "sandwich"],
];

export const products: Product[] = rawProducts.map(([name, price, category, out], i) => ({
  id: i + 1,
  name,
  price,
  category,
  barcode: `6281000${String(i + 1).padStart(4, "0")}`,
  out: out ?? false,
}));

export const productById = (id: number): Product => products.find((p) => p.id === id)!;

/* ---------------- الموظفون والأدوار ---------------- */

export const roles = ["مالك", "محاسب", "مشرف فرع", "مدير مخزون", "كاشير"] as const;
export type Role = (typeof roles)[number];

export type Employee = {
  id: string;
  name: string;
  role: Role;
  branchId: string | null;
};

export const employees: Employee[] = [
  { id: "u1", name: "نورة العتيبي", role: "مشرف فرع", branchId: "narjes" },
  { id: "u2", name: "سالم الدوسري", role: "كاشير", branchId: "narjes" },
  { id: "u3", name: "رهف القحطاني", role: "كاشير", branchId: "rawdah" },
  { id: "u4", name: "محمد الغامدي", role: "مدير مخزون", branchId: "rawdah" },
];

export const employeeById = (id: string): Employee => employees.find((e) => e.id === id)!;

/* ---------------- الفواتير — 500 فاتورة حتمية ---------------- */

export type PaymentMethod = "cash" | "card" | "wallet";
export const paymentLabel: Record<PaymentMethod, string> = {
  cash: "نقدي",
  card: "شبكة",
  wallet: "محفظة",
};

export type InvoiceStatus = "sent" | "pending" | "rejected";
export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  sent: "مُرسلة",
  pending: "معلّقة",
  rejected: "مرفوضة",
};

export type InvoiceLine = {
  productId: number;
  name: string;
  price: number;
  qty: number;
};

export type Invoice = {
  id: number;
  number: string;
  branchId: string;
  cashierId: string;
  createdAt: string;
  lines: InvoiceLine[];
  subtotal: number;
  vat: number;
  total: number;
  payment: PaymentMethod;
  status: InvoiceStatus;
  errorCode?: string;
};

const einvoiceErrorCodes = ["BR-KSA-12", "XSD-412", "SIG-09", "BR-S-08"];

function buildInvoices(): Invoice[] {
  const rand = mulberry32(20260823);
  const anchor = Date.parse("2026-08-23T18:00:00Z");
  const raw: Invoice[] = [];

  for (let i = 0; i < 500; i++) {
    const minutesBack = Math.floor(rand() * 120 * 24 * 60);
    const createdAt = new Date(anchor - minutesBack * 60_000).toISOString();
    const branchId = rand() < 0.55 ? "narjes" : "rawdah";
    const cashierId = branchId === "narjes" ? (rand() < 0.7 ? "u2" : "u1") : "u3";

    const lineCount = 1 + Math.floor(rand() * 4);
    const used = new Set<number>();
    const lines: InvoiceLine[] = [];
    for (let j = 0; j < lineCount; j++) {
      let p = products[Math.floor(rand() * products.length)]!;
      while (used.has(p.id)) {
        p = products[Math.floor(rand() * products.length)]!;
      }
      used.add(p.id);
      lines.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        qty: 1 + Math.floor(rand() * 3),
      });
    }

    const subtotal = round2(lines.reduce((s, l) => s + l.price * l.qty, 0));
    const vat = round2(subtotal * VAT_RATE);

    const payR = rand();
    const payment: PaymentMethod = payR < 0.45 ? "card" : payR < 0.8 ? "cash" : "wallet";

    const stR = rand();
    const status: InvoiceStatus = stR < 0.9 ? "sent" : stR < 0.97 ? "pending" : "rejected";

    raw.push({
      id: i + 1,
      number: "",
      branchId,
      cashierId,
      createdAt,
      lines,
      subtotal,
      vat,
      total: round2(subtotal + vat),
      payment,
      status,
      ...(status === "rejected"
        ? {
            errorCode: einvoiceErrorCodes[Math.floor(rand() * einvoiceErrorCodes.length)],
          }
        : {}),
    });
  }

  // الترقيم تسلسلي زمنيًا: الأقدم يأخذ الرقم الأصغر
  raw.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  raw.forEach((inv, idx) => {
    inv.number = `INV-2026-${String(idx + 1).padStart(5, "0")}`;
  });

  return raw.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

let invoicesCache: Invoice[] | null = null;

export function getInvoices(): Invoice[] {
  if (!invoicesCache) invoicesCache = buildInvoices();
  return invoicesCache;
}

export function getInvoiceByNumber(number: string): Invoice | undefined {
  return getInvoices().find((inv) => inv.number === number);
}

/* ---------------- الطلبات المعلّقة (الكاشير) ---------------- */

export type HeldOrder = {
  id: string;
  customer: string;
  heldAt: string;
  note?: string;
  lines: InvoiceLine[];
};

export const heldOrders: HeldOrder[] = [
  {
    id: "h1",
    customer: "أبو فهد",
    heldAt: "13:58",
    note: "بدون سكر — ينتظر مكالمة",
    lines: [
      { productId: 7, name: "سبانيش لاتيه", price: 18.0, qty: 2 },
      { productId: 49, name: "كيكة العسل", price: 14.0, qty: 1 },
    ],
  },
  {
    id: "h2",
    customer: "طاولة ٧ — منيو",
    heldAt: "14:05",
    lines: [
      { productId: 34, name: "شاي كرك", price: 8.5, qty: 4 },
      { productId: 47, name: "كرواسون زبدة", price: 9.5, qty: 2 },
    ],
  },
  {
    id: "h3",
    customer: "شركة مدار — طلب مكتب",
    heldAt: "14:21",
    note: "فاتورة ضريبية برقم المنشأة",
    lines: [
      { productId: 1, name: "لاتيه", price: 16.5, qty: 6 },
      { productId: 6, name: "أمريكانو", price: 13.0, qty: 4 },
      { productId: 52, name: "كوكيز الشوكولاتة", price: 8.5, qty: 10 },
    ],
  },
];

/* ---------------- الشفتات ---------------- */

export type Shift = {
  id: string;
  employeeId: string;
  branchId: string;
  label: string;
  openedAt: string;
  closedAt: string | null;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  walletSales: number;
  vatTotal: number;
  invoiceCount: number;
  actualCash: number | null;
  zNumber: string | null;
};

export const shifts: Shift[] = [
  {
    id: "sh-4",
    employeeId: "u2",
    branchId: "narjes",
    label: "الشفت الصباحي",
    openedAt: "2026-08-23T03:00:00Z",
    closedAt: null,
    openingFloat: 500,
    cashSales: 1240.5,
    cardSales: 1985.0,
    walletSales: 310.75,
    vatTotal: 460.84,
    invoiceCount: 87,
    actualCash: null,
    zNumber: null,
  },
  {
    id: "sh-3",
    employeeId: "u3",
    branchId: "rawdah",
    label: "الشفت المسائي",
    openedAt: "2026-08-22T11:00:00Z",
    closedAt: "2026-08-22T19:00:00Z",
    openingFloat: 500,
    cashSales: 1840.5,
    cardSales: 2310.0,
    walletSales: 402.25,
    vatTotal: 592.05,
    invoiceCount: 121,
    actualCash: 2335.5,
    zNumber: "Z-2026-0117",
  },
  {
    id: "sh-2",
    employeeId: "u2",
    branchId: "narjes",
    label: "الشفت المسائي",
    openedAt: "2026-08-22T11:00:00Z",
    closedAt: "2026-08-22T19:00:00Z",
    openingFloat: 500,
    cashSales: 2120.0,
    cardSales: 2615.75,
    walletSales: 388.0,
    vatTotal: 666.31,
    invoiceCount: 143,
    actualCash: 2620.0,
    zNumber: "Z-2026-0116",
  },
  {
    id: "sh-1",
    employeeId: "u1",
    branchId: "narjes",
    label: "الشفت الصباحي",
    openedAt: "2026-08-22T03:00:00Z",
    closedAt: "2026-08-22T11:00:00Z",
    openingFloat: 500,
    cashSales: 1560.25,
    cardSales: 1890.0,
    walletSales: 295.5,
    vatTotal: 487.35,
    invoiceCount: 104,
    actualCash: 2055.25,
    zNumber: "Z-2026-0115",
  },
];

/* ---------------- المخزون ---------------- */

export type StockItem = {
  id: string;
  name: string;
  unit: string;
  reorderLevel: number;
  stock: Record<string, number>; // branchId → الكمية
};

export const stockItems: StockItem[] = [
  { id: "m1", name: "حليب طازج", unit: "لتر", reorderLevel: 40, stock: { narjes: 62, rawdah: 28 } },
  {
    id: "m2",
    name: "بن مختص — إثيوبي",
    unit: "كجم",
    reorderLevel: 10,
    stock: { narjes: 14, rawdah: 8 },
  },
  { id: "m3", name: "بن عربي فاتح", unit: "كجم", reorderLevel: 6, stock: { narjes: 9, rawdah: 5 } },
  {
    id: "m4",
    name: "خلطة شاي كرك",
    unit: "كجم",
    reorderLevel: 8,
    stock: { narjes: 11, rawdah: 4 },
  },
  {
    id: "m5",
    name: "هيل مطحون",
    unit: "كجم",
    reorderLevel: 2,
    stock: { narjes: 3.5, rawdah: 1.2 },
  },
  {
    id: "m6",
    name: "زعفران فاخر",
    unit: "جم",
    reorderLevel: 100,
    stock: { narjes: 240, rawdah: 80 },
  },
  { id: "m7", name: "تمر سكري", unit: "كجم", reorderLevel: 12, stock: { narjes: 18, rawdah: 15 } },
  { id: "m8", name: "دقيق فاخر", unit: "كجم", reorderLevel: 25, stock: { narjes: 40, rawdah: 22 } },
  { id: "m9", name: "زبدة", unit: "كجم", reorderLevel: 8, stock: { narjes: 12, rawdah: 6 } },
  { id: "m10", name: "بيض", unit: "طبق", reorderLevel: 10, stock: { narjes: 16, rawdah: 7 } },
  { id: "m11", name: "جبن هالومي", unit: "كجم", reorderLevel: 6, stock: { narjes: 8, rawdah: 3 } },
  { id: "m12", name: "صدور دجاج", unit: "كجم", reorderLevel: 10, stock: { narjes: 15, rawdah: 9 } },
  { id: "m13", name: "سكر", unit: "كجم", reorderLevel: 15, stock: { narjes: 22, rawdah: 11 } },
  { id: "m14", name: "كريمة خفق", unit: "لتر", reorderLevel: 6, stock: { narjes: 5, rawdah: 8 } },
];

export type StockMove = {
  id: string;
  itemId: string;
  branchId: string;
  kind: "in" | "out" | "adjust";
  qty: number;
  reason: string;
  at: string;
};

export const stockMoves: StockMove[] = [
  {
    id: "mv1",
    itemId: "m1",
    branchId: "narjes",
    kind: "in",
    qty: 40,
    reason: "توريد مزرعة الروضة",
    at: "2026-08-23T04:10:00Z",
  },
  {
    id: "mv2",
    itemId: "m2",
    branchId: "narjes",
    kind: "out",
    qty: 3,
    reason: "استهلاك مبيعات اليوم",
    at: "2026-08-23T09:30:00Z",
  },
  {
    id: "mv3",
    itemId: "m4",
    branchId: "rawdah",
    kind: "out",
    qty: 2,
    reason: "استهلاك مبيعات اليوم",
    at: "2026-08-23T08:15:00Z",
  },
  {
    id: "mv4",
    itemId: "m8",
    branchId: "narjes",
    kind: "in",
    qty: 25,
    reason: "توريد مخبز الديرة",
    at: "2026-08-22T13:00:00Z",
  },
  {
    id: "mv5",
    itemId: "m6",
    branchId: "rawdah",
    kind: "adjust",
    qty: -20,
    reason: "تسوية جرد — فاقد",
    at: "2026-08-22T18:40:00Z",
  },
  {
    id: "mv6",
    itemId: "m11",
    branchId: "rawdah",
    kind: "in",
    qty: 5,
    reason: "تحويل من فرع النرجس",
    at: "2026-08-22T10:20:00Z",
  },
  {
    id: "mv7",
    itemId: "m13",
    branchId: "narjes",
    kind: "out",
    qty: 4,
    reason: "استهلاك مبيعات أمس",
    at: "2026-08-22T17:55:00Z",
  },
  {
    id: "mv8",
    itemId: "m10",
    branchId: "rawdah",
    kind: "in",
    qty: 12,
    reason: "توريد مؤسسة البيض الذهبي",
    at: "2026-08-21T06:00:00Z",
  },
];

export type Transfer = {
  id: string;
  itemId: string;
  fromBranchId: string;
  toBranchId: string;
  qty: number;
  status: "in-transit" | "received";
  at: string;
};

export const transfers: Transfer[] = [
  {
    id: "tr1",
    itemId: "m6",
    fromBranchId: "narjes",
    toBranchId: "rawdah",
    qty: 60,
    status: "in-transit",
    at: "2026-08-23T07:30:00Z",
  },
  {
    id: "tr2",
    itemId: "m11",
    fromBranchId: "narjes",
    toBranchId: "rawdah",
    qty: 5,
    status: "received",
    at: "2026-08-22T10:20:00Z",
  },
  {
    id: "tr3",
    itemId: "m9",
    fromBranchId: "rawdah",
    toBranchId: "narjes",
    qty: 3,
    status: "received",
    at: "2026-08-21T12:00:00Z",
  },
];

export type StocktakeRow = {
  itemId: string;
  system: number;
  counted: number;
};

export const stocktakeRows: StocktakeRow[] = [
  { itemId: "m1", system: 62, counted: 62 },
  { itemId: "m2", system: 14, counted: 13 },
  { itemId: "m4", system: 11, counted: 11 },
  { itemId: "m6", system: 240, counted: 240 },
  { itemId: "m8", system: 40, counted: 38 },
  { itemId: "m13", system: 22, counted: 22 },
];

export type Recipe = {
  productId: number;
  ingredients: Array<{ itemId: string; qty: number }>;
};

export const recipes: Recipe[] = [
  {
    productId: 1,
    ingredients: [
      { itemId: "m1", qty: 0.22 },
      { itemId: "m2", qty: 0.018 },
    ],
  },
  {
    productId: 3,
    ingredients: [
      { itemId: "m1", qty: 0.18 },
      { itemId: "m2", qty: 0.018 },
    ],
  },
  {
    productId: 34,
    ingredients: [
      { itemId: "m4", qty: 0.012 },
      { itemId: "m1", qty: 0.15 },
      { itemId: "m13", qty: 0.01 },
    ],
  },
];

/* ---------------- شاشة المطبخ (KDS) ---------------- */

export type KdsItem = { name: string; qty: number; note?: string };

export type KdsOrder = {
  id: string;
  source: string;
  elapsedMin: number;
  status: "new" | "preparing";
  items: KdsItem[];
};

export const kdsOrders: KdsOrder[] = [
  {
    id: "k1",
    source: "كاشير — سالم",
    elapsedMin: 2,
    status: "new",
    items: [
      { name: "لاتيه", qty: 2 },
      { name: "كيكة تمر", qty: 1 },
    ],
  },
  {
    id: "k2",
    source: "منيو — طاولة ٥",
    elapsedMin: 5,
    status: "new",
    items: [
      { name: "شاي كرك", qty: 3 },
      { name: "هالومي مشوي", qty: 1, note: "بدون زيت" },
    ],
  },
  {
    id: "k3",
    source: "كاشير — نورة",
    elapsedMin: 9,
    status: "preparing",
    items: [
      { name: "سبانيش لاتيه", qty: 1 },
      { name: "كورتادو", qty: 1 },
      { name: "كرواسون زبدة", qty: 2 },
    ],
  },
  {
    id: "k4",
    source: "منيو — طاولة ٢",
    elapsedMin: 14,
    status: "preparing",
    items: [
      { name: "آيس أمريكانو", qty: 2 },
      { name: "براوني", qty: 1, note: "يسخَّن ٢٠ ثانية" },
    ],
  },
  {
    id: "k5",
    source: "كاشير — سالم",
    elapsedMin: 17,
    status: "preparing",
    items: [{ name: "كرك بالزعفران", qty: 4 }],
  },
  {
    id: "k6",
    source: "منيو — طاولة ٩",
    elapsedMin: 23,
    status: "preparing",
    items: [
      { name: "دجاج مشوي", qty: 2, note: "خبز صاج" },
      { name: "آيس شاي خوخ", qty: 2 },
    ],
  },
];

/* ---------------- بيانات المنشأة (الإعدادات) ---------------- */

export const company = {
  name: "مقهى بُنّ الديرة",
  legalName: "مؤسسة بُنّ الديرة للمقهى المختص",
  cr: "1010785412",
  vatNumber: "310122393500003",
  address: "الرياض — حي النرجس، طريق عثمان بن عفان",
  phone: "0114567890",
};
