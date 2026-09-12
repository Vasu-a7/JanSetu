import { useEffect, useMemo, useState } from "react";
import { Search, X, Filter, MapPin, Tag, ThumbsUp, Share2, UserPlus, Navigation, Calendar, Sparkles, GraduationCap, Award, ShieldCheck } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { challengeCategories } from "@/lib/geminiAI";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CapstoneProposalModal } from "@/components/CapstoneProposalModal";
import { FieldVerificationModal } from "@/components/FieldVerificationModal";

type Challenge = Tables<"challenges">;

const statusStyles: Record<Challenge["status"], string> = {
  open: "bg-emerald-100 text-emerald-800 border-emerald-200",
  assigned: "bg-sky-100 text-sky-800 border-sky-200",
  under_review: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-indigo-100 text-indigo-800 border-indigo-200",
  resolved: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatStatus(status: Challenge["status"]) {
  return status.replaceAll("_", " ");
}

function ChallengeCard({
  challenge,
  upvoteCount,
  isUpvoted,
  onUpvote,
  onSelect,
  onCapstone,
  onAudit,
}: {
  challenge: Challenge;
  upvoteCount: number;
  isUpvoted: boolean;
  onUpvote: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onCapstone: (e: React.MouseEvent) => void;
  onAudit: (e: React.MouseEvent) => void;
}) {
  return (
    <article
      onClick={onSelect}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer w-full max-w-full overflow-hidden break-words"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-primary truncate max-w-[160px] sm:max-w-none">
            <Tag className="size-3 shrink-0" />
            <span className="truncate">{challenge.category}</span>
          </span>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold capitalize ${statusStyles[challenge.status]}`}
          >
            {formatStatus(challenge.status)}
          </span>
        </div>

        <h2 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold tracking-tight text-card-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
          {challenge.title}
        </h2>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-muted-foreground line-clamp-3 break-words">
          {challenge.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground truncate">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span className="truncate">{challenge.location_text ?? "Location to be confirmed"}</span>
        </p>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onCapstone}
            title="Adopt as Academic Capstone"
            className="p-1.5 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
          >
            <GraduationCap className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onAudit}
            title="Student Field Audit Verification"
            className="p-1.5 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-emerald-600 hover:border-emerald-500/40 transition-colors"
          >
            <ShieldCheck className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onUpvote}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              isUpvoted
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary"
            }`}
          >
            <ThumbsUp className={`size-3.5 ${isUpvoted ? "fill-current" : ""}`} />
            <span>{upvoteCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function ChallengeCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-5">
      <div className="h-6 w-24 rounded-full bg-muted" />
      <div className="mt-5 h-6 w-3/4 rounded bg-muted" />
      <div className="mt-3 h-4 w-full rounded bg-muted" />
      <div className="mt-2 h-4 w-5/6 rounded bg-muted" />
      <div className="mt-5 h-4 w-32 rounded bg-muted" />
    </div>
  );
}

const INITIAL_DEMO_CHALLENGES: Challenge[] = [
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

export function FeedView() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upvote State
  const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>({});
  const [userUpvoted, setUserUpvoted] = useState<Record<string, boolean>>({});

  // Selected challenge for details modal
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isVolunteered, setIsVolunteered] = useState<Record<string, boolean>>({});
  const [isCapstoneModalOpen, setIsCapstoneModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  useEffect(() => {
    let isCurrent = true;

    async function loadChallenges() {
      let remoteData: Challenge[] = [];
      try {
        const { data: reportedData } = await supabase
          .from("reported_data")
          .select("*")
          .order("created_at", { ascending: false });

        if (reportedData && reportedData.length > 0) {
          remoteData = reportedData.map((rd) => ({
            id: rd.id || "report-" + Date.now(),
            title: rd.title,
            description: rd.description,
            category: rd.category as any,
            status: (rd.status as any) || "open",
            location_text: rd.location_text || null,
            latitude: rd.latitude || null,
            longitude: rd.longitude || null,
            media_url: rd.media_url || null,
            reporter_id: rd.user_id || rd.reporter_id || null,
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
          localData = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
        } catch (_err) {
          localData = [];
        }
      }

      const combined = [...remoteData, ...localData, ...INITIAL_DEMO_CHALLENGES];

      const uniqueMap = new Map<string, Challenge>();
      combined.forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      const items = Array.from(uniqueMap.values());

      // Initialize sample upvotes counts
      const initialCounts: Record<string, number> = {};
      items.forEach((item, index) => {
        initialCounts[item.id] = 14 + (index * 7) % 23;
      });

      setUpvoteCounts(initialCounts);
      setChallenges(items);
      setIsLoading(false);
    }

    void loadChallenges();

    return () => {
      isCurrent = false;
    };
  }, []);

  function handleUpvote(challengeId: string, event?: React.MouseEvent) {
    if (event) event.stopPropagation();

    const currentlyUpvoted = !!userUpvoted[challengeId];
    setUserUpvoted((prev) => ({ ...prev, [challengeId]: !currentlyUpvoted }));
    setUpvoteCounts((prev) => ({
      ...prev,
      [challengeId]: (prev[challengeId] || 0) + (currentlyUpvoted ? -1 : 1),
    }));

    toast.success(currentlyUpvoted ? "Upvote removed" : "Challenge endorsed!");
  }

  function handleVolunteer(challengeId: string) {
    const nextState = !isVolunteered[challengeId];
    setIsVolunteered((prev) => ({ ...prev, [challengeId]: nextState }));
    toast.success(nextState ? "Joined as a community volunteer!" : "Volunteer registration updated");
  }

  function handleShare(challenge: Challenge) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } else {
      toast.info(`Sharing "${challenge.title}"`);
    }
  }

  // Filtered challenges logic
  const filteredChallenges = useMemo(() => {
    return challenges.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location_text && item.location_text.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "All" || item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [challenges, searchQuery, selectedCategory, selectedStatus]);

  function handleResetFilters() {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedStatus("All");
  }

  const availableCategories = useMemo(() => {
    const catsFromChallenges = challenges.map((c) => c.category).filter(Boolean);
    const uniqueSet = new Set(catsFromChallenges);
    return Array.from(uniqueSet);
  }, [challenges]);

  return (
    <section className="mx-auto w-full max-w-5xl max-w-full overflow-x-hidden px-0 sm:px-5 py-6 sm:py-10">
      <header className="mb-6 sm:mb-8 px-1 sm:px-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Community feed
        </p>
        <h1 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Current challenges
        </h1>
        <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-5 sm:leading-6 text-muted-foreground">
          See what your community is working on and find a way to contribute.
        </p>
      </header>

      {/* Search Bar & Status Filter */}
      <div className="mb-6 space-y-4 max-w-full overflow-x-hidden px-1 sm:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges by title, keyword, or district..."
              className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
            >
              <option value="All">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="w-full max-w-full overflow-x-auto flex items-center gap-1.5 pb-1.5 no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              selectedCategory === "All"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Categories ({challenges.length})
          </button>
          {availableCategories.map((cat) => {
            const count = challenges.filter((c) => c.category?.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2" aria-label="Loading challenges">
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && challenges.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <h2 className="font-semibold text-foreground">No challenges yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New community challenges will appear here.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && challenges.length > 0 && filteredChallenges.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <h2 className="font-semibold text-foreground">No matching challenges found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search query or filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            Reset Filters
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && filteredChallenges.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              upvoteCount={upvoteCounts[challenge.id] || 0}
              isUpvoted={!!userUpvoted[challenge.id]}
              onUpvote={(e) => handleUpvote(challenge.id, e)}
              onSelect={() => setSelectedChallenge(challenge)}
              onCapstone={(e) => {
                e.stopPropagation();
                setSelectedChallenge(challenge);
                setIsCapstoneModalOpen(true);
              }}
              onAudit={(e) => {
                e.stopPropagation();
                setSelectedChallenge(challenge);
                setIsVerificationModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Challenge Details Modal */}
      <Dialog open={selectedChallenge !== null} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
        {selectedChallenge && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Tag className="size-3" />
                  {selectedChallenge.category}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[selectedChallenge.status]}`}
                >
                  {formatStatus(selectedChallenge.status)}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {selectedChallenge.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="size-3.5 text-primary" />
                {selectedChallenge.location_text || "District Location"}
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-4 text-sm text-foreground">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Issue Description
                </h4>
                <p className="leading-6 text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border">
                  {selectedChallenge.description}
                </p>
              </div>

              {/* Interactive Resolution Roadmap */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Resolution Roadmap
                </h4>
                <div className="grid grid-cols-4 gap-1 text-center bg-muted/40 p-2 rounded-xl border border-border">
                  <div className="flex flex-col items-center">
                    <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
                    <span className="text-[10px] font-semibold mt-1">Reported</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`size-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      selectedChallenge.status !== "open" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"
                    }`}>2</span>
                    <span className="text-[10px] font-semibold mt-1">Reviewed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`size-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      selectedChallenge.status === "active" || selectedChallenge.status === "resolved" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"
                    }`}>3</span>
                    <span className="text-[10px] font-semibold mt-1">Assigned</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`size-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      selectedChallenge.status === "resolved" ? "bg-emerald-600 text-white" : "bg-muted-foreground/30 text-muted-foreground"
                    }`}>4</span>
                    <span className="text-[10px] font-semibold mt-1">Resolved</span>
                  </div>
                </div>
              </div>

              {selectedChallenge.latitude && selectedChallenge.longitude && (
                <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 border border-primary/20 text-xs">
                  <Navigation className="size-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">Captured GPS Coordinates: </span>
                    <span className="font-mono text-muted-foreground">
                      {selectedChallenge.latitude.toFixed(4)}, {selectedChallenge.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant={userUpvoted[selectedChallenge.id] ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleUpvote(selectedChallenge.id)}
                  >
                    <ThumbsUp className="size-4" />
                    {userUpvoted[selectedChallenge.id] ? "Endorsed" : "Endorse Issue"} (
                    {upvoteCounts[selectedChallenge.id] || 0})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground"
                    onClick={() => handleShare(selectedChallenge)}
                  >
                    <Share2 className="size-4" /> Share
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setIsCapstoneModalOpen(true)}
                >
                  <GraduationCap className="size-4 text-primary" />
                  Adopt as Capstone
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                  onClick={() => setIsVerificationModalOpen(true)}
                >
                  <ShieldCheck className="size-4 text-emerald-600" />
                  Field Audit Verification
                </Button>
              </div>

              <Button
                variant={isVolunteered[selectedChallenge.id] ? "secondary" : "default"}
                className="w-full gap-2"
                onClick={() => handleVolunteer(selectedChallenge.id)}
              >
                <UserPlus className="size-4" />
                {isVolunteered[selectedChallenge.id]
                  ? "✓ Registered as Volunteer"
                  : "Volunteer for Initiative"}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <CapstoneProposalModal
        isOpen={isCapstoneModalOpen}
        onClose={() => setIsCapstoneModalOpen(false)}
        challenge={selectedChallenge}
      />

      <FieldVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        challenge={selectedChallenge}
      />
    </section>
  );
}
