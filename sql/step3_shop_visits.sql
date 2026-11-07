-- Step 3: Shop QR + location + visit distance + QR lock

-- Shop location + unique QR code
alter table public.shops add column if not exists lat numeric;
alter table public.shops add column if not exists lng numeric;
alter table public.shops add column if not exists qr_code text;

update public.shops
   set qr_code = 'SB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
 where qr_code is null;

alter table public.shops
  alter column qr_code set default ('SB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)));

create unique index if not exists shops_qr_code_key on public.shops (qr_code);

-- Per-agency switch: reps must scan the shop QR to select a shop
alter table public.agencies add column if not exists require_shop_qr boolean not null default false;

-- Distance between rep and shop at visit time (metres)
alter table public.sfa_visits add column if not exists distance_m numeric;

notify pgrst, 'reload schema';
