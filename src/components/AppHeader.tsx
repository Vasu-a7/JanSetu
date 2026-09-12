import { Link } from "@tanstack/react-router";
import { Bell, Search, CheckCircle2, AlertCircle, X, LogIn } from "lucide-react";
import { useState } from "react";
import avatar from "@/assets/avatar.jpg";
import { useAuth } from "@/context/AuthContext";

export function AppHeader({ title }: { title?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, profile } = useAuth();

  const notifications = [
    {
      id: 1,
      title: "Issue Status Updated",
      message: "Broken Streetlight report moved to Active stage.",
      time: "10m ago",
      type: "update",
    },
    {
      id: 2,
      title: "New Civic Challenge",
      message: "Community clean-up drive announced in Morabadi.",
      time: "2h ago",
      type: "info",
    },
  ];

  const displayName = profile?.full_name || user?.email || "";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <img
            src="/logo.png"
            alt="JanSetu Logo"
            className="size-9 sm:size-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-foreground leading-tight">
              JanSetu
            </span>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight hidden sm:block">
              Connecting Citizens and Administration
            </span>
          </div>
        </Link>
        <div className="relative flex items-center gap-1.5 sm:gap-2">
          {searchOpen && (
            <input
              autoFocus
              type="search"
              placeholder="Search..."
              aria-label="Search challenges"
              className="h-9 sm:h-10 w-32 rounded-xl border border-border bg-card px-3 text-xs sm:text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2 sm:w-64"
            />
          )}
          <button
            type="button"
            aria-label="Search challenges"
            onClick={() => setSearchOpen((open) => !open)}
            className="grid size-9 sm:size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <Search className="size-4 sm:size-[18px]" strokeWidth={1.8} aria-hidden />
          </button>
          
          <div className="relative">
            <button
              type="button"
              aria-label="View notifications"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative grid size-9 sm:size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <Bell className="size-4 sm:size-[18px]" strokeWidth={1.8} aria-hidden />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500 ring-2 ring-background" />
            </button>

            {/* Notifications Dropdown Drawer */}
            {notifOpen && (
              <div className="absolute right-0 top-11 sm:top-12 z-50 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl border border-border bg-card p-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 rounded-xl bg-muted/40 p-2.5">
                      {n.type === "update" ? (
                        <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="size-4 text-primary mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/70 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <Link
              to="/profile"
              aria-label="Open your profile"
              className="flex items-center gap-2 rounded-full border border-border bg-muted p-1 pr-3 hover:bg-muted/80 transition-colors"
            >
              <div className="size-8 overflow-hidden rounded-full border border-border bg-primary text-primary-foreground font-semibold flex items-center justify-center text-xs">
                {initial || <img src={avatar} alt="" width={512} height={512} className="size-full object-cover" />}
              </div>
              <span className="text-xs font-semibold max-w-24 truncate hidden sm:inline">{displayName}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <LogIn className="size-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
