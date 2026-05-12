import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  Sparkles,
  MapPin,
  X,
  ExternalLink,
  Star,
  Quote,
  ShieldCheck,
  Gem,
  Heart,
  CheckCircle2,
  ArrowRight,
  Phone,
  Facebook,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";
import gallery3 from "@/assets/gallery-3.png";

const GALLERY_IMAGES = [
  { src: gallery1, alt: "Маникюр със сребърен арт дизайн" },
  { src: gallery2, alt: "Класически френски маникюр със златни акценти" },
  { src: gallery3, alt: "Нежен розов френски маникюр" },
  { src: gallery1, alt: "Nail art с метални детайли" },
  { src: gallery2, alt: "Елегантен френски маникюр" },
  { src: gallery3, alt: "Овален маникюр с фини линии" },
];

const ADDRESS = 'ул. "Христо Смирненски" 17, Габрово';
const MAP_SRC = "https://www.google.com/maps?q=ул.+Христо+Смирненски+17,+Габрово+5302&z=18&output=embed";
const MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=%D1%83%D0%BB.+%D0%A5%D1%80%D0%B8%D1%81%D1%82%D0%BE+%D0%A1%D0%BC%D0%B8%D1%80%D0%BD%D0%B5%D0%BD%D1%81%D0%BA%D0%B8+17%2C+%D0%93%D0%B0%D0%B1%D1%80%D0%BE%D0%B2%D0%BE+5302";
const FB_LINK = "https://www.facebook.com/profile.php?id=100082830309797";

const SERVICES = [
  { name: "Маникюр", desc: "Класическа грижа за нокти и кутикули", price: "от 15 лв. / 7.67 €" },
  { name: "Педикюр", desc: "Цялостна обработка на стъпала и нокти", price: "от 30 лв. / 15.34 €" },
  { name: "Гел лак", desc: "Дълготраен и блестящ цвят за до 3 седмици", price: "от 20 лв. / 10.23 €" },
  { name: "Изграждане", desc: "Удължаване и оформяне с гел или акрил", price: "от 40 лв. / 20.45 €" },
  { name: "Декорации", desc: "Nail art, камъчета, фолио, ръчно рисуване", price: "от 5 лв. / 2.56 €" },
  { name: "Сваляне", desc: "Деликатно премахване на гел лак или изграждане", price: "от 10 лв. / 5.11 €" },
];

const PERKS = [
  { icon: Sparkles, title: "Лесно онлайн записване", desc: "Резервирайте час за минута, без обаждания." },
  { icon: Gem, title: "Внимание към детайла", desc: "Всеки нокът — изпипан с прецизност и вкус." },
  { icon: ShieldCheck, title: "Качествени материали", desc: "Работим само с професионални марки и стерилни инструменти." },
  { icon: MapPin, title: "Удобна локация", desc: "В сърцето на Габрово, лесно достъпно място." },
];

