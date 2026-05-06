import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 gap-2">
        <Link to="/" className="flex items-center gap-2 group min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-soft transition-smooth group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base sm:text-xl font-semibold text-mauve truncate">Ruseva Nails Studio</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-2 text-xs sm:text-sm shrink-0">
          <Link to="/" className="px-2 sm:px-3 py-2 rounded-md hover:bg-secondary transition-smooth" activeOptions={{ exact: true }} activeProps={{ className: "px-2 sm:px-3 py-2 rounded-md bg-secondary text-mauve font-medium" }}>
            Начало
          </Link>
          <Link to="/specialists" className="px-2 sm:px-3 py-2 rounded-md hover:bg-secondary transition-smooth" activeProps={{ className: "px-2 sm:px-3 py-2 rounded-md bg-secondary text-mauve font-medium" }}>
            Специалисти
          </Link>
          <Link to="/admin" className="px-2 sm:px-3 py-2 rounded-md hover:bg-secondary transition-smooth text-muted-foreground" activeProps={{ className: "px-2 sm:px-3 py-2 rounded-md bg-secondary text-mauve font-medium" }}>
            Админ
          </Link>
        </nav>
      </div>
    </header>
  );
}
