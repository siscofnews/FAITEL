-- Create Radio Messages Table
CREATE TYPE radio_message_type AS ENUM ('chat', 'pedido_oracao', 'pedido_musica');

CREATE TABLE IF NOT EXISTS public.radio_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type radio_message_type DEFAULT 'chat'::radio_message_type,
    phone TEXT, -- Optional whatsapp contact
    likes_count INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

-- RLS Policies
ALTER TABLE public.radio_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon) to read visible messages
CREATE POLICY "Public messages are viewable by everyone" 
ON public.radio_messages FOR SELECT 
USING (is_visible = true);

-- Allow anyone to insert messages
CREATE POLICY "Anyone can insert messages" 
ON public.radio_messages FOR INSERT 
WITH CHECK (true);

-- Enable Realtime
alter publication supabase_realtime add table public.radio_messages;
