
import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, Target, Zap, Loader2, Shield, Trophy, Activity, BookOpen, Flame, BrainCircuit,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, TrendingDown, Sparkles, Brain, ArrowUpRight, Plus, StickyNote, X
} from 'lucide-react';
import ActivityCharts from '../components/dashboard/ActivityCharts';
import DashboardCard from '../components/dashboard/DashboardCard';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import DailyPlanner from '../components/dashboard/DailyPlanner';
import SecurityDetailModal from '../components/dashboard/SecurityDetailModal';
import FocusOverlay from '../components/common/FocusOverlay';
import ChartErrorBoundary from '../components/common/ChartErrorBoundary';
import ThemeToggle from '../components/common/ThemeToggle';
import { DualSparklineChart, HorizontalBarsChart, StackedBarsChart } from '../components/common/InlineCharts';
import { AppView } from '../types';
import { useProfile } from '../features/profile/hooks/useProfile';
import { useTransactions } from '../features/finance/hooks/useFinance';
import { useMissions } from '../features/discipline/hooks/useMissions';
import { useSubjects } from '../features/studies/hooks/useStudies';
import { useLearnedWords } from '../features/languages/hooks/useLanguages';
import { DEFAULT_MONTHLY_BUDGET, resolveMonthlyBudget } from '../utils/financeBudget';
import { DEFAULT_MISSION_CATEGORIES, displayMissionCategoryLabel, resolveStudyDomainLabel } from '../utils/studyDomainLabel';
import { isPastOrTodayDateOnly, isSameDateOnly, normalizeDateOnly } from '../utils/transactionDates';
import { useCurrentDayKey } from '../hooks/useCurrentDayKey';
import { resolveProfileRankTitle } from '../utils/profileRank';
import { isPlannedProvision } from '../utils/financeProvisions';
import { formatChartCurrency } from '../utils/chartHelpers';
import { formatCurrencyAmount, getCurrencyLabel, resolveCurrency } from '../utils/currency';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

type DetailCardTone = 'neutral' | 'positive' | 'negative' | 'warning';

const DETAIL_CARD_STYLES: Record<DetailCardTone, { shell: string; eyebrow: string; value: string }> = {
  neutral: {
    shell: 'border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.86))]',
    eyebrow: 'text-[color:var(--text-muted)] dark:text-slate-500',
    value: 'text-[color:var(--text-primary)] dark:text-white',
  },
  positive: {
    shell: 'border-emerald-200 bg-[color:var(--surface)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-emerald-500/15 dark:bg-[linear-gradient(180deg,rgba(6,78,59,0.24),rgba(2,6,23,0.92))] dark:shadow-[0_20px_60px_rgba(16,185,129,0.08)]',
    eyebrow: 'text-emerald-600 dark:text-emerald-300/70',
    value: 'text-emerald-600 dark:text-emerald-400',
  },
  negative: {
    shell: 'border-rose-200 bg-[color:var(--surface)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-rose-500/15 dark:bg-[linear-gradient(180deg,rgba(76,5,25,0.26),rgba(2,6,23,0.92))] dark:shadow-[0_20px_60px_rgba(244,63,94,0.08)]',
    eyebrow: 'text-rose-600 dark:text-rose-200/70',
    value: 'text-rose-600 dark:text-rose-400',
  },
  warning: {
    shell: 'border-amber-200 bg-[color:var(--surface)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-amber-500/15 dark:bg-[linear-gradient(180deg,rgba(120,53,15,0.24),rgba(2,6,23,0.92))] dark:shadow-[0_20px_60px_rgba(245,158,11,0.08)]',
    eyebrow: 'text-amber-700 dark:text-amber-200/70',
    value: 'text-amber-600 dark:text-amber-300',
  },
};

const DetailValueCard: React.FC<{
  eyebrow: string;
  value: string;
  tone?: DetailCardTone;
  helper?: string;
}> = ({ eyebrow, value, tone = 'neutral', helper }) => {
  const style = DETAIL_CARD_STYLES[tone];

  return (
    <div className={`rounded-[1.25rem] border p-3.5 transition-all duration-300 active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:border-white/15 ${style.shell}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.28em] ${style.eyebrow}`}>{eyebrow}</p>
      <p className={`mt-2.5 text-[1.7rem] font-black italic leading-none tracking-[-0.05em] font-outfit ${style.value}`}>
        {value}
      </p>
      {helper ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{helper}</p> : null}
    </div>
  );
};

