create table if not exists public.chat_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique(message_id, user_id)
);

create index if not exists chat_reactions_message_id_idx on public.chat_reactions(message_id);

alter table public.chat_reactions enable row level security;
alter table public.chat_reactions replica identity full;

grant select, insert, delete on public.chat_reactions to authenticated;

drop policy if exists "chat_reactions_select_authenticated" on public.chat_reactions;
create policy "chat_reactions_select_authenticated"
on public.chat_reactions for select
to authenticated
using (true);

drop policy if exists "chat_reactions_insert_own" on public.chat_reactions;
create policy "chat_reactions_insert_own"
on public.chat_reactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "chat_reactions_delete_own" on public.chat_reactions;
create policy "chat_reactions_delete_own"
on public.chat_reactions for delete
to authenticated
using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.chat_reactions;
exception
  when duplicate_object then null;
end;
$$;
