import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/specialists")({
  head: () => ({
    meta: [
      { title: "Нашите специалисти — Запиши Час" },
      { name: "description", content: "Запознайте се с нашите професионалисти и запазете час онлайн." },
      { property: "og:title", content: "Нашите специалисти" },
      { property: "og:description", content: "Изберете специалист и запишете час онлайн." },
    ],
  }),
  component: SpecialistsPage,
});

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  photo_url: string | null;
}

function SpecialistsPage() {
  const [list, setList] = useState<Specialist[] | null>(null);

  useEffect(() => {
    supabase.from("specialists").select("id,name,specialty,bio,photo_url").order("name").then(({ data }) => {
      setList(data ?? []);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-semibold text-mauve">Нашите специалисти</h1>
          <p className="mt-3 text-muted-foreground">Изберете специалист и запазете удобен за вас час.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {list === null
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)
            : list.map((s) => (
                <article
                  key={s.id}
                  className="group rounded-2xl overflow-hidden bg-card shadow-card border border-border/50 transition-smooth hover:-translate-y-1 hover:shadow-glow flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt={s.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-soft" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-mauve shadow-soft">
                      {s.specialty}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-display font-semibold text-mauve">{s.name}</h2>
                    {s.bio && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{s.bio}</p>}
                    <Button asChild className="mt-5 w-full bg-gradient-primary hover:opacity-90 transition-smooth rounded-full">
                      <Link to="/book/$specialistId" params={{ specialistId: s.id }}>
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Запази Час
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
        </div>

        {list?.length === 0 && (
          <p className="text-center text-muted-foreground mt-12">Няма налични специалисти в момента.</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
