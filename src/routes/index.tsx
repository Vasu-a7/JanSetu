import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { FeedView } from "@/views/FeedView";
import { useState } from "react";
import { Award, Flame, Zap, Trophy, CheckCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JanSetu — Connecting Citizens and Administration" },
      {
        name: "description",
        content: "Connecting Citizens and Administration to discover and resolve community issues.",
      },
      { property: "og:title", content: "JanSetu — Connecting Citizens and Administration" },
      {
        property: "og:description",
        content: "Connecting Citizens and Administration to discover and resolve community issues.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  // Live formatted current date
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-32 pt-8 lg:px-8 lg:pt-12">
        <section className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="size-3.5" />
              {currentDateFormatted}
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              Small actions.
              <br />
              <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                Visible change.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Find a challenge near you, lend your perspective, and help shape the places we share.
            </p>
          </div>

          {/* Interactive Civic Streak Card */}
          <div
            onClick={() => setStreakModalOpen(true)}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 p-6 text-primary-foreground shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/80">
                  <Flame className="size-4 text-amber-300 animate-pulse" />
                  Your civic streak
                </p>
                <p className="mt-2 text-4xl font-bold tracking-tight">12 days</p>
              </div>
              <span className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                +2 this week
              </span>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-3/4 rounded-full bg-amber-300 transition-all duration-500" />
            </div>
            <p className="mt-3 flex items-center justify-between text-xs text-primary-foreground/80">
              <span>3 actions to Community Builder</span>
              <span className="underline group-hover:text-white font-medium">View Badges →</span>
            </p>
          </div>
        </section>

        <FeedView />
      </main>

      {/* Streak & Achievements Modal */}
      <Dialog open={streakModalOpen} onOpenChange={setStreakModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Trophy className="size-6 text-amber-500" />
              Civic Streak & Badges
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You are on a 12-day streak! Keep reporting and upvoting local issues to unlock new badges.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-primary/10 p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Flame className="size-6 text-amber-300" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">12 Days Active</p>
                  <p className="text-xs text-muted-foreground">Top 5% active citizens in Ranchi</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Active Streak
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Unlocked Badges
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
                  <Award className="size-8 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Neighborhood Guard</p>
                    <p className="text-[10px] text-muted-foreground">Reported 5+ issues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
                  <Zap className="size-8 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Fast Reporter</p>
                    <p className="text-[10px] text-muted-foreground">AI verified report</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border p-4 bg-muted/40 text-xs leading-5">
              <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <CheckCircle className="size-4 text-emerald-600" /> Next Milestone: Community Builder
              </p>
              <p className="text-muted-foreground">
                Complete 3 more reports or upvotes this week to reach Tier 2 recognition on the municipal dashboard.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
