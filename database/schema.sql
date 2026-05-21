-- Bolao da Copa 2026 - schema inicial
-- Execute este arquivo no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  full_name text,
  is_paid boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists is_paid boolean not null default false,
  add column if not exists is_admin boolean not null default false;

do $$
begin
  -- Migra bancos antigos que tenham usado approved/role para o contrato final.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'approved'
  ) then
    update public.profiles
    set is_paid = coalesce(is_paid, false) or coalesce(approved, false);

    alter table public.profiles drop column approved;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
  ) then
    update public.profiles
    set is_admin = coalesce(is_admin, false)
      or lower(coalesce(role::text, '')) in ('admin', 'administrator');

    alter table public.profiles drop column role;
  end if;
end;
$$;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  home_flag text not null,
  away_flag text not null,
  match_date timestamptz not null,
  stage text not null check (stage in ('grupo', 'oitavas', 'quartas', 'semi', 'final')),
  group_name text,
  home_score int check (home_score is null or home_score >= 0),
  away_score int check (away_score is null or away_score >= 0),
  is_finished boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  predicted_home_score int not null check (predicted_home_score >= 0 and predicted_home_score <= 20),
  predicted_away_score int not null check (predicted_away_score >= 0 and predicted_away_score <= 20),
  points_earned int check (points_earned is null or points_earned >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, game_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists games_match_date_idx on public.games(match_date);
create index if not exists predictions_user_id_idx on public.predictions(user_id);
create index if not exists predictions_game_id_idx on public.predictions(game_id);
create index if not exists chat_messages_created_at_idx on public.chat_messages(created_at);

drop view if exists public.ranking_view;
create view public.ranking_view as
select
  p.id as user_id,
  p.username,
  p.avatar_url,
  coalesce(sum(coalesce(pr.points_earned, 0)), 0)::int as total_points,
  count(pr.id)::int as total_predictions,
  count(
    case
      -- Conta placar exato somente quando o jogo ja tem resultado final.
      when g.is_finished = true
        and g.home_score is not null
        and g.away_score is not null
        and pr.predicted_home_score = g.home_score
        and pr.predicted_away_score = g.away_score
      then 1
    end
  )::int as exact_scores,
  count(case when coalesce(pr.points_earned, 0) > 0 then 1 end)::int as correct_predictions,
  rank() over (
    order by
      coalesce(sum(coalesce(pr.points_earned, 0)), 0) desc,
      count(
        case
          when g.is_finished = true
            and g.home_score is not null
            and g.away_score is not null
            and pr.predicted_home_score = g.home_score
            and pr.predicted_away_score = g.away_score
          then 1
        end
      ) desc,
      count(pr.id) desc,
      p.username asc
  )::int as position
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
left join public.games g on g.id = pr.game_id
where p.is_paid = true
group by p.id, p.username, p.avatar_url
order by total_points desc, exact_scores desc, total_predictions desc, p.username asc;

grant select on public.ranking_view to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and is_admin = true
  );
$$;

create or replace function public.calculate_game_points(p_game_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_home_score int;
  v_away_score int;
  v_updated int := 0;
  rec record;
  v_points int;
begin
  -- Busca o resultado oficial; pontuacao so roda para jogo encerrado.
  select home_score, away_score
  into v_home_score, v_away_score
  from public.games
  where id = p_game_id
    and is_finished = true
    and home_score is not null
    and away_score is not null;

  if not found then
    raise exception 'Jogo % nao encontrado ou nao finalizado', p_game_id;
  end if;

  -- Atualiza cada palpite do jogo seguindo as regras da Parte 3.
  for rec in
    select id, predicted_home_score, predicted_away_score
    from public.predictions
    where game_id = p_game_id
  loop
    if rec.predicted_home_score = v_home_score
       and rec.predicted_away_score = v_away_score then
      v_points := 10;
    elsif sign(rec.predicted_home_score - rec.predicted_away_score)
          = sign(v_home_score - v_away_score)
      and (rec.predicted_home_score - rec.predicted_away_score)
          = (v_home_score - v_away_score) then
      v_points := 7;
    elsif sign(rec.predicted_home_score - rec.predicted_away_score)
          = sign(v_home_score - v_away_score)
      and sign(v_home_score - v_away_score) <> 0 then
      v_points := 5;
    elsif rec.predicted_home_score = rec.predicted_away_score
      and v_home_score = v_away_score then
      v_points := 3;
    else
      v_points := 0;
    end if;

    update public.predictions
    set points_earned = v_points
    where id = rec.id;

    v_updated := v_updated + 1;
  end loop;

  return v_updated;
end;
$$;

create or replace function public.slugify_username(raw_email text)
returns text
language plpgsql
as $$
declare
  base_username text;
  candidate text;
  suffix int := 0;
begin
  base_username := lower(split_part(coalesce(raw_email, 'usuario'), '@', 1));
  base_username := regexp_replace(base_username, '[^a-z0-9_]+', '_', 'g');
  base_username := trim(both '_' from base_username);

  if char_length(base_username) < 3 then
    base_username := 'usuario';
  end if;

  candidate := left(base_username, 20);

  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_username, greatest(3, 20 - char_length(suffix::text) - 1)) || '_' || suffix::text;
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    public.slugify_username(new.email),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists profiles_prevent_role_self_update on public.profiles;
drop function if exists public.prevent_profile_role_self_update();

create or replace function public.prevent_profile_flags_self_update()
returns trigger
language plpgsql
as $$
begin
  -- Usuarios comuns podem editar o proprio perfil, mas nao podem elevar permissao/acesso.
  if auth.role() <> 'service_role'
    and (new.is_paid is distinct from old.is_paid or new.is_admin is distinct from old.is_admin)
  then
    raise exception 'is_paid e is_admin so podem ser alterados por operacoes administrativas';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_flags_self_update on public.profiles;
create trigger profiles_prevent_flags_self_update
before update on public.profiles
for each row execute function public.prevent_profile_flags_self_update();

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.predictions enable row level security;
alter table public.chat_messages enable row level security;

-- Grants explicitos para o PostgREST enxergar as tabelas.
-- A seguranca continua sendo definida pelas policies de RLS abaixo.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.games to authenticated;
grant insert, update, delete on public.games to authenticated;
grant select, insert, update, delete on public.predictions to authenticated;
grant select, insert on public.chat_messages to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "games_select_authenticated" on public.games;
create policy "games_select_authenticated"
on public.games for select
to authenticated
using (true);

drop policy if exists "games_insert_admin" on public.games;
create policy "games_insert_admin"
on public.games for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "games_update_admin" on public.games;
create policy "games_update_admin"
on public.games for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "games_delete_admin" on public.games;
create policy "games_delete_admin"
on public.games for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "predictions_select_own_or_admin" on public.predictions;
create policy "predictions_select_own_or_admin"
on public.predictions for select
to authenticated
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "predictions_insert_own_before_deadline" on public.predictions;
create policy "predictions_insert_own_before_deadline"
on public.predictions for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.games
    where games.id = game_id
      and games.match_date > now() + interval '1 hour'
      and games.is_finished = false
  )
);

drop policy if exists "predictions_update_own_before_deadline" on public.predictions;
create policy "predictions_update_own_before_deadline"
on public.predictions for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.games
    where games.id = game_id
      and games.match_date > now() + interval '1 hour'
      and games.is_finished = false
  )
);

drop policy if exists "chat_messages_select_authenticated" on public.chat_messages;
create policy "chat_messages_select_authenticated"
on public.chat_messages for select
to authenticated
using (true);

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
on public.chat_messages for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
end;
$$;
