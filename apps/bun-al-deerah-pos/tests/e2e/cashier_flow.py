#!/usr/bin/env python3
"""
اختبارات E2E لتدفق الكاشير في نظام «فوترة» — مقهى بُنّ الديرة.

التغطية:
  ديسكتوب (1280×900):
    01 دخول PIN خاطئ ثم صحيح
    02 إجماليات السلة الافتتاحية (87.00 + 13.05 = 100.05)
    03 إضافة صنف وإعادة حساب الضريبة + بقاء تركيز البحث
    04 أزرار الكمية وحذف السطر عند الصفر
    05 الصنف النافد معطّل
    06 البحث وفلترة الفئات
    07 تعليق الطلب ثم استرجاعه (دورة كاملة مع التحقق من الإجمالي)
    08 إجماليات الطلبات المعلّقة المبدئية + الحذف
    09 الدفع النقدي: لوحة الأرقام، المتبقي، الباقي، رقم الفاتورة، إفراغ السلة
    10 الدفع بالشبكة بلا مبلغ مدفوع
    11 مودال فتح الشفت (العهدة الافتتاحية)
    12 مودال إغلاق الشفت — تقرير Z (النقدية المتوقعة = العهدة + النقدية)
    13 سجل الشفتات: إجمالي المبيعات والضريبة وفرق العهدة لكل تقرير Z
  موبايل (375×812):
    14 تدفق بيع كامل من PIN حتى النجاح + عدم وجود فيض أفقي
    15 مودالا الشفت ضمن عرض 375px

التشغيل:  python3 tests/e2e/cashier_flow.py
يتطلب خادم التطوير على http://localhost:8080
"""

import re
import sys
import traceback
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = "http://localhost:8080"
VIEWPORTS = {
    "desktop": {"width": 1280, "height": 900},
    "mobile": {"width": 375, "height": 812},
}
ARTIFACTS = Path("/tmp/browser/e2e-artifacts")
ARTIFACTS.mkdir(parents=True, exist_ok=True)

VAT = 0.15
# سلة الافتتاح: لاتيه×2 + كورتادو + كيكة تمر + شاي كرك×3
SEED = [("لاتيه", 16.5, 2), ("كورتادو", 15.0, 1), ("كيكة تمر", 13.5, 1), ("شاي كرك", 8.5, 3)]


from decimal import Decimal, ROUND_HALF_UP


