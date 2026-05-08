import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Public read-only endpoint for n8n (or any reminder automation) to verify
 * a booking is still active before sending a reminder.
 *
 * GET /api/public/booking-status/:id
 *
 * Response:
 *   200 OK
 *   {
 *     "id": "uuid",
 *     "status": "confirmed" | "cancelled",
 *     "cancelled_at": "2026-05-08T12:34:56.000Z" | null,
 *     "booking_date": "2026-05-12",
 *     "booking_time": "14:30:00",
 *     "should_send_reminder": true | false   // false if cancelled
 *   }
 *
 *   404 Not Found if booking does not exist.
 *
 * Recommended n8n flow:
 *   1. Reminder cron picks up bookings 24h ahead
 *   2. For each booking, call this endpoint with the booking_id
 *   3. Only send the reminder if `should_send_reminder` is true
 */
export const Route = createFileRoute("/api/public/booking-status/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        if (!/^[0-9a-f-]{36}$/i.test(id)) {
          return new Response(JSON.stringify({ error: "Invalid booking id" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabaseAdmin
          .from("bookings")
          .select("id,status,cancelled_at,booking_date,booking_time")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("[booking-status] db error:", error);
          return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!data) {
          return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return Response.json({
          ...data,
          should_send_reminder: data.status !== "cancelled",
        });
      },
    },
  },
});
