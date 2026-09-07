create or replace function public.validate_gmail_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or new.email !~* '^[^@\s]+@gmail\.com$' then
    raise exception 'Only trusted Gmail addresses ending in @gmail.com can be used to create an account.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_gmail_signup() from public, anon, authenticated;

drop trigger if exists enforce_gmail_signup on auth.users;

create trigger enforce_gmail_signup
  before insert on auth.users
  for each row
  execute function public.validate_gmail_signup();
