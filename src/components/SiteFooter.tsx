import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-display text-base text-mauve">Запиши Час</span>
        </div>
        <p>© {new Date().getFullYear()} Запиши Час. Всички права запазени.</p>
      </div>
    </footer>
  );
}
