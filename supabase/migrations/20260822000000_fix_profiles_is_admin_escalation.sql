-- =============================================================================
-- Fix: impede auto-promoção a admin via UPDATE em profiles
--
-- A policy "profiles: usuário atualiza o próprio perfil" permite update na
-- própria linha (auth.uid() = id), mas não restringe quais colunas podem
-- mudar. RLS não faz checagem column-level, então qualquer usuário
-- autenticado podia rodar:
--   update profiles set is_admin = true where id = auth.uid();
-- e conceder admin a si mesmo. Este trigger bloqueia mudanças em is_admin
-- vindas da API (JWT autenticado via PostgREST/Supabase client), mas deixa
-- passar mudanças feitas direto no SQL Editor (sem contexto de JWT), que é
-- como um admin deve ser promovido no MVP.
-- =============================================================================

create function public.protect_is_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() = 'authenticated' then
    raise exception 'não é permitido alterar is_admin pela API; promova admins pelo SQL Editor';
  end if;
  return new;
end;
$$;

create trigger protect_is_admin_before_update
  before update on public.profiles
  for each row execute function public.protect_is_admin();
