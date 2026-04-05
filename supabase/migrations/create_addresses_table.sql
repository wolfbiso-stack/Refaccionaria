-- 1. Create the user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pais TEXT DEFAULT 'México' NOT NULL,
    codigo_postal TEXT NOT NULL,
    estado TEXT NOT NULL,
    municipio TEXT NOT NULL,
    colonia TEXT NOT NULL,
    calle TEXT NOT NULL,
    num_exterior TEXT NOT NULL,
    num_interior TEXT,
    referencias TEXT,
    es_principal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Users can only manage their own addresses
CREATE POLICY "Users can view their own addresses" 
    ON user_addresses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
    ON user_addresses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
    ON user_addresses FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
    ON user_addresses FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Performance Index
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses (user_id);
