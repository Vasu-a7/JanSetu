import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  LogOut,
  ShieldCheck,
  Bell,
  Globe,
  Eye,
  Lock,
  HelpCircle,
  Check,
  LogIn,
  FileText,
  UserCheck,
  Building2,
  Tag,
  MapPin,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import avatar from "@/assets/avatar.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — JanSetu (Connecting Citizens and Administration)" },
      {
        name: "description",
        content: "Manage your JanSetu profile, track reported community issues, and configure preferences.",
      },
      { property: "og:title", content: "Profile — JanSetu (Connecting Citizens and Administration)" },
      {
        property: "og:description",
        content: "Manage your JanSetu profile, track reported community issues, and configure preferences.",
      },
    ],
  }),
  component: ProfilePage,
});

type SettingKey =
  | "Notification Settings"
  | "Language & Regional Preferences"
  | "Accessibility Options"
  | "Privacy & Data Protection"
  | "Help & Community Guidelines"
  | null;

const settingsList: Array<{ label: SettingKey; icon: any }> = [
  { label: "Notification Settings", icon: Bell },
  { label: "Language & Regional Preferences", icon: Globe },
  { label: "Accessibility Options", icon: Eye },
  { label: "Privacy & Data Protection", icon: Lock },
  { label: "Help & Community Guidelines", icon: HelpCircle },
];

type Challenge = Tables<"challenges">;

