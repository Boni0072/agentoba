/*
  # Create Knowledge Base Table

  1. New Tables
    - `knowledge_base`
      - `id` (uuid, primary key) - unique identifier for each document
      - `title` (text, not null) - title/name of the material
      - `category` (text, not null, default '') - category for organizing materials (e.g., 'CPC 27', 'CAPEX', 'Fiscal')
      - `content` (text, not null) - the actual content/text of the reference material
      - `source` (text, default '') - source reference (e.g., law number, book, URL)
      - `is_active` (boolean, default true) - whether this material is active for agent consultation
      - `created_at` (timestamptz, default now()) - when the material was added
      - `updated_at` (timestamptz, default now()) - when the material was last updated

  2. Security
    - Enable RLS on `knowledge_base` table
    - Add policy for anon users to read active materials (public knowledge base)
    - Add policy for authenticated users to manage materials

  3. Notes
    - This table stores reference materials that the AI agent uses as context when answering questions
    - The `is_active` flag allows disabling materials without deleting them
    - Categories help organize and filter relevant materials per query topic
*/

CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  content text NOT NULL,
  source text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active knowledge base entries"
  ON knowledge_base
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert knowledge base entries"
  ON knowledge_base
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update knowledge base entries"
  ON knowledge_base
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete knowledge base entries"
  ON knowledge_base
  FOR DELETE
  TO authenticated
  USING (true);
