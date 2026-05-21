# 🏆 Bolão da Copa 2026

Plataforma web para bolão da Copa do Mundo. Usuários se cadastram, fazem palpites nos jogos, interagem num chat em tempo real e competem num ranking de pontuação. O administrador gerencia os jogos, resultados e o acesso dos participantes manualmente.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [Regras de Pontuação](#regras-de-pontuação)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Instalação](#instalação)
- [Rodando o Projeto](#rodando-o-projeto)
- [Deploy](#deploy)
- [Roadmap de Desenvolvimento](#roadmap-de-desenvolvimento)
- [Skills do Projeto](#skills-do-projeto)

---

## Visão Geral

O Bolão da Copa é um SaaS simples e focado. O administrador cadastra os jogos e libera o acesso dos usuários manualmente. Usuários com acesso liberado podem fazer palpites, conversar no chat e acompanhar o ranking em tempo real.

**Fluxo principal:**
1. Usuário se cadastra via /signup
2. Admin libera o acesso no painel (`is_paid = true`)
3. Usuário faz palpites antes dos jogos começarem
4. Admin insere os resultados após cada jogo
5. Pontos são calculados automaticamente
6. Ranking atualiza em tempo real

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage (avatares) |
| Deploy | Vercel |
| Validação | Zod |
| Formulários | React Hook Form |

---

## Funcionalidades

### Usuário
- ✅ Cadastro e login com email e senha
- ✅ Palpites em todos os jogos da Copa (até 1h antes do início)
- ✅ Chat em tempo real com outros participantes
- ✅ Ranking com pontuação acumulada
- ✅ Perfil personalizável (apelido, foto, email, senha)

### Administrador
- ✅ Cadastro, edição e exclusão de jogos
- ✅ Inserção de resultados com cálculo automático de pontos
- ✅ Gerenciamento de usuários (liberar/revogar acesso, promover admin)
- ✅ Visão geral do bolão (total de usuários, acessos, jogos)

---

## Estrutura do Projeto

```
bolao-da-copa/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          # Layout protegido
│   │   ├── dashboard/page.tsx  # Jogos + palpites
│   │   ├── ranking/page.tsx
│   │   ├── chat/page.tsx
│   │   └── perfil/page.tsx
│   ├── admin/
│   │   ├── layout.tsx          # Verifica is_admin
│   │   ├── page.tsx
│   │   ├── jogos/page.tsx
│   │   └── usuarios/page.tsx
│   ├── actions/                # Server Actions por domínio
│   │   ├── auth.ts
│   │   ├── predictions.ts
│   │   ├── chat.ts
│   │   ├── profile.ts
│   │   └── admin.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui (não editar manualmente)
│   ├── layout/                 # Header, Sidebar, BottomNav
│   ├── landing/                # Seções da landing page
│   ├── games/                  # GameCard, PredictionInput
│   ├── chat/                   # ChatRoom, MessageBubble
│   ├── ranking/                # RankingTable, Podium
│   ├── profile/                # AvatarUpload, UsernameForm
│   └── admin/                  # GameForm, UserTable, ResultModal
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── admin.ts            # Service role (server-only)
│   ├── validations.ts          # Schemas Zod
│   ├── scoring.ts              # Lógica de pontuação
│   ├── utils.ts                # cn(), formatDate()
│   └── constants.ts            # SCORING_RULES, STAGES
├── hooks/
│   ├── useSession.ts
│   ├── useProfile.ts
│   └── useRealtimeChat.ts
├── types/
│   ├── database.ts             # Gerado pelo Supabase CLI
│   └── index.ts                # Tipos de domínio
├── middleware.ts               # Proteção de rotas
├── .env.local                  # Variáveis privadas (não commitar)
└── .env.example
```

---

## Banco de Dados

### Tabelas

#### `profiles`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | FK para auth.users |
| username | text | Apelido público único |
| avatar_url | text | URL da foto de perfil |
| full_name | text | Nome completo |
| is_paid | boolean | Acesso liberado pelo admin |
| is_admin | boolean | Permissão de administrador |
| created_at | timestamptz | — |
| updated_at | timestamptz | — |

#### `games`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | — |
| home_team / away_team | text | Nome dos times |
| home_flag / away_flag | text | Emoji da bandeira |
| match_date | timestamptz | Data e hora do jogo |
| stage | text | grupo / oitavas / quartas / semi / final |
| group_name | text | Grupo (A–H), nullable |
| home_score / away_score | int | Resultado, preenchido pelo admin |
| is_finished | boolean | Jogo encerrado |

#### `predictions`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | — |
| user_id | uuid | FK profiles |
| game_id | uuid | FK games |
| predicted_home_score | int | Palpite do placar |
| predicted_away_score | int | Palpite do placar |
| points_earned | int | Calculado após resultado |

#### `chat_messages`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | — |
| user_id | uuid | FK profiles |
| content | text | Conteúdo da mensagem |
| created_at | timestamptz | — |

### Gerar tipagens do banco

```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > types/database.ts
```

---

## Regras de Pontuação

| Situação | Pontos |
|---|---|
| Placar exato | 10 pts |
| Vencedor certo + diferença de gols certa | 7 pts |
| Vencedor certo | 5 pts |
| Empate certo (placar errado) | 3 pts |
| Errou | 0 pts |

> Regras configuráveis em `lib/constants.ts` → `SCORING_RULES`

---

## Configuração do Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Supabase — encontre em: supabase.com > seu projeto > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # chave pública (pode ir ao client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # chave privada (apenas server-side)
```

> ⚠️ Nunca commite o `.env.local`. Ele já está no `.gitignore`.
> O arquivo `.env.example` contém o template sem valores reais — commite ele.

---

## Instalação

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (para deploy)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/bolao-da-copa.git
cd bolao-da-copa

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase

# 4. Execute o schema SQL no Supabase
# Acesse: supabase.com > seu projeto > SQL Editor
# Cole e execute o conteúdo de: database/schema.sql

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Rodando o Projeto

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servidor de produção local
npm run lint     # verificar erros de lint
```

### Criar o primeiro admin

Após criar sua conta via `/signup`, execute no **SQL Editor do Supabase**:

```sql
UPDATE profiles
SET is_admin = true, is_paid = true
WHERE id = 'SEU_USER_ID';

-- Para encontrar seu user_id:
SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
```

---

## Deploy

### Vercel (recomendado)

1. Faça push do projeto para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy automático a cada push na branch `main`

---

## Roadmap de Desenvolvimento

Ordem recomendada de construção:

- [ ] **Parte 1** — Setup, banco de dados e autenticação
- [ ] **Parte 2** — Landing page
- [ ] **Parte 3** — Jogos e sistema de palpites
- [ ] **Parte 4** — Chat em tempo real
- [ ] **Parte 5** — Ranking de usuários
- [ ] **Parte 6** — Perfil do usuário
- [ ] **Parte 7** — Painel administrativo

---

## Skills do Projeto

Este projeto utiliza 3 skills de desenvolvimento para manter consistência:

| Skill | Descrição |
|---|---|
| `bolao-ui-design` | Design system, paleta de cores, componentes visuais e padrões por página |
| `bolao-security` | RLS, middleware, validação com Zod, upload seguro e boas práticas |
| `bolao-architecture` | Estrutura de pastas, Client vs Server, convenções e fluxo de features |

---

## Licença

Projeto privado — todos os direitos reservados.
"# bolao-copa" 
