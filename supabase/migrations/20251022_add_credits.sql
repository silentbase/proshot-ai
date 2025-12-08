-- Add credits to users table if it doesn't exist
ALTER TABLE users_table ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- Create credit_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_id TEXT,
    metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON credit_transactions("userId");