
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
ON public.available_slots FOR SELECT
USING (true);

CREATE POLICY "Anyone can mark slot unavailable"
ON public.available_slots FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can insert available slots"
ON public.available_slots FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete available slots"
ON public.available_slots FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
