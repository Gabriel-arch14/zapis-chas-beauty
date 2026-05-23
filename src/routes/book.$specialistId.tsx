import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendBookingWebhooks } from "@/server/webhooks.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatBGN, toDateKey, normalizeTime, formatDateBG } from "@/lib/booking";
import { Check, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PhoneInput } from "@/components/PhoneInput";
import { isValidPhoneNumber } from "libphonenumber-js";

export const Route = createFileRoute("/book/$specialistId")({
  head: () => ({
    meta: [
      { title: "Запиши час — Запиши Час" },
      { name: "description", content: "Изберете услуга, дата и час за вашата резервация." },
    ],
  }),
  component: BookPage,
});

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  photo_url: string | null;
  working_hours: { start: string; end: string };
}
interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

const clientSchema = z.object({
  client_name: z.string().trim().min(2, "Името е задължително").max(100),
  client_email: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Невалиден имейл",
    }),
  client_phone: z
    .string()
    .trim()
    .min(6, "Телефонът е задължителен")
    .max(30)
    .refine((v) => isValidPhoneNumber(v.replace(/\s+/g, "")), {
      message: "Невалиден телефонен номер",
    }),
});

function BookPage() {
  const { specialistId } = Route.useParams();
  const navigate = useNavigate();

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [client, setClient] = useState({ client_name: "", client_email: "", client_phone: "+359" });
  const [submitting, setSubmitting] = useState(false);

  // Load specialist + services
  useEffect(() => {
    supabase
      .from("specialists")
      .select("id,name,specialty,photo_url,working_hours")
      .eq("id", specialistId)
      .maybeSingle()
      .then(({ data }) => setSpecialist(data as Specialist | null));
    supabase
      .from("services")
      .select("id,name,duration_minutes,price")
      .eq("specialist_id", specialistId)
      .order("price")
      .then(({ data }) => setServices((data ?? []) as Service[]));

    // Load full-day blocked dates (where blocked_time is null)
    supabase
      .from("blocked_slots")
      .select("blocked_date,blocked_time")
      .eq("specialist_id", specialistId)
      .is("blocked_time", null)
      .then(({ data }) => {
        setBlockedDates(new Set((data ?? []).map((r: { blocked_date: string }) => r.blocked_date)));
      });
  }, [specialistId]);

  // Load available slots for the selected date from available_slots table
  useEffect(() => {
    if (!date) return;
    const key = toDateKey(date);
    setLoadingSlots(true);
    setAvailableTimes(null);
    supabase
      .from("available_slots")
      .select("slot_time")
      .eq("slot_date", key)
      .eq("is_available", true)
      .order("slot_time")
      .then(({ data }) => {
        let times = (data ?? []).map((r: { slot_time: string }) => normalizeTime(r.slot_time));
        // dedupe
        times = Array.from(new Set(times));
        // If selected date is today (in Europe/Sofia), filter out past times
        const nowParts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Sofia",
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", hour12: false,
        }).formatToParts(new Date());
        const get = (t: string) => nowParts.find((p) => p.type === t)?.value ?? "";
        const todayKeyBG = `${get("year")}-${get("month")}-${get("day")}`;
        if (key === todayKeyBG) {
          const nowMinutes = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
          times = times.filter((t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m > nowMinutes;
          });
        }
        setAvailableTimes(times);
        setLoadingSlots(false);
      });
  }, [date]);

  const selectedService = services.find((s) => s.id === serviceId);

  const handleSubmit = async () => {
    const parsed = clientSchema.safeParse(client);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!serviceId || !date || !time) {
      toast.error("Моля, попълнете всички стъпки.");
      return;
    }
    setSubmitting(true);
    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        specialist_id: specialistId,
        service_id: serviceId,
        booking_date: toDateKey(date),
        booking_time: time,
        ...parsed.data,
        status: "confirmed",
      })
      .select("id,cancel_token")
      .single();
    setSubmitting(false);
    if (error || !inserted) {
      toast.error(error?.code === "23505" ? "Този час вече е зает. Моля, изберете друг." : "Възникна грешка. Опитайте отново.");
      return;
    }
    // Mark the slot as no longer available
    await supabase
      .from("available_slots")
      .update({ is_available: false })
      .eq("slot_date", toDateKey(date))
      .eq("slot_time", time);
    const cancelUrl = `${window.location.origin}/cancel?token=${inserted.cancel_token}`;
    sendBookingWebhooks({
      data: {
        booking_id: inserted.id,
        cancel_url: cancelUrl,
        client_name: parsed.data.client_name,
        client_email: parsed.data.client_email,
        client_phone: parsed.data.client_phone,
        specialist_name: specialist?.name ?? "",
        service_name: selectedService?.name ?? "",
        booking_date: toDateKey(date),
        booking_time: time,
      },
    }).catch((e: unknown) => console.error("Webhook dispatch failed:", e));
    const params = new URLSearchParams({
      specialist: specialist?.name ?? "",
      service: selectedService?.name ?? "",
      date: toDateKey(date),
      time,
      name: parsed.data.client_name,
      duration: String(selectedService?.duration_minutes ?? 30),
    });
    navigate({ to: "/confirmation", search: Object.fromEntries(params) as any });
  };

  if (!specialist) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Skeleton className="h-32 w-full max-w-3xl mx-auto rounded-2xl" />
        </main>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const canNext = (step === 1 && serviceId) || (step === 2 && date) || (step === 3 && time);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* Specialist header */}
        <div className="rounded-2xl bg-card shadow-card border border-border/50 p-5 flex items-center gap-4 mb-6">
          {specialist.photo_url && (
            <img src={specialist.photo_url} alt={specialist.name} className="h-16 w-16 rounded-full object-cover" />
          )}
          <div>
            <h1 className="font-display text-xl font-semibold text-mauve">{specialist.name}</h1>
            <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
          </div>
        </div>

        {/* Stepper */}
        <ol className="flex items-center justify-between mb-8 text-xs sm:text-sm">
          {["Услуга", "Дата", "Час", "Данни"].map((label, idx) => {
            const num = idx + 1;
            const active = step === num;
            const done = step > num;
            return (
              <li key={label} className="flex-1 flex items-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-smooth shrink-0",
                  done ? "bg-primary border-primary text-primary-foreground" : active ? "border-primary text-mauve bg-white" : "border-border text-muted-foreground bg-white"
                )}>
                  {done ? <Check className="h-4 w-4" /> : num}
                </div>
                <span className={cn("ml-2 hidden sm:inline", active ? "font-medium text-mauve" : "text-muted-foreground")}>{label}</span>
                {num < 4 && <div className={cn("flex-1 h-px mx-2", done ? "bg-primary" : "bg-border")} />}
              </li>
            );
          })}
        </ol>

        <section className="rounded-2xl bg-card shadow-card border border-border/50 p-6 sm:p-8 min-h-[400px]">
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl text-mauve mb-4">Изберете услуга</h2>
              <div className="grid gap-3">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setServiceId(svc.id)}
                    className={cn(
                      "text-left rounded-xl border-2 p-4 transition-smooth hover:border-primary/60",
                      serviceId === svc.id ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-white"
                    )}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-medium text-mauve">{svc.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5" /> {svc.duration_minutes} мин.
                        </p>
                      </div>
                      <span className="font-display font-semibold text-mauve">{formatBGN(svc.price)}</span>
                    </div>
                  </button>
                ))}
                {services.length === 0 && <p className="text-muted-foreground">Няма налични услуги.</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl text-mauve mb-4">Изберете дата</h2>
              <p className="text-sm text-muted-foreground mb-4 text-center">Записванията са отворени само за текущия месец</p>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => { setDate(d); setTime(null); }}
                  month={monthStart}
                  disabled={(d) => d < today || d > monthEnd || blockedDates.has(toDateKey(d))}
                  className={cn("p-3 pointer-events-auto rounded-xl border bg-white max-w-full")}
                />
              </div>
            </div>
          )}

          {step === 3 && date && (
            <div>
              <h2 className="font-display text-2xl text-mauve mb-1">Изберете час</h2>
              <p className="text-sm text-muted-foreground mb-4">{formatDateBG(date)}</p>
              {loadingSlots && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              )}
              {!loadingSlots && availableTimes && availableTimes.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimes.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={cn(
                        "rounded-lg border-2 py-2.5 text-sm font-medium transition-smooth",
                        time === slot && "border-primary bg-primary text-primary-foreground shadow-soft",
                        time !== slot && "border-border bg-white hover:border-primary/60 text-mauve"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              {!loadingSlots && availableTimes && availableTimes.length === 0 && (
                <p className="text-center text-muted-foreground mt-4">
                  Няма свободни часове за тази дата.<br />Моля изберете друга дата.
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-2xl text-mauve mb-4">Вашите данни</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Име и фамилия</Label>
                  <Input id="name" value={client.client_name} onChange={(e) => setClient({ ...client, client_name: e.target.value })} className="mt-1.5" placeholder="Иван Иванов" />
                </div>
                <div>
                  <Label htmlFor="email">Имейл</Label>
                  <Input id="email" type="email" value={client.client_email} onChange={(e) => setClient({ ...client, client_email: e.target.value })} className="mt-1.5" placeholder="ivan@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <PhoneInput id="phone" value={client.client_phone} onChange={(v) => setClient({ ...client, client_phone: v })} />
                </div>

                <div className="rounded-xl bg-secondary/60 p-4 mt-6 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Услуга:</span> <span className="font-medium text-mauve">{selectedService?.name}</span></p>
                  <p><span className="text-muted-foreground">Дата:</span> <span className="font-medium text-mauve">{date && formatDateBG(date)}</span></p>
                  <p><span className="text-muted-foreground">Час:</span> <span className="font-medium text-mauve">{time}</span></p>
                  <p><span className="text-muted-foreground">Цена:</span> <span className="font-medium text-mauve">{selectedService && formatBGN(selectedService.price)}</span></p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Nav buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                navigate({ to: "/specialists" });
              } else {
                setStep((s) => Math.max(1, s - 1));
              }
            }}
            className="rounded-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="rounded-none"
            >
              Напред <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="rounded-none">
              {submitting ? "Записване..." : "Потвърди резервацията"}
            </Button>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
