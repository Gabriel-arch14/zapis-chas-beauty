
-- Update primary specialist to Русева
UPDATE public.specialists 
SET name = 'Русева',
    specialty = 'Маникюр & Педикюр специалист',
    bio = 'С години опит в маникюра и педикюра, създавам перфектни нокти за всеки повод. Специализирам в гел лак, изграждане и арт маникюр.',
    photo_url = NULL
WHERE id = '0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4';

-- Remove the other specialist (cascades to services/bookings)
DELETE FROM public.specialists WHERE id = 'be2deb93-cccd-4453-9bca-0cbdd40fcd13';

-- Replace services with real Ruseva Nails Studio services
DELETE FROM public.services WHERE specialist_id = '0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4';

INSERT INTO public.services (specialist_id, name, price, duration_minutes) VALUES
('0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4', 'Гел лак', 35, 60),
('0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4', 'Изграждане на нокти', 55, 90),
('0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4', 'Маникюр + Гел лак', 40, 75),
('0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4', 'Педикюр + Гел лак', 45, 90),
('0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4', 'Сваляне на гел лак', 10, 20),
('0d21c5be-4efd-4ab8-8d2b-2cf43eea50b4', 'Арт маникюр (на нокът)', 5, 10);
