-- =============================================================================
-- Schema inicial - Plataforma Interativa de Teologia e Filosofia
-- Baseado em spec-projeto-teologia.md
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.nivel_leitura as enum ('introdutorio', 'intermediario', 'avancado');
create type public.discussao_tipo as enum ('tema', 'geral');
create type public.tipo_registro as enum ('devocional', 'academico', 'filosofico');
create type public.tipo_interacao as enum ('visualizou', 'favoritou', 'comentou');

-- ---------------------------------------------------------------------------
-- Tabela: profiles (Usuario)
-- Estende auth.users (1-1). Email e senha continuam em auth.users.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  tradicao_declarada text,
  bio text,
  foto_url text,
  is_admin boolean not null default false,
  criado_em timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil do usuário (Usuario na spec), 1-1 com auth.users.';

-- Cria o profile automaticamente quando um novo usuário se cadastra no Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Tabela: temas (Tema)
-- ---------------------------------------------------------------------------

create table public.temas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descricao text,
  categoria text not null,
  nivel_leitura public.nivel_leitura not null default 'introdutorio',
  destaque_inicial boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tabela: discussoes (Discussao)
-- ---------------------------------------------------------------------------

create table public.discussoes (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid references public.temas (id) on delete set null,
  tipo public.discussao_tipo not null,
  titulo text not null,
  autor_id uuid not null references public.profiles (id) on delete cascade,
  criado_em timestamptz not null default now(),
  constraint discussao_tema_coerente check (
    (tipo = 'tema' and tema_id is not null) or
    (tipo = 'geral' and tema_id is null)
  )
);

create index discussoes_tema_id_idx on public.discussoes (tema_id);
create index discussoes_autor_id_idx on public.discussoes (autor_id);

-- ---------------------------------------------------------------------------
-- Tabela: comentarios (Comentario)
-- ---------------------------------------------------------------------------

create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  discussao_id uuid not null references public.discussoes (id) on delete cascade,
  autor_id uuid not null references public.profiles (id) on delete cascade,
  texto text not null,
  fonte_citada text,
  tipo_registro public.tipo_registro,
  resposta_a uuid references public.comentarios (id) on delete cascade,
  criado_em timestamptz not null default now()
);

create index comentarios_discussao_id_idx on public.comentarios (discussao_id);
create index comentarios_autor_id_idx on public.comentarios (autor_id);
create index comentarios_resposta_a_idx on public.comentarios (resposta_a);

-- ---------------------------------------------------------------------------
-- Tabela: leituras_recomendadas (Leitura_Recomendada)
-- ---------------------------------------------------------------------------

create table public.leituras_recomendadas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text not null,
  link_ou_referencia text not null,
  tema_id uuid references public.temas (id) on delete set null,
  ordem_exibicao int not null default 0
);

create index leituras_recomendadas_tema_id_idx on public.leituras_recomendadas (tema_id);

-- ---------------------------------------------------------------------------
-- Tabela: interacoes_usuario (Interacao_Usuario)
-- Schema criado desde o MVP sem uso funcional ainda - alimenta personalização
-- futura (V2/V3) sem exigir migração depois.
-- ---------------------------------------------------------------------------

create table public.interacoes_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  tema_id uuid not null references public.temas (id) on delete cascade,
  tipo_interacao public.tipo_interacao not null,
  criado_em timestamptz not null default now()
);

create index interacoes_usuario_usuario_id_idx on public.interacoes_usuario (usuario_id);
create index interacoes_usuario_tema_id_idx on public.interacoes_usuario (tema_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.temas enable row level security;
alter table public.discussoes enable row level security;
alter table public.comentarios enable row level security;
alter table public.leituras_recomendadas enable row level security;
alter table public.interacoes_usuario enable row level security;

-- Helper: verifica se o usuário autenticado atual é admin, sem recursão de RLS.
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profiles ---------------------------------------------------------------

create policy "profiles: leitura para usuários autenticados"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles: usuário insere o próprio perfil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles: usuário atualiza o próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- temas --------------------------------------------------------------------

create policy "temas: leitura para usuários autenticados"
  on public.temas for select
  to authenticated
  using (true);

create policy "temas: admin gerencia"
  on public.temas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- discussoes -----------------------------------------------------------------

create policy "discussoes: leitura para usuários autenticados"
  on public.discussoes for select
  to authenticated
  using (true);

create policy "discussoes: autor cria com o próprio autor_id"
  on public.discussoes for insert
  to authenticated
  with check (auth.uid() = autor_id);

create policy "discussoes: autor atualiza as próprias"
  on public.discussoes for update
  to authenticated
  using (auth.uid() = autor_id)
  with check (auth.uid() = autor_id);

create policy "discussoes: autor apaga as próprias"
  on public.discussoes for delete
  to authenticated
  using (auth.uid() = autor_id);

-- comentarios ------------------------------------------------------------

create policy "comentarios: leitura para usuários autenticados"
  on public.comentarios for select
  to authenticated
  using (true);

create policy "comentarios: autor cria com o próprio autor_id"
  on public.comentarios for insert
  to authenticated
  with check (auth.uid() = autor_id);

create policy "comentarios: autor atualiza os próprios"
  on public.comentarios for update
  to authenticated
  using (auth.uid() = autor_id)
  with check (auth.uid() = autor_id);

create policy "comentarios: autor apaga os próprios"
  on public.comentarios for delete
  to authenticated
  using (auth.uid() = autor_id);

-- leituras_recomendadas ---------------------------------------------------

create policy "leituras_recomendadas: leitura para usuários autenticados"
  on public.leituras_recomendadas for select
  to authenticated
  using (true);

create policy "leituras_recomendadas: admin gerencia"
  on public.leituras_recomendadas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- interacoes_usuario -------------------------------------------------------

create policy "interacoes_usuario: usuário lê as próprias"
  on public.interacoes_usuario for select
  to authenticated
  using (auth.uid() = usuario_id);

create policy "interacoes_usuario: usuário registra as próprias"
  on public.interacoes_usuario for insert
  to authenticated
  with check (auth.uid() = usuario_id);
