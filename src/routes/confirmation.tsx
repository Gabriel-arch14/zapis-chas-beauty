import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Mail, Home } from "lucide-react";
import { formatDateBG } from "@/lib/booking";

export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({
    specialist: (s.specialist as string) ?? "",
    service: (s.service as string) ?? "",
    date: (s.date as string) ?? "",
    time: (s.time as string) ?? "",
    name: (s.name as string) ?? "",
    duration: (s.duration as string) ?? "30",
  }),
  head: () => ({
    meta: [
      { title: "Резервацията е потвърдена — Запиши Час" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function buildGoogleCalendarUrl(opts: { title: string; details: string; date: string; time: string; duration: number }) {
  const start = new Date(`${opts.date}T${opts.time}:00`);
  const end = new Date(start.getTime() + opts.duration * 60_000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.details,
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function ConfirmationPage() {
  const { specialist, service, date, time, name, duration } = Route.useSearch();

  const calUrl = buildGoogleCalendarUrl({
    title: `${service} при ${specialist}`,
    details: `Резервация чрез Запиши Час за ${name}.`,
    date,
    time,
    duration: parseInt(duration, 10) || 30,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-20 max-w-2xl">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-in zoom-in duration-500">
            <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-display font-semibold text-mauve">
            Резервацията е потвърдена!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Благодарим Ви, {name || "клиент"}! Очакваме Ви.
          </p>
        </div>

        <div className="mt-10 rounded-2xl bg-card shadow-card border border-border/50 p-6 sm:p-8">
          <div className="space-y-3 text-sm sm:text-base">
            <Row label="Специалист" value={specialist} />
            <Row label="Услуга" value={service} />
            <Row label="Дата" value={date ? formatDateBG(date) : ""} />
            <Row label="Час" value={time} />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-secondary/70 p-4 text-sm text-mauve">
            <Mail className="h-5 w-5 mt-0.5 shrink-0" />
            <p>Ще получите имейл с потвърждение на посочения от Вас адрес.</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 rounded-full bg-gradient-primary hover:opacity-90">
              <a href={calUrl} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-4 w-4" /> Добави в Google Календар
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1 rounded-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" /> Към началото
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-mauve text-right">{value}</span>
    </div>
  );
}
