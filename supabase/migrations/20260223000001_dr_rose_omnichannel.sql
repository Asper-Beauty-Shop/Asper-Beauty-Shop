-- Dr. Rose Omnichannel Tables
-- =============================
-- Conversation persistence and analytics for Dr. Rose across all channels.

-- Conversation history table (for context persistence across messages)
CREATE TABLE IF NOT EXISTS dr_rose_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('website', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'email')),
  sender_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel, sender_id)
);

-- Analytics table (for tracking Dr. Rose interactions across channels)
CREATE TABLE IF NOT EXISTS dr_rose_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('website', 'whatsapp', 'instagram', 'facebook', 'tiktok', 'email')),
  sender_id TEXT NOT NULL,
  user_message TEXT,
  bot_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_conversations_channel_sender 
  ON dr_rose_conversations(channel, sender_id);

CREATE INDEX IF NOT EXISTS idx_analytics_channel 
  ON dr_rose_analytics(channel);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
  ON dr_rose_analytics(created_at);

-- Row Level Security
ALTER TABLE dr_rose_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dr_rose_analytics ENABLE ROW LEVEL SECURITY;

-- Allow the service role and anon key (edge functions) to manage conversations
CREATE POLICY "Allow edge functions to manage conversations" ON dr_rose_conversations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow edge functions to insert analytics" ON dr_rose_analytics
  FOR ALL USING (true) WITH CHECK (true);