const DetailSummaryRow: React.FC<{
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
}> = ({ label, value, tone = 'default' }) => {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'negative'
        ? 'text-rose-600 dark:text-rose-400'
        : tone === 'warning'
          ? 'text-amber-600 dark:text-amber-300'
          : 'text-[color:var(--text-primary)] dark:text-white';

  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-3.5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-white/5 dark:bg-slate-950/45 dark:shadow-none">
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)] dark:text-slate-500">{label}</span>
      <span className={`text-base font-black tracking-tight ${toneClass}`}>{value}</span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  // Data Hooks
  const { data: profile } = useProfile();
  const { data: transactionsRaw } = useTransactions();
  const { data: missionsRaw } = useMissions();
  const { data: subjectsRaw } = useSubjects();
  // For languages, we need to pass a lang, but dashboard usually needs aggregate. 
  // The hook requires a language arg. We might need a generic "stats" hook or fetch all langs?
  // Or just pick one for now or loop? The hook definition was `useLearnedWords(language: string)`.
  // Ideally we should have `useAllLearnedWords` or similar. 
  // For now let's assume we want total count.
  // Actually, let's create a new hook or just skip languages detail in dashboard for now if it's too complex, 
  // or just fetch 'Anglais' as default.
  const { data: learnedWordsRaw } = useLearnedWords('Anglais'); // Proxy for now

  const userProfile = useMemo(() => {
    const rank = resolveProfileRankTitle(profile?.total_xp || 0);
    return {
      xp: profile?.total_xp || 0,
      rank,
      username: profile?.username || 'Utilisateur',
      budget: resolveMonthlyBudget(profile?.amci_monthly_amount, DEFAULT_MONTHLY_BUDGET)
    };
  }, [profile]);

  const transactions = transactionsRaw || [];
  const missions = missionsRaw || [];
  const subjects = subjectsRaw || [];
  const learnedWords = learnedWordsRaw || [];
  const studyDomainLabel = resolveStudyDomainLabel(profile?.settings_config?.study?.primaryDomain);
  const showDashboardJournal = profile?.settings_config?.terminalLogging !== false;
  const activeCurrency = resolveCurrency(profile?.settings_config?.finance?.currency);
  const currencyLabel = getCurrencyLabel(activeCurrency);

  const loading = !profile || !transactionsRaw || !missionsRaw || !subjectsRaw;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('app:mobile-ui-override', {
      detail: {
        hideNav: Boolean(selectedDate),
        hideFab: Boolean(selectedDate),
      },
    }));

    return () => {
      window.dispatchEvent(new CustomEvent('app:mobile-ui-override', {
        detail: {
          hideNav: false,
          hideFab: false,
        },
      }));
    };
  }, [selectedDate]);

  // fetchAllData removed. React Query handles it.

  // --- COMPUTED STATS ---
  const todayStr = useCurrentDayKey();

  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'expense'),
    [transactions]
  );
  const todayExpenseTransactions = useMemo(
    () =>
      expenseTransactions.filter(
        (transaction) => !isPlannedProvision(transaction) && isSameDateOnly(transaction.date, todayStr),
      ),
    [expenseTransactions, todayStr]
  );
  const futureExpenseTransactions = useMemo(
    () =>
      expenseTransactions
        .filter((transaction) => isPlannedProvision(transaction))
        .sort((a, b) => normalizeDateOnly(a.date).localeCompare(normalizeDateOnly(b.date))),
    [expenseTransactions]
  );
  const settledExpenseTransactions = useMemo(
    () =>
      expenseTransactions.filter(
        (transaction) => !isPlannedProvision(transaction) && isPastOrTodayDateOnly(transaction.date, todayStr),
      ),
    [expenseTransactions, todayStr]
  );

  // Finance snapshot (aligns Dashboard with the Finance module logic)
  const financeTotals = useMemo(() => {
    const plannedTransactions = transactions.filter((t) => isPlannedProvision(t));
    const pastTransactions = transactions.filter(
      (t) => !isPlannedProvision(t) && isPastOrTodayDateOnly(t.date, todayStr),
    );

    const depositsBySource = pastTransactions
      .filter((t) => t.type === 'deposit')
      .reduce((acc: Record<string, number>, t) => {
        const src = t.source || 'Autres';
        acc[src] = (acc[src] || 0) + Number(t.amount || 0);
        return acc;
      }, {});

    const amciPot = userProfile.budget + (depositsBySource['AMCI'] || 0);
    const donPot = depositsBySource['DON'] || 0;
    const autresPot = Object.entries(depositsBySource)
      .filter(([k]) => k !== 'AMCI' && k !== 'DON')
      .reduce((sum, [, v]) => sum + Number(v || 0), 0);

    const totalAvailable = amciPot + donPot + autresPot;

    const totalExpenses = pastTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const todaySpent = pastTransactions
      .filter((t) => t.type === 'expense' && isSameDateOnly(t.date, todayStr))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const futureExpenses = plannedTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const currentBalance = totalAvailable - totalExpenses;
    const projectedBalance = currentBalance - futureExpenses;

    return {
      totalAvailable,
      totalExpenses,
      todaySpent,
      futureExpenses,
      currentBalance,
      projectedBalance,
    };
  }, [transactions, todayStr, userProfile.budget]);

  const stats = useMemo(() => {
    const remaining = financeTotals.currentBalance;
    const futureTotal = financeTotals.futureExpenses;
    const projectedRemaining = financeTotals.projectedBalance;
    const tasksPending = missions.filter(m => m.status !== 'Terminé').length;

    // Weekly comparison logic (executed expenses only)
    const dailyTrend = settledExpenseTransactions
      .slice()
      .sort((a, b) => normalizeDateOnly(a.date).localeCompare(normalizeDateOnly(b.date)))
      .slice(-7)
      .map((t) => ({ date: normalizeDateOnly(t.date).slice(5), amount: t.amount }));

    return {
      financeRemaining: remaining,
      financePercentage: financeTotals.totalAvailable > 0 ? Math.max(0, Math.round((remaining / financeTotals.totalAvailable) * 100)) : 0,
      todaySpent: financeTotals.todaySpent,
      futureTotal,
      futureCount: futureExpenseTransactions.length,
      projectedRemaining,
      dailyTrend,
      tasksCount: tasksPending,
      subjectsCount: subjects.length,
      disciplineScore: missions.length ? Math.round((missions.filter(m => m.status === 'Terminé').length / missions.length) * 100) : 0
    };
  }, [financeTotals, futureExpenseTransactions.length, missions, settledExpenseTransactions, subjects]);


  // --- CHARTS DATA PREPARATION ---

  // --- PREMIUM TACTICAL DATA ---

  const focusAreaData = useMemo(() => {
    const resolveMissionCategoryProgress = (category: string) => {
      const categoryMissions = missions.filter((mission) => mission.category === category);
      const completedMissions = categoryMissions.filter((mission) => mission.status === 'Terminé').length;

      return Math.round((completedMissions / (categoryMissions.length || 1)) * 100);
    };

    return [
      { subject: 'Finance', A: stats.financePercentage, fullMark: 100 },
      { subject: studyDomainLabel, A: Math.round(subjects.reduce((acc, s) => acc + (s.chaptersDone / (s.chaptersTotal || 1)), 0) / (subjects.length || 1) * 100), fullMark: 100 },
      { subject: 'Sport', A: 75, fullMark: 100 },
      { subject: 'Langues', A: resolveMissionCategoryProgress('Langues'), fullMark: 100 },
      { subject: 'Bible', A: resolveMissionCategoryProgress('Spirituel'), fullMark: 100 },
      { subject: 'Mental', A: Math.min(100, stats.disciplineScore + 10), fullMark: 100 },
    ];
  }, [studyDomainLabel, subjects, missions, stats]);

  const energyData = useMemo(() => [
    { time: '09h', level: 85 },
    { time: '12h', level: 70 },
    { time: '15h', level: 55 },
    { time: '18h', level: 80 },
    { time: '21h', level: 45 },
  ], []);

  const workIntensityData = useMemo(() => {
    return subjects
      .slice()
      .sort((a, b) => Number(b.chaptersDone || 0) - Number(a.chaptersDone || 0))
      .slice(0, 4)
      .map(subject => ({
        name: subject.name,
        value: Number(subject.chaptersDone || 0),
        total: Number(subject.chaptersTotal || 0)
      }));
  }, [subjects]);

  // 1. Dépenses Journalières par Catégorie (Last 7 Days)
  const categoryDailyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTxs = transactions.filter(
        (t) => t.date === date && t.type === 'expense' && !isPlannedProvision(t),
      );
      const categories = {};
      dayTxs.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
      });
      return { date: date.slice(5).replace('-', '/'), ...categories };
    });
  }, [transactions]);

  const categoriesList = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense' && !isPlannedProvision(t));
    const cats = new Set(expenses.map(t => t.category));
    const result = Array.from(cats);
    return result.length > 0 ? result : ['Général']; // Fallback category to show axis
  }, [transactions]);

  // 2. Différentiel Semaine (Current vs Last)
  const weeklyDiffData = useMemo(() => {
    // Simplified Logic
    const currentWeekSum = transactions.filter(t => {
      const d = new Date(t.date);
      const diff = (new Date().getTime() - d.getTime()) / (1000 * 3600 * 24);
      return diff <= 7 && t.type === 'expense' && !isPlannedProvision(t);
    }).reduce((acc, t) => acc + t.amount, 0);

    const prevWeekSum = transactions.filter(t => {
      const d = new Date(t.date);
      const diff = (new Date().getTime() - d.getTime()) / (1000 * 3600 * 24);
      return diff > 7 && diff <= 14 && t.type === 'expense' && !isPlannedProvision(t);
    }).reduce((acc, t) => acc + t.amount, 0);

    return [
      { name: 'Semaine Passée', amount: prevWeekSum },
      { name: 'Semaine Actuelle', amount: currentWeekSum }
    ];
  }, [transactions]);

  // 3. Activités (Missions + Learning) par jour
  const activityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const missionsCount = missions.filter(m => m.completed_at && m.completed_at.startsWith(date)).length;
      const wordsCount = learnedWords.filter(w => w.learned_at && w.learned_at.startsWith(date)).length;
      // If zero, we keep it as 0. Recharts should handle it.
      return {
        date: date.slice(8),
        missions: missionsCount,
        learning: wordsCount,
        // Hidden value to ensure the line has at least a visual anchor if all 0
        anchor: 0
      };
    });
  }, [missions, learnedWords]);

  // 4. Tendance Mensuelle des Dépenses (30 jours)
  const monthlySpendingTrend = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayExpenses = transactions
        .filter((t) => t.type === 'expense' && !isPlannedProvision(t) && isSameDateOnly(t.date, date))
        .reduce((acc, t) => acc + Number(t.amount), 0);
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        amount: dayExpenses,
        avgBudget: Math.round(userProfile.budget / 30)
      };
    });
  }, [transactions, userProfile.budget]);

  // 5. Répartition des Dépenses par Catégorie (Pie Chart)
  const categoryPieData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === 'expense' && !isPlannedProvision(t) && isPastOrTodayDateOnly(t.date, todayStr))
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, todayStr]);

  // 6. Progression XP (14 jours)
  const xpProgressionData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    let cumulativeXP = Math.max(0, userProfile.xp - (missions.filter(m => m.status === 'Terminé').length * 10));

    return last14Days.map(date => {
      const dayMissions = missions.filter(m => m.completed_at && m.completed_at.startsWith(date));
      const dayXP = dayMissions.reduce((acc, m) => acc + (m.impact_score || 10), 0);
      cumulativeXP += dayXP;

      return {
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        xp: cumulativeXP
      };
    });
  }, [missions, userProfile.xp]);

  // 7. Taux de Complétion des Missions par Catégorie
  const missionCompletionByCategory = useMemo(() => {
    const categories = DEFAULT_MISSION_CATEGORIES;

    return categories.map(cat => {
      const catMissions = missions.filter(m => m.category === cat);
      const completed = catMissions.filter(m => m.status === 'Terminé').length;
      const total = catMissions.length;

      return {
        category: displayMissionCategoryLabel(cat, studyDomainLabel),
        completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).filter(c => c.total > 0);
  }, [missions, studyDomainLabel]);

  // 8. Burn Rate Budget (projection)
  const budgetBurnRate = useMemo(() => {
    const daysInMonth = 30;
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;

    const spent = transactions
      .filter((t) => t.type === 'expense' && !isPlannedProvision(t) && isPastOrTodayDateOnly(t.date, todayStr))
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const dailyAvgSpent = dayOfMonth > 0 ? spent / dayOfMonth : 0;
    const projectedTotal = spent + (dailyAvgSpent * daysRemaining);

    return {
      spent,
      budget: userProfile.budget,
      projected: Math.round(projectedTotal),
      remaining: userProfile.budget - spent,
      daysRemaining,
      dailyAvg: Math.round(dailyAvgSpent)
    };
  }, [transactions, userProfile.budget, todayStr]);

  const securitySnapshot = useMemo(() => {
    const consumedPast = Math.max(0, financeTotals.totalExpenses);
    const finalBalance = financeTotals.projectedBalance;
    const safeThreshold = financeTotals.totalAvailable * 0.35;
    const warningThreshold = financeTotals.totalAvailable * 0.12;

    const tone: 'safe' | 'warning' | 'critical' =
      finalBalance > safeThreshold ? 'safe' : finalBalance > warningThreshold ? 'warning' : 'critical';

    return {
      consumedPast,
      finalBalance,
      tone,
    };
  }, [financeTotals]);

  // --- CALENDAR LOGIC ---
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Start Mon

    for (let i = 0; i < shift; i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const getDayDetails = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return {
      date: dStr,
      expenses: transactions.filter((t) => t.date === dStr && t.type === 'expense' && !isPlannedProvision(t)),
      missionsDone: missions.filter(m => m.completed_at && m.completed_at.startsWith(dStr)),
      missionsPlanned: missions.filter(m => m.planned_date === dStr && m.status !== 'Terminé'),
      wordsLearned: learnedWords.filter(w => w.learned_at && w.learned_at.startsWith(dStr))
    };
  };

  const dayDetails = selectedDate ? getDayDetails(selectedDate) : null;
  const safeCategoryDailyData = Array.isArray(categoryDailyData) ? categoryDailyData : [];
  const safeWeeklyDiffData = Array.isArray(weeklyDiffData) ? weeklyDiffData : [];
  const safeActivityData = Array.isArray(activityData) ? activityData : [];

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  const primaryQuickStat = {
    id: 'SECURITE',
    label: 'Solde actuel',
    val: formatChartCurrency(stats.financeRemaining),
    sub: '',
    icon: Shield,
    tone: 'emerald' as const,
  };

  const secondaryQuickStats = [
    {
      id: 'DEPENSES_JOUR',
      label: 'Depenses du jour',
      val: formatChartCurrency(stats.todaySpent),
      sub: '',
      icon: TrendingDown,
      tone: 'rose' as const,
      trendData: stats.dailyTrend.map((item) => ({
        label: String(item.date || ''),
        value: Number(item.amount || 0),
      })),
    },
    {
      id: 'PROVISIONS',
      label: 'Depenses a venir',
      val: formatChartCurrency(stats.futureTotal),
      sub: '',
      icon: Wallet,
      tone: 'amber' as const,
    },
    {
      id: 'MISSIONS',
      label: 'Objectifs actifs',
      val: stats.tasksCount,
      sub: '',
      icon: Activity,
      tone: 'blue' as const,
    },
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4'];
  const securityToneMeta = {
    safe: {
      badge: 'Zone saine',
      badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      finalTone: 'positive' as const,
      summaryClass: 'border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,rgba(236,253,245,0.95)_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-emerald-500/15 dark:bg-[linear-gradient(180deg,rgba(6,78,59,0.28),rgba(2,6,23,0.96))] dark:shadow-[0_24px_70px_rgba(16,185,129,0.12)]',
    },
    warning: {
      badge: 'Zone sensible',
      badgeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200',
      finalTone: 'warning' as const,
      summaryClass: 'border-amber-200 bg-[linear-gradient(180deg,#ffffff_0%,rgba(255,251,235,0.96)_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-amber-500/15 dark:bg-[linear-gradient(180deg,rgba(120,53,15,0.26),rgba(2,6,23,0.96))] dark:shadow-[0_24px_70px_rgba(245,158,11,0.12)]',
    },
    critical: {
      badge: 'Zone critique',
      badgeClass: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200',
      finalTone: 'negative' as const,
      summaryClass: 'border-rose-200 bg-[linear-gradient(180deg,#ffffff_0%,rgba(255,241,242,0.96)_100%)] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-rose-500/15 dark:bg-[linear-gradient(180deg,rgba(76,5,25,0.3),rgba(2,6,23,0.96))] dark:shadow-[0_24px_70px_rgba(244,63,94,0.12)]',
    },
  }[securitySnapshot.tone];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">

      {/* PROFIL SECTION */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate('PROFILE')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onNavigate('PROFILE');
          }
        }}
        className="dashboard-hero-shell w-full rounded-3xl p-6 text-left transition-all active:scale-[0.99] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--muted)] md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-amber-500 dark:opacity-[0.05]"><Shield size={180} /></div>
        <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full">
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-xl shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username || 'Profil'}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg md:text-3xl font-black">
                {(profile?.username || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">
              {profile?.username || 'Utilisateur'}
            </p>
            <h2 className="text-xl md:text-3xl font-black text-[color:var(--text-primary)] truncate font-outfit">NIVEAU {userProfile.rank}</h2>
            <div className="mt-2 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] dark:border-white/6 dark:bg-white/5">
              <div className="h-full bg-amber-500 shadow-[0_0_18px_rgba(255,171,17,0.45)] transition-all duration-1000" style={{ width: '65%' }} />
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <ThemeToggle className="border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-elevated)] dark:border-white/8 dark:bg-white/5 dark:hover:border-white/16 dark:hover:bg-white/8" />
            <button
              onClick={(event) => {
                event.stopPropagation();
                setFocusMode(true);
              }}
              className="hidden shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-xl transition-all hover:bg-amber-500 hover:text-white dark:bg-amber-500 dark:text-slate-950 dark:shadow-[0_20px_44px_rgba(255,171,17,0.25)] dark:hover:bg-[#ffbc3b] sm:flex"
            >
              <Zap size={16} fill="currentColor" /> Concentration
            </button>
          </div>
        </div>
      </div>

      {/* QUICK GRID */}
      <div className="space-y-3 sm:space-y-3.5 lg:space-y-4">
        <DashboardCard
          title={primaryQuickStat.label}
          value={primaryQuickStat.val}
          subtitle={primaryQuickStat.sub}
          icon={primaryQuickStat.icon}
          tone={primaryQuickStat.tone}
          index={0}
          onClick={() => setActiveDetail(primaryQuickStat.id)}
          className="w-full"
          featured
        />

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4">
          {secondaryQuickStats.map((stat, index) => (
            <DashboardCard
              key={stat.id}
              title={stat.label}
              value={stat.val}
              subtitle={stat.sub}
              icon={stat.icon}
              tone={stat.tone}
              index={index + 1}
              onClick={() => setActiveDetail(stat.id)}
              trendData={stat.trendData}
              compact
            />
          ))}
        </div>
      </div>

      {/* ANALYSES D'ACTIVITÉ */}
      <div className="mt-8">
        <ActivityCharts
          focusAreaData={focusAreaData}
          energyData={energyData}
          workIntensityData={workIntensityData}
          masteryTrendData={xpProgressionData}
          missions={missions}
          onNavigate={onNavigate}
        />
      </div>

      {/* NEW PLANNING & GOALS SECTION */}
      <div className={`grid grid-cols-1 gap-8 ${showDashboardJournal ? 'lg:grid-cols-2' : ''}`}>
        {showDashboardJournal ? (
          <DailyPlanner
            onNavigate={onNavigate}
            transactionsCount={transactions.length}
            financeRemaining={stats.financeRemaining}
            totalBudget={userProfile.budget}
            pendingMissions={stats.tasksCount}
            subjects={subjects}
            learnedWordsCount={learnedWords.length}
          />
        ) : null}
        <ProgressOverview />
      </div>

      {/* OLD CHARTS SECTION - For context or removal later */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DEPENSES PAR CATEGORIE (STACKED) */}
        <div className="lg:col-span-8 glass rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[9px] font-black text-[color:var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
              <Wallet size={14} className="text-amber-500" /> Repartition categorielle (7J)
            </h3>
          </div>
          <div className="h-[280px] w-full relative">
            {transactions.filter((t) => t.type === 'expense' && !isPlannedProvision(t)).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest bg-[color:var(--surface-2)] px-4 py-2 rounded-full border border-[color:var(--border)] backdrop-blur-sm">En attente de données financières...</p>
              </div>
            )}
            <ChartErrorBoundary fallbackTitle="Repartition indisponible" minHeightClassName="min-h-[200px]">
            <StackedBarsChart
              data={safeCategoryDailyData}
              valueKeys={categoriesList}
              colors={colors}
              labelKey="date"
            />
            </ChartErrorBoundary>
          </div>
        </div>

        {/* COMPARATIF HEBDO & ACTIVITES */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="dashboard-shell rounded-[2.5rem] p-8 flex-1 relative">
            <h3 className="text-[9px] font-black text-[color:var(--text-primary)] dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <ArrowUpRight size={14} className="text-emerald-500" /> Différentiel Hebdo
            </h3>
            {safeWeeklyDiffData.every(d => d.amount === 0) && (
              <div className="absolute inset-x-0 bottom-8 flex items-center justify-center z-10">
                <p className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">Flux stable...</p>
              </div>
            )}
            <div className="h-[120px] w-full">
              <ChartErrorBoundary fallbackTitle="Comparatif indisponible" minHeightClassName="min-h-[80px]">
                <HorizontalBarsChart
                  data={safeWeeklyDiffData.map((entry) => ({
                    label: String(entry.name || ''),
                    value: Number(entry.amount || 0),
                  }))}
                  getColor={(item, index) =>
                    index === 1 && Number(item.value || 0) > Number(safeWeeklyDiffData[0]?.amount || 0) ? '#f43f5e' : '#10b981'
                  }
                />
              </ChartErrorBoundary>
            </div>
          </div>

          <div className="dashboard-shell rounded-[2.5rem] p-8 flex-1 relative">
            <h3 className="text-[9px] font-black text-[color:var(--text-primary)] dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Activité (Missions / Leçons)
            </h3>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Missions
                </span>
                <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  Lecons
                </span>
              </div>
            </div>
            {safeActivityData.every(d => d.missions === 0 && d.learning === 0) && (
              <div className="absolute inset-x-0 bottom-8 flex items-center justify-center z-10">
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Base de données vierge...</p>
              </div>
            )}
            <div className="h-[140px] w-full">
              <ChartErrorBoundary fallbackTitle="Activité indisponible" minHeightClassName="min-h-[80px]">
                <DualSparklineChart
                  data={safeActivityData.map((entry) => ({
                    label: String(entry.date || ''),
                    missions: Number(entry.missions || 0),
                    learning: Number(entry.learning || 0),
                  }))}
                  lines={[
                    { key: 'missions', color: '#3b82f6' },
                    { key: 'learning', color: '#8b5cf6' },
                  ]}
                  height={116}
                />
              </ChartErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* MODERN INTERACTIVE CALENDAR */}
      <div className="dashboard-shell rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 opacity-5 text-amber-500 pointer-events-none"><CalendarIcon size={300} /></div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon size={24} className="text-amber-500" />
              <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter font-outfit">JOURNAL D'ACTIVITÉS</h3>
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest md:pl-9">PLANIFICATION & RÉTROSPECTIVE JOURNALIÈRE</p>
          </div>

          <div className="dashboard-control-shell flex items-center gap-4 p-2 rounded-2xl">
            <button onClick={() => changeMonth(-1)} className="p-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] dark:hover:text-white transition-colors"><ChevronLeft size={20} /></button>
            <span className="text-[10px] font-black text-[color:var(--text-primary)] dark:text-white uppercase tracking-widest min-w-[120px] text-center">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] dark:hover:text-white transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-3 relative z-10 h-full">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
            <div key={d} className="text-center text-[7px] font-black text-[color:var(--text-muted)] uppercase tracking-widest pb-3">{d}</div>
          ))}
          {daysInMonth.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;

            const dStr = day.toISOString().split('T')[0];
            const isToday = dStr === todayStr;
            const hasEvents = missions.some(m => m.planned_date === dStr || (m.completed_at && m.completed_at.startsWith(dStr))) || transactions.some(t => t.date === dStr);

            const completedMissionCount = missions.filter(m => m.completed_at && m.completed_at.startsWith(dStr)).length;
            const plannedMissionCount = missions.filter(m => m.planned_date === dStr && m.status !== 'Terminé').length;
            const expenseCount = transactions.filter(
              (t) => t.date === dStr && t.type === 'expense' && !isPlannedProvision(t),
            ).length;
            const learningCount = learnedWords.filter(w => w.learned_at && w.learned_at.startsWith(dStr)).length;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-between p-2 cursor-pointer group hover:scale-105 relative overflow-hidden ${isToday ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'dashboard-day-shell'
                  }`}
              >
                <span className={`text-xs md:text-sm font-black ${isToday ? 'text-amber-500' : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text-primary)] dark:group-hover:text-white'}`}>
                  {day.getDate()}
                </span>

                <div className="flex gap-1">
                  {/* Visual Indicators for Events */}
                  {expenseCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />}
                  {completedMissionCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />}
                  {plannedMissionCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse" />}
                  {learningCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAY DETAILS MODAL */}
      {selectedDate && dayDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[color:var(--overlay)] backdrop-blur-2xl animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-xl rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_30px_120px_var(--shadow-strong)] relative overflow-hidden flex flex-col max-h-[85vh] md:p-8">
            <button
              onClick={() => setSelectedDate(null)}
              className="absolute top-8 right-8 p-3 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--muted)] transition-all"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Rapport Journalier</p>
              <h2 className="text-3xl font-black text-[color:var(--text-primary)] italic uppercase">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">

              {/* FINANCES */}
              <div>
                <h3 className="text-xs font-black text-[color:var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2"><Wallet size={14} /> Flux Financiers</h3>
                {dayDetails.expenses.length > 0 ? (
                  <div className="space-y-3">
                    {dayDetails.expenses.map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center p-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)]">
                        <div>
                          <p className="font-bold text-[color:var(--text-primary)] text-sm">{t.title}</p>
                          <p className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-wider">{t.category}</p>
                        </div>
                        <span className="font-black text-rose-600 dark:text-rose-500 italic">-{formatCurrencyAmount(t.amount, activeCurrency)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-[color:var(--text-muted)] italic pl-4 border-l-2 border-[color:var(--border)] ml-1 py-1">Aucune dépense enregistrée.</p>}
              </div>

              {/* MISSIONS DONE */}
              <div>
                <h3 className="text-xs font-black text-[color:var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={14} /> Missions Accomplies</h3>
                {dayDetails.missionsDone.length > 0 ? (
                  <div className="space-y-3">
                    {dayDetails.missionsDone.map((m: any) => (
                      <div key={m.id} className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-500"><Trophy size={14} /></div>
                        <div>
                          <p className="font-bold text-[color:var(--text-primary)] text-sm">{m.title}</p>
                          <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-wider">XP ACQUISE</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-[color:var(--text-muted)] italic pl-4 border-l-2 border-[color:var(--border)] ml-1 py-1">Aucune mission terminée ce jour.</p>}
              </div>

              {/* LEARNING */}
              <div>
                <h3 className="text-xs font-black text-[color:var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2"><BrainCircuit size={14} /> Acquisition Savoir</h3>
                {dayDetails.wordsLearned.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dayDetails.wordsLearned.map((w: any) => (
                      <span key={w.id} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-wide">
                        {w.word}
                      </span>
                    ))}
                  </div>
                ) : <p className="text-xs text-[color:var(--text-muted)] italic pl-4 border-l-2 border-[color:var(--border)] ml-1 py-1">Aucun concept mémorisé.</p>}
              </div>

              {/* PLANNED */}
              <div>
                <h3 className="text-xs font-black text-[color:var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2"><Clock size={14} /> Programmation</h3>
                {dayDetails.missionsPlanned.length > 0 ? (
                  <div className="space-y-3">
                    {dayDetails.missionsPlanned.map((m: any) => (
                      <div key={m.id} className="flex justify-between items-center p-4 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-2)] opacity-80 hover:opacity-100 transition-opacity">
                        <p className="font-bold text-[color:var(--text-primary)] text-sm">{m.title}</p>
                        <span className="text-[9px] font-black text-amber-500 uppercase">PRÉVU</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-[color:var(--text-muted)] italic pl-4 border-l-2 border-[color:var(--border)] ml-1 py-1">Rien de prévu.</p>}
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-[color:var(--border)] flex gap-4">
              <button onClick={() => { onNavigate('DISCIPLINE'); }} className="flex-1 py-4 bg-amber-500 text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-400 transition-colors">Gérer les Tâches</button>
              <button onClick={() => { onNavigate('FINANCE'); }} className="flex-1 py-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] font-black uppercase text-[10px] tracking-widest hover:bg-[color:var(--muted)] transition-colors">Ajouter Dépense</button>
            </div>
          </div>
        </div>
      )}

      {/* WIDGET DETAIL MODAL */}
      {activeDetail === 'SECURITE' && (
        <SecurityDetailModal
          isOpen
          onClose={() => setActiveDetail(null)}
          onOpenModule={() => {
            onNavigate('FINANCE');
            setActiveDetail(null);
          }}
          budget={financeTotals.totalAvailable}
          consumed={financeTotals.totalExpenses}
          future={financeTotals.futureExpenses}
          current={financeTotals.currentBalance}
          projected={financeTotals.projectedBalance}
          futureCount={stats.futureCount}
          tone={securitySnapshot.tone}
        />
      )}

      {activeDetail && activeDetail !== 'SECURITE' && (
        <div className={`fixed inset-0 flex items-center justify-center bg-[color:rgba(247,249,252,0.88)] backdrop-blur-xl animate-in fade-in duration-200 ${activeDetail === 'SECURITE' ? 'z-[320] p-0 sm:p-4' : 'z-[320] p-4'}`}>
          <div className={`relative flex w-full flex-col overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_24px_70px_rgba(15,23,42,0.12)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ${activeDetail === 'SECURITE' ? 'min-h-[100dvh] rounded-none border-0 px-4 pb-5 pt-4 sm:min-h-0 sm:max-w-md sm:rounded-[1.5rem] sm:border sm:p-5' : 'max-w-[28rem] rounded-[2rem] px-6 pb-6 pt-7 max-h-[85vh] sm:px-7 sm:pb-7 sm:pt-8'}`}>
            {activeDetail === 'SECURITE' ? (
              <button
                onClick={() => setActiveDetail(null)}
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-secondary)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[color:var(--muted)] hover:text-[color:var(--text-primary)]"
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <button onClick={() => setActiveDetail(null)} className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-muted)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[color:var(--muted)] hover:text-[color:var(--text-primary)]"><X size={20} /></button>
            )}

            <div className={activeDetail === 'SECURITE' ? 'mb-4' : 'mb-6 space-y-2'}>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Détails</p>
              <h2 className="pr-12 text-[1.9rem] leading-[0.95] font-black italic uppercase tracking-[-0.04em] text-[color:var(--text-primary)] md:text-[2.2rem]">
                {activeDetail === 'DEPENSES_JOUR' && "Dépenses du Jour"}
                {activeDetail === 'PROVISIONS' && "Dépenses à Venir"}
                {activeDetail === 'SECURITE' && "Solde Disponible"}
                {activeDetail === 'MISSIONS' && "Objectifs en Cours"}
              </h2>
            </div>

            <div className={activeDetail === 'SECURITE' ? 'flex-1 overflow-y-auto space-y-3 pr-0' : 'flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4'}>
              {activeDetail === 'DEPENSES_JOUR' && (
                <div className="space-y-3">
                  {todayExpenseTransactions.length > 0 ? (
                    todayExpenseTransactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all hover:border-amber-500/30">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-amber-500/12 text-amber-500">
                            <TrendingDown size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase text-[color:var(--text-primary)]">{t.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{t.category}</span>
                              <span className="h-1 w-1 rounded-full bg-[color:var(--border-strong)]" />
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                                {t.created_at ? new Date(t.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Heure inconnue'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xl font-black italic text-amber-500">-{formatCurrencyAmount(t.amount, activeCurrency)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-10">Aucune dépense enregistrée aujourd'hui.</p>
                  )}
                </div>
              )}

              {activeDetail === 'PROVISIONS' && (
                <div className="space-y-3">
                  {futureExpenseTransactions.length > 0 ? (
                    futureExpenseTransactions.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-amber-500/12 text-amber-500">
                            <Wallet size={14} />
                          </div>
                          <div>
                            <p className="text-base font-black text-[color:var(--text-primary)]">{t.title}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-1">{t.category} — {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                        <span className="text-[1.55rem] font-black italic text-amber-500">-{formatCurrencyAmount(t.amount, activeCurrency)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-10">Aucune provision future détectée.</p>
                  )}
                </div>
              )}

              {activeDetail === 'SECURITE' && (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-[1.35rem] border border-[color:var(--border)] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)]">
                    <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

                    <div className="relative z-10 space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1.5">
                            <Shield size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-300">Projection</span>
                          </div>
                          <div className={`rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] ${securityToneMeta.badgeClass}`}>
                            {securityToneMeta.badge}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="max-w-[10ch] text-[1.7rem] leading-[0.9] font-black uppercase italic tracking-[-0.06em] text-[color:var(--text-primary)] font-outfit dark:text-white sm:max-w-none sm:text-[2.1rem]">
                            Solde <span className="text-emerald-600 dark:text-emerald-400">projete</span>
                          </h3>
                          <p className="max-w-md text-[13px] leading-relaxed text-[color:var(--text-secondary)] dark:text-slate-400">
                            Lecture instantanee du budget actuel, des charges deja engagees et du reste reel apres provisions.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <DetailValueCard
                          eyebrow="Budget actif"
                          value={formatCurrencyAmount(financeTotals.totalAvailable, activeCurrency)}
                          helper="Montant disponible au depart"
                        />
                        <DetailValueCard
                          eyebrow="Consomme"
                          value={`-${formatCurrencyAmount(securitySnapshot.consumedPast, activeCurrency)}`}
                          tone="negative"
                          helper="Charges deja enregistrees"
                        />
                        <DetailValueCard
                          eyebrow="A venir"
                          value={`-${formatCurrencyAmount(stats.futureTotal, activeCurrency)}`}
                          tone="warning"
                          helper={`${stats.futureCount} charge${stats.futureCount > 1 ? 's' : ''} planifiee${stats.futureCount > 1 ? 's' : ''}`}
                        />
                      </div>

                      <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3 dark:border-white/10 dark:bg-slate-950/45">
                        <div className="space-y-2.5">
                          <DetailSummaryRow
                            label="Solde actuel"
                            value={formatCurrencyAmount(financeTotals.currentBalance, activeCurrency)}
                          />
                          <div className={`overflow-hidden rounded-[1.2rem] border p-3.5 transition-all duration-300 active:scale-[0.99] sm:hover:-translate-y-0.5 ${securityToneMeta.summaryClass}`}>
                            <div className="flex items-end justify-between gap-4">
                              <div className="max-w-[10rem]">
                                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--text-muted)] dark:text-slate-500">Solde final projete</p>
                                <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-secondary)] dark:text-slate-300/80">
                                  Valeur restante apres deduction des depenses futures.
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-[2rem] font-black italic leading-none tracking-[-0.06em] font-outfit sm:text-[2.3rem] ${
                                  securityToneMeta.finalTone === 'positive'
                                    ? 'text-emerald-400'
                                    : securityToneMeta.finalTone === 'warning'
                                      ? 'text-amber-300'
                                      : 'text-rose-400'
                                }`}>
                                  {securitySnapshot.finalBalance.toLocaleString()}
                                </p>
                                <span className="mt-1 block text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)] dark:text-slate-500">{currencyLabel}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {false && activeDetail === 'SECURITE' && (
                <div className="space-y-3">
                  <div className="p-5 md:p-6 bg-slate-950 rounded-[2rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.24em] mb-4">Simulation Trésorerie Post-Provisions</p>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-sm gap-3">
                          <span className="text-slate-500 font-bold uppercase italic font-outfit text-xs">Budget AMCI</span>
                          <span className="text-white font-black">{formatCurrencyAmount(userProfile.budget, activeCurrency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm gap-3">
                          <span className="text-slate-500 font-bold uppercase italic font-outfit text-xs">Consommé (Passé)</span>
                          <span className="text-rose-500 font-black">-{formatCurrencyAmount(userProfile.budget - stats.financeRemaining, activeCurrency)}</span>
                        </div>
                        <div className="h-px bg-white/5 my-1" />
                        <div className="flex justify-between items-center text-sm font-outfit gap-3">
                          <span className="text-slate-500 font-bold uppercase italic font-outfit text-xs">SOLDE ESTIMÉ</span>
                          <span className="text-white font-black">{formatCurrencyAmount(stats.financeRemaining, activeCurrency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-outfit gap-3">
                          <span className="text-amber-500 font-bold uppercase italic font-outfit text-xs">Dépenses Planifiées</span>
                          <span className="text-amber-500 font-black">-{formatCurrencyAmount(stats.futureTotal, activeCurrency)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="rounded-[1.5rem] border border-emerald-500/10 bg-emerald-500/[0.04] px-4 py-3.5 flex items-center justify-between gap-4">
                          <span className="text-emerald-500 font-black uppercase italic text-base tracking-tighter font-outfit">SOLDE FINAL</span>
                          <span className="text-emerald-500 font-black text-2xl md:text-[2rem] italic tracking-tighter font-outfit">{formatCurrencyAmount(stats.projectedRemaining, activeCurrency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetail === 'MISSIONS' && (
                <div className="space-y-3">
                  {missions.filter(m => m.status !== 'Terminé').length > 0 ? (
                    missions.filter(m => m.status !== 'Terminé').map((m: any) => (
                      <div key={m.id} className="rounded-2xl border border-[color:var(--border)] border-l-4 border-l-blue-500 bg-[color:var(--surface)] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:border-white/5 dark:bg-slate-950 dark:shadow-none">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold uppercase text-[color:var(--text-primary)] dark:text-white">{m.title}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 font-outfit">{m.category} — Priorité {m.priority === 'high' ? 'Importante' : m.priority === 'critical' ? 'Critique' : 'Standard'}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase rounded-md">{m.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-10">Tous les objectifs sont accomplis.</p>
                  )}
                </div>
              )}
            </div>

            <div className={`${activeDetail === 'SECURITE' ? 'mt-3 pt-3' : 'mt-6 pt-5'} border-t border-[color:var(--border)]`}>
              <button
                onClick={() => {
                  const target = activeDetail === 'MISSIONS' ? 'DISCIPLINE' : 'FINANCE';
                  onNavigate(target as AppView);
                  setActiveDetail(null);
                }}
                className={`w-full rounded-[1.25rem] py-4 font-black uppercase text-[11px] tracking-[0.22em] transition-all active:scale-[0.99] shadow-[0_14px_30px_rgba(17,24,39,0.18)] ${
                  activeDetail === 'SECURITE'
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                    : 'bg-[color:var(--text-primary)] text-[color:var(--text-on-accent)] hover:bg-[color:var(--text-secondary)]'
                }`}
              >
                Ouvrir module complet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WIDGET DETAIL MODAL ... (existing code) */}

      {focusMode && (
        <FocusOverlay
          onClose={() => setFocusMode(false)}
          defaultTime={Number(profile?.settings_config?.defaultMissionDuration) || 25}
        />
      )}
    </div>
  );
};

export default Dashboard;