def fmt(v: float) -> str:
    """يطابق formatSar في الواجهة: toLocaleString تقرّب النصف للأعلى
    (12.225 ← "12.23") بخلاف تقريب Python الافتراضي للزوجي."""
    d = Decimal(repr(v)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return f"{d:,}"


def totals(lines):
    """يحاكي حساب الواجهة بنفس ترتيب عمليات الفاصلة العائمة."""
    sub = 0.0
    for _, price, qty in lines:
        sub += price * qty
    vat = sub * VAT
    return sub, vat, sub + vat


def goto(page, path: str, ready: str):
    page.goto(f"{BASE}{path}", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_text(ready, exact=False).first).to_be_visible(timeout=15000)
    page.wait_for_timeout(900)  # مهلة ترطيب (hydration) — خادم التطوير يصرّف المسارات كسولًا


def dl_val(scope, label: str) -> str:
    """قراءة قيمة dd من صف dl يحمل dt بالتسمية المعطاة."""
    row = scope.locator("dl > div", has_text=label)
    expect(row).to_have_count(1)
    return row.locator("dd").first.inner_text().strip()


def assert_cart_totals(page, lines):
    sub, vat, total = totals(lines)
    aside = page.locator("aside")
    assert dl_val(aside, "المجموع الفرعي") == fmt(sub), f"subtotal: {dl_val(aside, 'المجموع الفرعي')} != {fmt(sub)}"
    assert dl_val(aside, "الضريبة (15%)") == fmt(vat), f"vat: {dl_val(aside, 'الضريبة (15%)')} != {fmt(vat)}"
    pay = page.get_by_role("link", name=re.compile("الدفع"))
    expect(pay).to_contain_text(fmt(total))


def assert_no_hscroll(page, where: str):
    sw = page.evaluate("document.documentElement.scrollWidth")
    iw = page.evaluate("window.innerWidth")
    assert sw <= iw + 1, f"فيض أفقي في {where}: scrollWidth={sw} > innerWidth={iw}"


# ---------------- ديسكتوب ----------------

def t_pin_login(page, base):
    goto(page, "/pos/pin", "اختر اسمك وأدخل رمزك")
    # رمز خاطئ: رسالة خطأ ثم تصفير الخانات
    for d in "9999":
        page.get_by_role("button", name=d, exact=True).click()
    expect(page.get_by_text("الرمز غير صحيح — أعد المحاولة")).to_be_visible()
    page.wait_for_timeout(600)
    # رمز صحيح ينقلنا لشاشة الكاشير
    for d in "1234":
        page.get_by_role("button", name=d, exact=True).click()
    expect(page).to_have_url(re.compile(r"/pos$"))
    expect(page.get_by_text("الطلب الحالي")).to_be_visible()


def t_cart_initial_totals(page, base):
    goto(page, "/pos", "الطلب الحالي")
    assert_cart_totals(page, SEED)
    assert dl_val(page.locator("aside"), "الخصم") == "0.00"
    expect(page.locator("aside").get_by_text("الإجمالي")).to_be_visible()
    expect(page.locator("aside").get_by_text("100.05").first).to_be_visible()


def t_add_product_keeps_search_focus(page, base):
    goto(page, "/pos", "الطلب الحالي")
    page.get_by_role("button", name="إسبريسو").click()
    assert_cart_totals(page, SEED + [("إسبريسو", 11.0, 1)])  # 98.00 / 14.70 / 112.70
    line = page.locator('[data-testid="cart-line-إسبريسو"]')
    expect(line).to_contain_text("11.00")
    # التركيز يعود لحقل البحث — تدفق الباركود لا ينقطع
    expect(page.get_by_placeholder("ابحث بالاسم أو امسح الباركود…")).to_be_focused()


def t_qty_controls(page, base):
    goto(page, "/pos", "الطلب الحالي")
    karak = page.locator('[data-testid="cart-line-شاي كرك"]')
    # إنقاص شاي كرك 3 ← 2: المجموع 78.50
    karak.get_by_role("button", name="إنقاص الكمية").click()
    assert_cart_totals(page, [("لاتيه", 16.5, 2), ("كورتادو", 15.0, 1), ("كيكة تمر", 13.5, 1), ("شاي كرك", 8.5, 2)])
    # زيادة لاتيه 2 ← 3: المجموع 95.00
    page.locator('[data-testid="cart-line-لاتيه"]').get_by_role("button", name="زيادة الكمية").click()
    assert_cart_totals(page, [("لاتيه", 16.5, 3), ("كورتادو", 15.0, 1), ("كيكة تمر", 13.5, 1), ("شاي كرك", 8.5, 2)])
    # إنقاص كيكة تمر (كمية 1) يحذف السطر: المجموع 81.50
    page.locator('[data-testid="cart-line-كيكة تمر"]').get_by_role("button", name="إنقاص الكمية").click()
    expect(page.locator('[data-testid="cart-line-كيكة تمر"]')).to_have_count(0)
    assert_cart_totals(page, [("لاتيه", 16.5, 3), ("كورتادو", 15.0, 1), ("شاي كرك", 8.5, 2)])


def t_out_of_stock_disabled(page, base):
    goto(page, "/pos", "الطلب الحالي")
    btn = page.get_by_role("button", name=re.compile("فرابتشينو كراميل"))
    expect(btn).to_be_disabled()
    expect(btn.get_by_text("نفد")).to_be_visible()
    # لا يتغير الإجمالي
    assert_cart_totals(page, SEED)


def t_search_and_category_filter(page, base):
    goto(page, "/pos", "الطلب الحالي")
    search = page.get_by_placeholder("ابحث بالاسم أو امسح الباركود…")
    search.fill("كرواسون")
    expect(page.get_by_role("button", name=re.compile("كرواسون زبدة"))).to_be_visible()
    expect(page.get_by_role("button", name=re.compile("^لاتيه"))).to_have_count(0)
    search.fill("")
    page.get_by_role("button", name="مثلجة", exact=True).click()
    expect(page.get_by_role("button", name=re.compile("آيس لاتيه"))).to_be_visible()
    expect(page.get_by_role("button", name=re.compile("^لاتيه"))).to_have_count(0)
    page.get_by_role("button", name="الكل", exact=True).click()
    expect(page.get_by_role("button", name=re.compile("^لاتيه"))).to_be_visible()


def t_hold_and_restore_flow(page, base):
    goto(page, "/pos", "الطلب الحالي")
    page.get_by_role("button", name="تعليق الطلب").click()
    expect(page).to_have_url(re.compile(r"/pos/held$"))
    # الطلب المعلّق الجديد يظهر أول القائمة بإجمالي شامل الضريبة
    li = page.locator("li", has_text="طلب الكاشير المعلّق")
    expect(li).to_be_visible()
    expect(li).to_contain_text(fmt(totals(SEED)[2]))  # 100.05
    expect(page.get_by_role("button", name="استرجاع إلى السلة")).to_have_count(4)
    # الاسترجاع يعيد السلة كاملة بنفس الإجماليات
    li.get_by_role("button", name="استرجاع إلى السلة").click()
    expect(page).to_have_url(re.compile(r"/pos$"))
    assert_cart_totals(page, SEED)
    expect(page.locator("[data-testid^='cart-line-']")).to_have_count(4)
    # وقائمة المعلّقة تعود لثلاثة طلبات
    page.get_by_role("link", name="استرجاع طلب معلّق").click()
    expect(page.get_by_role("button", name="استرجاع إلى السلة")).to_have_count(3)


def t_held_seed_totals(page, base):
    goto(page, "/pos/held", "الطلبات المعلّقة")
    # 50.00 × 1.15 = 57.50
    expect(page.locator("li", has_text="أبو فهد")).to_contain_text("57.50")
    # 53.00 × 1.15 = 60.95
    expect(page.locator("li", has_text="طاولة ٧ — منيو")).to_contain_text("60.95")
    # 236.00 × 1.15 = 271.40
    expect(page.locator("li", has_text="شركة مدار")).to_contain_text("271.40")
    page.get_by_role("button", name="حذف طلب طاولة ٧ — منيو").click()
    expect(page.get_by_role("button", name="استرجاع إلى السلة")).to_have_count(2)
    expect(page.locator("li", has_text="طاولة ٧ — منيو")).to_have_count(0)


def t_payment_cash_full(page, base):
    goto(page, "/pos", "الطلب الحالي")
    page.get_by_role("link", name=re.compile("الدفع")).click()
    expect(page).to_have_url(re.compile(r"/pos/payment$"))
    expect(page.get_by_role("heading", name="الدفع")).to_be_visible()
    # إجمالي الفاتورة من السلة الفعلية
    expect(page.locator("p.text-price-total")).to_contain_text("100.05")
    expect(page.get_by_text("يشمل ضريبة القيمة المضافة 15%")).to_contain_text("13.05")
    # الافتراضي 100 مدفوعة ← متبقٍ 0.05 وزر التأكيد معطّل
    assert dl_val(page, "المبلغ المدفوع") == "100.00"
    assert dl_val(page, "المتبقي المطلوب") == "0.05"
    confirm = page.get_by_role("button", name=re.compile("تأكيد الدفع"))
    expect(confirm).to_be_disabled()
    # لوحة الأرقام: مسح ثم إدخال 150
    for _ in range(3):
        page.get_by_role("button", name="مسح", exact=True).click()
    for d in "150":
        page.get_by_role("button", name=d, exact=True).click()
    assert dl_val(page, "المبلغ المدفوع") == "150.00"
    assert dl_val(page, "الباقي للعميل") == "49.95"
    # شريحة 200 السريعة
    page.get_by_role("button", name="200", exact=True).click()
    assert dl_val(page, "المبلغ المدفوع") == "200.00"
    assert dl_val(page, "الباقي للعميل") == "99.95"
    expect(page.locator("dl > div", has_text="المتبقي المطلوب")).to_have_count(0)
    expect(confirm).to_be_enabled()
    confirm.click()
    # شاشة النجاح: رقم الفاتورة التسلسلي والباقي
    expect(page.get_by_role("heading", name="تمت العملية بنجاح")).to_be_visible()
    expect(page.get_by_text("INV-2026-00501")).to_be_visible()
    expect(page.get_by_text("نقدي", exact=True)).to_be_visible()
    expect(page.get_by_text("الباقي للعميل")).to_contain_text("99.95")
    # فاتورة جديدة ← سلة فارغة ودفع معطّل وتعليق معطّل
    page.get_by_role("link", name="فاتورة جديدة").click()
    expect(page).to_have_url(re.compile(r"/pos$"))
    expect(page.get_by_text("السلة فارغة")).to_be_visible()
    expect(page.get_by_role("button", name=re.compile("الدفع"))).to_be_disabled()
    expect(page.get_by_role("button", name="تعليق الطلب")).to_be_disabled()


def t_payment_card(page, base):
    goto(page, "/pos/payment", "إجمالي الفاتورة")
    page.get_by_role("button", name="شبكة", exact=True).click()
    expect(page.get_by_text("مرّر البطاقة على جهاز الشبكة")).to_be_visible()
    confirm = page.get_by_role("button", name=re.compile("تأكيد الدفع"))
    expect(confirm).to_be_enabled()  # الشبكة لا تحتاج مبلغًا مدفوعًا
    confirm.click()
    expect(page.get_by_role("heading", name="تمت العملية بنجاح")).to_be_visible()
    expect(page.get_by_text("INV-2026-00501")).to_be_visible()
    expect(page.get_by_text("— شبكة")).to_be_visible()


def t_shift_open_modal(page, base):
    goto(page, "/admin/shifts", "سجل الشفتات")
    page.get_by_role("button", name="فتح شفت جديد").click()
    modal = page.locator("div.fixed.inset-0.z-50")
    expect(modal.get_by_role("heading", name="فتح شفت جديد")).to_be_visible()
    assert modal.locator("#float").input_value() == "500.00"
    modal.get_by_role("button", name="إلغاء").click()
    expect(page.locator("div.fixed.inset-0.z-50")).to_have_count(0)


def t_shift_close_z_report(page, base):
    goto(page, "/admin/shifts", "سجل الشفتات")
    page.get_by_role("button", name="إغلاق الشفت وإصدار Z").click()
    modal = page.locator("div.fixed.inset-0.z-50")
    expect(modal.get_by_role("heading", name="إغلاق الشفت — تقرير Z")).to_be_visible()
    # قيم الشفت المفتوح (sh-4): عهدة 500 + نقدي 1,240.50 = متوقع 1,740.50
    assert dl_val(modal, "العهدة الافتتاحية") == "500.00"
    assert dl_val(modal, "مبيعات نقدية") == "1,240.50"
    assert dl_val(modal, "مبيعات شبكة") == "1,985.00"
    assert dl_val(modal, "مبيعات محفظة") == "310.75"
    assert dl_val(modal, "ضريبة القيمة المضافة المحصّلة") == "460.84"
    assert dl_val(modal, "عدد الفواتير") == "87"
    assert dl_val(modal, "النقدية المتوقعة في الدرج") == "1,740.50"
    assert modal.locator("#actual").input_value() == "1,740.50"
    modal.get_by_role("button", name="إغلاق الشفت وإصدار Z").click()
    expect(page.locator("div.fixed.inset-0.z-50")).to_have_count(0)


def t_shifts_history_table(page, base):
    goto(page, "/admin/shifts", "سجل الشفتات")
    # Z-2026-0115: 1,560.25 + 1,890.00 + 295.50 = 3,745.75 — فرق 2,055.25 − 2,060.25 = −5.00
    row = page.locator("tr", has_text="Z-2026-0115")
    expect(row).to_contain_text("3,745.75")
    expect(row).to_contain_text("487.35")
    expect(row).to_contain_text("-5.00")
    # Z-2026-0116: 2,120.00 + 2,615.75 + 388.00 = 5,123.75 — مطابق
    row = page.locator("tr", has_text="Z-2026-0116")
    expect(row).to_contain_text("5,123.75")
    expect(row).to_contain_text("666.31")
    expect(row).to_contain_text("مطابق")
    # Z-2026-0117: 1,840.50 + 2,310.00 + 402.25 = 4,552.75 — فرق −5.00
    row = page.locator("tr", has_text="Z-2026-0117")
    expect(row).to_contain_text("4,552.75")
    expect(row).to_contain_text("592.05")
    expect(row).to_contain_text("-5.00")


# ---------------- موبايل ----------------

def t_mobile_sale_flow(page, base):
    goto(page, "/pos/pin", "اختر اسمك وأدخل رمزك")
    assert_no_hscroll(page, "pos/pin")
    for d in "1234":
        page.get_by_role("button", name=d, exact=True).click()
    expect(page).to_have_url(re.compile(r"/pos$"))
    assert_no_hscroll(page, "pos")
    # إضافة سبانيش لاتيه: 87.00 + 18.00 = 105.00 → ضريبة 15.75 → 120.75
    page.get_by_role("button", name="سبانيش لاتيه").click()
    assert_cart_totals(page, SEED + [("سبانيش لاتيه", 18.0, 1)])
    # تعليق ثم استرجاع
    page.get_by_role("button", name="تعليق الطلب").click()
    expect(page).to_have_url(re.compile(r"/pos/held$"))
    assert_no_hscroll(page, "pos/held")
    li = page.locator("li", has_text="طلب الكاشير المعلّق")
    expect(li).to_contain_text("120.75")
    li.get_by_role("button", name="استرجاع إلى السلة").click()
    expect(page).to_have_url(re.compile(r"/pos$"))
    assert_cart_totals(page, SEED + [("سبانيش لاتيه", 18.0, 1)])
    # الدفع نقدي 200 ← الباقي 79.25
    page.get_by_role("link", name=re.compile("الدفع")).click()
    expect(page).to_have_url(re.compile(r"/pos/payment$"))
    assert_no_hscroll(page, "pos/payment")
    assert dl_val(page, "المتبقي المطلوب") == "20.75"  # الافتراضي 100
    page.get_by_role("button", name="200", exact=True).click()
    assert dl_val(page, "الباقي للعميل") == "79.25"
    page.get_by_role("button", name=re.compile("تأكيد الدفع")).click()
    expect(page.get_by_role("heading", name="تمت العملية بنجاح")).to_be_visible()
    expect(page.get_by_text("INV-2026-00501")).to_be_visible()
    expect(page.get_by_text("الباقي للعميل")).to_contain_text("79.25")
    assert_no_hscroll(page, "pos/payment — نجاح")


def t_mobile_shift_modals(page, base):
    goto(page, "/admin/shifts", "سجل الشفتات")
    assert_no_hscroll(page, "admin/shifts")
    page.get_by_role("button", name="فتح شفت جديد").click()
    modal = page.locator("div.fixed.inset-0.z-50")
    expect(modal.get_by_role("heading", name="فتح شفت جديد")).to_be_visible()
    box = modal.locator("div.max-w-md").bounding_box()
    assert box and box["width"] <= 375, f"مودال الفتح أعرض من الشاشة: {box}"
    modal.get_by_role("button", name="إلغاء").click()
    page.get_by_role("button", name="إغلاق الشفت وإصدار Z").click()
    expect(modal.get_by_role("heading", name="إغلاق الشفت — تقرير Z")).to_be_visible()
    box = modal.locator("div.max-w-lg").bounding_box()
    assert box and box["width"] <= 375, f"مودال الإغلاق أعرض من الشاشة: {box}"
    assert dl_val(modal, "النقدية المتوقعة في الدرج") == "1,740.50"
    modal.get_by_role("button", name="تراجع").click()
    expect(page.locator("div.fixed.inset-0.z-50")).to_have_count(0)


DESKTOP_TESTS = [
    t_pin_login,
    t_cart_initial_totals,
    t_add_product_keeps_search_focus,
    t_qty_controls,
    t_out_of_stock_disabled,
    t_search_and_category_filter,
    t_hold_and_restore_flow,
    t_held_seed_totals,
    t_payment_cash_full,
    t_payment_card,
    t_shift_open_modal,
    t_shift_close_z_report,
    t_shifts_history_table,
]

MOBILE_TESTS = [
    t_mobile_sale_flow,
    t_mobile_shift_modals,
]


def main() -> int:
    passed = failed = 0
    failures: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # تسخين: زيارة كل مسار مرة لتصرّيف وحداته في خادم التطوير قبل القياس
        warm = browser.new_context(viewport=VIEWPORTS["desktop"])
        wp = warm.new_page()
        for route in ["/pos", "/pos/pin", "/pos/held", "/pos/payment", "/admin/shifts"]:
            wp.goto(f"{BASE}{route}", wait_until="domcontentloaded")
            wp.wait_for_timeout(1500)
        warm.close()
        for vp_name, tests in (("desktop", DESKTOP_TESTS), ("mobile", MOBILE_TESTS)):
            for fn in tests:
                ctx = browser.new_context(viewport=VIEWPORTS[vp_name], locale="ar-SA")
                page = ctx.new_page()
                try:
                    fn(page, BASE)
                    passed += 1
                    print(f"PASS  [{vp_name:7}] {fn.__name__}")
                except Exception as e:  # noqa: BLE001
                    failed += 1
                    shot = ARTIFACTS / f"fail-{vp_name}-{fn.__name__}.png"
                    try:
                        page.screenshot(path=str(shot))
                    except Exception:
                        shot = None
                    msg = str(e).splitlines()[0] if str(e) else repr(e)
                    failures.append(f"[{vp_name}] {fn.__name__}: {msg}")
                    print(f"FAIL  [{vp_name:7}] {fn.__name__}: {msg}")
                    if shot:
                        print(f"      screenshot: {shot}")
                    traceback.print_exc(limit=2)
                finally:
                    ctx.close()
        browser.close()
    print(f"\n{'=' * 60}\n{passed} ناجح · {failed} فاشل من أصل {passed + failed}")
    if failures:
        print("\nالفشل:")
        for f in failures:
            print(f"  - {f}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
