import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Check, XCircle, AlertTriangle, Home, Loader2 } from "lucide-react";
import { cancelBookingByToken, type CancelledBooking } from "@/lib/cancellation.functions";
import { sendBookingEmail } from "@/lib/sendBookingEmail";
import { formatDateBG } from "@/lib/booking";

export const Route = createFileRoute("/cancel")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: (s.token as string) ?? "",
  }),
  head: () => ({
    meta: [
      { title: "Отказ на резервация — Ruseva Nails Studio" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CancelPage,
});

function CancelPage() {
  const { token } = Route.useSearch();
  const cancelFn = useServerFn(cancelBookingByToken);

  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [booking, setBooking] = useState<CancelledBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("Липсва токен в линка.");
    }
  }, [token]);

  const handleCancel = async () => {
    setState("loading");
    setError(null);
    try {
      const result = await cancelFn({ data: { token } });
      setBooking(result);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Възникна грешка.");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 sm:py-20 max-w-xl">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
          {state === "idle" && token && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full border border-border flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-foreground" />
              </div>
              <h1 className="mt-5 font-display text-2xl sm:text-3xl">Отказ на резервация</h1>
              <p className="mt-3 text-muted-foreground">
                Сигурни ли сте, че искате да откажете тази резервация? Това действие не може да бъде отменено.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleCancel} className="rounded-none bg-foreground text-background hover:opacity-90">
                  Да, откажи резервацията
                </Button>
                <Button asChild variant="outline" className="rounded-none">
                  <Link to="/">Назад към сайта</Link>
                </Button>
              </div>
            </>
          )}

          {state === "loading" && (
            <div className="py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Обработваме вашата заявка…</p>
            </div>
          )}

          {state === "done" && booking && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full border border-border flex items-center justify-center">
                <Check className="h-8 w-8 text-foreground" strokeWidth={2.5} />
              </div>
              <h1 className="mt-5 font-display text-2xl sm:text-3xl">
                {booking.was_already_cancelled ? "Резервацията вече е отказана" : "Резервацията е отказана"}
              </h1>
              <p className="mt-3 text-muted-foreground">
                Благодарим, че ни уведомихте. С нетърпение очакваме да ви видим друг път.
              </p>
              <div className="mt-6 text-left rounded-xl border border-border bg-secondary/40 p-5 text-sm space-y-2">
                {booking.specialist_name && (
                  <Row label="Специалист" value={booking.specialist_name} />
                )}
                {booking.service_name && <Row label="Услуга" value={booking.service_name} />}
                <Row label="Дата" value={formatDateBG(booking.booking_date)} />
                <Row label="Час" value={booking.booking_time.slice(0, 5)} />
                <Row label="Статус" value="Отказана" />
              </div>
              <Button asChild className="mt-6 rounded-none bg-foreground text-background hover:opacity-90">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" /> Към началото
                </Link>
              </Button>
            </>
          )}

          {state === "error" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full border border-border flex items-center justify-center">
                <XCircle className="h-8 w-8 text-foreground" />
              </div>
              <h1 className="mt-5 font-display text-2xl sm:text-3xl">Не успяхме да откажем резервацията</h1>
              <p className="mt-3 text-muted-foreground">{error}</p>
              <Button asChild variant="outline" className="mt-6 rounded-none">
                <Link to="/">Към началото</Link>
              </Button>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
