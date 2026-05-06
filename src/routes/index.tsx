import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calendar, MousePointerClick, Sparkles, Heart, MapPin, X, ExternalLink, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ADDRESS = 'ул. "Христо Смирненски" 17, Габрово';
const MAP_SRC =
  "https://www.google.com/maps?q=42.8712,25.3187&z=16&output=embed";
const MAPS_LINK = "https://maps.google.com/?q=42.8712,25.3187";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruseva Nails Studio — Маникюр и педикюр в Габрово" },
      { name: "description", content: "Професионален маникюр и педикюр в сърцето на Габрово. Запишете час онлайн — бързо и лесно!" },
      { property: "og:title", content: "Ruseva Nails Studio" },
      { property: "og:description", content: "Професионален маникюр и педикюр в сърцето на Габрово." },
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

      {/* Reviews */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-mauve">Какво казват клиентите ни</h2>
            <p className="mt-3 text-muted-foreground">Реални отзиви от доволни клиенти</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: "Мария К.", text: "Страхотна услуга! Записах се за 2 минути и всичко беше перфектно организирано." },
              { name: "Елена Д.", text: "Най-накрая онлайн записване! Спестява ми толкова много време." },
              { name: "Петя С.", text: "Много удобно и лесно. Получих имейл потвърждение веднага." },
              { name: "Ивана М.", text: "Препоръчвам на всички! Бързо, лесно и без обаждания по телефона." },
              { name: "Симона Г.", text: "Използвам го всеки месец. Никога повече без онлайн записване!" },
            ].map((r) => (
              <div key={r.name} className="rounded-2xl bg-card p-6 shadow-card border border-primary/15 transition-smooth hover:-translate-y-1 hover:shadow-glow">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-mauve/90 italic">"{r.text}"</p>
                <p className="mt-4 font-display font-semibold text-mauve">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-mauve">Често задавани въпроси</h2>
            <p className="mt-3 text-muted-foreground">Намерете отговор на най-често срещаните въпроси</p>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl bg-card border border-primary/15 shadow-card px-6">
            {[
              { q: "Как да запиша час?", a: "Натиснете 'Запиши Час Сега', изберете специалист, услуга, дата и час, попълнете данните си и потвърдете. Получавате имейл потвърждение веднага." },
              { q: "Мога ли да отменя записания час?", a: "Да, можете да се свържете с нас най-малко 24 часа преди записания час." },
              { q: "Ще получа ли потвърждение?", a: "Да, веднага след записването ще получите имейл с всички детайли на вашия час." },
              { q: "За кой период мога да записвам?", a: "Записванията са отворени само за текущия месец. В началото на всеки месец се отварят нови часове." },
              { q: "Трябва ли да плащам онлайн?", a: "Не, плащането се извършва на място при посещението." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-primary/10">
                <AccordionTrigger className="text-mauve font-medium text-left hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Map / Location */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-secondary/40 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-mauve">Къде ни намерите?</h2>
            <p className="mt-3 text-muted-foreground">ул. Възраждане 4, Габрово</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              aria-label="Отвори картата на цял екран"
              className="group relative block w-full overflow-hidden rounded-2xl shadow-card border border-primary/20 transition-smooth hover:shadow-glow hover:-translate-y-0.5"
              style={{ borderRadius: "16px" }}
            >
              <iframe
                src={MAP_SRC}
                title="Карта — ул. Възраждане 4, Габрово"
                className="w-full pointer-events-none"
                style={{ height: "300px", border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-smooth" />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-xs text-mauve shadow-soft">
                <ExternalLink className="h-3.5 w-3.5" /> Кликни за уголемяване
              </span>
            </button>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-card p-5 border border-border/60 shadow-soft">
              <div className="flex items-center gap-3 text-mauve">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <span className="font-medium">ул. Възраждане 4, Габрово</span>
              </div>
              <Button asChild className="rounded-full bg-gradient-primary hover:opacity-90 transition-smooth">
                <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Отвори в Google Maps
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {mapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in"
          onClick={() => setMapOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setMapOpen(false)}
            aria-label="Затвори картата"
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-mauve shadow-glow hover:bg-primary hover:text-primary-foreground transition-smooth"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="w-full h-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-glow border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={MAP_SRC}
              title="Карта — ул. Възраждане 4, Габрово (увеличена)"
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
