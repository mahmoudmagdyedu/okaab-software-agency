import { AuthenticateWithRedirectCallback } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";

import { ClerkBoundary } from "@/components/auth/ClerkBoundary";

export const Route = createFileRoute("/sso-callback")({
  head: () => ({
    meta: [
      { title: "إكمال تسجيل الدخول — عُقاب" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SsoCallbackPage,
});

function SsoCallbackPage() {
  return (
    <ClerkBoundary>
      <main
        dir="rtl"
        lang="ar"
        className="grid min-h-screen place-items-center bg-[#f8f2e6] px-4 text-[#171511]"
      >
        <div className="text-center">
          <img src="/logo-96.webp" alt="عُقاب" className="mx-auto mb-5 size-16 object-contain" />
          <LoaderCircle className="mx-auto mb-3 size-7 animate-spin text-[#E8A33D]" aria-hidden />
          <p className="font-bold">جارٍ إكمال تسجيل الدخول…</p>
        </div>
        <AuthenticateWithRedirectCallback />
      </main>
    </ClerkBoundary>
  );
}
