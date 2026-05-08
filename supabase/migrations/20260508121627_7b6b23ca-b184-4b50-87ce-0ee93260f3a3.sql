
-- Add cancel_token + cancelled_at to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancel_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_cancel_token_key ON public.bookings(cancel_token);

-- Allow public cancellation by knowing the cancel_token (acts as a capability)
-- We restrict updates so only status/cancelled_at can be changed AND only when the token matches
-- Using a security definer function is safer than a public UPDATE policy.

CREATE OR REPLACE FUNCTION public.cancel_booking_by_token(_token uuid)
RETURNS TABLE (
  id uuid,
  client_name text,
  client_email text,
  client_phone text,
  booking_date date,
  booking_time time,
  status text,
  specialist_name text,
  service_name text,
  cancelled_at timestamptz,
  was_already_cancelled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_already boolean := false;
  v_specialist_name text;
  v_service_name text;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE cancel_token = _token;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_booking.status = 'cancelled' THEN
    v_already := true;
  ELSE
    UPDATE public.bookings
       SET status = 'cancelled',
           cancelled_at = now()
     WHERE cancel_token = _token
     RETURNING * INTO v_booking;
  END IF;

  SELECT s.name INTO v_specialist_name FROM public.specialists s WHERE s.id = v_booking.specialist_id;
  SELECT sv.name INTO v_service_name FROM public.services sv WHERE sv.id = v_booking.service_id;

  RETURN QUERY SELECT
    v_booking.id,
    v_booking.client_name,
    v_booking.client_email,
    v_booking.client_phone,
    v_booking.booking_date,
    v_booking.booking_time,
    v_booking.status,
    v_specialist_name,
    v_service_name,
    v_booking.cancelled_at,
    v_already;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_booking_by_token(uuid) TO anon, authenticated;

-- Public read of booking status by id (for n8n reminder safety check)
CREATE OR REPLACE FUNCTION public.get_booking_status(_id uuid)
RETURNS TABLE (id uuid, status text, cancelled_at timestamptz, booking_date date, booking_time time)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, status, cancelled_at, booking_date, booking_time FROM public.bookings WHERE id = _id;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_status(uuid) TO anon, authenticated;
