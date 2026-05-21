
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, ShoppingCart, History, X, Banknote, ArrowUpCircle, Wallet, Tag, MessageSquare, Edit3, Trash2, Search, Loader2, Sparkles, AlertCircle, Calendar, TrendingDown, Target, ArrowRight, ShieldCheck, Save, Settings2, LineChart as LucideLineChart, FileDown, ArrowDownCircle, PieChart as LucidePieChart, Calculator, TrendingUp, Layers, PiggyBank, Pencil, BarChart3
} from 'lucide-react';
import { useAppDialog } from '../components/common/AppDialogProvider';
import ModalShell from '../components/common/ModalShell';
import { BarChartComponent, PieChartComponent, RadialProgressChart } from '../components/charts';
import { AlertBanner } from '../components/finance/AlertBanner';
import { DailyExpensesDetail } from '../components/finance/DailyExpensesDetail';
import { ProvisionsTimeline } from '../components/finance/ProvisionsTimeline';
import { SecurityDashboard } from '../components/finance/SecurityDashboard';
import { QuotaAnalysis } from '../components/finance/QuotaAnalysis';
import { BurnRateAnalytics } from '../components/finance/BurnRateAnalytics';
import { ExpensesEvolutionChart, VectorDistributionChart, ProjectionChart } from '../components/finance/FinancialCharts';
import ResteAVivreWidget from '../components/finance/ResteAVivreWidget';
import TacticalFinanceCharts from '../components/finance/TacticalFinanceCharts';
import TransactionDetailModal from '../components/finance/TransactionDetailModal';
import { consumeQueuedQuickAction, QUICK_ACTION_EVENT, QuickActionType } from '../lib/quickActions';
import { localStore, LOCAL_KEYS } from '../lib/localStorage';
import { DEFAULT_MONTHLY_BUDGET, resolveMonthlyBudget } from '../utils/financeBudget';
import { computeDaysUntilReset, resolveFinanceResetDate, type FinanceResetRecurrence } from '../utils/financeReset';
import { isPastOrTodayDateOnly, isSameDateOnly, normalizeDateOnly } from '../utils/transactionDates';
import { useCurrentDayKey } from '../hooks/useCurrentDayKey';
import { useTheme } from '../theme/ThemeProvider';
import { cx, uiRecipes } from '../theme/recipes';
import { toneClassNames } from '../theme/tokens';
import { isPlannedProvision } from '../utils/financeProvisions';
import { formatCurrencyAmount, getCurrencyLabel, getStoredCurrency, resolveCurrency } from '../utils/currency';

import { useTransactions, useBudgets, useSavings, useFinanceProfile, useCreateTransaction, useCreateSavings, useUpdateSavings, useDeleteSavings, useUpdateBudgets, useDeleteTransaction, useUpdateTransaction, useExecuteSaving, useUpdateFinanceSettings } from '../features/finance/hooks/useFinance';
import { useTransactionForm } from '../features/finance/hooks/useTransactionForm';
import { Transaction, CategoryBudget, SavingsItem } from '../features/finance/types';
import { formatChartCurrency } from '../utils/chartHelpers';

type FinanceAlert = {
  id: string;
  fingerprint: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  action?: string;
  onAction?: () => void;
};

