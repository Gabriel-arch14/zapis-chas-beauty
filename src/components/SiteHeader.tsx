import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const NAV_ITEMS: { label: string; to: string; hash?: string }[] = [
  { label: "Начало", to: "/" },
  { label: "Специалисти", to: "/specialists" },
  { label: "Галерия", to: "/", hash: "gallery" },
  { label: "Услуги", to: "/", hash: "services" },
  { label: "Контакти", to: "/", hash: "contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const goToHash = (hash: string) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate({ to: "/", hash });
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-3">
        <Link to="/" className="flex items-center gap-2.5 group min-w-0" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-border bg-card">
            <img src={logo} alt="Ruseva Nails Studio лого" className="h-full w-full object-cover" />
          </span>
          <span className="font-display text-base sm:text-lg font-semibold text-foreground truncate tracking-tight">
            Ruseva Nails Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV_ITEMS.map((item) =>
            item.hash ? (
              <button
                key={item.label}
                onClick={() => goToHash(item.hash!)}
                className="px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-secondary transition-smooth"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-secondary transition-smooth"
                activeOptions={item.to === "/" ? { exact: true } : undefined}
                activeProps={{ className: "px-3 py-2 rounded-md bg-secondary text-foreground font-medium" }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          aria-label={open ? "Затвори меню" : "Отвори меню"}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center border border-border bg-card"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            {NAV_ITEMS.map((item) =>
              item.hash ? (
                <button
                  key={item.label}
                  onClick={() => goToHash(item.hash!)}
                  className="text-left px-3 py-3 text-sm text-foreground/85 hover:bg-secondary border-b border-border/50 last:border-0"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-sm text-foreground/85 hover:bg-secondary border-b border-border/50 last:border-0"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
