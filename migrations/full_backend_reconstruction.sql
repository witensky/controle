-- TACTICAL BACKEND FULL SYNC - COMPLETE SCHEMA RECOVERY
-- Target: Supabase Postgres (Public Schema)
-- Description: Creates/Updates all tables required for the J&B LIFEFLOW core modules.

--------------------------------------------------------------------------------
-- 1. PROFILES & CORE STATS
--------------------------------------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'CONSCRIT',
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_missions_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS amci_monthly_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_amci_date DATE,
ADD COLUMN IF NOT EXISTS settings_config JSONB DEFAULT '{}'::jsonb;

-- Trigger for default AMCI date (10th of next month)
CREATE OR REPLACE FUNCTION public.set_default_amci_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.next_amci_date IS NULL THEN
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
-- 2. FINANCE MODULE
--------------------------------------------------------------------------------
ALTER TABLE public.finance_transactions 
ADD COLUMN IF NOT EXISTS source TEXT; -- 'AMCI', 'DON', 'AUTRES'

ALTER TABLE public.finance_savings 
ADD COLUMN IF NOT EXISTS executed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS execution_date DATE;

-- Ensure Budget table exists properly
CREATE TABLE IF NOT EXISTS public.finance_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    limit_amount NUMERIC DEFAULT 0,
    UNIQUE(user_id, category)
);

--------------------------------------------------------------------------------
-- 3. DISCIPLINE (MISSIONS) MODULE
--------------------------------------------------------------------------------
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS energy_required INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS feedback_difficulty INTEGER,
ADD COLUMN IF NOT EXISTS feedback_energy_after INTEGER,
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

--------------------------------------------------------------------------------
-- 4. BIBLE & MENTAL MODULE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    mood INTEGER, -- 0-3 scale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    chapter_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, chapter_id)
);

--------------------------------------------------------------------------------
-- 5. SPORT & ATHLETIC CORE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    exercises JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
    routine_name TEXT,
    total_volume NUMERIC DEFAULT 0,
    duration INTEGER, -- in minutes
    date DATE DEFAULT current_date,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    weight NUMERIC NOT NULL,
    date DATE DEFAULT current_date,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fitness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    unit TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--------------------------------------------------------------------------------
-- 6. KNOWLEDGE (LAW & LANGUAGES)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.law_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'À réviser',
    mastery INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learned_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    word TEXT NOT NULL,
    translation TEXT,
    category TEXT,
    mastery_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (GLOBAL POLICIES)
--------------------------------------------------------------------------------
-- Function to enable RLS and set default policy for a table
CREATE OR REPLACE FUNCTION public.setup_rls_for_user_table(tbl_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "Users can manage own data" ON public.%I', tbl_name);
    EXECUTE format('CREATE POLICY "Users can manage own data" ON public.%I FOR ALL USING (auth.uid() = user_id)', tbl_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to all tactical tables
SELECT setup_rls_for_user_table('finance_transactions');
SELECT setup_rls_for_user_table('finance_budgets');
SELECT setup_rls_for_user_table('finance_savings');
SELECT setup_rls_for_user_table('missions');
SELECT setup_rls_for_user_table('journal_entries');
SELECT setup_rls_for_user_table('bible_progress');
SELECT setup_rls_for_user_table('workout_routines');
SELECT setup_rls_for_user_table('workout_logs');
SELECT setup_rls_for_user_table('body_metrics');
SELECT setup_rls_for_user_table('fitness_goals');
SELECT setup_rls_for_user_table('law_subjects');
SELECT setup_rls_for_user_table('learned_words');

-- Special case for profiles (matches primary key id)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

--------------------------------------------------------------------------------
-- 8. INDEXING FOR PERFORMANCE
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.finance_transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_missions_user_status ON public.missions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON public.workout_logs(user_id, date);
