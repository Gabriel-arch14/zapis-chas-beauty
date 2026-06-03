import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Mail, Home, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDateBG } from "@/lib/booking";
import { cancelBookingByToken } from "@/lib/cancellation.functions";

export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({
    specialist: (s.specialist as string) ?? "",
    service: (s.service as string) ?? "",
    date: (s.date as string) ?? "",
    time: (s.time as string) ?? "",
    name: (s.name as string) ?? "",
    duration: (s.duration as string) ?? "30",
    token: (s.token as string) ?? "",
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
  const { specialist, service, date, time, name, duration, token } = Route.useSearch();
  const cancelFn = useServerFn(cancelBookingByToken);
  const [cancelState, setCancelState] = useState<"idle" | "loading" | "done">("idle");

  const calUrl = buildGoogleCalendarUrl({
    title: `${service} при ${specialist}`,
    details: `Резервация чрез Запиши Час за ${name}.`,
    date,
    time,
    duration: parseInt(duration, 10) || 30,
  });

  const handleCancel = async () => {
    if (!token) {
      toast.error("Липсва токен за отмяна.");
      return;
    }
    if (!window.confirm("Сигурни ли сте, че искате да отмените резервацията? Този час ще се освободи.")) {
      return;
    }
    setCancelState("loading");
    try {
      await cancelFn({ data: { token } });
      setCancelState("done");
      toast.success("Резервацията е отменена. Часът е освободен.");
    } catch (e) {
      setCancelState("idle");
      toast.error(e instanceof Error ? e.message : "Възникна грешка при отмяната.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-20 max-w-2xl">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-in zoom-in duration-500">
            {cancelState === "done" ? (
              <XCircle className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
            ) : (
              <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
            )}
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-display font-semibold text-mauve">
            {cancelState === "done" ? "Резервацията е отменена" : "Резервацията е потвърдена!"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {cancelState === "done"
              ? "Часът е освободен и отново е достъпен за резервация."
              : `Благодарим Ви, ${name || "клиент"}! Очакваме Ви.`}
          </p>
        </div>

        <div className="mt-10 rounded-2xl bg-card shadow-card border border-border/50 p-6 sm:p-8">
          <div className="space-y-3 text-sm sm:text-base">
            <Row label="Специалист" value={specialist} />
            <Row label="Услуга" value={service} />
            <Row label="Дата" value={date ? formatDateBG(date) : ""} />
            <Row label="Час" value={time} />
          </div>

          {cancelState !== "done" && (
            <>
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-secondary/70 p-4 text-sm text-mauve">
                <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                <p>Ще получите имейл с потвърждение на посочения от Вас адрес.</p>
              </div>

              {token && (
                <Button
                  onClick={handleCancel}
                  disabled={cancelState === "loading"}
                  variant="outline"
                  className="mt-3 w-full rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {cancelState === "loading" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Отменяме…</>
                  ) : (
                    <><XCircle className="mr-2 h-4 w-4" />Отмени резервация</>
                  )}
                </Button>
              )}
            </>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {cancelState !== "done" && (
              <Button asChild className="flex-1 rounded-full bg-gradient-primary hover:opacity-90">
                <a href={calUrl} target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-4 w-4" /> Добави в Google Календар
                </a>
              </Button>
            )}
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
