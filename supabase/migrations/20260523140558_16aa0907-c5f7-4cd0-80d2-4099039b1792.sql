-- ============ BOOKINGS ============
-- Remove public SELECT (exposed names, phones, emails, cancel tokens)
DROP POLICY IF EXISTS "Anyone can view booking times" ON public.bookings;

-- Admins can view all bookings
CREATE POLICY "Admins can view bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ BLOCKED SLOTS ============
DROP POLICY IF EXISTS "Anyone can insert blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Anyone can delete blocked slots" ON public.blocked_slots;

CREATE POLICY "Admins can insert blocked slots"
ON public.blocked_slots
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blocked slots"
ON public.blocked_slots
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ AVAILABLE SLOTS ============
-- Enable RLS so existing policies are actually enforced
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow service role insert" ON public.available_slots;
DROP POLICY IF EXISTS "Anyone can mark slot unavailable" ON public.available_slots;

-- Admin-only UPDATE
CREATE POLICY "Admins can update available slots"
ON public.available_slots
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger: when a booking is created, mark its slot as unavailable.
-- Runs with definer privileges so the public booking flow keeps working
-- without giving anonymous users UPDATE access to available_slots.
CREATE OR REPLACE FUNCTION public.sync_available_slot_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.available_slots
       SET is_available = false
     WHERE slot_date = NEW.booking_date
       AND slot_time = NEW.booking_time;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- When a booking is cancelled, free its slot back up
    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
      UPDATE public.available_slots
         SET is_available = true
       WHERE slot_date = NEW.booking_date
         AND slot_time = NEW.booking_time;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_available_slot_on_booking ON public.bookings;
CREATE TRIGGER trg_sync_available_slot_on_booking
AFTER INSERT OR UPDATE OF status ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.sync_available_slot_on_booking();

-- Also free the slot when the cancel-by-token RPC fires (it bypasses the
-- normal trigger path because it sets status directly via UPDATE, which the
-- trigger already covers, so no extra change needed there).

-- ============ USER ROLES ============
-- Explicit admin-only write policies (defense in depth on top of RLS deny-by-default)
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));