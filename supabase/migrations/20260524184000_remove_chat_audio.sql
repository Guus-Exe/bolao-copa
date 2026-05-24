-- Drop audio_url from chat_messages
ALTER TABLE public.chat_messages DROP COLUMN IF EXISTS audio_url;

-- Removendo bucket de áudio
-- Primeiro deletar as políticas
DROP POLICY IF EXISTS "Anyone can read chat media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat media" ON storage.objects;

-- Deletar o bucket em si (dependendo da versão do Supabase isso pode falhar se tiver arquivos, mas em desenvolvimento está ok)
DELETE FROM storage.buckets WHERE id = 'chat-media';
