/*
 * حالة نقطة البيع المشتركة بين شاشات الكاشير: السلة، الطلبات المعلّقة،
 * وتسلسل أرقام الفواتير. مخزن وحدات بسيط بلا اعتماديات خارجية؛
 * اللقطة الابتدائية حتمية (ثبات SSR) وكل تغيير ينشأ من حدث مستخدم.
 */

import { useSyncExternalStore } from "react";
import { heldOrders as seedHeld, VAT_RATE, type HeldOrder } from "./data";

export type CartLine = { id: string; name: string; price: number; qty: number };

/* سلة الافتتاح — بيانات الشاشة البطل: 87.00 + ضريبة 13.05 = 100.05 */
const seedCart: CartLine[] = [
  { id: "لاتيه", name: "لاتيه", price: 16.5, qty: 2 },
  { id: "كورتادو", name: "كورتادو", price: 15.0, qty: 1 },
  { id: "كيكة تمر", name: "كيكة تمر", price: 13.5, qty: 1 },
  { id: "شاي كرك", name: "شاي كرك", price: 8.5, qty: 3 },
];

type PosState = {
  cart: CartLine[];
  held: HeldOrder[];
  nextInvoice: number;
};

let state: PosState = { cart: seedCart, held: seedHeld, nextInvoice: 501 };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: (() => void) | undefined) => {
  if (!cb) return () => {};
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const usePosCart = (): CartLine[] =>
  useSyncExternalStore(
    subscribe,
    () => state.cart,
    () => state.cart,
  );

export const usePosHeld = (): HeldOrder[] =>
  useSyncExternalStore(
    subscribe,
    () => state.held,
    () => state.held,
  );

/* نفس حساب شاشة الكاشير بالضبط: المجموع الفرعي ثم الضريبة ثم الإجمالي */
export function cartTotals(cart: CartLine[]) {
  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
  const vat = subtotal * VAT_RATE;
  return { subtotal, vat, total: subtotal + vat };
}

export function addToCart(item: { name: string; price: number }) {
  const existing = state.cart.find((l) => l.id === item.name);
  state = {
    ...state,
    cart: existing
      ? state.cart.map((l) => (l.id === item.name ? { ...l, qty: l.qty + 1 } : l))
      : [...state.cart, { id: item.name, name: item.name, price: item.price, qty: 1 }],
  };
  emit();
}

export function changeQty(id: string, delta: number) {
  state = {
    ...state,
    cart: state.cart
      .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0),
  };
  emit();
}

let heldCounter = 0;

/* تعليق السلة الحالية كطلب معلّق وإفراغها — يعاد null إن كانت فارغة */
export function holdCart(): HeldOrder | null {
  if (state.cart.length === 0) return null;
  heldCounter += 1;
  const order: HeldOrder = {
    id: `h-live-${heldCounter}`,
    customer: "طلب الكاشير المعلّق",
    heldAt: new Date().toLocaleTimeString("ar-SA-u-nu-latn", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    lines: state.cart.map((l, i) => ({
      productId: i + 1,
      name: l.name,
      price: l.price,
      qty: l.qty,
    })),
  };
  state = { ...state, cart: [], held: [order, ...state.held] };
  emit();
  return order;
}

/* استرجاع طلب معلّق إلى السلة (يدمج الكميات عند تطابق الصنف) */
export function restoreHeld(id: string) {
  const order = state.held.find((o) => o.id === id);
  if (!order) return;
  let cart = [...state.cart];
  for (const l of order.lines) {
    const existing = cart.find((c) => c.id === l.name);
    cart = existing
      ? cart.map((c) => (c.id === l.name ? { ...c, qty: c.qty + l.qty } : c))
      : [...cart, { id: l.name, name: l.name, price: l.price, qty: l.qty }];
  }
  state = { ...state, cart, held: state.held.filter((o) => o.id !== id) };
  emit();
}

export function removeHeld(id: string) {
  state = { ...state, held: state.held.filter((o) => o.id !== id) };
  emit();
}

/* إتمام البيع: يرجع رقم الفاتورة ويفرغ السلة ويتقدّم بالتسلسل */
export function completeSale(): string {
  const number = `INV-2026-${String(state.nextInvoice).padStart(5, "0")}`;
  state = { ...state, cart: [], nextInvoice: state.nextInvoice + 1 };
  emit();
  return number;
}
