import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const payloadSchema = z.object({
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
    const urls = [process.env.WEBHOOK_URL_1, process.env.WEBHOOK_URL_2].filter(
      (u): u is string => !!u,
    );

    const results = await Promise.allSettled(
      urls.map((url) =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      ),
    );

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Webhook ${i + 1} failed:`, r.reason);
      } else if (!r.value.ok) {
        console.error(`Webhook ${i + 1} returned ${r.value.status}`);
      }
    });

    return { ok: true };
  });
