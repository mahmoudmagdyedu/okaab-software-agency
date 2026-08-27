import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { ClerkBoundary } from "@/components/auth/ClerkBoundary";

export const Route = createFileRoute("/sign-up/$")({
  component: Page,
});

function Page() {
  return (
    <ClerkBoundary>
      <div className="flex min-h-screen items-center justify-center">
        <SignUp />
      </div>
    </ClerkBoundary>
  );
}