const Finance: React.FC = () => {
  const { theme } = useTheme();
  const { data: transactionsRaw, isLoading: loadingTx } = useTransactions();
  const { data: budgetsRaw, isLoading: loadingBudgets } = useBudgets();
  const { data: savingsRaw, isLoading: loadingSavings } = useSavings();
  const { data: profileData, isLoading: loadingProfile } = useFinanceProfile();

  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const updateTransaction = useUpdateTransaction();
  const createSavings = useCreateSavings();
  const updateSavings = useUpdateSavings();
  const deleteSavings = useDeleteSavings();
  const executeSaving = useExecuteSaving();
  const updateBudgetsMutation = useUpdateBudgets();
  const updateFinanceSettings = useUpdateFinanceSettings();
  const { showAlert, showConfirm } = useAppDialog();

  const loading = loadingTx || loadingBudgets || loadingSavings || loadingProfile;

  const [saving, setSaving] = useState(false);
  const [isEditingBudgets, setIsEditingBudgets] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'table' | 'forecast'>('summary');

  const [localBudgets, setLocalBudgets] = useState<CategoryBudget[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);

  // Derive consolidated data
  const transactions = transactionsRaw || [];
  const savingsList = savingsRaw || [];

  const budgets = useMemo(() => {
    const raw = budgetsRaw || [];
    const defaultCategories = ['Courses', 'Plaisir', 'Transport', 'Loyers'];
    const merged = [...raw];
    defaultCategories.forEach(cat => {
      if (!merged.find(b => b.category === cat)) {
        merged.push({ category: cat, limit: 0 });
      }
    });
    return merged;
  }, [budgetsRaw]);

  const { totalBudget, nextAmciDate, amciRecurrence, amciDayOfMonth, customDailyQuota } = useMemo(() => {
    if (!profileData) {
      return {
        totalBudget: DEFAULT_MONTHLY_BUDGET,
        nextAmciDate: resolveFinanceResetDate({ recurrence: 'monthly', dayOfMonth: 10 }),
        amciRecurrence: 'monthly' as FinanceResetRecurrence,
        amciDayOfMonth: 10,
        customDailyQuota: null as number | null,
      };
    }

    const recurrence: FinanceResetRecurrence = profileData.settings_config?.amci_recurrence || 'monthly';
    const resetDay = profileData.settings_config?.amci_day_of_month || 10;
    const rawDailyQuotaOverride = profileData.settings_config?.daily_quota_override;
    const nextCustomDailyQuota = Number.isFinite(Number(rawDailyQuotaOverride)) && Number(rawDailyQuotaOverride) >= 0
      ? Number(rawDailyQuotaOverride)
      : null;

    return {
      totalBudget: resolveMonthlyBudget(profileData.amci_monthly_amount),
      nextAmciDate: profileData.next_amci_date || resolveFinanceResetDate({ recurrence, dayOfMonth: resetDay }),
      amciRecurrence: recurrence,
      amciDayOfMonth: resetDay,
      customDailyQuota: nextCustomDailyQuota,
    };
  }, [profileData]);
  const activeCurrency = resolveCurrency(profileData?.settings_config?.finance?.currency ?? getStoredCurrency());
  const currencyLabel = getCurrencyLabel(activeCurrency);
  const formatMoney = (value: number | string | null | undefined) => formatCurrencyAmount(value, activeCurrency);

  // Detail Modals State
  const [showDailyExpensesDetail, setShowDailyExpensesDetail] = useState(false);
  const [showProvisionsDetail, setShowProvisionsDetail] = useState(false);
  const [showSecurityDetail, setShowSecurityDetail] = useState(false);
  const [showQuotaDetail, setShowQuotaDetail] = useState(false);
  const [showBurnRateDetail, setShowBurnRateDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, string>>(
    () => localStore.get<Record<string, string>>(LOCAL_KEYS.FINANCE_DISMISSED_ALERTS) || {}
  );

  // Form State
  const [type, setType] = useState<'expense' | 'deposit'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [categoryValue, setCategoryValue] = useState('Courses');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');
  const [isPlanningProvision, setIsPlanningProvision] = useState(false);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Savings Form State
  const [newSavingsAmount, setNewSavingsAmount] = useState('');
  const [newSavingsReason, setNewSavingsReason] = useState('');
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null);
  const today = useCurrentDayKey();
  const migratedPlannedIdsRef = useRef<Set<string>>(new Set());



  // 1. Dynamic Reset Date Calculation
  const currentResetDate = useMemo(() => {
    return resolveFinanceResetDate({
      recurrence: amciRecurrence,
      dayOfMonth: amciDayOfMonth,
      customDate: nextAmciDate,
    });
  }, [amciRecurrence, amciDayOfMonth, nextAmciDate]);

  // 2. Single Source of Truth Logic
  const financialState = useMemo(() => {
    // Partition transactions
    // NOTE: "Provisions" are planned expenses that must NEVER auto-execute when the date is passed.
    // They become real expenses only when the user clicks "Exécuter".
    const plannedTransactions = transactions.filter((transaction) => isPlannedProvision(transaction));
    const pastTransactions = transactions.filter(
      (transaction) => !isPlannedProvision(transaction) && isPastOrTodayDateOnly(transaction.date, today),
    );

    // Day specific
    const todayTransactions = transactions.filter(
      (transaction) => !isPlannedProvision(transaction) && isSameDateOnly(transaction.date, today),
    );
    const todaySpent = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Totals
    const totalExpenses = pastTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Totals per source
    const depositsBySource = pastTransactions
      .filter(t => t.type === 'deposit')
      .reduce((acc: Record<string, number>, t) => {
        const src = t.source || 'Autres';
        acc[src] = (acc[src] || 0) + t.amount;
        return acc;
      }, {});

    // Initial base for AMCI is totalBudget, others start at 0 (unless we change that)
    // Actually, let's treat totalBudget as the initial AMCI allowance if no AMCI deposits exist,
    // or just assume AMCI deposits ARE the totalBudget.
    // The user said: "si le revenu est du source 'AMCI' les widget concerner doit etre augementer aussi"
    const amciPot = totalBudget + (depositsBySource['AMCI'] || 0);
    const donPot = depositsBySource['DON'] || 0;
    const autresPot = Object.entries(depositsBySource)
      .filter(([k]) => k !== 'AMCI' && k !== 'DON')
      .reduce((sum, [_, v]) => sum + (v as number), 0);

    const totalAvailable = amciPot + donPot + autresPot;

    const futureExpenses = plannedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSavings = savingsList.reduce((acc, s) => acc + s.amount, 0);

    // Balances
    const currentBalance = totalAvailable - totalExpenses;
    const projectedBalance = currentBalance - futureExpenses;

    // Time
    const daysUntilReset = Math.max(0, computeDaysUntilReset(currentResetDate));

    // Metrics
    const suggestedDailyQuota = Math.max(0, Math.round(currentBalance / Math.max(daysUntilReset, 1)));
    const dailyQuota = customDailyQuota ?? suggestedDailyQuota;
    const burnRate = totalAvailable > 0 ? (totalExpenses / totalAvailable) * 100 : 0;

    // Security Status
    const safetyRatio = totalAvailable > 0 ? (projectedBalance / totalAvailable) * 100 : 0;
    let securityLevel: 'safe' | 'warning' | 'critical' = 'safe';
    if (safetyRatio < 10) securityLevel = 'critical';
    else if (safetyRatio < 25) securityLevel = 'warning';

    return {
      totalExpenses,
      futureExpenses,
      todaySpent,
      currentBalance,
      projectedBalance,
      daysUntilReset,
      dailyQuota,
      suggestedDailyQuota,
      burnRate,
      securityLevel,
      totalSavings,
      todayTransactions,
      // Back-compat: keep the name used by the UI, but this is the list of planned provisions.
      futureTransactions: plannedTransactions,
      sources: {
        amci: amciPot,
        don: donPot,
        autres: autresPot,
        total: totalAvailable
      }
    };
  }, [transactions, totalBudget, currentResetDate, savingsList, today, customDailyQuota]);

  // Migration / safety net:
  // Any expense dated in the future is treated as a planned provision (manual execution required).
  // This prevents old data from auto-executing when its date becomes <= today.
  useEffect(() => {
    if (loadingTx) return;

    const candidates = transactions.filter(
      (transaction) => isPlannedProvision(transaction) && transaction.planned !== true,
    );

    const toMigrate = candidates.filter((transaction) => !migratedPlannedIdsRef.current.has(transaction.id));
    if (toMigrate.length === 0) return;

    (async () => {
      for (const transaction of toMigrate) {
        migratedPlannedIdsRef.current.add(transaction.id);
        try {
          await updateTransaction.mutateAsync({
            id: transaction.id,
            updates: { planned: true, planned_date: transaction.planned_date ?? transaction.date },
          });
        } catch (error) {
          console.error('Failed to migrate planned provision', error);
          migratedPlannedIdsRef.current.delete(transaction.id);
        }
      }
    })();
  }, [loadingTx, transactions, updateTransaction]);

  const handleSaveDailyQuota = async (nextQuota: number | null) => {
    await updateFinanceSettings.mutateAsync({
      daily_quota_override: nextQuota,
    });
  };

  const openPlannedExpenseModal = (defaultDate?: string) => {
    resetForm();
    setEditingTransaction(null);
    setType('expense');
    setIsPlanningProvision(true);
    setCategoryValue(budgets[0]?.category || 'Courses');

    if (defaultDate) {
      setDate(defaultDate);
    } else {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      setDate(nextDate.toISOString().split('T')[0]);
    }

    setShowModal(true);
  };

  const expenseAlertRevision = useMemo(() => {
    const expenseTransactions = transactions
      .filter((transaction) => transaction.type === 'expense')
      .sort((left, right) => {
        const dateComparison = left.date.localeCompare(right.date);
        if (dateComparison !== 0) return dateComparison;
        return left.id.localeCompare(right.id);
      });

    const latestExpense = expenseTransactions[expenseTransactions.length - 1];

    return [
      expenseTransactions.length,
      latestExpense?.id || 'none',
      latestExpense?.date || 'na',
      latestExpense?.amount || 0,
    ].join(':');
  }, [transactions]);

  // 3. Alerts System
  const alerts = useMemo(() => {
    const arr: FinanceAlert[] = [];

    // Over quota
    if (financialState.dailyQuota > 0 && financialState.todaySpent > financialState.dailyQuota * 1.5) {
      const overrunPercent = Math.round((financialState.todaySpent / financialState.dailyQuota - 1) * 100);
      const message = `Quota journalier dépassé de ${overrunPercent}%`;
      arr.push({
        id: 'daily-quota-overrun',
        fingerprint: `${today}-${overrunPercent}-${financialState.todaySpent}-${financialState.dailyQuota}-${expenseAlertRevision}`,
        type: 'warning',
        message,
        action: 'Détails',
        onAction: () => setShowDailyExpensesDetail(true)
      });
    } else if (financialState.dailyQuota === 0 && financialState.todaySpent > 0) {
      arr.push({
        id: 'daily-quota-overrun',
        fingerprint: `${today}-quota-zero-${financialState.todaySpent}-${expenseAlertRevision}`,
        type: 'warning',
        message: 'Aucune marge quotidienne disponible',
        action: 'Détails',
        onAction: () => setShowQuotaDetail(true)
      });
    }

    // Critical projected balance
    if (financialState.projectedBalance < 0) {
      const message = `Solde projeté négatif (${formatChartCurrency(financialState.projectedBalance)})`;
      arr.push({
        id: 'negative-projected-balance',
        fingerprint: `${today}-${financialState.projectedBalance}-${financialState.futureExpenses}-${expenseAlertRevision}`,
        type: 'critical',
        message,
        action: 'Ajuster',
        onAction: () => setShowProvisionsDetail(true)
      });
    }

    // Reset Imminent
    if (financialState.daysUntilReset <= 3 && financialState.daysUntilReset > 0) {
      const message = `Reset AMCI dans ${financialState.daysUntilReset} jours`;
      arr.push({
        id: 'amci-reset-imminent',
        fingerprint: `${today}-${financialState.daysUntilReset}-${currentResetDate}`,
        type: 'info',
        message,
      });
    }

    return arr;
  }, [currentResetDate, expenseAlertRevision, financialState, today]);

  const visibleAlerts = useMemo(
    () => alerts.filter(alert => dismissedAlerts[alert.id] !== alert.fingerprint),
    [alerts, dismissedAlerts]
  );

  useEffect(() => {
    setDismissedAlerts(prev => {
      let hasChanged = false;
      const nextState = { ...prev };

      alerts.forEach(alert => {
        if (nextState[alert.id] && nextState[alert.id] !== alert.fingerprint) {
          delete nextState[alert.id];
          hasChanged = true;
        }
      });

      Object.keys(nextState).forEach(key => {
        if (!alerts.some(alert => alert.id === key)) {
          delete nextState[key];
          hasChanged = true;
        }
      });

      if (hasChanged) {
        localStore.set(LOCAL_KEYS.FINANCE_DISMISSED_ALERTS, nextState);
      }

      return hasChanged ? nextState : prev;
    });
  }, [alerts]);

  const handleDismissAlert = (alert: FinanceAlert) => {
    setDismissedAlerts(prev => {
      const nextState = {
        ...prev,
        [alert.id]: alert.fingerprint,
      };
      localStore.set(LOCAL_KEYS.FINANCE_DISMISSED_ALERTS, nextState);
      return nextState;
    });
  };

  // 4. Adapters for existing UI (Backward Compatibility / Easy Migration)
  const amciStats = {
    remaining: financialState.currentBalance,
    progress: financialState.burnRate,
    daysLeft: financialState.daysUntilReset,
    dailyBudget: financialState.dailyQuota,
    isOver: financialState.burnRate > 90
  };

  const stats = useMemo(() => {
    // Re-implement missing stats for compatibility
    const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}h`,
      amount: financialState.todayTransactions
        .filter((_, idx) => (idx % 24) === i)
        .reduce((sum, t) => sum + t.amount, 0)
    })).filter(d => d.hour !== '');

    const securityScenarios = [
      { name: 'Normal', value: financialState.projectedBalance, status: financialState.projectedBalance > 500 ? 'safe' : 'warning' },
      { name: 'Pessimiste', value: financialState.projectedBalance * 0.8, status: financialState.projectedBalance * 0.8 > 200 ? 'warning' : 'critical' },
      { name: 'Critique', value: financialState.projectedBalance * 0.5, status: 'critical' }
    ];

    return {
      todaySpent: financialState.todaySpent,
      futureExpenses: financialState.futureExpenses,
      projectedRemaining: financialState.projectedBalance,
      futureCount: financialState.futureTransactions.length,
      totalSavings: financialState.totalSavings,
      todayTransactions: financialState.todayTransactions,
      hourlyData,
      securityScenarios,
      remaining: financialState.currentBalance,
      expenses: financialState.totalExpenses
    };
  }, [financialState]);

  const budgetAnalysis = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions
        .filter(
          (t) =>
            t.category === b.category &&
            t.type === 'expense' &&
            !isPlannedProvision(t) &&
            normalizeDateOnly(t.date) <= today,
        )
        .reduce((acc, t) => acc + t.amount, 0);

      const future = transactions
        .filter((t) => t.category === b.category && t.type === 'expense' && isPlannedProvision(t))
        .reduce((acc, t) => acc + t.amount, 0);

      return {
        ...b,
        spent,
        future,
        remaining: b.limit - spent,
        percent: b.limit > 0 ? (spent / b.limit) * 100 : 0
      };
    });
  }, [budgets, transactions, today]);

  const localBudgetAnalysis = useMemo(() => {
    return localBudgets.map((budget) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.category === budget.category &&
            transaction.type === 'expense' &&
            !isPlannedProvision(transaction) &&
            normalizeDateOnly(transaction.date) <= today,
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const future = transactions
        .filter(
          (transaction) =>
            transaction.category === budget.category &&
            transaction.type === 'expense' &&
            isPlannedProvision(transaction),
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const remaining = budget.limit - spent;
      const usedPercent = budget.limit > 0 ? (spent / budget.limit) * 100 : spent > 0 ? 100 : 0;
      const remainingPercent = budget.limit > 0 ? Math.max(0, (remaining / budget.limit) * 100) : 0;
      const tone =
        remaining < 0 || usedPercent >= 100
          ? 'critical'
          : usedPercent >= 75
            ? 'warning'
            : usedPercent > 0
              ? 'healthy'
              : 'idle';

      return {
        ...budget,
        spent,
        future,
        remaining,
        usedPercent,
        remainingPercent,
        tone,
      };
    });
  }, [localBudgets, transactions, today]);

  const localBudgetTotals = useMemo(() => {
    const allocated = localBudgetAnalysis.reduce((sum, item) => sum + Number(item.limit || 0), 0);
    const spent = localBudgetAnalysis.reduce((sum, item) => sum + Number(item.spent || 0), 0);
    const planned = localBudgetAnalysis.reduce((sum, item) => sum + Number(item.future || 0), 0);

    const remainingNow = allocated - spent;
    const remainingAfterPlanned = allocated - spent - planned;

    const usedPercent = allocated > 0 ? (spent / allocated) * 100 : spent > 0 ? 100 : 0;
    const remainingPercent = allocated > 0 ? Math.max(0, (remainingAfterPlanned / allocated) * 100) : 0;

    const tone: 'critical' | 'warning' | 'healthy' | 'idle' =
      remainingAfterPlanned < 0 || usedPercent >= 100
        ? 'critical'
        : usedPercent >= 75
          ? 'warning'
          : usedPercent > 0 || planned > 0
            ? 'healthy'
            : 'idle';

    return {
      allocated,
      spent,
      planned,
      remainingNow,
      remainingAfterPlanned,
      usedPercent,
      remainingPercent,
      tone,
    };
  }, [localBudgetAnalysis]);

  const futureTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => isPlannedProvision(transaction))
        .sort((a, b) => normalizeDateOnly(a.date).localeCompare(normalizeDateOnly(b.date))),
    [transactions]
  );

  const futureExpenseTransactions = useMemo(
    () => futureTransactions.filter((transaction) => transaction.type === 'expense'),
    [futureTransactions]
  );

  const forecastSummary = useMemo(() => {
    const nextProvision = futureExpenseTransactions[0] || null;
    const categoriesImpacted = new Set(futureExpenseTransactions.map((transaction) => transaction.category)).size;
    const averageProvision = futureExpenseTransactions.length
      ? Math.round(futureExpenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0) / futureExpenseTransactions.length)
      : 0;
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 7);
    const nextSevenDaysKey = normalizeDateOnly(limitDate.toISOString());
    const dueSoonCount = futureExpenseTransactions.filter((transaction) => normalizeDateOnly(transaction.date) <= nextSevenDaysKey).length;
    const budgetPressureCount = budgetAnalysis.filter((budget) => budget.future > 0 && budget.remaining - budget.future < 0).length;

    return {
      nextProvision,
      categoriesImpacted,
      averageProvision,
      dueSoonCount,
      budgetPressureCount,
    };
  }, [budgetAnalysis, futureExpenseTransactions, today]);

  const savingsFillPercent = totalBudget > 0
    ? Math.min(100, Math.max(0, (financialState.totalSavings / totalBudget) * 100))
    : 0;

  const pastTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => !isPlannedProvision(transaction) && isPastOrTodayDateOnly(transaction.date, today))
        .sort((a, b) => normalizeDateOnly(b.date).localeCompare(normalizeDateOnly(a.date))),
    [transactions, today]
  );

  const quotaHistoryLast7Days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const dateRef = new Date();
        dateRef.setDate(dateRef.getDate() - (6 - index));
        const dateKey = dateRef.toISOString().split('T')[0];

        return {
          date: dateRef.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          amount: transactions
            .filter(
              (transaction) =>
                transaction.type === 'expense' &&
                !isPlannedProvision(transaction) &&
                isSameDateOnly(transaction.date, dateKey),
            )
            .reduce((sum, transaction) => sum + transaction.amount, 0),
        };
      }),
    [transactions]
  );

  useEffect(() => {
    const openQuickTransactionModal = () => {
      resetForm();
      setType('expense');
      setCategoryValue('Courses');
      setViewMode('summary');
      setShowModal(true);

      window.setTimeout(() => {
        const titleInput = document.getElementById('finance-transaction-title') as HTMLInputElement | null;
        titleInput?.focus();
      }, 120);
    };

    const handleQuickAction = (event: Event) => {
      const action = (event as CustomEvent<{ action: QuickActionType }>).detail?.action;

      if (action !== 'add-transaction') return;

      consumeQueuedQuickAction('add-transaction');
      openQuickTransactionModal();
    };

    if (consumeQueuedQuickAction('add-transaction')) {
      openQuickTransactionModal();
    }

    window.addEventListener(QUICK_ACTION_EVENT, handleQuickAction as EventListener);
    return () => window.removeEventListener(QUICK_ACTION_EVENT, handleQuickAction as EventListener);
  }, []);


  const handleSaveTransaction = async () => {
    if (!amount || !title) return;
    setSaving(true);
    try {
      const requestedAmount = Number(amount);

      const isProvisionDraft =
        type === 'expense' &&
        (isPlanningProvision ||
          (editingTransaction ? isPlannedProvision(editingTransaction) : false) ||
          normalizeDateOnly(date) > today);

      const editingProvisionAmount =
        editingTransaction && editingTransaction.type === 'expense' && isPlannedProvision(editingTransaction)
          ? editingTransaction.amount
          : 0;

      const availableProjectedBalance = financialState.projectedBalance + editingProvisionAmount;

      // BLOCK SPENDING IF PROJECTED BALANCE (RESTE À VIVRE) INSUFFICIENT
      // NOTE: We do NOT block saving a provision; provisions are forecasts, not auto-spending.
      if (type === 'expense' && !isProvisionDraft) {
        if (availableProjectedBalance <= 0) {
          await showAlert({
            title: 'Depense bloquee',
            message: 'Reste a vivre critique. Toute nouvelle depense est momentanement bloquee.',
            tone: 'danger',
          });
          setSaving(false);
          return;
        }
        if (availableProjectedBalance - requestedAmount < 0) {
          await showAlert({
            title: 'Operation rejetee',
            message: `Cette depense (${formatChartCurrency(requestedAmount)}) depasse votre reste a vivre actualise (${formatChartCurrency(availableProjectedBalance)}).`,
            tone: 'warning',
          });
          setSaving(false);
          return;
        }
      }

      const payload = {
        type,
        amount: requestedAmount,
        title,
        category: type === 'expense' ? categoryValue : 'Dépôt',
        source: type === 'deposit' ? categoryValue : undefined,
        date,
        comment,
        ...(isProvisionDraft ? { planned: true as const, planned_date: normalizeDateOnly(date) } : {}),
      };

      if (editingTransaction) {
        await updateTransaction.mutateAsync({ id: editingTransaction.id, updates: payload });
      } else {
        await createTransaction.mutateAsync(payload);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: 'Enregistrement impossible',
        message: "La transaction n'a pas pu etre enregistree.",
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBudgets = async () => {
    setSaving(true);
    try {
      // NOTE: Previously we used local state 'budgets'. Now 'budgets' is derived from query.
      // If we want to save edits, we need to pass the EDITED list here.
      // But we don't have a local 'editedBudgets' state visible here yet unless we change the Modal to manage it.
      // For now, assuming the Modal might call this, but wait... 
      // The Budget Modal in this file iterates over `budgets` and has inputs that likely updated `setBudgets`.
      // Since I removed `setBudgets`, the inputs in the modal are now broken (they won't update state).
      // I need to fix the Modal inputs first to use a local state initialized from budgets.
      // However, for this replacement, I will assume we pass the budgets to save OR we fix the architecture.

      // FIX: The Modal logic below needs `setBudgets`.
      // I cannot easily fix this without refactoring the Modal to have its own state.
      // I will leave this function as is but pointing to mutation, 
      // AND I will add a local state for editing budgets when modal opens.

      await updateBudgetsMutation.mutateAsync(localBudgets);
      setShowBudgetModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Modified to be immediate for cleaner architecture
  const handleAddSaving = async () => {
    if (!newSavingsAmount || !newSavingsReason) return;

    await createSavings.mutateAsync({
      amount: Number(newSavingsAmount),
      reason: newSavingsReason,
      date: new Date().toISOString().split('T')[0]
    });

    setNewSavingsAmount('');
    setNewSavingsReason('');
  };

  const handleUpdateSaving = async (id: string, amount: number, reason: string) => {
    await updateSavings.mutateAsync({ id, updates: { amount, reason } });
  };

  const handleDeleteSaving = async (id: string) => {
    await deleteSavings.mutateAsync(id);
  };

  const handleExecuteSaving = async (savingId: string, amount: number, reason: string) => {
    // SAFETY CHECK
    if (financialState.projectedBalance - amount < 0) {
      await showAlert({
        title: 'Reserve refusee',
        message: "La resilience financiere est insuffisante pour executer cette reserve.",
        tone: 'danger',
      });
      return;
    }

    try {
      await executeSaving.mutateAsync({ id: savingId, amount, reason });
    } catch (err) {
      console.error('Error executing saving:', err);
    }
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    setLocalBudgets(prev => [...prev, { category: newCatName.trim(), limit: 0 }]);
    setNewCatName('');
    setShowAddCat(false);
  };

  const resetForm = () => {
    setAmount(''); setTitle(''); setDate(new Date().toISOString().split('T')[0]); setComment('');
    setEditingTransaction(null);
    setIsPlanningProvision(false);
  };

  const openTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(null);
    setShowDailyExpensesDetail(false);
    setShowProvisionsDetail(false);
    setEditingTransaction(transaction);
    setType(transaction.type);
    setIsPlanningProvision(isPlannedProvision(transaction));
    setAmount(transaction.amount.toString());
    setTitle(transaction.title);
    setCategoryValue(transaction.type === 'deposit' ? (transaction.source || 'AMCI') : transaction.category);
    setDate(transaction.date);
    setComment(transaction.comment || '');
    setShowModal(true);
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    const confirmed = await showConfirm({
      title: 'Supprimer la transaction',
      message: `La transaction "${transaction.title}" sera retiree definitivement.`,
      confirmLabel: 'Supprimer',
      tone: 'danger',
    });
    if (!confirmed) return;
    setSelectedTransaction(null);
    await deleteTransaction.mutateAsync(transaction.id);
  };

  const handleExecuteTransaction = async (transactionId: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;
    if (!isPlannedProvision(tx)) return;

    if (financialState.currentBalance - tx.amount < 0) {
      await showAlert({
        title: 'Execution impossible',
        message: "Le solde reel est insuffisant pour executer cette operation maintenant.",
        tone: 'danger',
      });
      return;
    }

    try {
      const todayDate = new Date().toISOString().split('T')[0];
      await updateTransaction.mutateAsync({
        id: transactionId,
        updates: {
          planned: false,
          planned_date: tx.planned_date ?? tx.date,
          date: todayDate,
        },
      });
    } catch (err) {
      console.error('Error executing transaction:', err);
    }
  };

  const handleDeleteTransactionById = async (transactionId: string, message: string) => {
    const confirmed = await showConfirm({
      title: 'Supprimer cette operation',
      message,
      confirmLabel: 'Supprimer',
      tone: 'danger',
    });
    if (!confirmed) return;
    await deleteTransaction.mutateAsync(transactionId);
  };

  const isProvisionForm =
    type === 'expense' &&
    (isPlanningProvision ||
      (editingTransaction ? isPlannedProvision(editingTransaction) : false) ||
      normalizeDateOnly(date) > today);

  if (loading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin text-amber-500 w-10 h-10 border-4 border-current border-t-transparent rounded-full" /></div>;

  return (
      <div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:space-y-10 md:pb-24 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-[color:var(--text-primary)] tracking-tighter uppercase leading-none">
            MES <span className="text-amber-500 font-outfit">FINANCES</span>
          </h2>
          <p className="text-[color:var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">
            GESTION DU BUDGET & SUIVI DES DÉPENSES
          </p>
        </div>

        <div className="flex w-full justify-center overflow-x-auto rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-1 shadow-card scrollbar-hide md:w-auto md:rounded-[2rem]">
          {[
            { id: 'summary', label: 'Synthèse', icon: Sparkles },
            { id: 'forecast', label: 'Provisions', icon: Calculator },
            { id: 'table', label: 'Registre', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all md:rounded-3xl md:px-6 md:py-4 md:text-xs ${
                viewMode === tab.id
                  ? 'bg-[color:var(--surface)] text-[color:var(--text-primary)] shadow-[0_14px_40px_var(--shadow)]'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--muted)]'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'summary' && (
        <>
          {/* ALERTS SYSTEM */}
          <div className="space-y-4">
            {visibleAlerts.map((alert) => (
              <AlertBanner
                key={`${alert.id}-${alert.fingerprint}`}
                type={alert.type}
                message={alert.message}
                action={alert.action || (alert.type === 'info' ? undefined : 'Voir')}
                onAction={alert.onAction}
                onDismiss={() => handleDismissAlert(alert)}
              />
            ))}
          </div>

          {/* AMCI ACCUMULATION WIDGET */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)] xl:gap-6">
            <div className="glass relative overflow-hidden rounded-[2rem] border-amber-500/20 bg-amber-500/[0.02] p-5 shadow-2xl flex flex-col gap-6 sm:rounded-[2.75rem] sm:p-6 lg:flex-row lg:items-center lg:p-8">
              <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 opacity-[0.025] text-amber-500 transition-transform duration-1000 lg:block">
                <Banknote size={200} />
              </div>

              <button
                type="button"
                className="relative z-10 mx-auto flex w-full max-w-[220px] shrink-0 items-center justify-center lg:mx-0 lg:max-w-[260px]"
                onClick={() => setShowBurnRateDetail(true)}
              >
                <div className="absolute inset-[16%] rounded-full bg-amber-500/10 blur-3xl" />
                <RadialProgressChart
                  value={amciStats.progress}
                  max={100}
                  label="Brule"
                  color={amciStats.isOver ? '#f43f5e' : '#f59e0b'}
                  theme={theme}
                  gradient={
                    amciStats.isOver
                      ? { start: '#fb7185', end: '#f43f5e' }
                      : { start: '#fbbf24', end: '#f97316' }
                  }
                  showSurface={false}
                  className="min-h-0 h-[190px] w-[190px] sm:h-[230px] sm:w-[230px]"
                />
              </button>

              <div className="relative z-10 w-full flex-1 space-y-5">
                <h3 className="text-2xl font-black text-[color:var(--text-primary)] uppercase tracking-tighter sm:text-3xl">
                  BUDGET <span className="text-amber-500">MENSUEL</span>
                </h3>
                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm sm:p-5">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)]">Reste disponible</p>
                    <p className="text-2xl font-black italic tracking-tight text-[color:var(--text-primary)] sm:text-3xl">{formatChartCurrency(amciStats.remaining)}</p>
                  </div>
                  <div
                    className="group cursor-pointer rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm transition-all hover:border-amber-500/30 hover:bg-[color:var(--surface)] sm:p-5"
                    onClick={() => setShowQuotaDetail(true)}
                  >
                    <p className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)]">
                      Quota / Jour <ArrowRight size={10} className="text-amber-500 transition-transform group-hover:translate-x-0.5" />
                    </p>
                    <p className="text-2xl font-black italic tracking-tight text-[color:var(--text-primary)] sm:text-3xl">
                      {formatChartCurrency(amciStats.dailyBudget)}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs font-black text-[color:var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3">
                  <Calendar size={16} className="text-amber-500" /> RESET DANS {amciStats.daysLeft} JOURS ({nextAmciDate})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-1">
              <button onClick={() => { setLocalBudgets(budgets); setShowAddCat(false); setShowBudgetModal(true); }} className="min-h-[136px] rounded-[1.5rem] border border-emerald-500/20 bg-[color:var(--surface)] p-4 shadow-card transition-all group flex flex-col items-center justify-center text-center gap-2 sm:min-h-[164px] sm:rounded-[2rem] sm:p-6 sm:gap-3 hover:border-emerald-400/40 hover:bg-emerald-500/[0.05] dark:glass dark:bg-emerald-500/[0.03] dark:hover:bg-emerald-500/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-emerald-500/10 text-emerald-500 transition-all group-hover:bg-emerald-500/15 sm:h-16 sm:w-16 sm:rounded-3xl dark:text-emerald-400 dark:group-hover:bg-slate-950">
                  <Target size={26} strokeWidth={2.5} className="sm:hidden" />
                  <Target size={32} strokeWidth={2.5} className="hidden sm:block" />
                </div>
                <div>
                  <h4 className="font-black text-[color:var(--text-primary)] uppercase italic text-[11px] sm:text-sm">GÉRER BUDGETS</h4>
                  <p className="mt-1 text-[7px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)] sm:text-[8px] sm:tracking-widest">PLANIFIER UNE DÉPENSE</p>
                </div>
              </button>
              <button onClick={() => { resetForm(); setType('expense'); setIsPlanningProvision(false); setShowModal(true); }} className="min-h-[136px] rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-card transition-all group flex flex-col items-center justify-center text-center gap-2 sm:min-h-[164px] sm:rounded-[2rem] sm:p-6 sm:gap-3 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] dark:glass dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] transition-all sm:h-16 sm:w-16 sm:rounded-3xl dark:bg-white/10 dark:text-white dark:group-hover:bg-slate-950">
                  <Plus size={26} strokeWidth={3} className="sm:hidden" />
                  <Plus size={32} strokeWidth={3} className="hidden sm:block" />
                </div>
                <div>
                  <h4 className="font-black text-[color:var(--text-primary)] uppercase italic text-[11px] sm:text-sm">NOUVEAU FLUX</h4>
                  <p className="mt-1 text-[7px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)] sm:text-[8px] sm:tracking-widest">AJOUTER UNE TRANSACTION</p>
                </div>
              </button>
            </div>
          </div>

          {/* QUICK STATS SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div
              onClick={() => setViewMode('table')}
              className="glass rounded-[2rem] min-h-[172px] p-5 border-rose-500/20 bg-rose-500/[0.03] shadow-xl animate-pulse-glow cursor-pointer transition-all group overflow-hidden relative sm:min-h-[196px] sm:p-6"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 text-rose-500 group-hover:scale-125 transition-transform duration-1000">
                <TrendingDown size={100} />
              </div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic flex items-center gap-2">
                  <ArrowDownCircle size={14} /> Dépenses Totales
                </p>
              </div>
              <h2 className="text-3xl font-black text-[color:var(--text-primary)] tracking-tighter transition-colors sm:text-4xl dark:text-white">
                {formatChartCurrency(financialState.totalExpenses)}
              </h2>
              <p className="text-[11px] text-[color:var(--text-muted)] mt-2 font-bold uppercase tracking-widest italic flex items-center gap-2">
                AUJOURD'HUI {formatChartCurrency(financialState.todaySpent)} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
              </p>
            </div>

            <div
              onClick={() => setShowProvisionsDetail(true)}
              className="glass rounded-[2rem] min-h-[172px] p-5 border-amber-500/20 bg-amber-500/[0.03] cursor-pointer transition-all group overflow-hidden relative sm:min-h-[196px] sm:p-6 dark:border-amber-500/10 dark:bg-[#0f172a]/40"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500 group-hover:scale-125 transition-transform duration-1000">
                <Calculator size={100} />
              </div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic flex items-center gap-2">
                  <Calculator size={14} /> Provisions Totales
                </p>
              </div>
              <h2 className="text-3xl font-black text-[color:var(--text-primary)] tracking-tighter transition-colors sm:text-4xl dark:text-white">
                {formatChartCurrency(financialState.futureExpenses)}
              </h2>
              <p className="text-[11px] text-[color:var(--text-muted)] mt-2 font-bold uppercase tracking-widest italic flex items-center gap-2">
                {financialState.futureTransactions.length} OPÉRATIONS <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
              </p>
            </div>

            <ResteAVivreWidget
              amount={financialState.projectedBalance}
              totalBudget={financialState.sources.total}
              onClick={() => setShowSecurityDetail(true)}
            />

            <motion.div
              onClick={() => setShowSavingsModal(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setShowSavingsModal(true);
                }
              }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              className="glass group relative flex min-h-[172px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(6,78,59,0.12),rgba(2,6,23,0.96))] p-5 text-center shadow-xl transition-all hover:border-emerald-400/35 hover:bg-[linear-gradient(180deg,rgba(6,95,70,0.16),rgba(2,6,23,0.98))] sm:min-h-[196px] sm:p-6"
            >
              <div className="absolute -right-5 -bottom-5 opacity-[0.06] text-emerald-400 transition-transform duration-1000 group-hover:scale-125">
                <Wallet size={112} />
              </div>

              <motion.div
                className="relative mb-4 flex h-[92px] w-[98px] items-center justify-center sm:h-[100px] sm:w-[108px]"
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-x-3 top-2 h-[28px] rounded-[1rem] border-[2.5px] border-white/80 bg-slate-900/95 shadow-[0_8px_26px_rgba(2,6,23,0.3)]" />
                <div className="absolute inset-x-1 bottom-2 top-5 rounded-[1.45rem] border-[2.5px] border-white/85 bg-slate-950/90 shadow-[0_10px_30px_rgba(2,6,23,0.28)]" />
                <div className="absolute right-1 top-[34px] z-10 h-7 w-7 rounded-r-[1rem] border-[2px] border-l-0 border-white/80 bg-slate-900/95 sm:top-[38px]">
                  <div className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/75" />
                </div>
                <div className="absolute inset-x-[13px] bottom-[10px] h-[34px] overflow-hidden rounded-[0.95rem] border border-white/8 bg-slate-950/55 sm:h-[38px]">
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 rounded-[1rem] bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600"
                    initial={false}
                    animate={{ height: ['42%', '60%', '48%'] }}
                    transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className="absolute left-[-8%] top-[-8px] h-4 w-[116%] rounded-[100%] bg-emerald-100/35"
                      animate={{ x: [-5, 7, -5], y: [0, -3, 0] }}
                      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="absolute bottom-2 left-2 w-2 rounded-full bg-white/20"
                      animate={{ height: ['18%', '40%', '26%'], opacity: [0.25, 0.6, 0.3] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] italic text-emerald-300">
                  Épargne
                </p>
                <div className="flex items-end justify-center gap-1.5">
                  <h2 className="text-[2rem] font-black tracking-[-0.06em] text-white transition-colors sm:text-[2.35rem]">
                    {financialState.totalSavings.toLocaleString()}
                  </h2>
                  <span className="pb-1 text-sm font-black uppercase italic text-emerald-300">{currencyLabel}</span>
                </div>
              </div>

              <div className="relative z-10 mt-4 w-full max-w-[154px]">
                <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/5 bg-slate-900/80">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500"
                    initial={false}
                    animate={{ width: `${Math.max(10, savingsFillPercent)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      <ModalShell
        isOpen={showSavingsModal}
        onClose={() => setShowSavingsModal(false)}
        title={<><span>GESTION DES </span><span className="text-blue-500">RÉSERVES D'ÉPARGNE</span></>}
        icon={<PiggyBank size={20} className="text-blue-500" />}
        maxWidthClassName="max-w-6xl"
        centered
        bodyClassName="space-y-6"
        footer={
          <button
            onClick={() => setShowSavingsModal(false)}
            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-blue-500 px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)]"
          >
            <ShieldCheck size={18} strokeWidth={3} /> FERMER LE GESTIONNAIRE
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            {savingsList.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] px-6 py-14 text-center dark:border-white/10 dark:bg-slate-950/30">
                <PiggyBank size={42} className="mx-auto mb-4 text-[color:var(--tone-info-text)] dark:text-slate-700" />
                <p className="text-[11px] font-black uppercase tracking-widest text-[color:var(--tone-info-text)] dark:text-slate-500">Aucune réserve scellée</p>
              </div>
            ) : (
              savingsList.map((s) => (
                <div
                  key={s.id}
                  className={`glass rounded-[1.75rem] border p-5 shadow-xl sm:p-6 ${s.executed
                    ? 'border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] opacity-75 dark:border-emerald-500/30 dark:bg-emerald-950/20'
                    : 'border-[color:var(--tone-info-border)] bg-[color:var(--surface-elevated)] dark:border-white/5 dark:bg-slate-950/60'
                    }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)] dark:text-slate-600">{s.date}</span>
                      {s.executed && s.execution_date && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-[color:var(--tone-success-text)] dark:text-emerald-500">
                          Exécuté le {s.execution_date}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!s.executed && (
                        <button
                          onClick={() => {
                            setEditingSavingsId(s.id);
                            setNewSavingsAmount(s.amount.toString());
                            setNewSavingsReason(s.reason);
                          }}
                          className="rounded-xl p-2 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--tone-info-text)] dark:text-slate-500 dark:hover:text-blue-400"
                        >
                          <Edit3 size={15} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteSaving(s.id)} className="rounded-xl p-2 text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--tone-danger-text)] dark:text-slate-500 dark:hover:text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h4 className={`text-lg font-black uppercase italic tracking-tight ${s.executed ? 'text-[color:var(--text-muted)] line-through dark:text-slate-500' : 'text-[color:var(--heading)] dark:text-white'}`}>{s.reason}</h4>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className={`text-2xl font-black italic ${s.executed ? 'text-[color:var(--tone-success-text)] dark:text-emerald-600' : 'text-[color:var(--tone-info-text)] dark:text-blue-500'}`}>{formatMoney(s.amount)}</p>
                    {!s.executed && (
                      <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] px-4 py-3 dark:border-white/5 dark:bg-slate-950/60">
                        <input
                          type="checkbox"
                          onChange={() => handleExecuteSaving(s.id, s.amount, s.reason)}
                          className="h-5 w-5 rounded-md border-2 border-blue-500/40 bg-[color:var(--surface)] accent-blue-500 dark:bg-slate-950"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--tone-info-text)] dark:text-slate-400">Exécuter</span>
                      </label>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-[1.9rem] border border-[color:var(--tone-info-border)] bg-[color:var(--surface)] p-5 shadow-card sm:p-6 dark:glass dark:border-white/5 dark:bg-[#0b1121]">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.32em] italic text-[color:var(--tone-info-text)] dark:text-blue-400">OPÉRATION D'ÉPARGNE</h4>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)] dark:text-slate-600">Montant</label>
                <input
                  type="number"
                  value={newSavingsAmount}
                  onChange={e => setNewSavingsAmount(e.target.value)}
                  placeholder="0.00"
                  className="ui-field w-full rounded-[1.5rem] border px-6 py-5 text-center text-3xl font-black italic outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)] dark:text-slate-600">Libellé</label>
                <input
                  type="text"
                  value={newSavingsReason}
                  onChange={e => setNewSavingsReason(e.target.value)}
                  placeholder="NOM DE LA RÉSERVE..."
                  className="ui-field w-full rounded-[1.25rem] border px-5 py-4 text-sm font-bold uppercase outline-none focus:border-blue-500/30"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {editingSavingsId ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      handleUpdateSaving(editingSavingsId, Number(newSavingsAmount), newSavingsReason);
                      setEditingSavingsId(null);
                      setNewSavingsAmount('');
                      setNewSavingsReason('');
                    }}
                    className="flex-1 rounded-3xl bg-blue-500 px-6 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-950"
                  >
                    METTRE À JOUR
                  </button>
                  <button
                  onClick={() => { setEditingSavingsId(null); setNewSavingsAmount(''); setNewSavingsReason(''); }}
                    className="rounded-3xl border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[color:var(--tone-info-text)] dark:bg-slate-900 dark:text-slate-500"
                  >
                    ANNULER
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddSaving}
                  disabled={!newSavingsAmount || !newSavingsReason}
                  className="w-full rounded-3xl border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--tone-info-text)] transition-all hover:bg-blue-500 hover:text-slate-950 disabled:opacity-40 dark:border-blue-500/20 dark:bg-white/5 dark:text-blue-400"
                >
                  AJOUTER À L'ÉPARGNE
                </button>
              )}
            </div>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        title={<><span>GESTION DU </span><span className="text-emerald-500">BUDGET</span></>}
        icon={<Target size={20} className="text-emerald-500" />}
        maxWidthClassName="max-w-5xl"
        bodyClassName="space-y-5"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSaveBudgets}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-3 rounded-3xl bg-emerald-500 px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] disabled:opacity-40"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} strokeWidth={3} className="shrink-0" />}
              <span className="whitespace-nowrap">ENREGISTRER LES OBJECTIFS</span>
            </button>
            <button
              onClick={() => setShowAddCat(true)}
              className="rounded-3xl border border-white/5 bg-[#1e293b]/40 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-[#1e293b] hover:text-white"
            >
              NOUVELLE CATÉGORIE
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="glass relative overflow-hidden rounded-[1.75rem] border border-[color:var(--tone-warning-border)] bg-gradient-to-br from-[color:var(--surface-elevated)] via-[color:var(--surface)] to-[color:var(--tone-warning-surface)] p-5 shadow-xl sm:p-6 lg:col-span-2 dark:border-white/5 dark:bg-slate-950/60">
            <div className="absolute -right-10 -top-10 opacity-[0.08] text-emerald-500 dark:opacity-[0.06] dark:text-emerald-400">
              <Layers size={180} />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase italic tracking-tight leading-none text-[color:var(--heading)] sm:text-xl dark:text-white">
                    Ensemble
                  </h4>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">
                    Total des allocations (toutes catégories)
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 text-[9px] font-black uppercase tracking-[0.22em]">
                  <span className="rounded-full border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] px-2.5 py-1 text-[color:var(--tone-warning-text)] dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                    Base {formatMoney(totalBudget)}
                  </span>
                  <span className="rounded-full border border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] px-2.5 py-1 text-[color:var(--tone-success-text)] dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Alloc {formatMoney(localBudgetTotals.allocated)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-[1.25rem] border border-[color:var(--tone-danger-border)] bg-[color:var(--tone-danger-surface)] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--tone-danger-text)] dark:text-[color:var(--text-muted)]">Utilisé</p>
                  <p className="mt-2 text-lg font-black italic text-[color:var(--tone-danger-text)] dark:text-rose-400">{formatMoney(localBudgetTotals.spent)}</p>
                </div>
                <div className="rounded-[1.25rem] border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--tone-info-text)] dark:text-[color:var(--text-muted)]">Prévu</p>
                  <p className="mt-2 text-lg font-black italic text-[color:var(--tone-info-text)] dark:text-sky-300">{formatMoney(localBudgetTotals.planned)}</p>
                </div>
                <div className="rounded-[1.25rem] border border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--tone-success-text)] dark:text-[color:var(--text-muted)]">Restant</p>
                  <p className="mt-2 text-lg font-black italic text-[color:var(--tone-success-text)] dark:text-emerald-400">{formatMoney(localBudgetTotals.remainingNow)}</p>
                </div>
                <div className="rounded-[1.25rem] border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">Après prévu</p>
                  <p className={`mt-2 text-lg font-black italic ${localBudgetTotals.remainingAfterPlanned < 0 ? 'text-[color:var(--tone-danger-text)] dark:text-rose-400' : localBudgetTotals.remainingAfterPlanned === 0 ? 'text-[color:var(--tone-warning-text)] dark:text-amber-300' : 'text-[color:var(--tone-success-text)] dark:text-emerald-400'}`}>
                    {formatMoney(localBudgetTotals.remainingAfterPlanned)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">
                  <span>Projection globale</span>
                  <span className="text-[color:var(--heading)] dark:text-white">{Math.round(localBudgetTotals.remainingPercent)}% restant</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[color:var(--tone-warning-surface)] ring-1 ring-inset ring-[color:var(--tone-warning-border)] dark:bg-white/[0.06] dark:ring-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                      localBudgetTotals.tone === 'critical'
                        ? 'from-rose-500 via-red-400 to-orange-400 shadow-[0_0_30px_rgba(244,63,94,0.28)]'
                        : localBudgetTotals.tone === 'warning'
                          ? 'from-amber-400 via-yellow-300 to-orange-300 shadow-[0_0_24px_rgba(251,191,36,0.24)]'
                          : localBudgetTotals.tone === 'healthy'
                            ? 'from-emerald-400 via-teal-300 to-cyan-300 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                            : 'from-amber-500 via-orange-400 to-orange-300'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, localBudgetTotals.remainingPercent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">
                  <span>{Math.round(localBudgetTotals.usedPercent)}% utilisé</span>
                  <span className="text-[color:var(--tone-warning-text)] dark:text-slate-400">Après déduction des provisions</span>
                </div>
              </div>
            </div>
          </div>

          {localBudgetAnalysis.map((b, i) => {
            const spentLabel = `${Math.round(b.usedPercent)}% utilisé`;
            const progressWidth = `${Math.max(0, Math.min(100, b.remainingPercent))}%`;
            const progressToneClass =
              b.tone === 'critical'
                ? 'from-rose-500 via-red-400 to-orange-400 shadow-[0_0_30px_rgba(244,63,94,0.28)]'
                : b.tone === 'warning'
                  ? 'from-amber-400 via-yellow-300 to-orange-300 shadow-[0_0_24px_rgba(251,191,36,0.24)]'
                  : b.tone === 'healthy'
                    ? 'from-emerald-400 via-teal-300 to-cyan-300 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                    : 'from-amber-500 via-orange-400 to-orange-300';
            const remainingTextClass =
              b.remaining < 0
                ? 'text-rose-400'
                : b.remaining === 0
                  ? 'text-amber-300'
                  : 'text-emerald-400';

            return (
            <div key={`${b.category}-${i}`} className="glass rounded-[1.75rem] border border-[color:var(--tone-warning-border)] bg-gradient-to-br from-[color:var(--surface-elevated)] via-[color:var(--surface)] to-[color:var(--tone-warning-surface)] p-5 shadow-xl sm:p-6 dark:border-white/5 dark:bg-slate-950/60">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase italic tracking-tight leading-none text-[color:var(--heading)] sm:text-xl dark:text-white">{b.category}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em]">
                    <span className={`rounded-full border px-2.5 py-1 ${b.tone === 'critical' ? 'border-[color:var(--tone-danger-border)] bg-[color:var(--tone-danger-surface)] text-[color:var(--tone-danger-text)] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300' : b.tone === 'warning' ? 'border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] text-[color:var(--tone-warning-text)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200' : 'border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] text-[color:var(--tone-success-text)] dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
                      {spentLabel}
                    </span>
                    {b.future > 0 ? (
                      <span className="rounded-full border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] px-2.5 py-1 text-[color:var(--tone-info-text)] dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                        Prévu {formatMoney(b.future)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Edit3 size={16} className="text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">
                    <span>Budget restant</span>
                    <span className={`font-black italic ${remainingTextClass}`}>{formatMoney(b.remaining)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[color:var(--tone-warning-surface)] ring-1 ring-inset ring-[color:var(--tone-warning-border)] dark:bg-white/[0.06] dark:ring-white/5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${progressToneClass}`}
                      style={{ width: progressWidth }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">
                    <span>Utilisé {formatMoney(b.spent)}</span>
                    <span className="text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-secondary)]">{b.limit > 0 ? `${Math.round(Math.max(0, Math.min(100, b.remainingPercent)))}% restant` : 'Aucune limite'}</span>
                  </div>
                </div>
                <div className="flex justify-end text-[10px] font-black uppercase tracking-widest text-[color:var(--tone-warning-text)] dark:text-[color:var(--text-muted)]">
                  <span className="font-black italic text-[color:var(--heading)] dark:text-white">{formatMoney(b.limit)}</span>
                </div>
                <input
                  type="number"
                  value={b.limit}
                  onChange={(e) => setLocalBudgets(prev => prev.map(old => old.category === b.category ? { ...old, limit: Number(e.target.value) } : old))}
                  className="w-full rounded-[1.25rem] border border-[color:var(--border)] bg-[#EAF2FF] px-5 py-4 text-xl font-black italic text-[color:var(--tone-success-text)] outline-none focus:border-[color:var(--tone-success-border)] dark:border-white/10 dark:bg-[#0b1121] dark:text-emerald-500 dark:focus:border-emerald-500/50"
                />
              </div>
            </div>
          )})}

          {showAddCat ? (
            <div className="glass flex flex-col justify-center gap-4 rounded-[1.75rem] border border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] p-5 sm:p-6 dark:border-emerald-500/40 dark:bg-emerald-500/[0.03]">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="NOM DE LA CATÉGORIE..."
                className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-xs font-black uppercase text-[color:var(--heading)] outline-none focus:border-[color:var(--tone-success-border)] dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button onClick={handleCreateCategory} className="flex-1 rounded-2xl bg-emerald-500 py-3 text-[10px] font-black uppercase text-slate-950">Confirmer</button>
                <button onClick={() => setShowAddCat(false)} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-3 text-[10px] font-black uppercase text-[color:var(--text-secondary)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-500">Annuler</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCat(true)}
              className="glass flex min-h-[160px] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 p-12 text-slate-500 transition-opacity hover:opacity-100"
            >
              <Plus size={32} />
            </button>
          )}
        </div>
      </ModalShell>

      {/* TACTICAL ANALYTIC CHARTS */}
      {viewMode === 'summary' && (
        <div className="animate-in slide-in-from-bottom-8">
          <TacticalFinanceCharts
            fluxData={transactions
              .filter((t) => !isPlannedProvision(t) && normalizeDateOnly(t.date) <= today)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(-10) // Show last 10 points
              .map(t => ({
                id: t.id,
                date: t.date,
                title: t.title,
                category: t.category,
                amount: t.amount,
                type: t.type,
                signedAmount: t.type === 'deposit' ? t.amount : -t.amount,
                comment: t.comment,
                source: t.source,
              }))
            }
            categoryData={budgetAnalysis
              .filter(b => b.spent > 0)
              .map(b => ({ name: b.category, value: b.spent }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5) // Show top 5
            }
            onSelectTransaction={openTransactionDetail}
          />
        </div>
      )}


      {/* PROVISIONS VIEW (FORECAST) - TABLE & CHARTS PER REQUEST */}
      {
        viewMode === 'forecast' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Prochaine sortie</p>
                <p className="mt-2 text-sm font-black text-[color:var(--text-primary)]">
                  {forecastSummary.nextProvision ? forecastSummary.nextProvision.date : 'Aucune'}
                </p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">
                  {forecastSummary.nextProvision ? forecastSummary.nextProvision.title : 'Aucune provision planifiée'}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Pression budgets</p>
                <p className="mt-2 text-2xl font-black italic text-amber-600 dark:text-amber-300">{forecastSummary.budgetPressureCount}</p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">Catégorie(s) sous tension</p>
              </div>
              <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Sous 7 jours</p>
                <p className="mt-2 text-2xl font-black italic text-blue-600 dark:text-blue-400">{forecastSummary.dueSoonCount}</p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">Échéance(s) imminente(s)</p>
              </div>
              <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Allocation moyenne</p>
                <p className="mt-2 text-2xl font-black italic text-emerald-600 dark:text-emerald-400">{formatMoney(forecastSummary.averageProvision)}</p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">{forecastSummary.categoriesImpacted} catégorie(s) impactée(s)</p>
              </div>
            </div>

            {/* Analytic Table Section */}
            <div className="glass rounded-[2rem] p-5 border-white/5 bg-[#0f172a]/40 overflow-hidden shadow-2xl sm:p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3">
                  <Calculator size={18} className="text-blue-500" /> REGISTRE DES DÉPENSES PRÉVUES
                </h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="px-6 py-2 bg-slate-950 rounded-full border border-white/5 text-[10px] font-black text-emerald-500 italic">
                    SOLDE PROJETÉ : {formatMoney(stats.projectedRemaining)}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPlannedExpenseModal()}
                    className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 transition-all hover:bg-blue-500 hover:text-slate-950"
                  >
                    Planifier une depense
                  </button>
                </div>
              </div>
              {futureExpenseTransactions.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/30 px-6 py-14 text-center">
                  <Calculator size={42} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Aucune provision scellée dans le registre</p>
                  <button
                    type="button"
                    onClick={() => openPlannedExpenseModal()}
                    className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 transition-all hover:bg-blue-500 hover:text-slate-950"
                  >
                    Ajouter une premiere provision
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {futureExpenseTransactions.map(t => {
                      const categoryBudget = budgetAnalysis.find((budget) => budget.category === t.category);
                      const categoryProjection = categoryBudget ? categoryBudget.limit - categoryBudget.spent - categoryBudget.future : null;
                      return (
                      <div key={t.id} role="button" tabIndex={0} onClick={() => openTransactionDetail(t)} onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openTransactionDetail(t);
                        }
                      }} className="block w-full rounded-[1.5rem] border border-[color:var(--tone-warning-border)] bg-gradient-to-r from-[color:var(--surface-elevated)] via-[color:var(--surface)] to-[color:var(--tone-warning-surface)] p-4 text-left shadow-soft dark:border-[color:var(--border)] dark:bg-[color:var(--surface)]">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#E9F0EF] dark:text-blue-400">{t.date}</p>
                            <h4 className="mt-2 text-sm font-black uppercase italic text-[color:var(--accent)] dark:text-white">{t.title}</h4>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#E9F0EF] dark:text-slate-400">{t.category}</p>
                            {categoryProjection !== null ? (
                              <p className={`mt-2 text-[10px] font-black uppercase tracking-[0.16em] ${categoryProjection < 0 ? 'text-[color:var(--tone-danger-text)] dark:text-rose-400' : 'text-[#E9F0EF] dark:text-slate-500'}`}>
                                Budget après provisions: {formatMoney(categoryProjection)}
                              </p>
                            ) : null}
                          </div>
                          <p className="text-lg font-black italic text-[color:var(--accent)] dark:text-blue-500">-{formatMoney(t.amount)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={(event) => { event.stopPropagation(); handleExecuteTransaction(t.id); }} className="flex-1 rounded-2xl bg-emerald-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-400">Exécuter</button>
                          <button onClick={(event) => { event.stopPropagation(); handleEditTransaction(t); }} className="rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#E9F0EF] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">Modifier</button>
                          <button onClick={async (event) => { event.stopPropagation(); await handleDeleteTransactionById(t.id, 'Cette provision future sera retiree du registre.'); }} className="rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#E9F0EF] dark:border-[color:var(--tone-danger-border)] dark:bg-[color:var(--tone-danger-surface)] dark:text-rose-400">Supprimer</button>
                        </div>
                      </div>
                    )})}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                      <thead>
                        <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
                          <th className="px-4 pb-4 text-center">Exécuter</th>
                          <th className="px-8 pb-4">Échéance</th>
                          <th className="px-8 pb-4">Titre / Flux</th>
                          <th className="px-8 pb-4">Catégorie</th>
                          <th className="px-8 pb-4">Impact budget</th>
                          <th className="px-8 pb-4 text-right">Volume</th>
                          <th className="px-8 pb-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {futureExpenseTransactions.map(t => {
                          const categoryBudget = budgetAnalysis.find((budget) => budget.category === t.category);
                          const categoryProjection = categoryBudget ? categoryBudget.limit - categoryBudget.spent - categoryBudget.future : null;
                          return (
                          <tr key={t.id} onClick={() => openTransactionDetail(t)} className="cursor-pointer rounded-3xl border-l-4 border-blue-500 bg-[color:var(--surface)] transition-all">
                            <td className="px-4 py-6 text-center">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  onChange={() => handleExecuteTransaction(t.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  className="h-5 w-5 rounded border-2 border-blue-500 bg-slate-950 accent-blue-500"
                                  title="Marquer comme exécuté (passer à aujourd'hui)"
                                />
                              </div>
                            </td>
                            <td className="px-8 py-6 font-black text-xs italic text-[color:var(--tone-info-text)] dark:text-slate-500">{t.date}</td>
                            <td className="px-8 py-6 text-sm font-black uppercase italic tracking-tight text-[color:var(--heading)] dark:text-white">{t.title}</td>
                            <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)] dark:text-slate-400">{t.category}</td>
                            <td className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.16em] ${categoryProjection !== null && categoryProjection < 0 ? 'text-[color:var(--tone-danger-text)] dark:text-rose-400' : 'text-[color:var(--tone-warning-text)] dark:text-slate-500'}`}>
                              {categoryProjection !== null ? `${formatMoney(categoryProjection)} restants` : 'Hors budget'}
                            </td>
                            <td className="px-8 py-6 text-right text-lg font-black italic text-[color:var(--tone-info-text)] dark:text-blue-500">-{formatMoney(t.amount)}</td>
                            <td className="px-8 py-6 rounded-r-[1.5rem] text-center">
                              <button onClick={(event) => { event.stopPropagation(); handleEditTransaction(t); }} className="rounded-xl p-2 text-[color:var(--tone-warning-text)] transition-colors hover:text-[color:var(--heading)] dark:text-slate-500 dark:hover:text-white"><Pencil size={16} /></button>
                              <button onClick={async (event) => { event.stopPropagation(); await handleDeleteTransactionById(t.id, 'Cette provision future sera retiree du registre.'); }} className="rounded-xl p-2 text-[color:var(--tone-danger-text)] transition-colors hover:text-[color:var(--danger)] dark:text-slate-500 dark:hover:text-rose-500"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Analytical Control Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="rounded-[2rem] border border-[color:var(--tone-warning-border)] bg-[color:var(--surface)] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] sm:p-6 dark:glass dark:border-white/5 dark:bg-[#0f172a]/40 dark:shadow-card">
                <h3 className="mb-5 text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-[0.32em] italic flex items-center gap-3">
                  <LucidePieChart size={18} className="text-blue-500" /> RÉPARTITION CERCLE (PROVISIONS)
                </h3>
                <div className="rounded-[1.5rem] border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                  <PieChartComponent
                    data={budgetAnalysis.filter(b => b.future > 0).map(b => ({ name: b.category, value: b.future }))}
                    dataKey="value"
                    nameKey="name"
                    emptyMessage="Le graphe apparaîtra dès qu'une provision future existera."
                    fallbackTitle="Repartition indisponible"
                    heightClassName="h-[260px] sm:h-[300px]"
                    minHeightClassName="min-h-[260px]"
                    valueFormatter={(value) => formatChartCurrency(value)}
                  />
                </div>
              </div>

              <div className="rounded-[2rem] border border-[color:var(--tone-warning-border)] bg-[color:var(--surface)] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] sm:p-6 dark:glass dark:border-white/5 dark:bg-[#0f172a]/40 dark:shadow-card">
                <h3 className="mb-5 text-[10px] font-black text-[color:var(--text-primary)] uppercase tracking-[0.32em] italic flex items-center gap-3">
                  <BarChart3 size={18} className="text-blue-500" /> CONTRÔLE BARRE (VOLUMES FUTURS)
                </h3>
                <div className="rounded-[1.5rem] border border-[color:var(--tone-warning-border)] bg-[color:var(--tone-warning-surface)] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-slate-950/20 dark:shadow-none">
                  <BarChartComponent
                    data={budgetAnalysis.filter(b => b.future > 0).map(b => ({ name: b.category, value: b.future }))}
                    xKey="name"
                    series={[
                      {
                        key: 'value',
                        label: 'Provision',
                        color: '#3b82f6',
                        radius: [10, 10, 0, 0],
                      },
                    ]}
                    emptyMessage="Aucun volume futur à afficher pour le moment."
                    fallbackTitle="Controle barre indisponible"
                    heightClassName="h-[260px] sm:h-[300px]"
                    minHeightClassName="min-h-[260px]"
                    hideYAxis
                    barSize={40}
                    tooltipValueFormatter={(value) => formatChartCurrency(value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* REGISTRE TABLE VIEW */}
      {
        viewMode === 'table' && (
          <div className="ui-section-card overflow-hidden rounded-[2rem] p-5 shadow-card animate-in slide-in-from-right-8 sm:p-6 md:p-8 dark:glass dark:border-white/5 dark:bg-[#0f172a]/40">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-[10px] font-black text-[color:var(--heading)] uppercase tracking-[0.34em] italic">REGISTRE ANALYTIQUE DES FLUX PASSÉS</h3>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] px-3 py-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[color:var(--success)]" /> <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[color:var(--tone-success-text)]">DEPOT</span></div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--tone-danger-border)] bg-[color:var(--tone-danger-surface)] px-3 py-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[color:var(--danger)]" /> <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[color:var(--tone-danger-text)]">DEPENSE</span></div>
              </div>
            </div>
            {pastTransactions.length === 0 ? (
              <div className={cx(uiRecipes.emptyPanel, 'px-6 py-14')}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] text-[color:var(--tone-info-text)] shadow-soft">
                  <History size={30} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">Aucun flux passé à afficher</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {pastTransactions.map(t => (
                    <div key={t.id} role="button" tabIndex={0} onClick={() => openTransactionDetail(t)} onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openTransactionDetail(t);
                      }
                    }} className="ui-item-card block w-full rounded-[1.5rem] p-4 text-left">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">{t.date}</p>
                          <h4 className="mt-2 text-sm font-black uppercase italic text-[color:var(--heading)] dark:text-white">{t.title}</h4>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)]">{t.category}</p>
                        </div>
                        <p className={`text-lg font-black italic ${t.type === 'deposit' ? 'text-[color:var(--tone-success-text)]' : 'text-[color:var(--tone-danger-text)]'}`}>
                          {t.type === 'deposit' ? '+' : '-'}{formatMoney(t.amount)}
                        </p>
                      </div>
                      <button onClick={async (event) => { event.stopPropagation(); await handleDeleteTransactionById(t.id, 'Ce flux passe sera retire de votre registre financier.'); }} className={cx(uiRecipes.ghostButton, 'w-full rounded-2xl border-[color:var(--tone-danger-border)] bg-[color:var(--tone-danger-surface)] text-[color:var(--tone-danger-text)]')}>Supprimer</button>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-[0.3em] italic">
                        <th className="px-8 pb-4">Date</th>
                        <th className="px-8 pb-4">Flux / DÉPENSE PLANIFIÉE</th>
                        <th className="px-8 pb-4">Catégorie</th>
                        <th className="px-8 pb-4 text-right">Volume</th>
                        <th className="px-8 pb-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastTransactions.map(t => (
                        <tr key={t.id} onClick={() => openTransactionDetail(t)} className="ui-item-card cursor-pointer rounded-3xl transition-all">
                          <td className="rounded-l-[1.5rem] px-8 py-6 font-black text-xs italic text-[color:var(--text-muted)]">{t.date}</td>
                          <td className="px-8 py-6 text-sm font-black uppercase italic tracking-tight text-[color:var(--heading)] dark:text-white">{t.title}</td>
                          <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)]">{t.category}</td>
                          <td className={`px-8 py-6 text-right font-black italic text-lg ${t.type === 'deposit' ? 'text-[color:var(--tone-success-text)]' : 'text-[color:var(--tone-danger-text)]'}`}>
                            {t.type === 'deposit' ? '+' : '-'}{formatMoney(t.amount)}
                          </td>
                          <td className="px-8 py-6 rounded-r-[1.5rem] text-center">
                            <button onClick={async (event) => { event.stopPropagation(); await handleDeleteTransactionById(t.id, 'Ce flux passe sera retire de votre registre financier.'); }} className={cx(uiRecipes.actionIcon, toneClassNames.danger.text)}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )
      }

      <ModalShell
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={<><span>{editingTransaction ? 'AJUSTER UN ' : 'SÉCURISER UN '}</span><span className="text-amber-500">FLUX</span></>}
        subtitle={editingTransaction ? "Modifier une transaction liée au pilotage financier" : "Créer une dépense planifiée ou enregistrer un dépôt"}
        icon={<ShieldCheck size={20} className="text-amber-500" />}
        maxWidthClassName="max-w-2xl"
        centered
        footer={
          <button
            onClick={handleSaveTransaction}
            disabled={saving || !amount || !title}
            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-amber-500 px-6 py-4 text-xs font-black uppercase tracking-[0.22em] text-slate-950 shadow-3xl transition-all disabled:opacity-40"
          >
            {saving ? <Loader2 className="animate-spin shrink-0" size={18} /> : <ShieldCheck size={18} strokeWidth={3} className="shrink-0" />}
            <span className="truncate">
              {editingTransaction
                ? (isProvisionForm ? 'METTRE À JOUR LA PROVISION' : "METTRE À JOUR L'OPÉRATION")
                : (isProvisionForm ? 'PLANIFIER LA DÉPENSE' : "CONFIRMER L'OPÉRATION")}
            </span>
          </button>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-1.5">
            <button onClick={() => { setType('expense'); setCategoryValue('Courses'); }} className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-rose-500 text-slate-950 shadow-lg' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'}`}>DÉPENSE</button>
            <button onClick={() => { setType('deposit'); setCategoryValue('AMCI'); setIsPlanningProvision(false); }} className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${type === 'deposit' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'}`}>DÉPÔT</button>
          </div>

          <div className="space-y-4">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`0.00 ${currencyLabel}`} className="ui-field w-full rounded-[1.5rem] border px-6 py-5 text-center text-3xl font-black italic outline-none transition-all focus:border-amber-500 sm:text-4xl" />
            <input id="finance-transaction-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="TITRE DE L'OPÉRATION" className="ui-field w-full rounded-[1.25rem] border px-5 py-4 text-sm font-bold uppercase tracking-widest outline-none transition-all focus:border-amber-500/30" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Catégorie</label>
              <select value={categoryValue} onChange={e => setCategoryValue(e.target.value)} className="ui-field w-full rounded-[1.25rem] border px-5 py-4 text-[11px] font-black uppercase outline-none">
                {type === 'expense' ? (
                  <>
                    {budgets.map(b => <option key={b.category} value={b.category}>{b.category.toUpperCase()}</option>)}
                    <option value="Admin">ADMIN</option>
                    <option value="Santé">SANTÉ</option>
                    <option value="Loyer">LOYER</option>
                  </>
                ) : (
                  <>
                    <option value="AMCI">AMCI</option>
                    <option value="Don">DON</option>
                    <option value="Autres">AUTRES</option>
                  </>
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Date d'exécution</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ui-field w-full rounded-[1.25rem] border px-5 py-4 text-[11px] font-black uppercase outline-none" />
            </div>
          </div>
        </div>
      </ModalShell>
      {/* 5. NEW DETAIL MODALS */}
      <DailyExpensesDetail
        isOpen={showDailyExpensesDetail}
        onClose={() => setShowDailyExpensesDetail(false)}
        transactions={transactions}
        date={today}
        monthlyBudget={totalBudget}
        onDelete={async (id) => { await handleDeleteTransactionById(id, 'Cette operation sera retiree de votre historique financier.'); }}
        onEdit={handleEditTransaction}
        onSelectTransaction={openTransactionDetail}
      />
      <ProvisionsTimeline
        isOpen={showProvisionsDetail}
        onClose={() => setShowProvisionsDetail(false)}
        futureTransactions={financialState.futureTransactions}
        onExecute={(t) => handleExecuteTransaction(t.id)}
        onSelectTransaction={openTransactionDetail}
      />
      <SecurityDashboard
        isOpen={showSecurityDetail}
        onClose={() => setShowSecurityDetail(false)}
        currentBalance={financialState.currentBalance}
        projectedBalance={financialState.projectedBalance}
        totalBudget={financialState.sources.total}
        provisionsAmount={financialState.futureExpenses}
        sources={financialState.sources}
      />
      <QuotaAnalysis
        isOpen={showQuotaDetail}
        onClose={() => setShowQuotaDetail(false)}
        dailyQuota={financialState.dailyQuota}
        suggestedDailyQuota={financialState.suggestedDailyQuota}
        todaySpent={financialState.todaySpent}
        daysUntilReset={financialState.daysUntilReset}
        historyLast7Days={quotaHistoryLast7Days}
        dailyQuotaOverride={customDailyQuota}
        onSaveDailyQuota={handleSaveDailyQuota}
        isSavingQuota={updateFinanceSettings.isPending}
      />
      <BurnRateAnalytics
        isOpen={showBurnRateDetail}
        onClose={() => setShowBurnRateDetail(false)}
        burnRate={financialState.burnRate}
        daysPassed={30 - financialState.daysUntilReset}
        totalDays={30} // Assuming 30 days
        todaySpent={financialState.todaySpent}
        dailyQuota={financialState.dailyQuota}
        currentBalance={financialState.currentBalance}
        projectedBalance={financialState.projectedBalance}
        futureExpenses={financialState.futureExpenses}
        expensesByCategory={budgetAnalysis.map(b => ({ name: b.category, value: b.spent }))}
      />
      <TransactionDetailModal
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onExecute={(transaction) => handleExecuteTransaction(transaction.id)}
        canExecute={Boolean(selectedTransaction && isPlannedProvision(selectedTransaction))}
      />

    </div>
  );
};

export default Finance;
