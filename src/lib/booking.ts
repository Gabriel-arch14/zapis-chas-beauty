export function generateTimeSlots(start: string, end: string, stepMinutes = 30): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let total = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  while (total + stepMinutes <= endTotal) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    total += stepMinutes;
  }
  return slots;
}

export function formatBGN(price: number | string): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `${n.toFixed(2)} лв.`;
}

export function formatDateBG(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" });
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function normalizeTime(t: string): string {
  // DB returns "HH:MM:SS"; we use "HH:MM"
  return t.slice(0, 5);
}
