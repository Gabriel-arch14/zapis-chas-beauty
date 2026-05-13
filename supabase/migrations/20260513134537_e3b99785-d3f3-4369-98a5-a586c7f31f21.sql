
DROP POLICY IF EXISTS "Admins can insert blocked slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Admins can delete blocked slots" ON public.blocked_slots;

CREATE POLICY "Anyone can insert blocked slots"
  ON public.blocked_slots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete blocked slots"
  ON public.blocked_slots FOR DELETE
  USING (true);
