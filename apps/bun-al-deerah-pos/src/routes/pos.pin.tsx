import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Delete, Fingerprint } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { employees } from "../lib/data";

export const Route = createFileRoute("/pos/pin")({
  head: () => ({
    meta: [
      { title: "الدخول برمز PIN — فوترة" },
      {
        name: "description",
        content: "دخول سريع لشاشة الكاشير برمز PIN — سطح داكن مستقل.",
      },
      { property: "og:title", content: "الدخول برمز PIN — فوترة" },
      {
        property: "og:description",
        content: "دخول سريع لشاشة الكاشير برمز PIN.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PinLogin,
});

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

const cashiers = employees.filter((e) => ["كاشير", "مشرف فرع"].includes(e.role));

function PinLogin() {
  const [employeeId, setEmployeeId] = useState(cashiers[1]!.id);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const press = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      // رمز العرض التجريبي الصحيح: 1234
      if (next === "1234") {
        void navigate({ to: "/pos" });
      } else {
        setError(true);
        setTimeout(() => setPin(""), 450);
      }
    }
  };

  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 py-10 text-text-primary">
      <BrandLogo inverse className="justify-center" />
      <h1 className="sr-only">مقهى بُنّ الديرة</h1>
      <p className="mt-1 text-body-sm text-text-secondary">
        الرياض — حي النرجس · اختر اسمك وأدخل رمزك
      </p>

      <div className="mt-6 flex gap-2">
        {cashiers.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              setEmployeeId(e.id);
              setPin("");
              setError(false);
            }}
            className={`flex h-12 items-center gap-2 rounded-md px-4 text-body-sm font-medium transition-colors ${focusRing} ${
              employeeId === e.id
                ? "bg-primary text-primary-foreground"
                : "border border-border-subtle bg-bg-overlay text-text-secondary hover:text-text-primary"
            }`}
          >
            {e.name}
            <span className="text-caption opacity-70">{e.role}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3" aria-label="خانات الرمز">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 transition-colors ${
              error
                ? "border-error bg-error"
                : i < pin.length
                  ? "border-accent-400 bg-accent-400"
                  : "border-border-subtle"
            }`}
          />
        ))}
      </div>
      <p
        className={`mt-3 h-5 text-body-sm font-medium ${error ? "text-error" : "text-text-muted"}`}
        role="status"
      >
        {error ? "الرمز غير صحيح — أعد المحاولة" : "أدخل رمز PIN المكوّن من ٤ خانات"}
      </p>

      <div className="mt-4 grid w-full max-w-[320px] grid-cols-3 gap-3" dir="ltr">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((k) =>
          k === "" ? (
            <span key="empty" />
          ) : k === "del" ? (
            <button
              key="del"
              aria-label="مسح آخر خانة"
              onClick={() => setPin((p) => p.slice(0, -1))}
              className={`flex h-16 items-center justify-center rounded-md border border-border-subtle bg-bg-overlay text-text-secondary transition-colors hover:text-text-primary ${focusRing}`}
            >
              <Delete className="h-5 w-5" />
            </button>
          ) : (
            <button
              key={k}
              onClick={() => press(k)}
              className={`num h-16 rounded-md border border-border-subtle bg-bg-overlay text-h2 font-semibold text-text-primary transition-colors hover:bg-bg-subtle active:bg-bg-base ${focusRing}`}
            >
              {k}
            </button>
          ),
        )}
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-caption text-text-muted">
        <Fingerprint className="h-3.5 w-3.5" />
        رمز العرض التجريبي: <span className="num font-semibold">1234</span>
      </p>
    </div>
  );
}
