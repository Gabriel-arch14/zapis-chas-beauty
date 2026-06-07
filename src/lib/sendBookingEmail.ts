import { supabase } from "@/integrations/supabase/client";

export type BookingEmailPayload = {
  eventType: "confirmation" | "cancellation";
  client_email: string;
  client_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  specialist_name?: string;
  cancel_url?: string;
};

/**
 * Invoke the Supabase Edge Function `send-booking-email`.
 * Failures are logged and swallowed — booking flows must not break if email fails.
 */
export async function sendBookingEmail(payload: BookingEmailPayload): Promise<void> {
  if (!payload.client_email) return;
  try {
    const { data, error } = await supabase.functions.invoke("send-booking-email", {
      body: payload,
    });
    if (error) {
      console.error("[sendBookingEmail] invoke error:", error);
    } else {
      console.log("[sendBookingEmail] ok:", data);
    }
  } catch (e) {
    console.error("[sendBookingEmail] unexpected error:", e);
  }
}
