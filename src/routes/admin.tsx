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
import { CalendarIcon, LogOut, Plus, Trash2 } from "lucide-react";
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

const ADMIN_USER = "RUSEVANAILS";
const ADMIN_PASS = "123456789a";
const STORAGE_KEY = "rn_admin_auth";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthed(sessionStorage.getItem(STORAGE_KEY) === "1");
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-12"><Skeleton className="h-64 w-full max-w-md mx-auto" /></main>
      </div>
    );
  }

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;

  return (
    <AdminDashboard
      onLogout={() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setAuthed(false);
      }}
    />
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      toast.success("Добре дошли!");
      onSuccess();
    } else {
      toast.error("Грешно потребителско име или парола");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-md">
        <div className="rounded-2xl bg-card shadow-card border border-border/50 p-8">
          <h1 className="font-display text-2xl text-mauve mb-1">Админ панел</h1>
          <p className="text-sm text-muted-foreground mb-6">Влезте със своите данни.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="username">Потребителско име</Label>
              <Input id="username" type="text" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Парола</Label>
              <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full rounded-full bg-gradient-primary hover:opacity-90">
              Вход
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

/* ---------- Dashboard ---------- */

interface BookingRow {
  id: string; client_name: string; client_email: string; client_phone: string;
  booking_date: string; booking_time: string; status: string;
  specialists: { name: string } | null;
  services: { name: string; price: number } | null;
}
interface SpecialistRow { id: string; name: string; specialty: string; photo_url: string | null; }
interface ServiceRow { id: string; specialist_id: string; name: string; duration_minutes: number; price: number; }

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-display text-2xl sm:text-3xl text-mauve">Админ панел</h1>
          <Button variant="outline" onClick={onLogout} className="rounded-full"><LogOut className="mr-2 h-4 w-4" /> Изход</Button>
        </div>

        <Tabs defaultValue="calendar">
          <TabsList className="bg-secondary flex w-full overflow-x-auto h-auto flex-wrap sm:flex-nowrap">
            <TabsTrigger value="calendar" className="flex-1 min-w-fit text-xs sm:text-sm">Календар</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 min-w-fit text-xs sm:text-sm">Резервации</TabsTrigger>
            <TabsTrigger value="specialists" className="flex-1 min-w-fit text-xs sm:text-sm">Специалисти</TabsTrigger>
            <TabsTrigger value="services" className="flex-1 min-w-fit text-xs sm:text-sm">Услуги</TabsTrigger>
            <TabsTrigger value="blocked" className="flex-1 min-w-fit text-xs sm:text-sm">Блокирани</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar"><CalendarTab /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="specialists"><SpecialistsTab /></TabsContent>
          <TabsContent value="services"><ServicesTab /></TabsContent>
          <TabsContent value="blocked"><BlockedTab /></TabsContent>
        </Tabs>

      </main>
      <SiteFooter />
    </div>
  );
}

function CalendarTab() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [rows, setRows] = useState<BookingRow[] | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id,client_name,client_email,client_phone,booking_date,booking_time,status,specialists(name),services(name,price)")
      .order("booking_date")
      .order("booking_time");
    setRows((data ?? []) as any);
  };
  useEffect(() => { load(); }, []);

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

      <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-card p-5 flex justify-center">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ booked: bookedDays }}
          modifiersClassNames={{
            booked: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary",
          }}
          className="p-3 pointer-events-auto"
        />
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-display text-lg text-mauve mb-3">
          {selected ? formatDateBG(selected) : "Изберете дата"}
        </h3>
        {rows === null && <Skeleton className="h-24 w-full" />}
        {rows !== null && dayBookings.length === 0 && (
          <p className="text-sm text-muted-foreground">Няма резервации за този ден.</p>
        )}
        <div className="space-y-2">
          {dayBookings.map((b) => (
            <div key={b.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-background">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-mauve">{normalizeTime(b.booking_time)}</span>
                  <span className={cn(
                    "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full",
                    b.status === "confirmed" && "bg-primary/10 text-primary",
                    b.status === "completed" && "bg-emerald-500/10 text-emerald-600",
                    b.status === "cancelled" && "bg-destructive/10 text-destructive line-through",
                  )}>
                    {b.status === "confirmed" ? "потвърдена" : b.status === "completed" ? "завършена" : "отказана"}
                  </span>
                </div>
                <div className="text-sm">{b.client_name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {b.specialists?.name} • {b.services?.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">{b.client_phone} • {b.client_email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Статусът е обновен"); load(); }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-mauve">
              <tr>
                <th className="text-left p-3">Дата / Час</th>
                <th className="text-left p-3">Клиент</th>
                <th className="text-left p-3 hidden md:table-cell">Контакти</th>
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
                  <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
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
      </div>
    </div>
  );
}

function SpecialistsTab() {
  const [list, setList] = useState<SpecialistRow[] | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "", photo_url: "", bio: "" });

  const load = async () => {
    const { data } = await supabase.from("specialists").select("id,name,specialty,photo_url").order("name");
    setList((data ?? []) as any);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name || !form.specialty) { toast.error("Попълнете име и специалност"); return; }
    const { error } = await supabase.from("specialists").insert(form);
    if (error) toast.error(error.message);
    else { toast.success("Добавен"); setForm({ name: "", specialty: "", photo_url: "", bio: "" }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Изтриване на специалиста?")) return;
    const { error } = await supabase.from("specialists").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Изтрит"); load(); }
  };

  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <h3 className="font-display text-lg text-mauve">Добавяне на специалист</h3>
        <Input placeholder="Име" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Специалност" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
        <Input placeholder="URL на снимка" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
        <Input placeholder="Кратко описание" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <Button onClick={add} className="rounded-full bg-gradient-primary hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Добави</Button>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-display text-lg text-mauve mb-3">Списък</h3>
        <div className="space-y-2">
          {list?.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.specialty}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          {list?.length === 0 && <p className="text-sm text-muted-foreground">Няма добавени.</p>}
        </div>
      </div>
    </div>
  );
}

function ServicesTab() {
  const [specialists, setSpecialists] = useState<SpecialistRow[]>([]);
  const [services, setServices] = useState<ServiceRow[] | null>(null);
  const [form, setForm] = useState({ specialist_id: "", name: "", duration_minutes: 30, price: 0 });

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
    if (!form.specialist_id || !form.name) { toast.error("Изберете специалист и въведете име"); return; }
    const { error } = await supabase.from("services").insert(form);
    if (error) toast.error(error.message);
    else { toast.success("Добавена"); setForm({ specialist_id: "", name: "", duration_minutes: 30, price: 0 }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Изтриване на услугата?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Изтрита"); load(); }
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
          <div><Label className="text-xs">Времетраене (мин.)</Label><Input type="number" min={15} step={15} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })} /></div>
          <div><Label className="text-xs">Цена (лв.) — показва се в €</Label><Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
        </div>
        <Button onClick={add} className="rounded-full bg-gradient-primary hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Добави</Button>
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
    if (error) toast.error(error.message); else { toast.success("Блокирано"); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
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
        <Button onClick={add} className="rounded-full bg-gradient-primary hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Блокирай</Button>
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
