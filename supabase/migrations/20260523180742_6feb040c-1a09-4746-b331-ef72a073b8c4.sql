ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_specialist_id_booking_date_booking_time_key;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_slot_unique
ON public.bookings (specialist_id, booking_date, booking_time)
WHERE status <> 'cancelled';