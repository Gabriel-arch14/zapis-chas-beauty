import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const payloadSchema = z.object({
  booking_id: z.string().uuid(),
  cancel_url: z.string().url(),
  client_name: z.string(),
  client_email: z.string(),
  client_phone: z.string(),
  specialist_name: z.string(),
  service_name: z.string(),
  booking_date: z.string(),
  booking_time: z.string(),
});

export const sendBookingWebhooks = createServerFn({ method: "POST" })
  .inputValidator((input) => payloadSchema.parse(input))
  .handler(async ({ data }) => {
    console.log("[booking.created] serverFn invoked for", data.client_email);
    const hasKey = !!process.env.RESEND_API_KEY;
    console.log("[booking.created] RESEND_API_KEY present:", hasKey);
    const { sendBookingConfirmationEmail } = await import("./email.server");
    try {
      await sendBookingConfirmationEmail({
        client_email: data.client_email,
        client_name: data.client_name,
        service_name: data.service_name,
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        specialist_name: data.specialist_name,
        cancel_url: data.cancel_url,
      });
      console.log("[booking.created] sendBookingConfirmationEmail completed");
    } catch (e) {
      console.error("[booking.created] email send failed:", e);
    }
    return { ok: true };
  });
