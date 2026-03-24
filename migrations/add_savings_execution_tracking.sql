-- Migration: Add execution tracking to finance_savings table
-- This allows tracking which savings reserves have been executed
-- while preserving the history for reporting purposes

-- Add executed status column (default: false for existing records)
ALTER TABLE finance_savings 
ADD COLUMN IF NOT EXISTS executed BOOLEAN DEFAULT FALSE;

-- Add execution date column (nullable, only set when executed)
ALTER TABLE finance_savings 
ADD COLUMN IF NOT EXISTS execution_date DATE;

-- Create index for faster queries on executed savings
CREATE INDEX IF NOT EXISTS idx_finance_savings_executed 
ON finance_savings(executed);

-- Create index for execution date queries (calendar integration)
CREATE INDEX IF NOT EXISTS idx_finance_savings_execution_date 
ON finance_savings(execution_date) 
WHERE execution_date IS NOT NULL;

-- Add comment to table for documentation
COMMENT ON COLUMN finance_savings.executed IS 'Indicates if this savings reserve has been executed/converted to an expense transaction';
COMMENT ON COLUMN finance_savings.execution_date IS 'Date when the savings reserve was executed and converted to an expense';
