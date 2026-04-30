import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary shadow-soft transition-smooth group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-xl font-semibold text-mauve">Запиши Час</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link to="/" className="px-3 py-2 rounded-md hover:bg-secondary transition-smooth" activeOptions={{ exact: true }} activeProps={{ className: "px-3 py-2 rounded-md bg-secondary text-mauve font-medium" }}>
            Начало
          </Link>
          <Link to="/specialists" className="px-3 py-2 rounded-md hover:bg-secondary transition-smooth" activeProps={{ className: "px-3 py-2 rounded-md bg-secondary text-mauve font-medium" }}>
            Специалисти
          </Link>
          <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-secondary transition-smooth text-muted-foreground" activeProps={{ className: "px-3 py-2 rounded-md bg-secondary text-mauve font-medium" }}>
            Админ
          </Link>
        </nav>
      </div>
    </header>
  );
}
