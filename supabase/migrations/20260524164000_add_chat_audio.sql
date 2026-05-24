-- Add audio_url to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN audio_url text;

-- Create chat-media bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for chat-media bucket
-- Permite leitura publica
CREATE POLICY "Anyone can read chat media" ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-media');

-- Permite upload apenas para usuarios autenticados
CREATE POLICY "Authenticated users can upload chat media" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');
