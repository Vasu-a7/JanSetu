import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { ReportView } from "@/views/ReportView";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Report an Issue — JanSetu (Connecting Citizens and Administration)" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Issue report karne ke liye pehle login karein.");
      navigate({ to: "/auth", search: { mode: "signin" } });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <>
        <AppHeader title="Report an Issue" />
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
      <AppHeader title="Report an Issue" />
      <main id="main" className="pb-24">
        <ReportView />
      </main>
    </>
  );
}
