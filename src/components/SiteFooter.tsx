import { Link } from "@tanstack/react-router";
import { Sparkles, Phone, MapPin, Facebook } from "lucide-react";

const MAPS_LINK = "https://maps.google.com/?q=ул.Христо+Смирненски+17,Габрово";
const FB_LINK = "https://www.facebook.com/profile.php?id=100082830309797";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-12 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3 text-foreground">
            <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-display text-base">Ruseva Nails Studio</p>
              <p className="text-muted-foreground">Маникюр & Педикюр</p>
            </div>
          </div>
          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 text-foreground hover:text-gold transition-smooth"
          >
            <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>ул. „Христо Смирненски" 17, Габрово 5302</span>
          </a>
          <div className="flex flex-col gap-2 text-foreground">
            <a href="tel:0878778293" className="flex items-center gap-3 hover:text-gold transition-smooth">
              <Phone className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              087 877 8293
            </a>
            <a
              href={FB_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-gold transition-smooth"
            >
              <Facebook className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              Ruseva Nails Studio
            </a>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Ruseva Nails Studio. Всички права запазени.</p>
          <Link to="/admin" className="hover:text-foreground transition-smooth">
            Админ вход
          </Link>
        </div>
      </div>
    </footer>
  );
}


const MAPS_LINK = "https://maps.google.com/?q=ул.Христо+Смирненски+17,Габрово";
const FB_LINK = "https://www.facebook.com/profile.php?id=100082830309797";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3 text-foreground">
            <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-display text-base">Ruseva Nails Studio</p>
              <p className="text-muted-foreground">Маникюр & Педикюр</p>
            </div>
          </div>
          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 text-foreground hover:text-gold transition-smooth"
          >
            <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>ул. „Христо Смирненски" 17, Габрово 5302</span>
          </a>
          <div className="flex flex-col gap-2 text-foreground">
            <a href="tel:0878778293" className="flex items-center gap-3 hover:text-gold transition-smooth">
              <Phone className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              087 877 8293
            </a>
            <a
              href={FB_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:text-gold transition-smooth"
            >
              <Facebook className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              Ruseva Nails Studio
            </a>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center border-t border-border pt-4">
          © {new Date().getFullYear()} Ruseva Nails Studio. Всички права запазени.
        </p>
      </div>
    </footer>
  );
}
