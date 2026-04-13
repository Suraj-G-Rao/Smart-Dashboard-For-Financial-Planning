-- Budget presets table
CREATE TABLE budget_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  inputs JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for budget_presets
ALTER TABLE budget_presets ENABLE ROW LEVEL SECURITY;

-- Users can only access their own presets
CREATE POLICY "Users can view their own budget presets" 
  ON budget_presets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget presets" 
  ON budget_presets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget presets" 
  ON budget_presets FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget presets" 
  ON budget_presets FOR DELETE 
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_budget_presets_user_id ON budget_presets(user_id);
CREATE INDEX idx_budget_presets_created_at ON budget_presets(created_at DESC);
