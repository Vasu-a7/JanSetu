import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/views/AuthView";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In & Register — JanSetu" },
      {
        name: "description",
        content: "Sign in or create an account on JanSetu Civic Commons.",
      },
    ],
  }),
  component: AuthRouteComponent,
});

function AuthRouteComponent() {
  const search = Route.useSearch() as { mode?: "signin" | "signup" | "forgot" };

  return <AuthView initialMode={search.mode || "signin"} />;
}

