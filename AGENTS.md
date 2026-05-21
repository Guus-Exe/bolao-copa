# AGENTS.md — Bolão da Copa 2026

Leia sempre o README.md antes de implementar qualquer coisa.

O projeto deve seguir esta stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase PostgreSQL
- Supabase Realtime
- Supabase Storage
- Zod
- React Hook Form
- Vercel

Use as skills do projeto quando necessário:

- bolao-architecture: estrutura de pastas, organização, Server/Client Components e fluxo de features.
- bolao-security: autenticação, autorização, RLS, middleware, cookies, validação, Supabase e upload seguro.
- bolao-ui-design: layout, responsividade, Tailwind, shadcn/ui, páginas e componentes visuais.

Regras:
- Não implemente tudo de uma vez.
- Trabalhe por etapas pequenas.
- Não exponha SUPABASE_SERVICE_ROLE_KEY no client.
- Não confie em user_id vindo do client.
- Sempre valide inputs com Zod.
- Ao final de cada etapa, explique arquivos alterados, como testar e próximo passo.