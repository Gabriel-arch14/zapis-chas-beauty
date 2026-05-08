# Webhook & API Reference for n8n Integration

This document describes the events and endpoints the website exposes for
external automations (n8n, Zapier, etc.). Build your n8n flows against
this contract.

---

## 1. Outgoing webhooks

Both `WEBHOOK_URL1` and `WEBHOOK_URL2` (configured as Lovable Cloud secrets)
receive every event. They are called server-side from the site, with
`Content-Type: application/json`. Identify the event type via the `event`
field in the body.

### 1.1 `booking.created` — fired when a client confirms a booking

```json
{
  "event": "booking.created",
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "cancel_url": "https://your-domain.com/cancel?token=<uuid>",
  "client_name": "Иван Иванов",
  "client_email": "ivan@example.com",
  "client_phone": "+359 88 123 4567",
  "specialist_name": "Мария Русева",
  "service_name": "Маникюр с гел лак",
  "booking_date": "2026-05-12",
  "booking_time": "14:30"
}
```

**n8n usage**: send the confirmation email and include `cancel_url` as the
"Откажи резервация" button. The link is unique per booking and works
without login.

### 1.2 `booking.cancelled` — fired when a client visits their cancel link

Triggered the **first time** a booking is cancelled. Re-visiting the cancel
link does NOT re-fire the webhook (idempotent).

```json
{
  "event": "booking.cancelled",
  "booking_id": "550e8400-e29b-41d4-a716-446655440000",
  "client_name": "Иван Иванов",
  "client_email": "ivan@example.com",
  "client_phone": "+359 88 123 4567",
  "specialist_name": "Мария Русева",
  "service_name": "Маникюр с гел лак",
  "booking_date": "2026-05-12",
  "booking_time": "14:30",
  "cancelled_at": "2026-05-08T12:34:56.000Z",
  "status": "cancelled"
}
```

**n8n usage**:
- notify the studio (email / Telegram / SMS) that a slot freed up
- optionally remove the event from any external calendar
- mark the booking in your CRM as cancelled so reminder workflows skip it

---

## 2. Public read endpoint — reminder safety check

Before sending a scheduled reminder (e.g. 24h or 2h before the appointment),
n8n **must** call this endpoint and only proceed when
`should_send_reminder` is `true`. This prevents sending reminders for
bookings that were cancelled after the reminder was queued.

```
GET https://<your-domain>/api/public/booking-status/<booking_id>
```

Response (200):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "confirmed",
  "cancelled_at": null,
  "booking_date": "2026-05-12",
  "booking_time": "14:30:00",
  "should_send_reminder": true
}
```

Response (404) if the booking no longer exists.

### Recommended n8n reminder flow

```
Cron (hourly)
  → fetch bookings 24h ahead from your queue
  → HTTP Request: GET /api/public/booking-status/{{ $json.booking_id }}
  → IF should_send_reminder == true
       → send email / SMS reminder
     ELSE
       → skip + log
```

---

## 3. Database fields added for cancellation

| Column         | Type        | Purpose                                              |
| -------------- | ----------- | ---------------------------------------------------- |
| `cancel_token` | `uuid`      | Unique per booking, auto-generated. Capability key   |
|                |             | for the public cancellation URL.                     |
| `cancelled_at` | `timestamptz` | Set when the booking transitions to `cancelled`.   |

The booking `status` is set to `"cancelled"` on cancellation. Existing
queries that filter `status != 'cancelled'` (e.g. the slot picker) already
exclude cancelled bookings, so freed slots become bookable again
immediately.

---

## 4. Security notes

- The `cancel_token` is a UUID v4. Treat the cancel URL like a password —
  do not log it or share it. Send it only to the booking's own email.
- The reminder-status endpoint is **read-only** and intentionally public so
  n8n can call it without managing API keys. It returns no PII (no name,
  email, or phone).
- The cancel webhook fires only on the first cancellation, so n8n flows
  don't need to deduplicate.
