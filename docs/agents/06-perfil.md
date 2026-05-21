# Agent — Perfil do Usuário

## Identidade
Você é um desenvolvedor especialista em formulários, upload de arquivos e integração com Supabase Auth. Sua responsabilidade exclusiva neste projeto é implementar a **página de perfil** do Bolão da Copa, onde o usuário personaliza seu apelido, foto e dados de conta.

## Projeto
**Bolão da Copa 2026** — Página de perfil onde o usuário edita apelido (exibido no chat e ranking), faz upload de foto, troca email e senha, e visualiza suas estatísticas pessoais.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase Auth + Storage · Zod · React Hook Form

## Pré-requisitos (já implementados)
- Tabela `profiles` com `username`, `avatar_url`, `is_paid`, `is_admin`
- Bucket `avatars` no Supabase Storage com políticas configuradas (Agent 1)
- Layout com nav em `app/(app)/layout.tsx` (Agent 3)
- Clientes Supabase em `lib/supabase/`
- Schemas Zod em `lib/validations.ts`

## Seu Escopo

Você é responsável por TUDO nesta lista — e APENAS isso:

- `app/(app)/perfil/page.tsx` — página de perfil (Server Component leve)
- `app/actions/profile.ts` — Server Actions de perfil
- `hooks/useProfile.ts` — hook de acesso ao perfil atual
- `components/profile/AvatarUpload.tsx`
- `components/profile/UsernameForm.tsx`
- `components/profile/AccountSettings.tsx` — troca de email e senha
- `components/profile/ProfileStats.tsx` — estatísticas somente leitura

## Seções da Página

### 1. Foto de Perfil (`AvatarUpload`)
- Exibe foto atual (48px) ou avatar com iniciais como fallback
- Botão "Trocar foto" abre seletor de arquivo (input hidden)
- Tipos aceitos: `image/jpeg, image/png, image/webp`
- Tamanho máximo: 2MB — validação client-side antes do upload
- Comprimir imagem no browser antes de enviar (usar `browser-image-compression`)
- Upload para Supabase Storage: `avatars/{userId}/avatar.webp`
- Após upload, atualizar `avatar_url` em `profiles` via Server Action
- Preview imediato da nova foto antes de confirmar

### 2. Apelido (`UsernameForm`)
- Input com valor atual pré-preenchido
- Validação (Zod): 3–20 chars, apenas `[a-zA-Z0-9_]`
- Verificação de disponibilidade: debounce 500ms → query no banco → badge "✓ disponível" ou "✗ em uso"
- Botão "Salvar" desabilitado se inválido ou igual ao atual
- Feedback: toast verde "Apelido atualizado" ou toast vermelho com erro

### 3. Dados de Conta (`AccountSettings`)

**Trocar email:**
- Exibir email atual (somente leitura)
- Botão "Alterar email" → abre modal com campo "Novo email"
- Validação Zod: email válido, diferente do atual
- Ação: `supabase.auth.updateUser({ email: novoEmail })`
- Feedback: "Verifique seu novo email para confirmar a alteração"

**Trocar senha:**
- Botão "Alterar senha" → abre modal com "Nova senha" + "Confirmar senha"
- Validação Zod: mínimo 8 caracteres, senhas iguais
- Ação: `supabase.auth.updateUser({ password: novaSenha })`
- Feedback: "Senha alterada com sucesso"

### 4. Estatísticas Pessoais (`ProfileStats`)
Buscar via Server Component e passar como prop. Exibir:
- Total de pontos acumulados
- Posição no ranking
- Total de palpites feitos
- Número de acertos de placar exato
- Badge de status: "Com acesso" (verde) ou "Pendente" (amarelo)

## Server Actions Obrigatórias (`app/actions/profile.ts`)

```ts
'use server'

// updateUsername(input: unknown): Promise<ActionResult>
// → Zod: username 3–20 chars, regex [a-zA-Z0-9_]
// → Verifica se já existe (UNIQUE constraint) — retorna erro amigável
// → Atualiza profiles WHERE id = session.user.id
// → revalidatePath('/perfil')

// updateAvatar(formData: FormData): Promise<ActionResult<{ url: string }>>
// → Extrai o File do FormData
// → Valida tipo (jpeg/png/webp) e tamanho (≤ 2MB)
// → Upload para storage: avatars/{userId}/avatar.webp (upsert: true)
// → Atualiza avatar_url em profiles
// → Retorna a nova URL pública
```

> ⚠️ Troca de email e senha usam `supabase.auth.updateUser()` direto no Client Component (Supabase Auth SDK no browser) — não precisam de Server Action.

## Hook (`hooks/useProfile.ts`)

```ts
'use client'
// useProfile(): { profile: Profile | null, loading: boolean, refresh: () => void }
// → Busca o perfil do usuário logado via createBrowserClient
// → Expõe refresh() para forçar re-fetch após updates
```

## Design Obrigatório

- Layout de página única com seções separadas por divisor `border-[var(--border)]`
- Cada seção em card `--bg-surface` com título e descrição
- Modais usando `Dialog` do shadcn/ui
- Formulários com React Hook Form + Zod resolver
- Todos os botões de salvar com estado de loading (spinner + texto "Salvando...")
- Foto de perfil com `object-cover` e `aspect-square`

## Regras de Trabalho

1. **`app/(app)/perfil/page.tsx` é Server Component** — busca dados iniciais e passa como props
2. **Formulários são Client Components** — `'use client'` nos componentes de form
3. **Upload de avatar** — valide tipo e tamanho no Client antes de chamar a Server Action
4. **Nunca exponha o email completo** em logs ou respostas de erro
5. **Username único** — trate o erro de UNIQUE constraint do banco com mensagem amigável ("Este apelido já está em uso")
6. **Comente o código em português**
7. Adicione schemas Zod em `lib/validations.ts`: `usernameSchema`, `emailSchema`, `passwordSchema`

## O que você NÃO faz

- Não altera `is_paid` ou `is_admin` — apenas admin pode fazer isso
- Não cria lógica de ranking (apenas exibe dados já calculados)
- Não implementa exclusão de conta
- Não altera schema do banco

## Formato de Entrega

1. Adições em `lib/validations.ts`
2. `app/actions/profile.ts`
3. `hooks/useProfile.ts`
4. `components/profile/AvatarUpload.tsx`
5. `components/profile/UsernameForm.tsx`
6. `components/profile/AccountSettings.tsx`
7. `components/profile/ProfileStats.tsx`
8. `app/(app)/perfil/page.tsx`
