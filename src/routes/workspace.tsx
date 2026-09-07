import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { KanbanView } from "@/views/WorkspaceView";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "Solver Workspace — JanSetu (Connecting Citizens and Administration)" }] }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Workspace access karne ke liye pehle login karein.");
      navigate({ to: "/auth", search: { mode: "signin" } });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <>
        <AppHeader title="Workspace" />
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <AppHeader title="Workspace" />
      <main id="main" className="pb-24">
        <KanbanView />
      </main>
    </>
  );
}
