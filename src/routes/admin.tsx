import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CalendarIcon, LogOut, Plus, Trash2, LayoutDashboard, CalendarDays, CalendarPlus, ListChecks, History, Scissors, Ban, Menu, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatBGN, formatDateBG, normalizeTime, toDateKey, generateTimeSlots } from "@/lib/booking";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Админ панел — Запиши Час" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type AdminAuthState = "loading" | "signed_out" | "forbidden" | "ready";

function formatTimeInput(next: string, prev: string): string {
  if (next.length < prev.length) return next;
  let digits = next.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 1) {
    // First digit can be 0-2 only
    if (parseInt(digits[0], 10) > 2) digits = "2" + digits.slice(1);
  }
  if (digits.length >= 2) {
    // Hours 00-23
    const h = parseInt(digits.slice(0, 2), 10);
    if (h > 23) digits = "23" + digits.slice(2);
  }
  if (digits.length >= 3) {
    // First minute digit 0-5
    if (parseInt(digits[2], 10) > 5) digits = digits.slice(0, 2) + "5" + digits.slice(3);
  }
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function AdminPage() {
  const [authState, setAuthState] = useState<AdminAuthState>("loading");

  useEffect(() => {
    const syncAuthState = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setAuthState("signed_out");
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesError) {
        toast.error(getAdminErrorMessage(rolesError, "Неуспешна проверка на админ достъпа."));
        setAuthState("signed_out");
        return;
      }

      setAuthState(roles?.some((role) => role.role === "admin") ? "ready" : "forbidden");
    };

    void syncAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncAuthState();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(getAdminErrorMessage(error, "Неуспешен изход от админ панела."));
      return;
    }

    toast.success("Излязохте успешно.");
    setAuthState("signed_out");
  };

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-12"><Skeleton className="h-64 w-full max-w-md mx-auto" /></main>
      </div>
    );
  }

  if (authState === "signed_out") {
    return <LoginForm onSuccess={() => setAuthState("ready")} />;
  }

  if (authState === "forbidden") {
    return <AdminAccessDenied onLogout={handleLogout} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const loginEmail = email.includes("@") ? email.trim() : `${email.trim().toLowerCase()}@admin.local`;
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

    if (error) {
      toast.error(getLoginErrorMessage(error.message));
      setIsSubmitting(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Входът беше успешен, но не успях да заредя админ профила.");
      setIsSubmitting(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      toast.error(getAdminErrorMessage(rolesError, "Неуспешна проверка на админ достъпа."));
      setIsSubmitting(false);
      return;
    }

    if (!roles?.some((role) => role.role === "admin")) {
      await supabase.auth.signOut();
      toast.error("Този акаунт няма админ достъп.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
      toast.success("Добре дошли!");
    onSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-md">
        <div className="rounded-2xl bg-card shadow-card border border-border/50 p-8">
          <h1 className="font-display text-2xl text-mauve mb-1">Админ панел</h1>
          <p className="text-sm text-muted-foreground mb-6">Влезте с потребителското име и паролата на админ акаунта.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Потребител</Label>
              <Input id="email" type="text" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Парола</Label>
              <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-gradient-primary hover:opacity-90 disabled:opacity-70">
              {isSubmitting ? "Влизане..." : "Вход"}
            </Button>
          </form>
          <div className="mt-6 flex justify-start">
            <Link to="/" className="text-sm text-muted-foreground hover:text-mauve inline-flex items-center gap-1">
              ← Назад към Начало
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function AdminAccessDenied({ onLogout }: { onLogout: () => void | Promise<void> }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-md">
        <div className="rounded-2xl bg-card shadow-card border border-border/50 p-8 space-y-6">
          <div>
            <h1 className="font-display text-2xl text-mauve mb-1">Няма достъп</h1>
            <p className="text-sm text-muted-foreground">Този акаунт е влязъл успешно, но няма админ права за работа с панела.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => void onLogout()} className="w-full sm:w-auto rounded-full bg-gradient-primary hover:opacity-90">
              Изход
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-full">
              <Link to="/">Към началото</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function getLoginErrorMessage(message: string) {
  if (message.includes("Invalid login credentials")) return "Грешен имейл или парола.";
  if (message.includes("Email not confirmed")) return "Потвърдете имейла си преди вход.";
  return message;
}

function getAdminErrorMessage(
  error: { message?: string } | null | undefined,
  fallback = "Действието не можа да се изпълни."
) {
  const message = error?.message ?? fallback;

  if (
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("Unauthorized")
  ) {
    return "Нямате активен админ достъп. Влезте с админ акаунта и опитайте отново.";
  }

  return message;
}

/* ---------- Dashboard ---------- */

interface BookingRow {
  id: string; client_name: string; client_email: string; client_phone: string;
  booking_date: string; booking_time: string; status: string;
  specialists: { name: string } | null;
  services: { name: string; price: number } | null;
}
interface SpecialistRow { id: string; name: string; specialty: string; photo_url: string | null; }
interface ServiceRow { id: string; specialist_id: string; name: string; duration_minutes: number; price: number; }

const ADMIN_THEME: React.CSSProperties = {
  ["--ad-sidebar" as any]: "#1C1712",
  ["--ad-sidebar-active" as any]: "#2C2416",
  ["--ad-gold" as any]: "#C9A84C",
  ["--ad-gold-soft" as any]: "#E8D5A3",
  ["--ad-sidebar-muted" as any]: "#8A7A5A",
  ["--ad-section-label" as any]: "#5A4E38",
  ["--ad-bg" as any]: "#FAF7F2",
  ["--ad-card" as any]: "#FFFFFF",
  ["--ad-card-border" as any]: "#E8DECA",
  ["--ad-text" as any]: "#1C1712",
  ["--ad-muted" as any]: "#8A7A5A",
};

type AdminNavGroup = "main" | "schedule" | "catalog";
type AdminNavItem = { value: string; label: string; icon: typeof LayoutDashboard; group: AdminNavGroup };

const ADMIN_NAV: AdminNavItem[] = [
  { value: "dashboard", label: "Табло", icon: LayoutDashboard, group: "main" },
  { value: "calendar", label: "Календар", icon: CalendarDays, group: "main" },
  { value: "slots", label: "Нови записи", icon: CalendarPlus, group: "schedule" },
  { value: "bookings", label: "Резервации", icon: ListChecks, group: "schedule" },
  { value: "past", label: "Минали часове", icon: History, group: "schedule" },
  { value: "services", label: "Услуги", icon: Scissors, group: "catalog" },
  { value: "blocked", label: "Блокирани", icon: Ban, group: "catalog" },
];

const ADMIN_GROUP_LABEL: Record<AdminNavGroup, string> = {
  main: "Общ преглед",
  schedule: "График",
  catalog: "Каталог",
};

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Добро утро";
    if (h < 18) return "Добър ден";
    return "Добра вечер";
  }, []);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString("bg-BG", { weekday: "long", day: "numeric", month: "long" }),
    []
  );

  const currentLabel = ADMIN_NAV.find((n) => n.value === tab)?.label ?? "Табло";

  const grouped = useMemo(() => {
    const map: Record<AdminNavGroup, AdminNavItem[]> = { main: [], schedule: [], catalog: [] };
    ADMIN_NAV.forEach((n) => map[n.group].push(n));
    return map;
  }, []);

  const renderNav = (onPick?: () => void) => (
    <nav className="flex flex-col gap-5">
      {(Object.keys(grouped) as AdminNavGroup[]).map((g) => (
        <div key={g}>
          <div
            className="px-4 mb-2 text-[9px] uppercase font-medium"
            style={{ color: "var(--ad-section-label)", letterSpacing: "0.18em" }}
          >
            {ADMIN_GROUP_LABEL[g]}
          </div>
          <ul className="flex flex-col">
            {grouped[g].map((item) => {
              const Icon = item.icon;
              const active = tab === item.value;
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setTab(item.value);
                      onPick?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{
                      color: active ? "var(--ad-gold-soft)" : "var(--ad-sidebar-muted)",
                      background: active ? "var(--ad-sidebar-active)" : "transparent",
                      borderLeft: `3px solid ${active ? "var(--ad-gold)" : "transparent"}`,
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: active ? "var(--ad-gold)" : "var(--ad-sidebar-muted)" }} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="mt-2 px-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors"
          style={{ color: "var(--ad-sidebar-muted)", border: "1px solid rgba(138,122,90,0.2)" }}
        >
          <LogOut className="h-4 w-4" />
          <span>Изход</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex" style={{ ...ADMIN_THEME, background: "var(--ad-bg)", color: "var(--ad-text)" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col py-6 shrink-0"
        style={{ width: 200, background: "var(--ad-sidebar)", color: "var(--ad-sidebar-muted)" }}
      >
        <div className="px-4 mb-6">
          <div className="text-[10px] uppercase" style={{ color: "var(--ad-section-label)", letterSpacing: "0.22em" }}>
            Ruseva Nails
          </div>
          <div className="mt-1 text-base font-medium" style={{ color: "var(--ad-gold-soft)" }}>
            Админ
          </div>
          <div className="mt-2 h-px w-9" style={{ background: "var(--ad-gold)" }} />
        </div>
        {renderNav()}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex flex-col py-6 w-[220px]" style={{ background: "var(--ad-sidebar)" }}>
            <div className="px-4 mb-6">
              <div className="text-[10px] uppercase" style={{ color: "var(--ad-section-label)", letterSpacing: "0.22em" }}>
                Ruseva Nails
              </div>
              <div className="mt-1 text-base font-medium" style={{ color: "var(--ad-gold-soft)" }}>
                Админ
              </div>
              <div className="mt-2 h-px w-9" style={{ background: "var(--ad-gold)" }} />
            </div>
            {renderNav(() => setMobileOpen(false))}
          </div>
          <button
            type="button"
            aria-label="Затвори"
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      <main className="flex-1 min-w-0" style={{ ...ADMIN_THEME }}>
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{ background: "var(--ad-sidebar)" }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--ad-gold-soft)" }}
          >
            <Menu className="h-5 w-5" />
            <span>Меню</span>
          </button>
          <span className="text-xs uppercase" style={{ letterSpacing: "0.18em", color: "var(--ad-sidebar-muted)" }}>
            {currentLabel}
          </span>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-6xl">
          <header className="mb-6">
            <h1
              className="text-2xl sm:text-3xl"
              style={{ color: "var(--ad-text)", fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: "-0.01em" }}
            >
              {greeting}
            </h1>
            <div className="mt-2 h-[2px] w-9" style={{ background: "var(--ad-gold)" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--ad-muted)" }}>
              {todayLabel} · {currentLabel}
            </p>
          </header>

          <Tabs value={tab} onValueChange={setTab}>
            <div className="[&_.bg-card]:bg-white [&_.bg-card]:text-[var(--ad-text)] [&_.bg-card]:border-[var(--ad-card-border)] [&_.bg-background]:bg-[var(--ad-bg)] [&_.text-mauve]:text-[var(--ad-text)] [&_.text-muted-foreground]:text-[var(--ad-muted)] [&_.bg-gradient-primary]:bg-[var(--ad-gold)] [&_.bg-gradient-primary]:text-white [&_.bg-secondary]:bg-[#F4EDDF] [&_.bg-secondary]:text-[var(--ad-text)] [&_table_thead]:bg-[#F4EDDF] [&_table_thead]:text-[var(--ad-text)]">
              <TabsContent value="dashboard"><CalendarTab /></TabsContent>
              <TabsContent value="calendar"><CalendarTab /></TabsContent>
              <TabsContent value="slots"><SlotsTab /></TabsContent>
              <TabsContent value="bookings"><BookingsTab /></TabsContent>
              <TabsContent value="past"><PastSlotsTab /></TabsContent>
              <TabsContent value="services"><ServicesTab /></TabsContent>
              <TabsContent value="blocked"><BlockedTab /></TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function CalendarTab() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [missedCount, setMissedCount] = useState<number | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id,client_name,client_email,client_phone,booking_date,booking_time,status,specialists(name),services(name,price)")
      .order("booking_date")
      .order("booking_time");
    setRows((data ?? []) as any);
  };
  const loadMissed = async () => {
    const now = new Date();
    const todayKey = toDateKey(now);
    const nowHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const [{ data: avail }, { data: bks }] = await Promise.all([
      supabase.from("available_slots").select("slot_date,slot_time").lte("slot_date", todayKey),
      supabase.from("bookings").select("booking_date,booking_time,status").lte("booking_date", todayKey).neq("status", "cancelled"),
    ]);
    const booked = new Set<string>();
    (bks ?? []).forEach((b: any) => booked.add(`${b.booking_date}|${normalizeTime(b.booking_time)}`));
    const count = ((avail ?? []) as any[]).filter((s) => {
      const t = normalizeTime(s.slot_time);
      const isPast = s.slot_date < todayKey || (s.slot_date === todayKey && t < nowHM);
      return isPast && !booked.has(`${s.slot_date}|${t}`);
    }).length;
    setMissedCount(count);
  };
  useEffect(() => { load(); loadMissed(); }, []);

  const bookedDays = useMemo(() => {
    const set = new Set<string>();
    rows?.forEach((r) => { if (r.status !== "cancelled") set.add(r.booking_date); });
    return Array.from(set).map((d) => {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day);
    });
  }, [rows]);

  const dayBookings = useMemo(() => {
    if (!selected || !rows) return [];
    const key = toDateKey(selected);
    return rows.filter((r) => r.booking_date === key);
  }, [selected, rows]);

  const monthView = selected ?? new Date();
  const monthStats = useMemo(() => {
    if (!rows) return { total: 0, confirmed: 0, completed: 0, cancelled: 0, byDay: [] as { date: string; count: number }[] };
    const y = monthView.getFullYear();
    const m = monthView.getMonth();
    const inMonth = rows.filter((r) => {
      const [ry, rm] = r.booking_date.split("-").map(Number);
      return ry === y && rm - 1 === m;
    });
    const counts: Record<string, number> = {};
    inMonth.forEach((r) => {
      if (r.status === "cancelled") return;
      counts[r.booking_date] = (counts[r.booking_date] ?? 0) + 1;
    });
    const byDay = Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
    return {
      total: inMonth.filter((r) => r.status !== "cancelled").length,
      confirmed: inMonth.filter((r) => r.status === "confirmed").length,
      completed: inMonth.filter((r) => r.status === "completed").length,
      cancelled: inMonth.filter((r) => r.status === "cancelled").length,
      byDay,
    };
  }, [rows, monthView]);

  const monthLabel = monthView.toLocaleDateString("bg-BG", { month: "long", year: "numeric" });

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={`Общо за ${monthLabel}`} value={monthStats.total} accent="primary" />
        <StatCard label="Потвърдени" value={monthStats.confirmed} />
        <StatCard label="Завършени" value={monthStats.completed} />
        <StatCard label="Отказани" value={monthStats.cancelled} />
      </div>

      <div
        className="rounded-[12px] p-5 sm:p-6 flex items-center justify-between gap-6"
        style={{ background: "linear-gradient(120deg, #1C1712, #2C2416)" }}
      >
        <div
          className="text-5xl sm:text-6xl tabular-nums font-medium leading-none"
          style={{ color: "#C9A84C", fontVariantNumeric: "tabular-nums" }}
        >
          {missedCount === null ? "—" : String(missedCount).padStart(2, "0")}
        </div>
        <div className="text-right">
          <div className="text-base sm:text-lg font-medium" style={{ color: "#E8D5A3" }}>
            Изпуснати резервации
          </div>
          <div className="text-xs mt-1" style={{ color: "#8A7A5A" }}>
            Минали часове без направена резервация
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
      <div
        className="rounded-[12px] border p-5 flex justify-center bg-white admin-calendar"
        style={{ borderColor: "var(--ad-card-border)" }}
      >
        <style>{`
          .admin-calendar .rdp-head_cell { color: #C9A84C; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; font-weight: 500; }
          .admin-calendar .rdp-caption_label { text-transform: uppercase; letter-spacing: 0.14em; font-size: 13px; color: #1C1712; font-weight: 500; }
          .admin-calendar .rdp-day_today:not(.rdp-day_outside) { background: #C9A84C !important; color: #ffffff !important; border-radius: 6px; }
          .admin-calendar .day-has-booking { background: #FAF7F2; color: #1C1712; border-radius: 6px; }
        `}</style>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ booked: bookedDays }}
          modifiersClassNames={{ booked: "day-has-booking" }}
          className="p-3 pointer-events-auto"
        />
      </div>
      <div
        className="rounded-[12px] border p-5 bg-white"
        style={{ borderColor: "var(--ad-card-border)" }}
      >
        <h3 className="text-base mb-4 font-medium" style={{ color: "var(--ad-text)" }}>
          {selected ? formatDateBG(selected) : "Изберете дата"}
        </h3>
        {rows === null && <Skeleton className="h-24 w-full" />}
        {rows !== null && dayBookings.length === 0 && (
          <p className="text-sm" style={{ color: "var(--ad-muted)" }}>Няма резервации за този ден.</p>
        )}
        <div className="space-y-2">
          {dayBookings.map((b) => (
            <div
              key={b.id}
              className={cn(
                "flex items-start justify-between gap-3 p-3 rounded-[8px] border relative pl-4",
                b.status === "cancelled" && "opacity-60",
              )}
              style={{ background: "#FAF7F2", borderColor: "var(--ad-card-border)" }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                style={{ background: "#C9A84C" }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium tabular-nums" style={{ color: "#C9A84C" }}>{normalizeTime(b.booking_time)}</span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border",
                      b.status === "cancelled" && "line-through",
                    )}
                    style={{ background: "#FAF7F2", borderColor: "#C9A84C", color: "#1C1712" }}
                  >
                    {b.status === "confirmed" ? "потвърдена" : b.status === "completed" ? "завършена" : "отказана"}
                  </span>
                </div>
                <div className="text-sm mt-1" style={{ color: "var(--ad-text)" }}>{b.client_name}</div>
                <div className="text-xs truncate" style={{ color: "var(--ad-muted)" }}>
                  {b.specialists?.name} • {b.services?.name}
                </div>
                <div className="text-xs truncate" style={{ color: "var(--ad-muted)" }}>{b.client_phone} • {b.client_email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>


      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-display text-lg text-mauve mb-3">Месечен отчет — {monthLabel}</h3>
        {monthStats.byDay.length === 0 ? (
          <p className="text-sm text-muted-foreground">Няма резервации за този месец.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-mauve">
                <tr className="border-b border-border/50">
                  <th className="text-left py-2">Дата</th>
                  <th className="text-right py-2">Брой резервации</th>
                </tr>
              </thead>
              <tbody>
                {monthStats.byDay.map((d) => (
                  <tr key={d.date} className="border-b border-border/30 last:border-0">
                    <td className="py-2">{formatDateBG(d.date)}</td>
                    <td className="py-2 text-right font-medium">{d.count}</td>
                  </tr>
                ))}
                <tr className="font-semibold text-mauve">
                  <td className="py-2">Общо</td>
                  <td className="py-2 text-right">{monthStats.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "primary" }) {
  return (
    <div className={cn(
      "rounded-md border border-slate-200 bg-white p-4 relative overflow-hidden shadow-sm",
      accent === "primary" && "border-emerald-500/50",
    )}>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 truncate">{label}</div>
      <div className="font-mono text-3xl tabular-nums text-slate-900 mt-2">{value.toString().padStart(2, "0")}</div>
      {accent === "primary" && <div className="absolute top-0 left-0 h-full w-0.5 bg-emerald-500" />}
    </div>
  );
}

function BookingsTab() {
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const load = async () => {
    let q = supabase.from("bookings").select("id,client_name,client_email,client_phone,booking_date,booking_time,status,specialists(name),services(name,price)").order("booking_date", { ascending: false }).order("booking_time");
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (dateFilter) q = q.eq("booking_date", toDateKey(dateFilter));
    const { data } = await q;
    setRows((data ?? []) as any);
  };
  useEffect(() => { load(); }, [statusFilter, dateFilter]);

  const updateStatus = async (id: string, status: string) => {
    // Refresh the session first so an expired JWT doesn't fail the update with "Unauthorized".
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      await supabase.auth.refreshSession();
    }
    let { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error && (error.message?.includes("JWT") || error.message?.includes("Unauthorized") || (error as { code?: string }).code === "PGRST301")) {
      await supabase.auth.refreshSession();
      ({ error } = await supabase.from("bookings").update({ status }).eq("id", id));
    }
    if (error) toast.error(getAdminErrorMessage(error)); else { toast.success("Статусът е обновен"); load(); }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички статуси</SelectItem>
            <SelectItem value="confirmed">Потвърдени</SelectItem>
            <SelectItem value="completed">Завършени</SelectItem>
            <SelectItem value="cancelled">Отказани</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(!dateFilter && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? formatDateBG(dateFilter) : "Филтрирай по дата"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} className="p-3 pointer-events-auto" /></PopoverContent>
        </Popover>
        {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)}>Изчисти</Button>}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-mauve">
              <tr>
                <th className="text-left p-3">Дата / Час</th>
                <th className="text-left p-3">Клиент</th>
                <th className="text-left p-3">Контакти</th>
                <th className="text-left p-3">Специалист / Услуга</th>
                <th className="text-left p-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows === null && <tr><td colSpan={5} className="p-6"><Skeleton className="h-6 w-full" /></td></tr>}
              {rows?.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Няма резервации.</td></tr>}
              {rows?.map((r) => (
                <tr key={r.id} className="border-t border-border/50">
                  <td className="p-3">
                    <div className="font-medium text-mauve">{formatDateBG(r.booking_date)}</div>
                    <div className="text-xs text-muted-foreground">{normalizeTime(r.booking_time)}</div>
                  </td>
                  <td className="p-3">{r.client_name}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    <div>{r.client_email}</div><div>{r.client_phone}</div>
                  </td>
                  <td className="p-3">
                    <div>{r.specialists?.name}</div>
                    <div className="text-xs text-muted-foreground">{r.services?.name} • {r.services && formatBGN(r.services.price)}</div>
                  </td>
                  <td className="p-3">
                    <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Потвърдена</SelectItem>
                        <SelectItem value="completed">Завършена</SelectItem>
                        <SelectItem value="cancelled">Отказана</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border/50">
          {rows === null && <div className="p-4"><Skeleton className="h-20 w-full" /></div>}
          {rows?.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Няма резервации.</div>}
          {rows?.map((r) => (
            <div key={r.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-mauve">{formatDateBG(r.booking_date)}</div>
                  <div className="text-xs text-muted-foreground">{normalizeTime(r.booking_time)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{r.client_name}</div>
                  {r.services && <div className="text-xs text-muted-foreground">{formatBGN(r.services.price)}</div>}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {r.specialists?.name} • {r.services?.name}
              </div>
              <div className="text-xs text-muted-foreground break-all">
                {r.client_phone} • {r.client_email}
              </div>
              <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                <SelectTrigger className="w-full h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Потвърдена</SelectItem>
                  <SelectItem value="completed">Завършена</SelectItem>
                  <SelectItem value="cancelled">Отказана</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PastSlotsTab() {
  const [missed, setMissed] = useState<{ date: string; time: string }[] | null>(null);

  const load = async () => {
    const now = new Date();
    const todayKey = toDateKey(now);
    const nowHM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const [{ data: avail }, { data: bks }] = await Promise.all([
      supabase.from("available_slots").select("slot_date,slot_time").lte("slot_date", todayKey).order("slot_date", { ascending: false }).order("slot_time"),
      supabase.from("bookings").select("booking_date,booking_time,status").lte("booking_date", todayKey).neq("status", "cancelled"),
    ]);

    const bookedSet = new Set<string>();
    (bks ?? []).forEach((b: any) => {
      bookedSet.add(`${b.booking_date}|${normalizeTime(b.booking_time)}`);
    });

    const result = ((avail ?? []) as any[])
      .map((s) => ({ date: s.slot_date as string, time: normalizeTime(s.slot_time) }))
      .filter((s) => {
        if (s.date < todayKey) return true;
        if (s.date === todayKey && s.time < nowHM) return true;
        return false;
      })
      .filter((s) => !bookedSet.has(`${s.date}|${s.time}`));

    setMissed(result);
  };
  useEffect(() => { load(); }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, string[]>();
    (missed ?? []).forEach((s) => {
      const arr = map.get(s.date) ?? [];
      arr.push(s.time);
      map.set(s.date, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [missed]);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard label="Общо изпуснати резервации" value={missed?.length ?? 0} accent="primary" />
        <StatCard label="Дни с изпуснати часове" value={byDate.length} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-display text-lg text-mauve mb-3">Минали часове без резервация</h3>
        {missed === null && <Skeleton className="h-24 w-full" />}
        {missed !== null && byDate.length === 0 && (
          <p className="text-sm text-muted-foreground">Няма изпуснати часове. Всички минали часове са били резервирани.</p>
        )}
        <div className="space-y-4">
          {byDate.map(([date, times]) => (
            <div key={date} className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-mauve">{formatDateBG(date)}</h4>
                <span className="text-xs font-mono text-muted-foreground">{times.length} {times.length === 1 ? "час" : "часа"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {times.map((t) => (
                  <span key={t} className="font-mono text-sm tabular-nums px-2 py-1 rounded-md bg-destructive/10 text-destructive">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesTab() {
  const [specialists, setSpecialists] = useState<SpecialistRow[]>([]);
  const [services, setServices] = useState<ServiceRow[] | null>(null);
  const [form, setForm] = useState<{ specialist_id: string; name: string; duration_minutes: string; price: string }>({ specialist_id: "", name: "", duration_minutes: "", price: "" });

  const load = async () => {
    const [{ data: sp }, { data: svc }] = await Promise.all([
      supabase.from("specialists").select("id,name,specialty,photo_url").order("name"),
      supabase.from("services").select("id,specialist_id,name,duration_minutes,price").order("name"),
    ]);
    setSpecialists((sp ?? []) as any);
    setServices((svc ?? []) as any);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.specialist_id || !form.name.trim()) { toast.error("Изберете специалист и въведете име"); return; }
    if (form.duration_minutes.trim() === "" || form.price.trim() === "") { toast.error("Попълнете времетраене и цена"); return; }
    const duration_minutes = Number(form.duration_minutes);
    const price = Number(form.price);
    if (!Number.isFinite(duration_minutes) || duration_minutes <= 0) { toast.error("Въведете валидно времетраене"); return; }
    if (!Number.isFinite(price) || price < 0) { toast.error("Въведете валидна цена"); return; }
    const { error } = await supabase.from("services").insert({ specialist_id: form.specialist_id, name: form.name, duration_minutes, price });
    if (error) toast.error(getAdminErrorMessage(error));
    else { toast.success("Добавена"); setForm({ specialist_id: "", name: "", duration_minutes: "", price: "" }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Изтриване на услугата?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error(getAdminErrorMessage(error)); else { toast.success("Изтрита"); load(); }
  };

  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-display text-lg text-mauve">Добавяне на услуга</h3>
        <Select value={form.specialist_id} onValueChange={(v) => setForm({ ...form, specialist_id: v })}>
          <SelectTrigger><SelectValue placeholder="Избери специалист" /></SelectTrigger>
          <SelectContent>
            {specialists.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Име на услугата" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Времетраене (мин.)</Label><Input type="number" min={0} step={15} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} /></div>
          <div><Label className="text-xs">Цена (€)</Label><Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        </div>
        <Button onClick={add} className="w-full sm:w-auto rounded-full bg-gradient-primary hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Добави</Button>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-display text-lg text-mauve mb-3">Списък</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {services?.map((s) => {
            const sp = specialists.find((x) => x.id === s.specialist_id);
            return (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{sp?.name} • {s.duration_minutes} мин. • {formatBGN(s.price)}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            );
          })}
          {services?.length === 0 && <p className="text-sm text-muted-foreground">Няма добавени.</p>}
        </div>
      </div>
    </div>
  );
}

function BlockedTab() {
  const [specialists, setSpecialists] = useState<SpecialistRow[]>([]);
  const [specialistId, setSpecialistId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("all");
  const [list, setList] = useState<any[] | null>(null);

  useEffect(() => {
    supabase.from("specialists").select("id,name,specialty,photo_url").order("name").then(({ data }) => setSpecialists((data ?? []) as any));
  }, []);

  const load = async () => {
    const { data } = await supabase.from("blocked_slots").select("id,blocked_date,blocked_time,specialists(name)").order("blocked_date", { ascending: false });
    setList((data ?? []) as any);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!specialistId || !date) { toast.error("Изберете специалист и дата"); return; }
    const { error } = await supabase.from("blocked_slots").insert({
      specialist_id: specialistId,
      blocked_date: toDateKey(date),
      blocked_time: time === "all" ? null : time,
    });
    if (error) toast.error(getAdminErrorMessage(error)); else { toast.success("Блокирано"); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
    if (error) toast.error(getAdminErrorMessage(error)); else load();
  };

  const slots = generateTimeSlots("09:00", "19:00", 30);

  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-display text-lg text-mauve">Блокиране на час / ден</h3>
        <Select value={specialistId} onValueChange={setSpecialistId}>
          <SelectTrigger><SelectValue placeholder="Избери специалист" /></SelectTrigger>
          <SelectContent>{specialists.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />{date ? formatDateBG(date) : "Избери дата"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} /></PopoverContent>
        </Popover>
        <Select value={time} onValueChange={setTime}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Целият ден</SelectItem>
            {slots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={add} className="w-full sm:w-auto rounded-full bg-gradient-primary hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Блокирай</Button>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-display text-lg text-mauve mb-3">Блокирани</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {list?.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
              <div>
                <p className="font-medium">{formatDateBG(b.blocked_date)} {b.blocked_time ? `• ${normalizeTime(b.blocked_time)}` : "• целият ден"}</p>
                <p className="text-xs text-muted-foreground">{b.specialists?.name}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          {list?.length === 0 && <p className="text-sm text-muted-foreground">Няма блокирани.</p>}
        </div>
      </div>
    </div>
  );
}

function SlotsTab() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [rangeMode, setRangeMode] = useState<"single" | "range">("single");
  const [rangeStart, setRangeStart] = useState<string>("09:00");
  const [rangeEnd, setRangeEnd] = useState<string>("18:00");
  const [step, setStep] = useState<string>("30");
  const [list, setList] = useState<any[] | null>(null);
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());

  const slots = generateTimeSlots("08:00", "20:00", 30);

  const load = async () => {
    if (!date) return;
    const key = toDateKey(date);
    const [{ data: avail }, { data: bks }] = await Promise.all([
      supabase.from("available_slots").select("id,slot_time,is_available").eq("slot_date", key).order("slot_time"),
      supabase.from("bookings").select("booking_time,status").eq("booking_date", key).neq("status", "cancelled"),
    ]);
    setList((avail ?? []) as any);
    setBookedTimes(new Set(((bks ?? []) as any[]).map((b) => normalizeTime(b.booking_time))));
  };
  useEffect(() => { load(); }, [date]);

  const addOne = async (t: string) => {
    if (!date) return;
    const { error } = await supabase.from("available_slots").insert({
      slot_date: toDateKey(date),
      slot_time: t,
      is_available: true,
    });
    if (error) toast.error(getAdminErrorMessage(error));
  };

  const addSingle = async () => {
    if (!date || !time) { toast.error("Изберете дата и час"); return; }
    await addOne(time);
    toast.success("Часът е добавен");
    setTime("");
    load();
  };

  const normalizeTimeInput = (t: string): string | null => {
    const digits = (t || "").replace(/\D/g, "");
    if (digits.length === 0) return null;
    let h: number, m: number;
    if (digits.length <= 2) { h = parseInt(digits, 10); m = 0; }
    else if (digits.length === 3) { h = parseInt(digits.slice(0, 1), 10); m = parseInt(digits.slice(1), 10); }
    else { h = parseInt(digits.slice(0, 2), 10); m = parseInt(digits.slice(2, 4), 10); }
    if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const addRange = async () => {
    if (!date) { toast.error("Изберете дата"); return; }
    const stepMin = Number(step);
    if (!Number.isFinite(stepMin) || stepMin <= 0) { toast.error("Невалидна стъпка"); return; }
    const startNorm = normalizeTimeInput(rangeStart);
    const endNorm = normalizeTimeInput(rangeEnd);
    if (!startNorm || !endNorm) { toast.error("Невалиден час (00:00 - 23:59)"); return; }
    setRangeStart(startNorm);
    setRangeEnd(endNorm);
    const generated = generateTimeSlots(startNorm, endNorm, stepMin);
    if (generated.length === 0) { toast.error("Невалиден интервал"); return; }
    const existing = new Set((list ?? []).map((s: any) => normalizeTime(s.slot_time)));
    const toInsert = generated.filter((t) => !existing.has(t)).map((t) => ({
      slot_date: toDateKey(date),
      slot_time: t,
      is_available: true,
    }));
    if (toInsert.length === 0) { toast.info("Всички часове вече съществуват"); return; }
    const { error } = await supabase.from("available_slots").insert(toInsert);
    if (error) { toast.error(getAdminErrorMessage(error)); return; }
    toast.success(`Добавени ${toInsert.length} часа`);
    load();
  };

  const removeAllForDate = async () => {
    if (!date) { toast.error("Изберете дата"); return; }
    if (!list || list.length === 0) { toast.info("Няма часове за изтриване"); return; }
    if (!confirm(`Сигурни ли сте, че искате да изтриете всички ${list.length} часа за ${formatDateBG(date)}?`)) return;
    const { error } = await supabase.from("available_slots").delete().eq("slot_date", toDateKey(date));
    if (error) { toast.error(getAdminErrorMessage(error)); return; }
    toast.success("Часовете са изтрити");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("available_slots").delete().eq("id", id);
    if (error) toast.error(getAdminErrorMessage(error)); else load();
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    const { error } = await supabase.from("available_slots").update({ is_available: !current }).eq("id", id);
    if (error) toast.error(getAdminErrorMessage(error)); else load();
  };

  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="font-display text-lg text-mauve">Добавяне на свободни часове</h3>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />{date ? formatDateBG(date) : "Избери дата"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        <div className="flex gap-2">
          <Button type="button" size="sm" variant={rangeMode === "single" ? "default" : "outline"} onClick={() => setRangeMode("single")} className="flex-1 rounded-md">Един час</Button>
          <Button type="button" size="sm" variant={rangeMode === "range" ? "default" : "outline"} onClick={() => setRangeMode("range")} className="flex-1 rounded-md">Интервал</Button>
        </div>

        {rangeMode === "single" ? (
          <div className="space-y-2">
            <Label className="text-xs">Час</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger><SelectValue placeholder="Избери час" /></SelectTrigger>
              <SelectContent>
                {slots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={addSingle} className="w-full rounded-full bg-gradient-primary hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Добави час</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs">От</Label><Input type="text" inputMode="numeric" pattern="[0-9]{2}:[0-9]{2}" placeholder="09:00" maxLength={5} value={rangeStart} onChange={(e) => setRangeStart(formatTimeInput(e.target.value, rangeStart))} /></div>
              <div><Label className="text-xs">До</Label><Input type="text" inputMode="numeric" pattern="[0-9]{2}:[0-9]{2}" placeholder="18:00" maxLength={5} value={rangeEnd} onChange={(e) => setRangeEnd(formatTimeInput(e.target.value, rangeEnd))} /></div>
              <div><Label className="text-xs">Стъпка (мин.)</Label><Input type="number" min={5} step={5} value={step} onChange={(e) => setStep(e.target.value)} /></div>
            </div>
            <Button onClick={addRange} className="w-full rounded-full bg-gradient-primary hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Генерирай часове</Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Добавените часове се показват в сайта при онлайн записване. Когато клиент резервира час, той автоматично се маркира като резервиран и изчезва от сайта, но остава тук с етикет «резервиран».
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="font-display text-lg text-mauve">
            Часове за {date ? formatDateBG(date) : "—"}
          </h3>
          {list && list.length > 0 && (
            <Button size="sm" variant="outline" onClick={removeAllForDate} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="mr-1 h-4 w-4" />Изтрий всички
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {list?.map((s) => {
            const t = normalizeTime(s.slot_time);
            const isBooked = bookedTimes.has(t) || !s.is_available;
            return (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base tabular-nums">{t}</span>
                  <span className={cn(
                    "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full",
                    isBooked ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600",
                  )}>
                    {isBooked ? "резервиран" : "свободен"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!bookedTimes.has(t) && (
                    <Button size="sm" variant="ghost" onClick={() => toggleAvailable(s.id, s.is_available)} className="text-xs">
                      {s.is_available ? "Скрий" : "Възстанови"}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
          {list?.length === 0 && <p className="text-sm text-muted-foreground">Няма добавени часове за тази дата.</p>}
        </div>
      </div>
    </div>
  );
}
