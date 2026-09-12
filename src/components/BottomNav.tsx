import { Link } from "@tanstack/react-router";
import { Home, LayoutDashboard, PlusCircle, User } from "lucide-react";

const linkClass =
  "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] sm:text-xs font-semibold transition-colors";

const inactiveClass = `${linkClass} text-muted-foreground hover:bg-muted hover:text-foreground`;
const activeClass = `${linkClass} bg-primary/10 text-primary font-bold`;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-1.5 backdrop-blur-lg shadow-lg"
    >
      <div className="mx-auto flex max-w-md items-center gap-1 px-2">
        <Link
          to="/"
          aria-label="Feed"
          className={`${linkClass} tour-feed`}
          activeOptions={{ exact: true }}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <Home className="size-5" strokeWidth={1.75} aria-hidden />
          <span>Feed</span>
        </Link>
        
        <Link
          to="/report"
          aria-label="Report an issue"
          className={`${linkClass} tour-report`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <PlusCircle className="size-5" strokeWidth={1.75} aria-hidden />
          <span>Report Issue</span>
        </Link>
        
        <Link
          to="/workspace"
          aria-label="Open workspace"
          className={`${linkClass} tour-workspace`}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <LayoutDashboard className="size-5" strokeWidth={1.75} aria-hidden />
          <span>Workspace</span>
        </Link>
        
        <Link
          to="/profile"
          aria-label="Profile"
          className={linkClass}
          activeProps={{ className: activeClass }}
          inactiveProps={{ className: inactiveClass }}
        >
          <User className="size-5" strokeWidth={1.75} aria-hidden />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}