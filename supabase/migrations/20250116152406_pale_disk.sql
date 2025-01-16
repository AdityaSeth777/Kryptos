/*
  # Create messages table for encrypted chat

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (text, not null)
      - `recipient_id` (text, not null)
      - `message` (text, not null) - Stores encrypted message
      - `timestamp` (timestamptz, not null)
      - `read` (boolean, default false)

  2. Security
    - Enable RLS on messages table
    - Add policies for message access
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id text NOT NULL,
  recipient_id text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for message access
CREATE POLICY "Users can insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = sender_id OR
    auth.uid()::text = recipient_id
  );