import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StatusBadge, type AppointmentStatus } from "@/components/mawid/status-badge";
import { LetterAvatar } from "@/components/mawid/letter-avatar";
import { Stepper } from "@/components/mawid/stepper";
import { EmptyState } from "@/components/mawid/empty-state";
import { ErrorState } from "@/components/mawid/error-state";
import { InlineAlert } from "@/components/mawid/inline-alert";
import { MonoText } from "@/components/mawid/mono-text";
import { SlotChip } from "@/components/mawid/slot-chip";
import { AppointmentCard } from "@/components/mawid/appointment-card";
import { Can } from "@/components/mawid/can";

export const Route = createFileRoute("/ui-kit")({
  head: () => ({
    meta: [
      { title: "دليل المكوّنات — مَوعِد" },
      {
        name: "description",
        content: "صفحة داخلية تعرض مكوّنات مَوعِد وحالاتها للمقارنة مع صفحة Components في Figma.",
      },
      { property: "og:title", content: "دليل المكوّنات — مَوعِد" },
      {
        property: "og:description",
        content: "كل مكوّنات واجهة مَوعِد بحالاتها: افتراضي، تمرير، تركيز، معطّل، تحميل.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UiKitPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border pb-8">
      <h2 className="text-h2 text-foreground">{title}</h2>
      {children}
    </section>
  );
}

const STATUSES: AppointmentStatus[] = [
  "confirmed",
  "pending_deposit",
  "completed",
  "cancelled",
  "no_show",
];

function UiKitPage() {
  const [selectedSlot, setSelectedSlot] = useState("10:30");
  const [step, setStep] = useState(2);

  return (
    <TooltipProvider>
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
        <header className="space-y-2">
          <h1 className="text-display text-foreground">دليل المكوّنات — مَوعِد</h1>
          <p className="text-body text-muted-foreground">
            مرجع داخلي للمقارنة المباشرة مع صفحة Components في ملف Figma. كل الألوان من التوكنز، وكل
            الأرقام والأوقات بخط JetBrains Mono باتجاه LTR.
          </p>
        </header>

        <Section title="الأزرار">
          <div className="flex flex-wrap items-center gap-3">
            <Button>موعد جديد</Button>
            <Button variant="secondary">إلغاء</Button>
            <Button variant="ghost">تخطي</Button>
            <Button variant="destructive">حذف الموعد</Button>
            <Button disabled>معطّل</Button>
            <Button loading>جارٍ الحفظ</Button>
            <Button size="icon" aria-label="إضافة موعد">
              <CalendarPlus />
            </Button>
          </div>
          <p className="text-caption text-faint">
            ارتفاع كل الأزرار 40px على الأقل، وحالة التركيز بحلقة accent ظاهرة بلوحة المفاتيح.
          </p>
        </Section>

        <Section title="الحقول">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">اسم العميل</Label>
              <Input id="name" placeholder="محمود عبد الله" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الجوال</Label>
              <Input id="phone" className="mono-ltr" defaultValue="+201001234567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">الخدمة</Label>
              <Select>
                <SelectTrigger id="service">
                  <SelectValue placeholder="اختر الخدمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean">تنظيف الأسنان</SelectItem>
                  <SelectItem value="whitening">تبييض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">حقل معطّل</Label>
              <Input id="disabled" disabled placeholder="غير متاح" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="note">ملاحظة</Label>
              <Textarea id="note" placeholder="ملاحظة اختيارية للطبيب" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="active" defaultChecked />
              <Label htmlFor="active">الخدمة مفعّلة</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remind" defaultChecked />
              <Label htmlFor="remind">إرسال تذكير واتساب</Label>
            </div>
            <RadioGroup defaultValue="weekly" className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">أسبوعي</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">شهري</Label>
              </div>
            </RadioGroup>
          </div>
        </Section>

        <Section title="شارات حالة الموعد">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </Section>

        <Section title="الأحرف الأولى والأوقات">
          <div className="flex flex-wrap items-center gap-4">
            <LetterAvatar name="أحمد الشريف" size="sm" />
            <LetterAvatar name="سارة محمود" />
            <LetterAvatar name="خالد عبد العزيز" size="lg" />
            <MonoText className="text-body">10:30 – 11:00</MonoText>
            <MonoText className="text-body">250 ج.م</MonoText>
            <MonoText className="text-body">+201001234567</MonoText>
          </div>
        </Section>

        <Section title="شريط الخطوات">
          <Stepper
            steps={["الخدمة", "المقدم", "الوقت", "البيانات", "العربون", "التأكيد"]}
            current={step}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              السابق
            </Button>
            <Button variant="secondary" onClick={() => setStep((s) => Math.min(5, s + 1))}>
              التالي
            </Button>
          </div>
        </Section>

        <Section title="شرائح الأوقات وبطاقة الموعد">
          <div className="flex flex-wrap gap-2">
            {["09:00", "09:30", "10:00", "10:30", "11:00"].map((time) => (
              <SlotChip
                key={time}
                time={time}
                selected={selectedSlot === time}
                onClick={() => setSelectedSlot(time)}
              />
            ))}
            <SlotChip time="11:30" disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AppointmentCard
              startTime="10:30"
              endTime="11:00"
              customerName="محمود عبد الله"
              serviceName="تنظيف وتلميع الأسنان"
              status="confirmed"
              heightPx={64}
            />
            <AppointmentCard
              startTime="11:00"
              endTime="12:00"
              customerName="نورهان سعيد"
              serviceName="حشو تجميلي"
              status="pending_deposit"
              heightPx={128}
              dragging
            />
          </div>
        </Section>

        <Section title="التنبيهات والحالات">
          <div className="grid gap-3">
            <InlineAlert tone="info">وضع الاختبار مفعّل لبوابة الدفع.</InlineAlert>
            <InlineAlert tone="success">تم تأكيد الموعد وإرسال رسالة واتساب للعميل.</InlineAlert>
            <InlineAlert tone="warning">بانتظار سداد العربون خلال ساعتين.</InlineAlert>
            <InlineAlert tone="danger">
              للأسف حُجز هذا الموعد للتو من عميل آخر — اختر وقتًا آخر من المتاح
            </InlineAlert>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState
              title="لا توجد جداول بعد"
              hint="أضف أول مقدم خدمة لتظهر جداوله هنا"
              actionLabel="إضافة مقدم خدمة"
            />
            <ErrorState onRetry={() => undefined} />
          </div>
          <div className="space-y-3 rounded-md border border-border p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Section>

        <Section title="الطبقات: Popover و Drawer و Tooltip">
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary">إنشاء سريع</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 space-y-3">
                <Label htmlFor="quick-search">بحث عن عميل</Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-faint"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <Input id="quick-search" className="pe-9" placeholder="اسم أو رقم جوال" />
                </div>
                <Button className="w-full">حجز الموعد</Button>
              </PopoverContent>
            </Popover>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">فتح لوح الموعد</Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[420px] sm:max-w-[420px]">
                <SheetHeader>
                  <SheetTitle>تفاصيل الموعد</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <LetterAvatar name="محمود عبد الله" />
                    <div>
                      <p className="text-body font-medium">محمود عبد الله</p>
                      <MonoText className="text-body-sm text-muted-foreground">
                        +201001234567
                      </MonoText>
                    </div>
                  </div>
                  <InlineAlert tone="warning">
                    مدفوع <MonoText>100</MonoText> من <MonoText>250</MonoText> ج.م
                  </InlineAlert>
                  <div className="flex flex-wrap gap-2">
                    <Button>تأكيد</Button>
                    <Button variant="secondary">إعادة جدولة</Button>
                    <Button variant="secondary">تسجيل حضور</Button>
                    <Button variant="destructive">إلغاء</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">تلميح التعارض</Button>
              </TooltipTrigger>
              <TooltipContent>يتعارض مع موعد د. سارة الساعة 11:00</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Section title="التبويبات والجدول">
          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">اليوم</TabsTrigger>
              <TabsTrigger value="week">الأسبوع</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>الخدمة</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>العربون</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>محمود عبد الله</TableCell>
                    <TableCell>تنظيف الأسنان</TableCell>
                    <TableCell>
                      <MonoText>10:30</MonoText>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="confirmed" />
                    </TableCell>
                    <TableCell>
                      <MonoText>100 ج.م</MonoText>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>سلمى عادل</TableCell>
                    <TableCell>تبييض</TableCell>
                    <TableCell>
                      <MonoText>12:00</MonoText>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="pending_deposit" />
                    </TableCell>
                    <TableCell>
                      <MonoText>0 ج.م</MonoText>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="week" className="pt-4">
              <EmptyState title="لا مواعيد هذا الأسبوع" hint="ابدأ بإضافة موعد جديد من التقويم" />
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="التحكم بالصلاحيات">
          <div className="flex flex-wrap items-center gap-3">
            <Can role="owner" allow={["owner", "branch_manager"]}>
              <Button variant="secondary">إعدادات الفوترة (مرئية للمالك)</Button>
            </Can>
            <Can
              role="receptionist"
              allow={["owner"]}
              fallback={
                <p className="text-body-sm text-faint">
                  عنصر مخفي عن موظف الاستقبال — الفرض الحقيقي في سياسات قاعدة البيانات.
                </p>
              }
            >
              <Button>لن يظهر</Button>
            </Can>
          </div>
        </Section>
      </main>
    </TooltipProvider>
  );
}
