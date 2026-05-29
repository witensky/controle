
import { motion } from 'framer-motion';
import {
    ArrowDownCircle,
    ArrowRight,
    ArrowUpCircle,
    Banknote,
    BarChart3,
    Calculator,
    Calendar,
    Copy,
    Edit3,
    History,
    Loader2,
    PieChart as LucidePieChart,
    Pencil,
    PiggyBank,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    Trash2,
    Wallet,
    X
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BarChartComponent, PieChartComponent, RadialProgressChart } from '../components/charts';
import { useAppDialog } from '../components/common/AppDialogProvider';
import ModalShell from '../components/common/ModalShell';
import { AlertBanner } from '../components/finance/AlertBanner';
import { BurnRateAnalytics } from '../components/finance/BurnRateAnalytics';
import { DailyExpensesDetail } from '../components/finance/DailyExpensesDetail';
import { ProvisionsTimeline } from '../components/finance/ProvisionsTimeline';
import { QuotaAnalysis } from '../components/finance/QuotaAnalysis';
import ResteAVivreWidget from '../components/finance/ResteAVivreWidget';
import { SecurityDashboard } from '../components/finance/SecurityDashboard';
import TacticalFinanceCharts from '../components/finance/TacticalFinanceCharts';
import TransactionDetailModal from '../components/finance/TransactionDetailModal';
import { useCurrentDayKey } from '../hooks/useCurrentDayKey';
import { useSwipeDelete } from '../hooks/useSwipeDelete';
import { LOCAL_KEYS, localStore } from '../lib/localStorage';
import { consumeQueuedQuickAction, QUICK_ACTION_EVENT, QuickActionType } from '../lib/quickActions';
import { useTheme } from '../theme/ThemeProvider';
import { cx, uiRecipes } from '../theme/recipes';
import { toneClassNames } from '../theme/tokens';
import { formatCurrencyAmount, getCurrencyLabel, getStoredCurrency, resolveCurrency } from '../utils/currency';
import { DEFAULT_MONTHLY_BUDGET, resolveMonthlyBudget } from '../utils/financeBudget';
import { isPlannedProvision } from '../utils/financeProvisions';
import { computeDaysUntilReset, resolveFinanceResetDate, type FinanceResetRecurrence } from '../utils/financeReset';
import { isPastOrTodayDateOnly, isSameDateOnly, normalizeDateOnly } from '../utils/transactionDates';

import { useBudgets, useCreateSavings, useCreateTransaction, useDeleteSavings, useDeleteTransaction, useExecuteSaving, useFinanceProfile, useSavings, useTransactions, useUpdateBudgets, useUpdateFinanceSettings, useUpdateSavings, useUpdateTransaction } from '../features/finance/hooks/useFinance';
import { useTransactionForm } from '../features/finance/hooks/useTransactionForm';
import { CategoryBudget, Transaction } from '../features/finance/types';
import { formatChartCurrency } from '../utils/chartHelpers';

type FinanceAlert = {
  id: string;
  fingerprint: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  action?: string;
  onAction?: () => void;
};

