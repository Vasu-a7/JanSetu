import { Link } from "@tanstack/react-router";
import { Home, LayoutDashboard, PlusCircle, User } from "lucide-react";

const linkClass =
  "flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] sm:text-xs font-semibold transition-colors shrink-0 overflow-hidden text-center";

const inactiveClass = `${linkClass} text-muted-foreground hover:bg-muted hover:text-foreground`;
const activeClass = `${linkClass} bg-primary/10 text-primary font-bold`;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-full border-t border-border bg-background/95 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1 backdrop-blur-lg shadow-xl overflow-hidden"
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-0.5 px-1 sm:px-3">
        <Link
          to="/"
          aria-label="Feed"
          className={`${linkClass} tour-feed`}
          activeOptions={{ exact: true }}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <Home className="size-4 sm:size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate w-full text-center">Feed</span>
        </Link>
        
        <Link
          to="/report"
          aria-label="Report an issue"
          className={`${linkClass} tour-report`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <PlusCircle className="size-4 sm:size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate w-full text-center">Report</span>
        </Link>
        
        <Link
          to="/workspace"
          aria-label="Open workspace"
          className={`${linkClass} tour-workspace`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <LayoutDashboard className="size-4 sm:size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate w-full text-center">Workspace</span>
        </Link>
        
        <Link
          to="/profile"
          aria-label="Profile"
          className={linkClass}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <User className="size-4 sm:size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate w-full text-center">Profile</span>
        </Link>
      </div>
    </nav>
  );
}