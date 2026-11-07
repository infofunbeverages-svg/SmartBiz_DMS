-- Step 4: Route plan locking + change-request approval

alter table public.route_plans add column if not exists locked_at timestamptz;
alter table public.route_plans add column if not exists locked_by uuid;

alter table public.route_change_requests add column if not exists proposed_route_id uuid;
alter table public.route_change_requests add column if not exists proposed_day_of_week text;
alter table public.route_change_requests add column if not exists decided_at timestamptz;

-- 1) A LOCKED plan row cannot be edited or deleted directly (only an approved change may)
create or replace function public.guard_locked_route_plans()
returns trigger language plpgsql as $$
begin
  if current_setting('app.route_change_approved', true) = 'on' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  if tg_op = 'DELETE' then
    if old.status = 'LOCKED' then
      raise exception 'This route plan is locked. Submit a change request.';
    end if;
    return old;
  end if;

  if old.status = 'LOCKED' then
    raise exception 'This route plan is locked. Submit a change request.';
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_locked_route_plans on public.route_plans;
create trigger trg_guard_locked_route_plans
  before update or delete on public.route_plans
  for each row execute function public.guard_locked_route_plans();

-- 2) Approve a change request: applies the change to the locked plan
create or replace function public.approve_route_change(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.route_change_requests;
begin
  if public.get_my_role() not in
     ('SUPER_ADMIN','ADMIN','SALES_MANAGER','AREA_SALES_MANAGER','REGIONAL_MANAGER','AGENCY_OWNER') then
    raise exception 'You are not allowed to approve route changes';
  end if;

  select * into r from public.route_change_requests
   where id = p_request_id and status = 'PENDING' for update;
  if not found then raise exception 'Request not found or already decided'; end if;

  if public.get_my_role() <> 'SUPER_ADMIN' and not exists (
    select 1 from public.route_plans p join public.profiles pr on pr.id = p.sales_rep_id
     where p.id = r.route_plan_id and pr.company_id = public.get_my_company_id()
  ) then
    raise exception 'This request belongs to another company';
  end if;

  perform set_config('app.route_change_approved', 'on', true);
  update public.route_plans
     set route_id = coalesce(r.proposed_route_id, route_id),
         day_of_week = coalesce(r.proposed_day_of_week, day_of_week)
   where id = r.route_plan_id;

  update public.route_change_requests
     set status = 'APPROVED', approved_by = auth.uid(), decided_at = now()
   where id = p_request_id;
end $$;

-- 3) Reject a change request
create or replace function public.reject_route_change(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.get_my_role() not in
     ('SUPER_ADMIN','ADMIN','SALES_MANAGER','AREA_SALES_MANAGER','REGIONAL_MANAGER','AGENCY_OWNER') then
    raise exception 'You are not allowed to reject route changes';
  end if;
  update public.route_change_requests
     set status = 'REJECTED', approved_by = auth.uid(), decided_at = now()
   where id = p_request_id and status = 'PENDING';
end $$;

grant execute on function public.approve_route_change(uuid) to authenticated;
grant execute on function public.reject_route_change(uuid) to authenticated;

notify pgrst, 'reload schema';
