# Melhorias e Backlog — TeoBase

Documento vivo. Atualizar conforme o projeto evolui — não é uma foto única,
é para ir marcando o que foi feito e acumulando o que falta.

Referência: `spec-projeto-teologia.md` (spec funcional/produto).

---

## Feito

- Projeto Next.js 16 (App Router, TypeScript, Tailwind) inicializado do zero.
- Schema Postgres completo no Supabase: `profiles`, `temas`, `discussoes`,
  `comentarios`, `leituras_recomendadas`, `interacoes_usuario` — com enums,
  índices e RLS em todas as tabelas.
- Trigger `handle_new_user` cria o `profile` automaticamente no cadastro.
- Clients Supabase (browser/server) via `@supabase/ssr` + `proxy.ts` de
  refresh de sessão (Next 16 renomeou `middleware.ts` → `proxy.ts`).
- Camada de dados agnóstica (`src/lib/data/*`), sem acoplamento a UI.
- Server Actions (`src/lib/actions/*`) para auth, temas, discussões,
  comentários e perfil.
- Script `scripts/verify-db.ts` para validar o backend ponta a ponta sem UI
  (`npm run verify` / `npm run verify -- --write`).
- Decisão: confirmação de email obrigatória no cadastro (padrão Supabase).
- Fix de segurança: trigger `protect_is_admin_before_update` bloqueia
  auto-promoção a admin (usuário autenticado alterando `is_admin` na própria
  linha via `UPDATE profiles`). Antes disso a policy de update do próprio
  perfil não restringia colunas, só a linha.

---

## Backlog imediato (fechar o MVP da spec)

Nenhuma UI foi construída ainda — o front está em prototipagem separada.
Quando o protótipo estiver definido, falta implementar:

- [ ] Landing page + fluxo de login/cadastro (`/`, `/login`, `/cadastro`)
- [ ] Tela "confirme seu email" pós-cadastro (consequência de manter a
      confirmação obrigatória)
- [ ] Área logada / página principal (`/home`)
- [ ] Catálogo de temas estático (`/temas`, `/temas/[slug]`)
- [ ] Discussões gerais + thread de comentários (`/discussoes`, `/discussoes/[id]`)
- [ ] Leitura recomendada (`/leitura-recomendada`)
- [ ] Perfil (modal/página): foto, bio, histórico de discussões (`/perfil`)
- [ ] Admin mínimo de Temas e Leitura Recomendada (`/admin`)
- [ ] Seed de dados iniciais (temas de exemplo, leituras curadas) — hoje o
      banco está vazio, sem isso não dá pra testar as telas com conteúdo real
- [ ] Registrar `Interacao_Usuario` nos pontos de leitura da UI (visualizou
      tema, etc.) — schema já existe, falta o disparo no front

---

## Evolução técnica

- [ ] CI (GitHub Actions): rodar `tsc --noEmit` + `lint` + `npm run verify`
      (read-only) a cada PR
- [ ] Testes automatizados da camada `src/lib/data` (hoje só há o script de
      verificação manual) — considerar Vitest com um projeto Supabase de
      teste dedicado
- [ ] Gerar `src/types/database.types.ts` via `supabase gen types` em vez de
      mantido à mão, assim que `supabase login` for viável no ambiente
      (hoje os tipos foram escritos manualmente a partir da migration)
- [ ] Deploy no Vercel + variáveis de ambiente de produção
- [ ] Observabilidade básica: logging estruturado nas Server Actions,
      alertas de erro (ex.: Sentry) antes de abrir para usuários reais
- [ ] Rate limiting nas Server Actions de escrita (`createComentario`,
      `createDiscussao`) — hoje qualquer usuário autenticado pode postar sem
      limite
- [ ] Paginação nas listagens (`listDiscussoesGerais`, `listComentariosByDiscussao`,
      etc.) — hoje trazem tudo de uma vez, não escala
- [ ] Revisar `bodySizeLimit` / `allowedOrigins` de Server Actions
      (`next.config.ts`) antes de produção

---

## Segurança

- [ ] Checklist de RLS: revisar policies antes de abrir cadastro público
      (hoje qualquer usuário autenticado lê o catálogo inteiro — aceitável
      para MVP, reavaliar se dados sensíveis entrarem no schema)
- [ ] Validação de input em todas as Server Actions com Zod (hoje só
      `auth.ts` valida; `temas`, `discussoes`, `comentarios`, `perfil`
      confiam no shape do TypeScript, que não protege contra payload
      malicioso em runtime)
- [ ] Sanitização de texto livre (`comentarios.texto`, `bio`) antes de
      renderizar no front — decidir se `texto` aceita Markdown/HTML e como
      neutralizar XSS
- [ ] Política de senha / proteção contra brute-force no login (Supabase
      tem rate limit básico; avaliar se precisa de camada extra)
- [ ] Segredos: confirmar que `.env.local` nunca é commitado (já no
      `.gitignore`) e que a `service_role key` do Supabase (se algum dia for
      usada, ex. para o admin) nunca vai para o client bundle
- [ ] Revisão de CORS/allowed origins quando o domínio de produção for
      definido

---

## Experiência do usuário

- [ ] Definir identidade visual (nenhum design system herdado — greenfield,
      conforme a spec)
- [ ] Estados de carregamento/erro consistentes nos formulários (Server
      Actions já retornam `{errors, message}` / `{data, error}` prontos pra
      isso — falta o componente de UI)
- [ ] Mensagens de erro em português, amigáveis (hoje `error.message` do
      Supabase vaza em inglês em alguns pontos, ex. "Invalid login
      credentials")
- [ ] Acessibilidade: formulários com labels associados, foco visível,
      navegação por teclado no fluxo de discussão/comentário
- [ ] Responsivo mobile-first (fórum de leitura/discussão — mobile tende a
      ser uso comum)
- [ ] Onboarding pós-cadastro: o que mostrar antes de o catálogo ter
      histórico de uso (primeira visita = "cold start" mencionado na spec)

---

## V2 (se houver retenção validada)

Direto da spec, mantido aqui como lembrete de que o schema **já suporta**
sem migração:

- [ ] Personalização do catálogo por interesse (`interacoes_usuario` já
      coleta dados desde o MVP)
- [ ] Favoritos funcionais no perfil
- [ ] `fonte_citada` estruturado (autor, obra, página) em vez de texto livre
- [ ] Biblioteca de fontes buscável

## V3 (pós-validação)

- [ ] Classificação por `tradicao_teologica` exposta na UI (filtros, badges)
- [ ] Assistente de contrapontos/fontes durante discussão
- [ ] Modo "arena" — debate estruturado com turnos e limite de palavras

---

## Fora de escopo (não fazer sem decisão explícita)

Repetido da spec para não escapar por scope creep durante o MVP:

- Motor de recomendação/personalização
- Sistema de reputação/gamificação
- Moderação automatizada por IA
- Debate estruturado tipo "arena"
- Login OAuth

---

## Decisões em aberto

- [ ] Front vai reaproveitar Tailwind + App Router deste mesmo repo (decidido)
      ou algum framework de componentes por cima (shadcn/ui, etc.)? — a
      definir quando o protótipo chegar
- [ ] Estratégia de moderação manual mínima para MVP (denunciar comentário?
      nem isso está no escopo hoje)
- [ ] Política de retenção/expurgo de `interacoes_usuario` (cresce sem
      limite, sem uso funcional até V2 — decidir se há TTL)
