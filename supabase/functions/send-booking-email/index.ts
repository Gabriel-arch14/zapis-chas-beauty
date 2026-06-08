// Supabase Edge Function: send-booking-email
// Sends booking confirmation / cancellation emails via Resend.
// RESEND_API_KEY must be set as a Supabase secret.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const STUDIO_EMAIL = Deno.env.get("STUDIO_EMAIL") ?? "inforuseva@gmail.com";
const FROM = "Ruseva Nails <noreply@rusevanails.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EventType = "confirmation" | "cancellation";

interface Payload {
  eventType: EventType;
  client_email: string;
  client_name: string;
  client_phone?: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  specialist_name?: string;
  cancel_url?: string;
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateBG(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat("bg-BG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateStr;
  }
}

function formatTime(t: string): string {
  return t?.slice(0, 5) ?? t;
}

function confirmationHtml(d: Payload): string {
  const date = formatDateBG(d.booking_date);
  const time = formatTime(d.booking_time);
  return `<!doctype html><html lang="bg"><body style="font-family:Arial,sans-serif;background:#faf7f5;padding:24px;color:#3a2a35;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #f0e6ea;">
    <h1 style="color:#7a4a63;margin:0 0 16px;font-size:22px;">Вашият час е потвърден ✨</h1>
    <p>Здравейте, <strong>${escapeHtml(d.client_name)}</strong>,</p>
    <p>Благодарим Ви за резервацията! Ето детайлите:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#7a6770;">Услуга:</td><td style="padding:8px 0;"><strong>${escapeHtml(d.service_name)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Дата:</td><td style="padding:8px 0;"><strong>${escapeHtml(date)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Час:</td><td style="padding:8px 0;"><strong>${escapeHtml(time)}</strong></td></tr>
      ${d.specialist_name ? `<tr><td style="padding:8px 0;color:#7a6770;">Специалист:</td><td style="padding:8px 0;"><strong>${escapeHtml(d.specialist_name)}</strong></td></tr>` : ""}
    </table>
    ${d.cancel_url ? `<p style="margin-top:24px;font-size:14px;color:#7a6770;">Ако се налага да отмените часа, моля използвайте този линк:<br/><a href="${escapeHtml(d.cancel_url)}" style="color:#7a4a63;">Отказване на резервацията</a></p>` : ""}
    <p style="margin-top:24px;">Очакваме Ви!</p>
  </div></body></html>`;
}

function cancellationHtml(d: Payload): string {
  const date = formatDateBG(d.booking_date);
  const time = formatTime(d.booking_time);
  return `<!doctype html><html lang="bg"><body style="font-family:Arial,sans-serif;background:#faf7f5;padding:24px;color:#3a2a35;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #f0e6ea;">
    <h1 style="color:#7a4a63;margin:0 0 16px;font-size:22px;">Вашият час е отменен</h1>
    <p>Здравейте, <strong>${escapeHtml(d.client_name)}</strong>,</p>
    <p>Потвърждаваме, че следната резервация беше отменена:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#7a6770;">Услуга:</td><td style="padding:8px 0;"><strong>${escapeHtml(d.service_name)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Дата:</td><td style="padding:8px 0;"><strong>${escapeHtml(date)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Час:</td><td style="padding:8px 0;"><strong>${escapeHtml(time)}</strong></td></tr>
    </table>
    <p style="margin-top:24px;">Ще се радваме да Ви видим друг път — можете да направите нова резервация по всяко време през сайта ни.</p>
  </div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY) {
    console.error("[send-booking-email] RESEND_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!payload.client_email) {
    return new Response(
      JSON.stringify({ skipped: true, reason: "no recipient" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let subject = "";
  let html = "";
  if (payload.eventType === "confirmation") {
    subject = "Вашият час е потвърден";
    html = confirmationHtml(payload);
  } else if (payload.eventType === "cancellation") {
    subject = "Вашият час е отменен";
    html = cancellationHtml(payload);
  } else {
    return new Response(JSON.stringify({ error: "Invalid eventType" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [payload.client_email],
        subject,
        html,
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error(`[send-booking-email] Resend ${res.status}: ${body}`);
      return new Response(
        JSON.stringify({ error: "Resend failed", status: res.status, body }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[send-booking-email] sent ${payload.eventType} to ${payload.client_email}`);
    return new Response(JSON.stringify({ success: true, data: body }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-booking-email] fetch error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