const REVIEWS = [
  { name: "Мария К.", text: "Невероятно прецизна работа и приятна атмосфера. Винаги излизам с усмивка." },
  { name: "Елена Д.", text: "Първото студио, в което се чувствам наистина глезена. Маникюрът ми издържа повече от 3 седмици." },
  { name: "Петя С.", text: "Внимание към детайла и истински професионализъм. Препоръчвам на всички!" },
  { name: "Ивана М.", text: "Чисто, спокойно, премиум — точно както трябва да изглежда едно nails студио." },
  { name: "Симона Г.", text: "Записването онлайн е страхотно удобство. А резултатът — всеки път перфектен." },
  { name: "Габриела Т.", text: "Най-доброто място в Габрово за маникюр и педикюр. Преоткрих какво е грижа." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruseva Nails Studio — Маникюр и педикюр в Габрово" },
      {
        name: "description",
        content:
          "Премиум маникюр, педикюр и nail art в Габрово. Внимание към детайла, качествени материали и удобно онлайн записване.",
      },
      { property: "og:title", content: "Ruseva Nails Studio" },
      {
        property: "og:description",
        content: "Премиум маникюр и педикюр в сърцето на Габрово.",
      },
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

  // Smooth scroll if URL contains a hash on load
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-background border-b border-border overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-card text-xs uppercase tracking-[0.18em] text-muted-foreground mb-6">
                <span className="h-1 w-1 rounded-full bg-gold" />
                Nails studio · Габрово
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-foreground leading-[1.05] tracking-tight">
                Ruseva Nails<br />Studio
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Премиум маникюр, педикюр и nail art с внимание към всеки детайл. Запишете час онлайн — бързо, лесно и удобно.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3">
                <Button asChild size="lg" className="h-14 text-base px-8 rounded-none w-full sm:w-auto bg-foreground text-background hover:bg-foreground/85">
                  <Link to="/specialists">
                    Запиши час сега
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 rounded-none w-full sm:w-auto border-border bg-background text-foreground hover:bg-secondary"
                >
                  <a href="#gallery">Виж галерия</a>
                </Button>
              </div>
              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Лесно онлайн записване
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Професионална грижа
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Габрово
                </span>
              </div>
            </div>

            {/* Visual collage */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-10">
                  <img src={gallery1} alt="Nail art" loading="eager" fetchPriority="high" decoding="async" className="w-full h-56 object-cover border border-border" />
                  <img src={gallery3} alt="Френски маникюр" loading="eager" fetchPriority="high" decoding="async" className="w-full h-72 object-cover border border-border" />
                </div>
                <div className="space-y-4">
                  <img src={gallery2} alt="Маникюр" loading="eager" fetchPriority="high" decoding="async" className="w-full h-72 object-cover border border-border" />
                  <img src={gallery1} alt="Маникюр детайл" loading="lazy" decoding="async" className="w-full h-56 object-cover border border-border" />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border border-border px-5 py-3 text-xs uppercase tracking-[0.15em] text-foreground">
                Premium care
              </div>
            </div>

            {/* Mobile single image */}
            <div className="lg:hidden">
              <img src={gallery2} alt="Маникюр в Ruseva Nails Studio" loading="eager" fetchPriority="high" decoding="async" className="w-full h-72 object-cover border border-border" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 sm:py-24 border-b border-border bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Галерия</p>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">Избери своята визия</h2>
            <p className="mt-3 text-muted-foreground">Разгледайте част от нашите маникюр и педикюр визии</p>
          </div>

          <div
            className="group/marquee relative overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            }}
          >
            <div className="flex gap-5 sm:gap-6 w-max animate-marquee group-hover/marquee:[animation-play-state:paused]">
              {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((img, i) => (
                <figure
                  key={i}
                  className="shrink-0 overflow-hidden rounded-md border border-border bg-card transition-smooth hover:-translate-y-1 hover:shadow-card"
                  style={{ width: i % 3 === 1 ? "320px" : i % 3 === 2 ? "260px" : "290px" }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="h-64 sm:h-72 w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* Services */}
      <section id="services" className="py-20 sm:py-24 bg-secondary/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Услуги</p>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">Услуги и цени</h2>
            <p className="mt-3 text-muted-foreground">Подбрани процедури за безупречен резултат</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border max-w-5xl mx-auto border border-border">
            {SERVICES.map((s) => (
              <div key={s.name} className="bg-card p-6 sm:p-7 transition-smooth hover:bg-background">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-display text-xl text-foreground">{s.name}</h3>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{s.price}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-none h-12 px-8 bg-foreground text-background hover:bg-foreground/85">
              <Link to="/specialists">
                Запази час
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <img src={gallery3} alt="Атмосфера в студиото" loading="lazy" decoding="async" className="w-full h-80 lg:h-[420px] object-cover border border-border" />
            </div>
            <div className="lg:col-span-3 order-1 lg:order-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">За студиото</p>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground leading-tight">
                Спокойствие, естетика<br />и истинска грижа.
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Ruseva Nails Studio е място, създадено с любов към детайла. Тук всеки клиент получава внимание,
                професионална грижа и резултат, който носи увереност. Работим със сертифицирани материали,
                стерилни инструменти и поддържаме спокойна, премиум атмосфера.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Вярваме, че красивите нокти не са лукс, а малка ежедневна грижа за себе си.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { v: "5+", l: "години опит" },
                  { v: "100%", l: "хигиена" },
                  { v: "★★★★★", l: "оценки" },
                ].map((s) => (
                  <div key={s.l} className="border border-border bg-card px-3 py-4 text-center">
                    <p className="font-display text-lg text-foreground">{s.v}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 sm:py-24 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Защо нас</p>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">Защо да изберете нас</h2>
            <p className="mt-3 text-muted-foreground">Малки детайли, които правят голяма разлика</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {PERKS.map((p) => (
              <div key={p.title} className="bg-card border border-border p-7 transition-smooth hover:-translate-y-0.5 hover:shadow-card">
                <p.icon className="h-6 w-6 text-gold mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Отзиви</p>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">Какво казват клиентите</h2>
            <p className="mt-3 text-muted-foreground">Истински думи от истински хора</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="bg-card p-7 border border-border transition-smooth hover:-translate-y-0.5 hover:shadow-card relative">
                <Quote className="absolute top-5 right-5 h-5 w-5 text-border" strokeWidth={1.5} />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-gold" fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="text-foreground/85 text-[15px] leading-relaxed">"{r.text}"</blockquote>
                <figcaption className="mt-5 pt-4 border-t border-border/70 font-display text-sm text-foreground">
                  — {r.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">Често задавани въпроси</h2>
            <p className="mt-3 text-muted-foreground">Отговорите на най-често срещаните въпроси</p>
          </div>
          <Accordion type="single" collapsible className="bg-card border border-border divide-y divide-border">
            {[
              { q: "Как да запиша час?", a: "Натиснете бутона „Запиши час сега“, изберете специалист, услуга, дата и час, попълнете данните си и потвърдете. Получавате имейл потвърждение веднага." },
              { q: "Мога ли да отменя записания час?", a: "Да. Свържете се с нас най-малко 24 часа преди записания час, за да освободите слота." },
              { q: "Ще получа ли потвърждение?", a: "Да, веднага след записването получавате имейл с всички детайли на резервацията." },
              { q: "За кой период мога да записвам?", a: "Записванията са отворени за текущия и следващия месец. Часовете се обновяват редовно." },
              { q: "Трябва ли да плащам онлайн?", a: "Не. Плащането се извършва на място — в брой или с карта." },
              { q: "Какви материали използвате?", a: "Работим само с професионални марки и стерилизирани инструменти за всеки клиент." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-0 px-6">
                <AccordionTrigger className="text-foreground font-medium text-left hover:no-underline py-5 text-[15px]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Map / Location */}
      <section id="contact" className="py-20 sm:py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Локация</p>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">Къде ни намерите</h2>
            <p className="mt-3 text-muted-foreground">Намираме се на удобно място в Габрово.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              aria-label="Отвори картата на цял екран"
              className="group relative block w-full overflow-hidden border border-border transition-smooth hover:shadow-card"
            >
              <iframe
                src={MAP_SRC}
                title={`Карта — ${ADDRESS}`}
                className="w-full pointer-events-none"
                style={{ height: "320px", border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 text-xs text-foreground">
                <ExternalLink className="h-3.5 w-3.5" /> Кликни за уголемяване
              </span>
            </button>

            <div className="mt-6 grid sm:grid-cols-3 gap-px bg-border border border-border">
              <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="bg-card p-5 flex items-start gap-3 hover:bg-background transition-smooth">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Адрес</p>
                  <p className="text-foreground mt-1">{ADDRESS}</p>
                </div>
              </a>
              <a href="tel:0878778293" className="bg-card p-5 flex items-start gap-3 hover:bg-background transition-smooth">
                <Phone className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Телефон</p>
                  <p className="text-foreground mt-1">087 877 8293</p>
                </div>
              </a>
              <a href={FB_LINK} target="_blank" rel="noopener noreferrer" className="bg-card p-5 flex items-start gap-3 hover:bg-background transition-smooth">
                <Facebook className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Facebook</p>
                  <p className="text-foreground mt-1">Ruseva Nails Studio</p>
                </div>
              </a>
            </div>

            <div className="text-center mt-6">
              <Button asChild variant="outline" className="rounded-none h-11 px-6 border-border">
                <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Отвори в Google Maps
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Heart className="h-6 w-6 text-gold mx-auto mb-5" strokeWidth={1.5} />
          <h2 className="text-3xl sm:text-4xl font-display font-semibold leading-tight">
            Готови ли сте за своята нова визия?
          </h2>
          <p className="mt-4 text-background/70">Запишете час онлайн бързо и лесно.</p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-none h-14 text-base px-8 bg-background text-foreground hover:bg-background/90">
              <Link to="/specialists">
                Запиши час сега
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
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
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center bg-white text-foreground border border-border hover:bg-secondary transition-smooth"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-full h-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={MAP_SRC}
              title={`Карта — ${ADDRESS} (увеличена)`}
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
