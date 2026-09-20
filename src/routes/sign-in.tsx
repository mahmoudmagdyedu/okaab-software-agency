import { createFileRoute } from "@tanstack/react-router";
import { AuthExperience } from "@/components/auth/AuthExperience";
import { ClerkBoundary } from "@/components/auth/ClerkBoundary";
import { LearnerSignInForm } from "@/components/auth/LearnerAuthForms";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/sign-in")({
  component: Page,
});

function Page() {
  return (
    <ThemeProvider>
      <ClerkBoundary>
        <AuthExperience audience="learner">
          <LearnerSignInForm />
        </AuthExperience>
      </ClerkBoundary>
    </ThemeProvider>
  );
}
