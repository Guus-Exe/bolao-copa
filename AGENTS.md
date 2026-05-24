# AGENTS.md — Bolão da Copa 2026

> Leia sempre o **README.md** antes de implementar qualquer coisa.

---

## Contexto do projeto

| | |
|---|---|
| **Nome** | Bolão da Copa 2026 |
| **Domínio** | bolaocopa-2026.vercel.app |
| **Auth** | Supabase Auth — cookie-based SSR sessions |
| **Banco** | Supabase PostgreSQL + Realtime + Storage |
| **Deploy** | Vercel — `main` branch = produção |
| **Segredos** | Nunca no client — apenas em Server Actions ou Route Handlers |

---

## Stack

Next.js App Router · TypeScript · Tailwind CSS · shadcn/ui · Supabase Auth · Supabase PostgreSQL · Supabase Realtime · Supabase Storage · Zod · React Hook Form · Vercel 

---

## Skills do projeto

> Consultar sempre a skill relevante antes de implementar.

- **bolao-architecture** — estrutura de pastas, Server/Client Components, fluxo de features
- **bolao-security** — autenticação, RLS, middleware, cookies, validação, upload seguro
- **bolao-ui-design** — layout, responsividade, Tailwind, shadcn/ui, componentes visuais

---

## Convenções de arquivo

| Tipo | Caminho |
|---|---|
| Componentes | `components/NomeComponente.tsx` (PascalCase) |
| Server Actions | `app/actions/nome-da-acao.ts` |
| Route Handlers | `app/api/recurso/route.ts` |
| Tipos globais | `types/nome.ts` |
| Queries Supabase | `lib/queries/recurso.ts` — nunca inline no componente |
| Schemas Zod | junto ao action/componente que o usa |
| Migrações SQL | `supabase/migrations/` — nunca criar manualmente |

---

## Regras gerais de comportamento

- **Modo silencioso:** ao usar `replace_file_content` ou `write_to_file`, não explique nem resuma. Apenas execute.
- Trabalhe em **etapas pequenas**. Nunca implemente tudo de uma vez.
- Ao final de cada etapa: liste arquivos alterados, como testar e qual é o próximo passo.
- Nunca instale dependências sem listar o motivo no plano antes de executar.

---

## Regras de paralelismo (multi-agent)

- Cada agente trabalha em **domínio isolado** — uma feature ou rota por agente.
- Dois agentes **nunca** editam o mesmo arquivo simultaneamente.
- Arquivos compartilhados são **read-only** para agentes paralelos:
  `lib/supabase.ts` · `middleware.ts` · `schema.sql`
  → Modificações nesses arquivos somente via tarefa sequencial dedicada.
- Ao criar um componente novo, criar também o arquivo de tipos se necessário.

---

## Proibido

- ✕ Usar `getUser()` no client — sempre via Server Action ou middleware
- ✕ Fazer fetch direto ao Supabase no client sem passar por RLS
- ✕ Expor `SUPABASE_SERVICE_ROLE_KEY` em qualquer contexto client
- ✕ Confiar em `user_id` vindo do client
- ✕ Criar arquivos `.env` ou logar variáveis de ambiente
- ✕ Criar migrações SQL manualmente — usar `supabase/migrations/`
- ✕ Usar `any` no TypeScript sem comentário explicando o motivo
- ✕ Ignorar validação de inputs — sempre usar Zod antes de processar dados

---

## Checklist de finalização

Todo agente deve executar antes de concluir:

- [ ] `tsc --noEmit` sem erros
- [ ] `eslint` sem warnings novos
- [ ] Testar a rota/feature no browser embutido — screenshot como Artifact
- [ ] Confirmar que nenhuma variável de ambiente está exposta no client bundle