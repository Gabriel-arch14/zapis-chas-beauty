
CREATE OR REPLACE FUNCTION public.create_booking(
  _specialist_id uuid,
  _service_id uuid,
  _booking_date date,
  _booking_time time,
  _client_name text,
  _client_phone text,
  _client_email text
)
RETURNS TABLE(id uuid, cancel_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_token uuid;
BEGIN
  INSERT INTO public.bookings (
    specialist_id, service_id, booking_date, booking_time,
    client_name, client_phone, client_email, status
  ) VALUES (
    _specialist_id, _service_id, _booking_date, _booking_time,
    _client_name, _client_phone, COALESCE(_client_email, ''), 'confirmed'
  )
  RETURNING bookings.id, bookings.cancel_token INTO v_id, v_token;

  RETURN QUERY SELECT v_id, v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking(uuid, uuid, date, time, text, text, text) TO anon, authenticated;
