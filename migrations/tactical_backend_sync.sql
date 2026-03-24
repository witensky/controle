-- TACTICAL BACKEND SYNC - CORE SCHEMA UPDATE
-- Target: Supabase Postgres
-- Description: Ensures all backend tables match the tactical HUD frontend requirements.

--------------------------------------------------------------------------------
-- 1. PROFILES TABLE ENHANCEMENTS
--------------------------------------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'CONSCRIT',
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_missions_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS amci_monthly_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_amci_date DATE,
ADD COLUMN IF NOT EXISTS settings_config JSONB DEFAULT '{}'::jsonb;

-- Trigger to update next_amci_date if empty
CREATE OR REPLACE FUNCTION public.set_default_amci_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.next_amci_date IS NULL THEN
        -- Set to 10th of next month by default
        NEW.next_amci_date := (date_trunc('month', current_date) + interval '1 month' + interval '9 days')::date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_default_amci_date ON public.profiles;
CREATE TRIGGER tr_set_default_amci_date
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_default_amci_date();

--------------------------------------------------------------------------------
-- 2. FINANCE TRANSACTIONS ENHANCEMENTS
--------------------------------------------------------------------------------
ALTER TABLE public.finance_transactions 
ADD COLUMN IF NOT EXISTS source TEXT; -- Tracks AMCI vs DON vs Others

-- Index for faster filtering by source
CREATE INDEX IF NOT EXISTS idx_finance_transactions_source ON public.finance_transactions(source);

--------------------------------------------------------------------------------
-- 3. FINANCE SAVINGS ENHANCEMENTS
--------------------------------------------------------------------------------
ALTER TABLE public.finance_savings 
ADD COLUMN IF NOT EXISTS executed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS execution_date DATE;

CREATE INDEX IF NOT EXISTS idx_finance_savings_executed ON public.finance_savings(executed);

--------------------------------------------------------------------------------
-- 4. MISSIONS TABLE SCHEMA
--------------------------------------------------------------------------------
-- Just in case it's missing specific tactical fields
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS energy_required INTEGER DEFAULT 1, -- 1-5 scale
ADD COLUMN IF NOT EXISTS feedback_difficulty INTEGER,
ADD COLUMN IF NOT EXISTS feedback_energy_after INTEGER,
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10;

--------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) - ENSURE BASIC POLICIES
--------------------------------------------------------------------------------
-- This assumes standard Supabase user_id matching

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Finance Transactions
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.finance_transactions;
CREATE POLICY "Users can manage own transactions" ON public.finance_transactions FOR ALL USING (auth.uid() = user_id);

-- Missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own missions" ON public.missions;
CREATE POLICY "Users can manage own missions" ON public.missions FOR ALL USING (auth.uid() = user_id);

-- Budgets
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own budgets" ON public.finance_budgets;
CREATE POLICY "Users can manage own budgets" ON public.finance_budgets FOR ALL USING (auth.uid() = user_id);

-- Savings
ALTER TABLE public.finance_savings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own savings" ON public.finance_savings;
CREATE POLICY "Users can manage own savings" ON public.finance_savings FOR ALL USING (auth.uid() = user_id);
