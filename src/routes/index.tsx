import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { FeedView } from "@/views/FeedView";
import { useState } from "react";
import { Award, Flame, Zap, Trophy, CheckCircle, Sparkles, PlusCircle, GraduationCap, Landmark, ShieldCheck, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
  const { user, profile, role } = useAuth();

  // Live formatted current date
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto max-w-6xl px-3.5 sm:px-5 pb-28 pt-4 sm:pt-8 lg:px-8 lg:pt-12 space-y-8 sm:space-y-10">
        {/* HERO SECTION */}
        <section className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-3.5" />
              {currentDateFormatted} • JanSetu Platform
            </div>
            <h1 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl leading-tight">
              Small actions.
              <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                Visible community change.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Welcome back, <strong className="text-foreground">{profile?.full_name || user?.email || "Citizen"}</strong>! Report local infrastructure issues with AI assistant, collaborate with university capstones, or track municipal resolution.
            </p>
          </div>

          {/* Interactive Civic Streak & Achievements Card */}
          <div
            onClick={() => setStreakModalOpen(true)}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 p-4 sm:p-6 text-primary-foreground shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-primary-foreground/80">
                  <Flame className="size-4 text-amber-300 animate-pulse" />
                  Your Civic Streak
                </p>
                <p className="mt-1 sm:mt-2 text-3xl sm:text-4xl font-bold tracking-tight">12 days</p>
              </div>
              <span className="rounded-xl bg-white/20 px-2.5 py-1 text-[11px] sm:text-xs font-semibold backdrop-blur-md shrink-0">
                Top 5% Active
              </span>
            </div>
            <div className="mt-4 sm:mt-5 h-2.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-3/4 rounded-full bg-amber-300 transition-all duration-500" />
            </div>
            <p className="mt-3 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-primary-foreground/80">
              <span>3 actions to Community Builder</span>
              <span className="underline group-hover:text-white font-medium">View Badges →</span>
            </p>
          </div>
        </section>

        {/* INTERACTIVE QUICK ACTION HUBS */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/report"
            className="group flex flex-col justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-all duration-200 hover:bg-primary/10 hover:border-primary/40 hover:shadow-md"
          >
            <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <PlusCircle className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Report Issue ✨
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Use AI assistant to structure civic reports</p>
            </div>
          </Link>

          <Link
            to="/workspace"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-md"
          >
            <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                University Hub
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Adopt capstones & academic research</p>
            </div>
          </Link>

          <Link
            to="/workspace"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
          >
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <Landmark className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                Govt Desk
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Official admin status & resolution</p>
            </div>
          </Link>

          <div
            onClick={() => setStreakModalOpen(true)}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-amber-500/40 hover:shadow-md cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-5" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors">
                Field Audit XP
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Verify site status & earn XP certificates</p>
            </div>
          </div>
        </section>

        {/* CIVIC IMPACT METRICS DASHBOARD */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Live Civic Impact Metrics
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time resolution updates across municipal districts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Data Synchronized
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reported Issues</p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">148</p>
              <p className="mt-1 text-[11px] font-medium text-emerald-600">+12 this week</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Resolution</p>
              <p className="mt-2 text-3xl font-extrabold text-primary">89%</p>
              <p className="mt-1 text-[11px] font-medium text-primary">Active workflow</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capstones Adopted</p>
              <p className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">34</p>
              <p className="mt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Academic projects</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volunteer Hours</p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">1,250+</p>
              <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">Verified audit XP</p>
            </div>
          </div>
        </section>

        {/* FEED VIEW */}
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
