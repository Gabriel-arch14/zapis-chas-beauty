// Server-only Resend email sender for booking confirmation & cancellation.
// Never import from client code — the `.server.ts` suffix is enforced by the bundler.

const FROM = "Ruseva Nails <noreply@rusevanails.com>";

function formatDateBG(dateStr: string): string {
  // dateStr expected as YYYY-MM-DD
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

function formatTime(timeStr: string): string {
  // Trim seconds if present: "14:30:00" -> "14:30"
  return timeStr?.slice(0, 5) ?? timeStr;
}

type BaseFields = {
  client_email: string;
  client_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
};

type ConfirmationFields = BaseFields & {
  specialist_name?: string;
  cancel_url?: string;
};

function confirmationHtml(data: ConfirmationFields): string {
  const date = formatDateBG(data.booking_date);
  const time = formatTime(data.booking_time);
  return `<!doctype html><html lang="bg"><body style="font-family:Arial,sans-serif;background:#faf7f5;padding:24px;color:#3a2a35;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #f0e6ea;">
    <h1 style="color:#7a4a63;margin:0 0 16px;font-size:22px;">Вашият час е потвърден ✨</h1>
    <p>Здравейте, <strong>${escapeHtml(data.client_name)}</strong>,</p>
    <p>Благодарим Ви за резервацията! Ето детайлите:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#7a6770;">Услуга:</td><td style="padding:8px 0;"><strong>${escapeHtml(data.service_name)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Дата:</td><td style="padding:8px 0;"><strong>${escapeHtml(date)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Час:</td><td style="padding:8px 0;"><strong>${escapeHtml(time)}</strong></td></tr>
      ${data.specialist_name ? `<tr><td style="padding:8px 0;color:#7a6770;">Специалист:</td><td style="padding:8px 0;"><strong>${escapeHtml(data.specialist_name)}</strong></td></tr>` : ""}
    </table>
    ${data.cancel_url ? `<p style="margin-top:24px;font-size:14px;color:#7a6770;">Ако се налага да отмените часа, моля използвайте този линк:<br/><a href="${escapeHtml(data.cancel_url)}" style="color:#7a4a63;">Отказване на резервацията</a></p>` : ""}
    <p style="margin-top:24px;">Очакваме Ви!</p>
  </div></body></html>`;
}

function cancellationHtml(data: BaseFields): string {
  const date = formatDateBG(data.booking_date);
  const time = formatTime(data.booking_time);
  return `<!doctype html><html lang="bg"><body style="font-family:Arial,sans-serif;background:#faf7f5;padding:24px;color:#3a2a35;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #f0e6ea;">
    <h1 style="color:#7a4a63;margin:0 0 16px;font-size:22px;">Вашият час е отменен</h1>
    <p>Здравейте, <strong>${escapeHtml(data.client_name)}</strong>,</p>
    <p>Потвърждаваме, че следната резервация беше отменена:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#7a6770;">Услуга:</td><td style="padding:8px 0;"><strong>${escapeHtml(data.service_name)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Дата:</td><td style="padding:8px 0;"><strong>${escapeHtml(date)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#7a6770;">Час:</td><td style="padding:8px 0;"><strong>${escapeHtml(time)}</strong></td></tr>
    </table>
    <p style="margin-top:24px;">Ще се радваме да Ви видим друг път — можете да направите нова резервация по всяко време през сайта ни.</p>
  </div></body></html>`;
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendViaResend(payload: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = await getResendApiKey();
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set — skipping send");
    return;
  }
  if (!payload.to) {
    console.warn("[email] No recipient — skipping send");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend returned ${res.status}: ${body}`);
  }
}

export async function sendBookingConfirmationEmail(data: ConfirmationFields): Promise<void> {
  await sendViaResend({
    to: data.client_email,
    subject: "Вашият час е потвърден",
    html: confirmationHtml(data),
  });
}

export async function sendBookingCancellationEmail(data: BaseFields): Promise<void> {
  await sendViaResend({
    to: data.client_email,
    subject: "Вашият час е отменен",
    html: cancellationHtml(data),
  });
}