type SwipeableTransactionCardProps = {
  transaction: Transaction;
  formatMoney: (value: number | string | null | undefined) => string;
  onOpen: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onDuplicate: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

const SwipeableTransactionCard: React.FC<SwipeableTransactionCardProps> = ({
  transaction,
  formatMoney,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const swipe = useSwipeDelete(() => onDelete(transaction));

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onTouchStart={swipe.onTouchStart}
      onTouchMove={swipe.onTouchMove}
      onTouchEnd={swipe.onTouchEnd}
    >
      <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-[color:var(--danger)] px-5">
        <Trash2 size={18} className="text-white" />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(transaction)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(transaction);
          }
        }}
        className="ui-item-card relative block w-full rounded-[1.5rem] p-4 text-left transition-transform duration-200"
        style={{ transform: `translateX(-${swipe.offset}px)`, opacity: swipe.swiped ? 0 : 1 }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">{transaction.date}</p>
            <h4 className="mt-2 text-sm font-black uppercase italic text-[color:var(--heading)] dark:text-white">{transaction.title}</h4>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-secondary)]">{transaction.category}</p>
          </div>
          <p className={`text-lg font-black italic ${transaction.type === 'deposit' ? 'text-[color:var(--tone-success-text)]' : 'text-[color:var(--tone-danger-text)]'}`}>
            {transaction.type === 'deposit' ? '+' : '-'}{formatMoney(transaction.amount)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onEdit(transaction); }}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)] transition-all hover:text-[color:var(--text)]"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onDuplicate(transaction); }}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)] transition-all hover:text-[color:var(--text)]"
          >
            Dupliquer
          </button>
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onDelete(transaction); }}
            className={cx(uiRecipes.ghostButton, 'rounded-2xl border-[color:var(--tone-danger-border)] bg-[color:var(--tone-danger-surface)] text-[color:var(--tone-danger-text)]')}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'deposit'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

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

  // Form State — extracted to useTransactionForm hook
  const txForm = useTransactionForm();
  const { form: { type, amount, title, categoryValue, date, comment, isPlanningProvision, editingTransaction: _editingTxFromForm } } = txForm;
  const setType = txForm.setType;
  const setAmount = txForm.setAmount;
  const setTitle = txForm.setTitle;
  const setCategoryValue = txForm.setCategoryValue;
  const setDate = txForm.setDate;
  const setComment = txForm.setComment;
  const setIsPlanningProvision = txForm.setIsPlanningProvision;

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

    const nextIncomeTransaction = transactions
      .filter((t) => t.type === 'deposit' && ['AMCI', 'DON'].includes(String(t.source || '').toUpperCase()) && normalizeDateOnly(t.date) > today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const totalSavings = savingsList.reduce((acc, s) => acc + s.amount, 0);

    // Balances
    const currentBalance = totalAvailable - totalExpenses;
    const projectedBalance = currentBalance - futureExpenses;

    // Time
    const daysUntilReset = Math.max(0, computeDaysUntilReset(currentResetDate));

    // Metrics
    const nextIncomeDate = nextIncomeTransaction?.date || profileData?.next_amci_date || nextAmciDate;
    const daysUntilNextIncome = Math.max(1, Math.ceil((new Date(nextIncomeDate).getTime() - new Date(today).getTime()) / 86400000));
    const autoSuggestedDailyQuota = Math.max(0, Math.round(currentBalance / daysUntilNextIncome));
    const suggestedDailyQuota = autoSuggestedDailyQuota;
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
  }, [transactions, totalBudget, currentResetDate, savingsList, today, customDailyQuota, nextAmciDate, profileData]);

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

  const isAnyModalOpen = showModal || showBudgetModal || showSavingsModal || showDailyExpensesDetail || showProvisionsDetail || showSecurityDetail || showQuotaDetail || showBurnRateDetail;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('app:mobile-ui-override', {
      detail: { hideNav: isAnyModalOpen, hideFab: isAnyModalOpen },
    }));

    return () => {
      window.dispatchEvent(new CustomEvent('app:mobile-ui-override', {
        detail: { hideNav: false, hideFab: false },
      }));
    };
  }, [isAnyModalOpen]);

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

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return pastTransactions.filter((transaction) => {
      const matchSearch = normalizedQuery === '' ||
        transaction.title.toLowerCase().includes(normalizedQuery) ||
        transaction.category.toLowerCase().includes(normalizedQuery) ||
        (transaction.source || '').toLowerCase().includes(normalizedQuery);
      const matchType = filterType === 'all' || transaction.type === filterType;
      const matchCat = filterCategory === 'all' || transaction.category === filterCategory;

      return matchSearch && matchType && matchCat;
    });
  }, [pastTransactions, searchQuery, filterType, filterCategory]);

  const uniqueCategories = useMemo(
    () => [...new Set(pastTransactions.map((transaction) => transaction.category))].sort(),
    [pastTransactions]
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

  const handleDuplicateTransaction = (transaction: Transaction) => {
    setSelectedTransaction(null);
    resetForm();
    setType(transaction.type);
    setTitle(`${transaction.title} (copie)`);
    setAmount(transaction.amount.toString());
    setCategoryValue(transaction.type === 'deposit' ? (transaction.source || 'AMCI') : transaction.category);
    setDate(new Date().toISOString().split('T')[0]);
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

  if (loading) return (
    <div className="space-y-4 pb-24 animate-pulse">
      <div className="skeleton h-10 w-48" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
      </div>
      <div className="skeleton h-48" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </div>
    </div>
  );

  return (
      <div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:space-y-10 md:pb-24 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[color:var(--text-primary)] tracking-tight leading-none sm:text-3xl">
            Finances
          </h2>
          <p className="mt-1.5 text-[10px] font-semibold text-[color:var(--text-muted)] sm:text-xs">
            Budget, provisions et suivi des dépenses
          </p>
        </div>

        <div className="flex w-full justify-end overflow-x-auto scrollbar-hide md:w-auto">
          <div className="inline-flex rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1">
          {[
            { id: 'summary', label: 'Synthèse', icon: Sparkles },
            { id: 'forecast', label: 'Provisions', icon: Calculator },
            { id: 'table', label: 'Registre', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all sm:px-4 ${
                viewMode === tab.id
                  ? 'bg-[color:var(--surface)] text-[color:var(--text-primary)] shadow-sm'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--muted)]'
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
          </div>
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
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
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

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
              {/* Gérer budgets */}
              <button
                onClick={() => { setLocalBudgets(budgets); setShowAddCat(false); setShowBudgetModal(true); }}
                className="group flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-center transition-all hover:border-[color:var(--success)]/40 hover:bg-[color:var(--success)]/5 active:scale-[0.98] sm:min-h-[140px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--success)]/10 text-[color:var(--success)] transition-all group-hover:bg-[color:var(--success)]/20">
                  <Target size={22} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[color:var(--text)]">Budgets</p>
                  <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">Gérer les limites</p>
                </div>
              </button>

              {/* Nouveau flux */}
              <button
                onClick={() => { resetForm(); setType('expense'); setIsPlanningProvision(false); setShowModal(true); }}
                className="group flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-center transition-all hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--primary)]/5 active:scale-[0.98] sm:min-h-[140px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--primary)]/10 text-[color:var(--primary)] transition-all group-hover:bg-[color:var(--primary)]/20">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[color:var(--text)]">Nouveau flux</p>
                  <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">Ajouter une opération</p>
                </div>
              </button>
            </div>
          </div>

          {/* QUICK STATS SUMMARY */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Dépenses totales */}
            <button
              onClick={() => setViewMode('table')}
              className="group flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-left transition-all hover:border-[color:var(--danger)]/30 hover:bg-[color:var(--danger)]/5 active:scale-[0.98] sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[color:var(--danger)]">Dépenses</span>
                <ArrowDownCircle size={14} className="text-[color:var(--danger)] opacity-60" />
              </div>
              <p className="text-2xl font-black tracking-tight text-[color:var(--heading)] sm:text-3xl">
                {formatChartCurrency(financialState.totalExpenses)}
              </p>
              <p className="text-[10px] text-[color:var(--text-muted)]">
                Aujourd'hui {formatChartCurrency(financialState.todaySpent)}
              </p>
            </button>

            {/* Provisions totales */}
            <button
              onClick={() => setShowProvisionsDetail(true)}
              className="group flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-left transition-all hover:border-[color:var(--warning)]/30 hover:bg-[color:var(--warning)]/5 active:scale-[0.98] sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[color:var(--warning)]">Provisions</span>
                <Calculator size={14} className="text-[color:var(--warning)] opacity-60" />
              </div>
              <p className="text-2xl font-black tracking-tight text-[color:var(--heading)] sm:text-3xl">
                {formatChartCurrency(financialState.futureExpenses)}
              </p>
              <p className="text-[10px] text-[color:var(--text-muted)]">
                {financialState.futureTransactions.length} opération{financialState.futureTransactions.length !== 1 ? 's' : ''}
              </p>
            </button>
          </div>

          {/* Reste à vivre + Épargne */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
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
          </div>{/* end 2-col grid */}
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
        title="Gestion du budget"
        icon={<Target size={20} className="text-[color:var(--success)]" />}
        maxWidthClassName="max-w-5xl"
        bodyClassName="space-y-5"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleSaveBudgets}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--primary)] px-6 py-3.5 text-[11px] font-bold text-[color:var(--primary-foreground)] disabled:opacity-40 transition-all hover:opacity-90"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} strokeWidth={2} className="shrink-0" />}
              Enregistrer les objectifs
            </button>
            <button
              onClick={() => setShowAddCat(true)}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-6 py-3.5 text-[11px] font-medium text-[color:var(--text-secondary)] transition-all hover:text-[color:var(--text)]"
            >
              + Nouvelle catégorie
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h4 className="text-base font-bold text-[color:var(--heading)]">Vue d'ensemble</h4>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">Toutes catégories confondues</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-[10px] font-semibold text-[color:var(--text-secondary)]">
                  Base {formatMoney(totalBudget)}
                </span>
                <span className="rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-3 py-1 text-[10px] font-semibold text-[color:var(--success)]">
                  Alloué {formatMoney(localBudgetTotals.allocated)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3.5">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Utilisé</p>
                <p className="mt-2 text-lg font-black text-[color:var(--danger)]">{formatMoney(localBudgetTotals.spent)}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3.5">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Prévu</p>
                <p className="mt-2 text-lg font-black text-[color:var(--info)]">{formatMoney(localBudgetTotals.planned)}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3.5">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Restant</p>
                <p className="mt-2 text-lg font-black text-[color:var(--success)]">{formatMoney(localBudgetTotals.remainingNow)}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3.5">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Après prévu</p>
                <p className={`mt-2 text-lg font-black ${localBudgetTotals.remainingAfterPlanned < 0 ? 'text-[color:var(--danger)]' : localBudgetTotals.remainingAfterPlanned === 0 ? 'text-[color:var(--warning)]' : 'text-[color:var(--success)]'}`}>
                  {formatMoney(localBudgetTotals.remainingAfterPlanned)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-[color:var(--text-secondary)]">
                <span>Projection globale</span>
                <span className="font-bold text-[color:var(--heading)]">{Math.round(localBudgetTotals.remainingPercent)}% restant</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    localBudgetTotals.tone === 'critical' ? 'bg-[color:var(--danger)]'
                    : localBudgetTotals.tone === 'warning' ? 'bg-[color:var(--warning)]'
                    : 'bg-[color:var(--success)]'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, localBudgetTotals.remainingPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[color:var(--text-muted)]">
                <span>{Math.round(localBudgetTotals.usedPercent)}% utilisé</span>
                <span>Après déduction des provisions</span>
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
            <div key={`${b.category}-${i}`} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[color:var(--heading)]">{b.category}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                      b.tone === 'critical' ? 'border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 text-[color:var(--danger)]'
                      : b.tone === 'warning' ? 'border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 text-[color:var(--warning)]'
                      : 'border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]'
                    }`}>
                      {spentLabel}
                    </span>
                    {b.future > 0 && (
                      <span className="rounded-full border border-[color:var(--info)]/30 bg-[color:var(--info)]/10 px-2 py-0.5 text-[9px] font-semibold text-[color:var(--info)]">
                        Prévu {formatMoney(b.future)}
                      </span>
                    )}
                  </div>
                </div>
                <Edit3 size={14} className="shrink-0 text-[color:var(--text-muted)]" />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[color:var(--text-muted)]">Budget restant</span>
                    <span className={`font-bold ${remainingTextClass}`}>{formatMoney(b.remaining)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressToneClass}`}
                      style={{ width: progressWidth }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[color:var(--text-muted)]">
                    <span>Utilisé {formatMoney(b.spent)}</span>
                    <span>{b.limit > 0 ? `${Math.round(Math.max(0, Math.min(100, b.remainingPercent)))}% restant` : 'Aucune limite'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[color:var(--text-muted)]">
                    Limite mensuelle ({currencyLabel})
                  </label>
                  <input
                    type="number"
                    value={b.limit}
                    onChange={(e) => setLocalBudgets(prev => prev.map(old => old.category === b.category ? { ...old, limit: Number(e.target.value) } : old))}
                    className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-base font-bold text-[color:var(--heading)] outline-none transition-all focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--focus-ring)]"
                  />
                </div>
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
            budgetUsageData={budgetAnalysis
              .filter(b => b.limit > 0)
              .map(b => ({
                name: b.category,
                spent: b.spent,
                limit: b.limit,
                percent: Math.min(100, b.percent),
              }))
              .sort((a, b) => b.percent - a.percent)
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
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Prochaine sortie</p>
                <p className="mt-2 text-sm font-bold text-[color:var(--heading)]">
                  {forecastSummary.nextProvision ? forecastSummary.nextProvision.date : 'Aucune'}
                </p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">
                  {forecastSummary.nextProvision ? forecastSummary.nextProvision.title : 'Aucune provision planifiée'}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Pression budgets</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[color:var(--tone-warning-text)]">{forecastSummary.budgetPressureCount}</p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">Catégorie(s) sous tension</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Sous 7 jours</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[color:var(--tone-info-text)]">{forecastSummary.dueSoonCount}</p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">Échéance(s) imminente(s)</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm">
                <p className="text-[10px] font-semibold text-[color:var(--text-muted)]">Allocation moyenne</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[color:var(--tone-success-text)]">{formatMoney(forecastSummary.averageProvision)}</p>
                <p className="mt-1 text-[10px] text-[color:var(--text-secondary)]">{forecastSummary.categoriesImpacted} catégorie(s) impactée(s)</p>
              </div>
            </div>

            {/* Analytic Table Section */}
            <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--heading)]">
                    <Calculator size={16} className="text-[color:var(--primary)]" /> Registre des dépenses prévues
                  </h3>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">Charges planifiées et impact budgétaire.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="rounded-full border border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] px-3 py-1.5 text-[10px] font-semibold text-[color:var(--tone-success-text)]">
                    Solde projeté : {formatMoney(stats.projectedRemaining)}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPlannedExpenseModal()}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--primary)]/25 bg-[color:var(--primary)]/10 px-4 py-2 text-[10px] font-semibold text-[color:var(--primary)] transition-all hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)]"
                  >
                    <Plus size={13} />
                    Planifier
                  </button>
                </div>
              </div>
              {futureExpenseTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-6 py-12 text-center">
                  <Calculator size={34} className="mb-3 text-[color:var(--text-muted)]" />
                  <p className="text-sm font-semibold text-[color:var(--heading)]">Aucune dépense prévue</p>
                  <p className="mt-1 max-w-sm text-xs text-[color:var(--text-muted)]">Planifiez une provision pour la voir apparaître ici avec son impact budget.</p>
                  <button
                    type="button"
                    onClick={() => openPlannedExpenseModal()}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--primary)]/25 bg-[color:var(--surface)] px-4 py-2.5 text-xs font-semibold text-[color:var(--primary)] transition-all hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)]"
                  >
                    <Plus size={14} />
                    Ajouter une première provision
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
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[color:var(--border)] text-[10px] font-semibold text-[color:var(--text-muted)]">
                          <th className="px-3 py-3 text-center">Exécuter</th>
                          <th className="px-4 py-3">Échéance</th>
                          <th className="px-4 py-3">Titre / Flux</th>
                          <th className="px-4 py-3">Catégorie</th>
                          <th className="px-4 py-3">Impact budget</th>
                          <th className="px-4 py-3 text-right">Volume</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[color:var(--border)]">
                        {futureExpenseTransactions.map(t => {
                          const categoryBudget = budgetAnalysis.find((budget) => budget.category === t.category);
                          const categoryProjection = categoryBudget ? categoryBudget.limit - categoryBudget.spent - categoryBudget.future : null;
                          return (
                          <tr key={t.id} onClick={() => openTransactionDetail(t)} className="cursor-pointer transition-colors hover:bg-[color:var(--surface-muted)]">
                            <td className="px-3 py-4 text-center">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  onChange={() => handleExecuteTransaction(t.id)}
                                  onClick={(event) => event.stopPropagation()}
                                  className="h-5 w-5 rounded border-2 border-[color:var(--primary)] bg-[color:var(--surface)] accent-[color:var(--primary)]"
                                  title="Marquer comme exécuté (passer à aujourd'hui)"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-[color:var(--tone-info-text)]">{t.date}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-[color:var(--heading)]">{t.title}</td>
                            <td className="px-4 py-4 text-xs text-[color:var(--text-secondary)]">{t.category}</td>
                            <td className={`px-4 py-4 text-xs font-semibold ${categoryProjection !== null && categoryProjection < 0 ? 'text-[color:var(--tone-danger-text)]' : 'text-[color:var(--tone-warning-text)]'}`}>
                              {categoryProjection !== null ? `${formatMoney(categoryProjection)} restants` : 'Hors budget'}
                            </td>
                            <td className="px-4 py-4 text-right text-base font-black text-[color:var(--tone-info-text)]">-{formatMoney(t.amount)}</td>
                            <td className="px-4 py-4 text-center">
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
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold text-[color:var(--heading)]">
                  <LucidePieChart size={16} className="text-[color:var(--primary)]" /> Répartition des provisions
                </h3>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3">
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

              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold text-[color:var(--heading)]">
                  <BarChart3 size={16} className="text-[color:var(--primary)]" /> Volumes futurs
                </h3>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3">
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
            <div className="mb-5 space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher une transaction..."
                  className="ui-field w-full rounded-2xl border py-3 pl-11 pr-4 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
                    aria-label="Effacer la recherche"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'expense', 'deposit'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setFilterType(filter)}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-all ${
                      filterType === filter
                        ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                        : 'border-[color:var(--border)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
                    }`}
                  >
                    {filter === 'all' ? 'Tout' : filter === 'expense' ? 'Dépenses' : 'Dépôts'}
                  </button>
                ))}

                <select
                  value={filterCategory}
                  onChange={(event) => setFilterCategory(event.target.value)}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-[10px] font-semibold text-[color:var(--text-secondary)] outline-none"
                >
                  <option value="all">Toutes catégories</option>
                  {uniqueCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>

              {(searchQuery || filterType !== 'all' || filterCategory !== 'all') && (
                <p className="text-[10px] text-[color:var(--text-muted)]">
                  {filteredTransactions.length} résultat{filteredTransactions.length !== 1 ? 's' : ''}
                  {' '}
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterCategory('all'); }}
                    className="ml-1 text-[color:var(--primary)] hover:underline"
                  >
                    Effacer
                  </button>
                </p>
              )}
            </div>
            {pastTransactions.length === 0 ? (
              <div className={cx(uiRecipes.emptyPanel, 'px-6 py-14')}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] text-[color:var(--tone-info-text)] shadow-soft">
                  <History size={30} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">Aucun flux passé à afficher</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className={cx(uiRecipes.emptyPanel, 'px-6 py-14')}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] text-[color:var(--tone-info-text)] shadow-soft">
                  <Search size={28} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">Aucun flux ne correspond aux filtres</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterCategory('all');
                  }}
                  className={cx(uiRecipes.ghostButton, 'mt-5')}
                >
                  Reinitialiser
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {filteredTransactions.map((transaction) => (
                    <SwipeableTransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      formatMoney={formatMoney}
                      onOpen={openTransactionDetail}
                      onEdit={handleEditTransaction}
                      onDuplicate={handleDuplicateTransaction}
                      onDelete={(item) => handleDeleteTransactionById(item.id, 'Transaction supprimée.')}
                    />
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[color:var(--border)] text-[10px] font-semibold text-[color:var(--text-muted)]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Flux / dépense planifiée</th>
                        <th className="px-4 py-3">Catégorie</th>
                        <th className="px-4 py-3 text-right">Volume</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--border)]">
                      {filteredTransactions.map(t => (
                        <tr key={t.id} onClick={() => openTransactionDetail(t)} className="cursor-pointer transition-colors hover:bg-[color:var(--surface-muted)]">
                          <td className="px-4 py-4 text-xs font-semibold text-[color:var(--text-muted)]">{t.date}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-[color:var(--heading)]">{t.title}</td>
                          <td className="px-4 py-4 text-xs text-[color:var(--text-secondary)]">{t.category}</td>
                          <td className={`px-4 py-4 text-right text-base font-black ${t.type === 'deposit' ? 'text-[color:var(--tone-success-text)]' : 'text-[color:var(--tone-danger-text)]'}`}>
                            {t.type === 'deposit' ? '+' : '-'}{formatMoney(t.amount)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(event) => { event.stopPropagation(); handleEditTransaction(t); }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] transition-all hover:text-[color:var(--text)]"
                                aria-label="Modifier"
                                title="Modifier cette transaction"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDuplicateTransaction(t);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-muted)] transition-all hover:text-[color:var(--text)]"
                                aria-label="Dupliquer"
                                title="Réutiliser cette transaction"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={async (event) => { event.stopPropagation(); await handleDeleteTransactionById(t.id, 'Ce flux passe sera retire de votre registre financier.'); }}
                                className={cx(uiRecipes.actionIcon, toneClassNames.danger.text)}
                                aria-label="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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
        title={editingTransaction ? 'Modifier l\'opération' : 'Nouvelle opération'}
        subtitle={editingTransaction ? "Ajuster les détails de cette transaction" : "Enregistrer une dépense ou un dépôt"}
        icon={<ShieldCheck size={20} className="text-amber-500" />}
        maxWidthClassName="max-w-2xl"
        centered
        footer={
          <button
            onClick={handleSaveTransaction}
            disabled={saving || !amount || !title}
            aria-label={editingTransaction ? 'Enregistrer les modifications' : 'Enregistrer l’opération'}
            className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-lg transition-all hover:scale-105 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 className="animate-spin shrink-0" size={18} /> : <ShieldCheck size={18} strokeWidth={2.5} className="shrink-0" />}
          </button>
        }
      >
        <div className="space-y-5">

          {/* ── Type toggle ── */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1.5">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryValue('Courses'); }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold transition-all ${
                type === 'expense'
                  ? 'bg-[color:var(--danger)] text-white shadow-sm'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
              }`}
            >
              <ArrowDownCircle size={14} />
              Dépense
            </button>
            <button
              type="button"
              onClick={() => { setType('deposit'); setCategoryValue('AMCI'); setIsPlanningProvision(false); }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold transition-all ${
                type === 'deposit'
                  ? 'bg-[color:var(--success)] text-white shadow-sm'
                  : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
              }`}
            >
              <ArrowUpCircle size={14} />
              Dépôt
            </button>
          </div>

          {/* ── Amount ── */}
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="ui-field w-full rounded-2xl border px-6 py-5 text-center text-4xl font-black tracking-tight outline-none transition-all focus:border-[color:var(--primary)]"
            />
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-[color:var(--text-muted)]">
              {currencyLabel}
            </span>
          </div>

          {type === 'expense' && amount && !Number.isNaN(Number(amount)) && Number(amount) > 0 && (() => {
            const categoryBudget = budgets.find((budget) => budget.category === categoryValue);
            const budgetAnalysisItem = budgetAnalysis.find((budget) => budget.category === categoryValue);
            if (!categoryBudget || !budgetAnalysisItem) return null;
            const remaining = budgetAnalysisItem.remaining - Number(amount);
            const isOver = remaining < 0;

            return (
              <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs ${
                isOver
                  ? 'border-[color:var(--danger)]/30 bg-[color:var(--danger)]/8 text-[color:var(--danger)]'
                  : 'border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)]'
              }`}>
                <span className="font-medium">Budget {categoryValue}</span>
                <span className="font-bold">
                  {isOver ? '⚠ ' : ''}{formatMoney(Math.abs(remaining))} {isOver ? 'de dépassement' : 'restant après'}
                </span>
              </div>
            );
          })()}

          {/* ── Title ── */}
          <div className="space-y-1.5">
            <label className="ml-1 text-[11px] font-semibold text-[color:var(--text-muted)]">
              Libellé de l'opération
            </label>
            <input
              id="finance-transaction-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Courses Marjane"
              className="ui-field w-full rounded-2xl border px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-[color:var(--primary)]"
            />
          </div>

          {/* ── Category + Date ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="ml-1 text-[11px] font-semibold text-[color:var(--text-muted)]">Catégorie</label>
              <select
                value={categoryValue}
                onChange={e => setCategoryValue(e.target.value)}
                className="ui-field w-full rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none"
              >
                {type === 'expense' ? (
                  <>
                    {budgets.map(b => <option key={b.category} value={b.category}>{b.category}</option>)}
                    <option value="Admin">Admin</option>
                    <option value="Santé">Santé</option>
                    <option value="Loyer">Loyer</option>
                  </>
                ) : (
                  <>
                    <option value="AMCI">AMCI</option>
                    <option value="Don">Don</option>
                    <option value="Autres">Autres</option>
                  </>
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="ml-1 text-[11px] font-semibold text-[color:var(--text-muted)]">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="ui-field w-full rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none"
              />
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
