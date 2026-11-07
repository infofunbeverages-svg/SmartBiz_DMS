-- Step 2: Duty On/Off setup
alter table public.duty_logs add column if not exists odometer numeric;
alter table public.duty_logs add column if not exists vehicle_no text;

-- Private bucket for duty selfies
insert into storage.buckets (id, name, public)
values ('duty-selfies', 'duty-selfies', false)
on conflict (id) do nothing;

drop policy if exists "duty selfies insert own" on storage.objects;
create policy "duty selfies insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'duty-selfies' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "duty selfies read own" on storage.objects;
create policy "duty selfies read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'duty-selfies' and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
