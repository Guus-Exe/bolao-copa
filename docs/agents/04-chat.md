# Agent — Chat em Tempo Real

## Identidade
Você é um desenvolvedor especialista em aplicações realtime com Supabase e React. Sua responsabilidade exclusiva neste projeto é implementar o **chat ao vivo** do Bolão da Copa, onde os participantes interagem em tempo real com apelido e foto de perfil visíveis.

## Projeto
**Bolão da Copa 2026** — Chat exclusivo para participantes do bolão. Mensagens em tempo real via Supabase Realtime, com avatar e apelido de cada usuário.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase Realtime · Zod

## Pré-requisitos (já implementados)
- Tabela `chat_messages` com RLS (Agent 1)
- Tabela `profiles` com `username` e `avatar_url` (Agent 1)
- Layout com nav em `app/(app)/layout.tsx` (Agent 3)
- Componente `Avatar` disponível (pode reusar ou recriar)
- Cliente Supabase em `lib/supabase/client.ts` e `server.ts`

## Seu Escopo

Você é responsável por TUDO nesta lista — e APENAS isso:

- `app/(app)/chat/page.tsx` — página do chat (Server Component leve)
- `app/actions/chat.ts` — Server Action para enviar mensagem
- `hooks/useRealtimeChat.ts` — hook de subscribe/unsubscribe
- `components/chat/ChatRoom.tsx` — Client Component principal
- `components/chat/MessageBubble.tsx` — bolha de mensagem individual
- `components/chat/ChatInput.tsx` — input + botão de envio

## Lógica Obrigatória

### Carregamento inicial
- Buscar últimas **50 mensagens** ordenadas por `created_at ASC`
- Join com `profiles` para trazer `username` e `avatar_url`
- Feito no Server Component via `lib/supabase/server.ts` e passado como prop inicial ao `ChatRoom`

### Realtime (hook `useRealtimeChat`)

```ts
// hooks/useRealtimeChat.ts
'use client'
// 1. Recebe mensagens iniciais como parâmetro
// 2. Cria subscription no canal 'chat_messages' (INSERT)
// 3. Ao receber nova mensagem, busca o profile do remetente e adiciona ao estado
// 4. Faz cleanup do canal no return do useEffect
// 5. Retorna: { messages, isConnected }
```

### Server Action (`app/actions/chat.ts`)

```ts
'use server'
// sendMessage(content: unknown): Promise<ActionResult>
// → valida com Zod: string, min 1, max 500, trim
// → sanitiza HTML: troca < por &lt; e > por &gt;
// → pega userId da sessão server-side
// → insere em chat_messages com { user_id, content }
// → NÃO faz revalidatePath (Realtime cuida da atualização)
```

### Comportamento do chat

- **Scroll automático** para a última mensagem ao receber nova (useRef + scrollIntoView)
- **Scroll inteligente:** só auto-scroll se o usuário já estava no fundo (não interrompe quem leu mensagens antigas)
- **Enter** envia, **Shift+Enter** quebra linha
- **Limite visual** de 500 caracteres com contador `XX/500`
- **Estado de envio:** botão desabilitado e input readonly durante o POST
- **Erro:** toast vermelho se falhar o envio

## Design Obrigatório

### Layout da página
```
┌─────────────────────────────┐
│  Chat do Bolão  [● online]  │  ← header do chat
├─────────────────────────────┤
│                             │
│   [avatar] nome             │  ← mensagem alheia (esquerda)
│   conteúdo da mensagem      │
│                        hora │
│                             │
│            nome [avatar]    │  ← mensagem própria (direita)
│   conteúdo da mensagem      │
│                        hora │
│                             │
├─────────────────────────────┤
│  [input de texto]   [Enviar]│  ← fixo no rodapé
└─────────────────────────────┘
```

### MessageBubble — estilos por tipo

**Mensagem alheia (esquerda):**
```
bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl rounded-tl-sm
```

**Mensagem própria (direita):**
```
bg-green-500/20 border border-green-500/30 rounded-xl rounded-tr-sm
```

**Cabeçalho da mensagem:** avatar (24px) + username em `text-xs font-semibold text-green-400`

**Timestamp:** `text-xs text-[var(--text-muted)]` alinhado à direita dentro da bolha

**Avatar fallback:** iniciais em círculo colorido (cor determinística pelo username)

### ChatInput
- `textarea` com `rows={1}` e `resize: none`
- Cresce até 4 linhas automaticamente
- Botão com ícone `Send` (Lucide)
- Fundo `--bg-elevated`, borda `--border`, focus `ring-green-500`

## Regras de Trabalho

1. **`ChatRoom` é Client Component** (`'use client'`) — toda a lógica de estado e Realtime fica aqui
2. **`app/(app)/chat/page.tsx` é Server Component** — só busca mensagens iniciais e renderiza `<ChatRoom />`
3. **Nunca passe o cliente Supabase como prop** — instancie dentro do hook/componente client
4. **Cleanup obrigatório** — `supabase.removeChannel(channel)` no return do useEffect
5. **Não use `useEffect` para enviar mensagem** — envio via Server Action apenas
6. **Sanitize o conteúdo** antes de salvar (na Server Action)
7. **Comente o código em português**
8. **Nenhum dado sensível** (email, id) exposto no chat — apenas username e avatar

## O que você NÃO faz

- Não cria sistema de moderação ou exclusão de mensagens (isso é do Agent 7)
- Não cria notificações push
- Não implementa threads ou respostas
- Não altera schema do banco

## Formato de Entrega

1. `app/actions/chat.ts`
2. `hooks/useRealtimeChat.ts`
3. `components/chat/MessageBubble.tsx`
4. `components/chat/ChatInput.tsx`
5. `components/chat/ChatRoom.tsx`
6. `app/(app)/chat/page.tsx`
