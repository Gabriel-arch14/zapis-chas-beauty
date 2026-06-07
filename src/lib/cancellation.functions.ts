import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const tokenSchema = z.object({ token: z.string().uuid("Невалиден токен за отказ") });

export type CancelledBooking = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  specialist_name: string | null;
  service_name: string | null;
  cancelled_at: string | null;
  was_already_cancelled: boolean;
};

/**
 * Cancels a booking by its cancel_token (sent in confirmation email).
 * Also dispatches a "booking.cancelled" event to configured webhooks
 * (WEBHOOK_URL1, WEBHOOK_URL2) so n8n / external automations can react.
 */
export const cancelBookingByToken = createServerFn({ method: "POST" })
  .inputValidator((input) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabase.rpc("cancel_booking_by_token", {
      _token: data.token,
    });

    if (error) {
      console.error("[cancel] RPC error:", error);
      throw new Error("Грешка при отказване на резервацията.");
    }

    const booking = (rows ?? [])[0] as CancelledBooking | undefined;
    if (!booking) {
      throw new Error("Резервацията не е намерена или линкът е невалиден.");
    }

    // Only send email on first cancellation, not on idempotent re-hits.
    if (!booking.was_already_cancelled) {
      const { sendBookingCancellationEmail } = await import("./email.server");
      try {
        await sendBookingCancellationEmail({
          client_email: booking.client_email,
          client_name: booking.client_name,
          service_name: booking.service_name ?? "",
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
        });
      } catch (e) {
        console.error("[booking.cancelled] email send failed:", e);
      }
    }

    return booking;
  });
