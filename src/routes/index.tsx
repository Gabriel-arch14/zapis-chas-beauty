import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calendar, MousePointerClick, Sparkles, Heart, MapPin, X, ExternalLink } from "lucide-react";

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2934.1!2d25.315322!3d42.872214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDUyJzE5LjkiTiAyNcKwMTgnNTUuMiJF!5e0!3m2!1sbg!2sbg!4v1620000000000!5m2!1sbg!2sbg";
const MAPS_LINK = "https://maps.google.com/?q=42.872214,25.315322";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Запиши Час — Онлайн резервации в салон за красота" },
      { name: "description", content: "Запишете час при любимия си специалист — маникюр, козметика, масаж. Бързо, лесно, без обаждания." },
      { property: "og:title", content: "Запиши Час" },
      { property: "og:description", content: "Онлайн резервации в салон за красота." },
    ],
  }),
  component: Index,
});

function Index() {
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMapOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mapOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />



      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

        <div className="container mx-auto px-4 py-20 sm:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur text-sm text-mauve shadow-soft mb-6 animate-in fade-in slide-in-from-bottom-2">
              <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
              Онлайн резервации за салони за красота
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-semibold text-mauve leading-tight animate-in fade-in slide-in-from-bottom-4">
              Запиши час при любимия<br />си специалист
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-6">
              Бързо, лесно, без телефонни обаждания.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="h-14 px-8 text-base shadow-glow bg-gradient-primary hover:opacity-90 transition-smooth rounded-full">
                <Link to="/specialists">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Запиши Час Сега
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-mauve">Как работи?</h2>
            <p className="mt-3 text-muted-foreground">Три прости стъпки до Вашата резервация</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MousePointerClick, step: "1", title: "Избери", desc: "Изберете специалист и услуга, която ви интересува." },
              { icon: Calendar, step: "2", title: "Запиши", desc: "Изберете удобни за вас дата и час." },
              { icon: Sparkles, step: "3", title: "Посети", desc: "Получете потвърждение и ни посетете в уговореното време." },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="group relative rounded-2xl bg-card p-8 shadow-card border border-border/50 transition-smooth hover:-translate-y-1 hover:shadow-glow"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-display font-semibold shadow-soft">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 text-primary mt-2 mb-4" />
                <h3 className="text-xl font-display font-semibold text-mauve">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-primary/40 hover:bg-primary/10 transition-smooth">
              <Link to="/specialists">Виж нашите специалисти</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
