import { useEffect, useState } from "react";
import { ArrowRight, CircleDot, Eye, LoaderCircle, Landmark, MapPin, ShieldAlert, Lock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import AnalyticsView from "./AnalyticsView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BoardStatus = "open" | "under_review" | "active" | "resolved";
type Challenge = Tables<"challenges">;

const boardColumns: Array<{
  status: BoardStatus;
  label: string;
  description: string;
}> = [
  { status: "open", label: "Open", description: "Newly reported by the community" },
  { status: "under_review", label: "Under review", description: "Being assessed by team" },
  { status: "active", label: "Active", description: "Work currently underway" },
  { status: "resolved", label: "Resolved", description: "Successfully completed" },
];

const nextStatus: Partial<Record<BoardStatus, BoardStatus>> = {
  open: "under_review",
  under_review: "active",
  active: "resolved",
};

function formatStatus(status: BoardStatus) {
  if (status === "under_review") return "Under review";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function KanbanView() {
  const { user, isGovernment, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"kanban" | "analytics">("kanban");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadChallenges() {
      let remoteData: Challenge[] = [];
      try {
        let query = supabase.from("reported_data").select("*");
        if (user?.id) {
          query = query.or(`user_id.eq.${user.id},reporter_id.eq.${user.id}`);
        }

        const { data: reportedData } = await query.order("created_at", { ascending: false });

        if (reportedData && reportedData.length > 0) {
          remoteData = reportedData.map((rd) => ({
            id: rd.id || "report-" + Date.now(),
            title: rd.title,
            description: rd.description,
            category: rd.category,
            status: (rd.status as BoardStatus) || "open",
            location_text: rd.location_text || null,
            latitude: rd.latitude || null,
            longitude: rd.longitude || null,
            media_url: rd.media_url || null,
            reporter_id: rd.user_id || rd.reporter_id || user?.id || null,
            created_at: rd.created_at || new Date().toISOString(),
            updated_at: rd.updated_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error("Supabase fetch error", e);
      }

      if (!isCurrent) return;

      let localData: Challenge[] = [];
      if (typeof window !== "undefined") {
        try {
          const parsed = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
          if (user?.id) {
            localData = parsed.filter(
              (item: any) => item.reporter_id === user.id || item.user_id === user.id || !item.reporter_id
            );
          } else {
            localData = parsed;
          }
        } catch (_err) {
          localData = [];
        }
      }

      const defaultDemoItems: Challenge[] = [
        // OPEN COLUMN
        {
          id: "demo-jh-1",
          title: "Broken Streetlight & Dark Alley near Main Library",
          description: "Streetlights along 4th Avenue near Doranda College have been broken for two weeks, creating safety concerns for students returning home late.",
          category: "Street Lighting",
          status: "open",
          location_text: "Doranda, Ranchi District, Jharkhand",
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
          latitude: 23.3441,
          longitude: 85.3096,
          media_url: "photo_streetlight.jpg",
          reporter_id: "user-jh-101",
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-jh-3",
          title: "Severe Potholes & Storm Drainage Waterlogging",
          description: "Deep dangerous potholes on Bistupur main road and clogged stormwater drains causing severe traffic bottleneck during evening peak hours.",
          category: "Road Maintenance",
          status: "open",
          location_text: "Bistupur Main Market, Jamshedpur (East Singhbhum), Jharkhand",
          created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
          latitude: 22.8046,
          longitude: 86.2029,
          media_url: null,
          reporter_id: "user-jh-103",
          updated_at: new Date().toISOString(),
        },
        // UNDER REVIEW COLUMN
        {
          id: "demo-jh-2",
          title: "Drinking Water Pipeline Leakage & Contaminated Supply",
          description: "Main municipal water supply pipe damaged near Bank More junction, leading to muddy water contamination in household tap lines of Ward 14.",
          category: "Water Supply",
          status: "under_review",
          location_text: "Bank More, Dhanbad District, Jharkhand",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          latitude: 23.7957,
          longitude: 86.4304,
          media_url: "water_leak.jpg",
          reporter_id: "user-jh-102",
          updated_at: new Date().toISOString(),
        },
        // ACTIVE COLUMN
        {
          id: "demo-jh-4",
          title: "Community Health Center Staff & Emergency Supply Shortage",
          description: "Sub-divisional hospital requires immediate night duty medical staff and basic emergency medicine replenishment to manage seasonal patient volume.",
          category: "Healthcare",
          status: "active",
          location_text: "Matwari, Hazaribagh District, Jharkhand",
          created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          latitude: 23.9961,
          longitude: 85.3637,
          media_url: null,
          reporter_id: "user-jh-104",
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-jh-5",
          title: "Uncleared Waste Dump Near Temple Pilgrimage Route",
          description: "Municipal waste collection bin overflowing near Tower Chowk market area along temple route. Immediate sanitation and bin clearance required.",
          category: "Sanitation & Drainage",
          status: "active",
          location_text: "Tower Chowk, Deoghar District, Jharkhand",
          created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
          latitude: 24.4826,
          longitude: 86.6967,
          media_url: null,
          reporter_id: "user-jh-105",
          updated_at: new Date().toISOString(),
        },
        // RESOLVED COLUMN
        {
          id: "demo-jh-6",
          title: "Solar Streetlamp Installation & Public Park Restoration",
          description: "Successful installation of 20 high-efficiency solar LED streetlamps and boundary wall repairs completed in Sector 4 public park.",
          category: "Environment",
          status: "resolved",
          location_text: "Sector 4 City Park, Bokaro Steel City, Jharkhand",
          created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
          latitude: 23.6693,
          longitude: 86.1511,
          media_url: "solar_lamp.jpg",
          reporter_id: "user-jh-106",
          updated_at: new Date().toISOString(),
        },
      ];

      const combined = [...remoteData, ...localData, ...defaultDemoItems];

      const uniqueMap = new Map<string, Challenge>();
      combined.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      setChallenges(Array.from(uniqueMap.values()));
      setIsLoading(false);
    }

    void loadChallenges();

    return () => {
      isCurrent = false;
    };
  }, [user?.id]);

  async function moveChallenge(challenge: Challenge) {
    if (!isGovernment) {
      toast.error("Status modifications are strictly restricted to verified Government accounts.");
      return;
    }

    const targetStatus = nextStatus[challenge.status as BoardStatus];
    if (!targetStatus || updatingId) return;

    setErrorMessage(null);
    setUpdatingId(challenge.id);

    const updatedChallenge = { ...challenge, status: targetStatus };

    setChallenges((current) =>
      current.map((item) => (item.id === challenge.id ? updatedChallenge : item)),
    );

    // Save stage update to local storage safely
    if (typeof window !== "undefined") {
      try {
        const localData: Challenge[] = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
        const existsIndex = localData.findIndex((item) => item.id === challenge.id);
        if (existsIndex >= 0 && localData[existsIndex]) {
          localData[existsIndex]!.status = targetStatus;
        } else {
          localData.unshift(updatedChallenge);
        }
        localStorage.setItem("jansetu_user_challenges", JSON.stringify(localData));
      } catch (_err) {
        console.error("Local storage update error", _err);
      }
    }

    // Update reported_data in Supabase
    try {
      await supabase
        .from("reported_data")
        .update({ status: targetStatus })
        .eq("id", challenge.id);
    } catch (err) {
      console.error("Supabase update error", err);
    }

    setUpdatingId(null);
    toast.success(`Report status updated to ${formatStatus(targetStatus)}`);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-10">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Team workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Move community work forward.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Review incoming challenges and monitor government analytics across districts.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex shrink-0 rounded-xl bg-muted/50 p-1">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "kanban"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "analytics"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Govt Analytics
          </button>
        </div>
      </header>

      {/* Role Banner / Access Control Indicator */}
      {isGovernment ? (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
              <Landmark className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                Government Official Portal
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
                  Status Modification Access
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                You have administrative authority to update, advance, and resolve civic reports across districts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void switchRole("citizen")}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Lock className="size-3.5" />
            Switch to Citizen View (Demo)
          </button>
        </div>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-sm shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                Citizen Read-Only Workspace
                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
                  Modification Restricted
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Report status updates are strictly managed by verified Government Authorities. You can track progress below.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void switchRole("government")}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Landmark className="size-3.5" />
            Switch to Government View (Demo)
          </button>
        </div>
      )}

      {activeTab === "analytics" ? (
        <AnalyticsView />
      ) : (
        <>
          {errorMessage && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          )}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading workspace">
              {boardColumns.map((column) => (
                <div key={column.status} className="min-h-64 animate-pulse rounded-2xl bg-muted/60" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
              {boardColumns.map((column) => {
                const columnChallenges = challenges.filter(
                  (challenge) => challenge.status === column.status,
                );
                const targetStatus = nextStatus[column.status];

                return (
                  <section
                    key={column.status}
                    className="min-w-0 rounded-2xl border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3 px-2 pb-3">
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">{column.label}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">{column.description}</p>
                      </div>
                      <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {columnChallenges.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnChallenges.length === 0 && (
                        <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                          No challenges here yet.
                        </p>
                      )}
                      {columnChallenges.map((challenge) => (
                        <article
                          key={challenge.id}
                          className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                              {challenge.category}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              #{challenge.id.slice(-6)}
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold leading-5 text-card-foreground">
                            {challenge.title}
                          </h3>

                          {challenge.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {challenge.description}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedChallenge(challenge)}
                            className="inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                          >
                            <Eye className="size-3.5" aria-hidden />
                            View problem overview
                          </button>

                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                            <span className="truncate max-w-[150px]">📍 {challenge.location_text || "Ranchi"}</span>
                            <span>📅 {new Date(challenge.created_at || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                          </div>

                          {/* GOVERNMENT ONLY MODIFY ACTION */}
                          {isGovernment ? (
                            targetStatus ? (
                              <button
                                type="button"
                                onClick={() => void moveChallenge(challenge)}
                                disabled={updatingId !== null}
                                className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updatingId === challenge.id ? (
                                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
                                ) : (
                                  <ArrowRight className="size-3.5" aria-hidden />
                                )}
                                {updatingId === challenge.id
                                  ? "Moving..."
                                  : `Move to ${formatStatus(targetStatus)}`}
                              </button>
                            ) : (
                              <p className="mt-3 text-center text-xs font-medium text-emerald-600 bg-emerald-500/10 py-1.5 rounded-md border border-emerald-500/20">
                                ✓ Completed & Resolved
                              </p>
                            )
                          ) : (
                            <p className="mt-2 pt-2 border-t border-border/30 text-[11px] text-muted-foreground text-center italic">
                              Status: <strong className="text-foreground font-medium">{formatStatus(challenge.status as BoardStatus)}</strong> (Govt Managed)
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

      <Dialog
        open={selectedChallenge !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedChallenge(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          {selectedChallenge && (
            <>
              <DialogHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-left">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {selectedChallenge.category}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {formatStatus(selectedChallenge.status as BoardStatus)}
                  </span>
                </div>
                <DialogTitle className="text-left text-xl leading-7">
                  {selectedChallenge.title}
                </DialogTitle>
                <DialogDescription className="text-left">
                  Full report overview for government review.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Problem description
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {selectedChallenge.description || "No description was provided for this report."}
                  </p>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="mt-1 font-medium text-foreground">
                        {selectedChallenge.location_text || "Ranchi, Jharkhand"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                    <CircleDot className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="text-xs text-muted-foreground">Report ID</p>
                      <p className="mt-1 font-medium text-foreground">#{selectedChallenge.id.slice(-6)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Reported on {new Date(selectedChallenge.created_at || Date.now()).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}