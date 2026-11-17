-- Apply in the Supabase SQL editor or with `supabase db push`.
-- A scorebook is one transactional document: players, sessions and round scores.
create table public.scorebooks (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(trim(name)) between 1 and 80),
 owner_id uuid not null references auth.users(id),
 invite_code uuid not null default gen_random_uuid() unique,
 data jsonb not null default '{"players":[],"games":[]}'::jsonb
   check (coalesce(jsonb_typeof(data->'players') = 'array' and jsonb_typeof(data->'games') = 'array', false)),
 revision bigint not null default 0,
 updated_at timestamptz not null default now()
);
create table public.scorebook_members (
 scorebook_id uuid not null references public.scorebooks(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 primary key (scorebook_id,user_id)
);
alter table public.scorebooks enable row level security;
alter table public.scorebook_members enable row level security;

create function public.is_scorebook_member(book uuid) returns boolean
 language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.scorebook_members where scorebook_id=book and user_id=auth.uid());
$$;
revoke all on function public.is_scorebook_member(uuid) from public, anon;
grant execute on function public.is_scorebook_member(uuid) to authenticated;
create policy "Members read scorebooks" on public.scorebooks for select to authenticated
 using (public.is_scorebook_member(id));
create policy "Members edit scorebook data" on public.scorebooks for update to authenticated
 using (public.is_scorebook_member(id)) with check (public.is_scorebook_member(id));
create policy "Read own memberships" on public.scorebook_members for select to authenticated
 using (user_id=auth.uid());
revoke all on public.scorebooks, public.scorebook_members from anon, authenticated;
grant select on public.scorebooks, public.scorebook_members to authenticated;
grant update (data, revision) on public.scorebooks to authenticated;

create function public.scorebook_before_update() returns trigger
 language plpgsql set search_path = '' as $$
begin
 if new.revision <> old.revision + 1 then raise exception 'Invalid scorebook revision'; end if;
 new.updated_at=now();
 return new;
end;
$$;
create trigger scorebook_revision before update on public.scorebooks
 for each row execute function public.scorebook_before_update();

create function public.create_scorebook(book_name text) returns uuid
 language plpgsql security definer set search_path = '' as $$
declare book uuid;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 insert into public.scorebooks(name,owner_id) values(trim(book_name),auth.uid()) returning id into book;
 insert into public.scorebook_members values(book,auth.uid());
 return book;
end;
$$;
create function public.join_scorebook(code uuid) returns uuid
 language plpgsql security definer set search_path = '' as $$
declare book uuid;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select id into book from public.scorebooks where invite_code=code;
 if book is null then raise exception 'Invite code not found'; end if;
 insert into public.scorebook_members values(book,auth.uid()) on conflict do nothing;
 return book;
end;
$$;
revoke all on function public.create_scorebook(text), public.join_scorebook(uuid) from public, anon;
grant execute on function public.create_scorebook(text), public.join_scorebook(uuid) to authenticated;
