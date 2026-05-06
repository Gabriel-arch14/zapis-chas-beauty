import { Sparkles, Phone, MapPin, Facebook } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3 text-mauve">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-display text-base">Ruseva Nails Studio</p>
              <p className="text-muted-foreground">Маникюр & Педикюр</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-mauve">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <a
              href="https://maps.google.com/?q=42.8712,25.3187"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              ул. „Христо Смирненски“ 17, Габрово
            </a>
          </div>
          <div className="flex flex-col gap-2 text-mauve">
            <a href="tel:+359878778293" className="flex items-center gap-3 hover:underline">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              087 877 8293
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:underline"
            >
              <Facebook className="h-5 w-5 text-primary shrink-0" />
              Ruseva Nails Studio
            </a>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center border-t border-border/60 pt-4">
          © {new Date().getFullYear()} Ruseva Nails Studio. Всички права запазени.
        </p>
      </div>
    </footer>
  );
}