function ProfilePage() {
  const { user, profile, role, signOut, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userReports, setUserReports] = useState<Challenge[]>([]);
  const [activeModal, setActiveModal] = useState<SettingKey>(null);

  // Settings State
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const [language, setLanguage] = useState("English");
  const [district, setDistrict] = useState("Ranchi");

  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState("Normal");

  const [anonReports, setAnonReports] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  useEffect(() => {
    async function loadUserReports() {
      if (user?.id) {
        try {
          // Fetch from Reported_data
          const { data: reportedData } = await supabase
            .from("reported_data")
            .select("*")
            .or(`user_id.eq.${user.id},reporter_id.eq.${user.id}`)
            .order("created_at", { ascending: false });

          if (reportedData && reportedData.length > 0) {
            setUserReports(
              reportedData.map((rd) => ({
                id: rd.id || "report-" + Date.now(),
                title: rd.title,
                description: rd.description,
                category: rd.category as any,
                status: (rd.status as any) || "open",
                location_text: rd.location_text || null,
                latitude: rd.latitude || null,
                longitude: rd.longitude || null,
                media_url: rd.media_url || null,
                reporter_id: rd.user_id || rd.reporter_id || user.id,
                created_at: rd.created_at || new Date().toISOString(),
                updated_at: rd.updated_at || new Date().toISOString(),
              }))
            );
            return;
          }
        } catch (err) {
          console.error("Failed to fetch user reports from Supabase:", err);
        }
      }

      // Fallback to local storage challenges
      try {
        const localData = JSON.parse(localStorage.getItem("jansetu_user_challenges") || "[]");
        setUserReports(localData);
      } catch (e) {
        setUserReports([]);
      }
    }

    loadUserReports();
  }, [user]);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("Successfully signed out of JanSetu");
    } catch (err) {
      toast.error("Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  }

  function handleSaveSettings() {
    toast.success(`${activeModal} updated successfully!`);
    setActiveModal(null);
  }

  function handleClearCache() {
    try {
      localStorage.removeItem("jansetu_user_challenges");
      toast.success("Local application cache cleared.");
      setUserReports([]);
      setActiveModal(null);
    } catch (e) {
      toast.error("Failed to clear cache");
    }
  }

  const displayName = profile?.full_name || user?.email || "Civic Contributor";
  const userRoleDisplay = role ? role.toUpperCase() : "CITIZEN";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <AppHeader title="Profile" />
      <main id="main" className="mx-auto max-w-md px-6 pb-32 pt-8">
        
        {/* LOGGED OUT STATE BANNER */}
        {!user && !isLoading && (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <UserCheck className="mx-auto size-10 text-primary mb-2" />
            <h2 className="text-lg font-bold text-foreground">Sign In to Save Your Reports</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Log in or register to link all your civic reports to your Supabase profile and track issue status in real-time.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/auth" search={{ mode: "signin" }} className="flex-1">
                <Button className="w-full text-xs font-semibold">
                  <LogIn className="size-3.5 mr-1.5" /> Sign In
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="flex-1">
                <Button variant="outline" className="w-full text-xs font-semibold">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* LOGGED IN USER PROFILE HEADER */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            {user ? (
              <div className="size-24 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center border-4 border-background shadow-md">
                {initials}
              </div>
            ) : (
              <img
                src={avatar}
                alt="JanSetu Civic Contributor"
                width={512}
                height={512}
                className="size-24 rounded-full object-cover outline-2 outline-primary/20"
              />
            )}
            <span className="absolute bottom-0 right-0 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
              <ShieldCheck className="size-4" />
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h1>
          
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
              {userRoleDisplay}
            </span>
            {profile?.organisation && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="size-3" /> {profile.organisation}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-xs text-xs text-muted-foreground">
            {user ? user.email : "Active community member working towards local infrastructure and public welfare."}
          </p>

          <div className="mt-6 flex w-full max-w-xs justify-around rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="text-center">
              <span className="block text-xl font-semibold text-foreground">12</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Streak Days
              </span>
            </div>
            <div className="h-8 w-px bg-border my-auto" />
            <div className="text-center">
              <span className="block text-xl font-semibold text-primary">{userReports.length}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Reports Filed
              </span>
            </div>
          </div>
        </div>

        {/* RECENT SUBMITTED REPORTS LIST */}
        {userReports.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-sm font-bold tracking-tight text-foreground mb-3 flex items-center gap-1.5">
              <FileText className="size-4 text-primary" /> My Submitted Issues ({userReports.length})
            </h2>
            <div className="space-y-3">
              {userReports.slice(0, 5).map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-primary inline-flex items-center gap-1">
                      <Tag className="size-3" /> {r.category}
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-bold capitalize">
                      {r.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-foreground">{r.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>
                  {r.location_text && (
                    <span className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> {r.location_text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS MENU */}
        <ul className="mt-8 space-y-1 border-t border-border pt-4">
          {settingsList.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setActiveModal(label)}
                className="flex min-h-12 w-full items-center justify-between border-b border-border py-4 text-left hover:bg-muted/40 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </li>
          ))}

          {user ? (
            <li>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className="flex min-h-12 w-full items-center justify-between border-b border-border py-4 text-left text-destructive hover:bg-destructive/10 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="size-4" />
                  <span className="text-sm font-semibold">
                    {isSigningOut ? "Signing Out..." : "Sign Out"}
                  </span>
                </div>
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </button>
            </li>
          ) : (
            <li>
              <Link
                to="/auth"
                className="flex min-h-12 w-full items-center justify-between border-b border-border py-4 text-left text-primary hover:bg-primary/10 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="size-4" />
                  <span className="text-sm font-semibold">Sign In / Register</span>
                </div>
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </Link>
            </li>
          )}
        </ul>
      </main>

      {/* Interactive Settings Dialog */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{activeModal}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Customize your preferences and app settings below.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-5">
            {/* Notification Settings */}
            {activeModal === "Notification Settings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive real-time alerts for issue updates</p>
                  </div>
                  <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Emergency Alerts</p>
                    <p className="text-xs text-muted-foreground">Urgent civic hazard notifications</p>
                  </div>
                  <Switch checked={emergencyAlerts} onCheckedChange={setEmergencyAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly Email Digest</p>
                    <p className="text-xs text-muted-foreground">Summary of resolved district projects</p>
                  </div>
                  <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
                </div>
              </div>
            )}

            {/* Language & Regional Preferences */}
            {activeModal === "Language & Regional Preferences" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    App Interface Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Primary District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Ranchi">Ranchi</option>
                    <option value="Dhanbad">Dhanbad</option>
                    <option value="Jamshedpur">Jamshedpur</option>
                    <option value="Hazaribagh">Hazaribagh</option>
                    <option value="Koderma">Koderma</option>
                  </select>
                </div>
              </div>
            )}

            {/* Accessibility Options */}
            {activeModal === "Accessibility Options" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">High Contrast Mode</p>
                    <p className="text-xs text-muted-foreground">Enhance visual readability</p>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Text Scaling</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Normal", "Large", "X-Large"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTextSize(size)}
                        className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                          textSize === size
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Data Protection */}
            {activeModal === "Privacy & Data Protection" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Anonymous Reporting</p>
                    <p className="text-xs text-muted-foreground">Hide your identity on submitted issues</p>
                  </div>
                  <Switch checked={anonReports} onCheckedChange={setAnonReports} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Location Services</p>
                    <p className="text-xs text-muted-foreground">Auto-attach GPS coords to reports</p>
                  </div>
                  <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
                </div>

                <div className="pt-2 border-t border-border">
                  <Button variant="destructive" className="w-full text-xs" onClick={handleClearCache}>
                    Clear Local Application Data
                  </Button>
                </div>
              </div>
            )}

            {/* Help & Community Guidelines */}
            {activeModal === "Help & Community Guidelines" && (
              <div className="space-y-3 text-xs leading-5 text-muted-foreground">
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="font-semibold text-foreground mb-1">Community Guidelines</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Report genuine civic concerns with verified locations.</li>
                    <li>Do not upload inappropriate media or personal information.</li>
                    <li>Respect municipal workers and community solvers.</li>
                  </ul>
                </div>
                <p>
                  Toll-free Civic Helpline: <strong className="text-foreground">1800-111-234</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              <Check className="size-4 mr-1" /> Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
