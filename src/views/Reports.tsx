import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BarChart3 as LucideBarChart, Download, Loader2, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { offlineRepository, type ProtocolLog } from '../data/offlineRepository';
import { AreaChartComponent, BarChartComponent, LineChartComponent, PieChartComponent, RadarChartComponent } from '../components/charts';
import { useProfile } from '../features/profile/hooks/useProfile';
import type { Mission } from '../features/discipline/types';
import type { CategoryBudget, Transaction } from '../features/finance/types';
import type { Word } from '../features/languages/types';
import type { FocusSession } from '../features/planning/services/focus.service';
import type { WorkoutLog, BodyMetric } from '../features/sport/types';
import type { LawSubject } from '../types';
import { useAppDialog } from '../components/common/AppDialogProvider';
import { formatChartCurrency } from '../utils/chartHelpers';
import { exportHtmlToPdf } from '../utils/pdfExport';
import { generatePdfTemplate } from '../utils/reportPdfTemplate';
import { formatWeeklySchedule } from '../utils/studyReminders';
import { normalizeDateOnly } from '../utils/transactionDates';
import { isPlannedProvision } from '../utils/financeProvisions';
import { formatCurrencyAmount } from '../utils/currency';

const isCompletedMission = (status: string) => {
  const normalized = String(status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return normalized.includes('termine');
};

const toValidDate = (value?: string | null) => {
  if (!value) return null;
  const next = new Date(value);
  return Number.isNaN(next.getTime()) ? null : next;
};

const isWithinLastDays = (value: string | null | undefined, days: number) => {
  const current = toValidDate(value);
  if (!current) return false;
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return current >= start && current <= end;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatShortDate = (value?: string | null) => {
  const current = toValidDate(value);
  return current ? current.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--';
};

const formatGeneratedAt = () =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

type ReportRange = 'day' | 'week' | 'biweekly' | 'month' | 'quarter';

const REPORT_RANGE_OPTIONS: Array<{ value: ReportRange; label: string; printLabel: string; days: number }> = [
  { value: 'day', label: 'Journalier', printLabel: "Aujourd'hui", days: 1 },
  { value: 'week', label: 'Hebdomadaire', printLabel: '7 derniers jours', days: 7 },
  { value: 'biweekly', label: 'Bimensuel', printLabel: '15 derniers jours', days: 15 },
  { value: 'month', label: 'Mensuel', printLabel: '30 derniers jours', days: 30 },
  { value: 'quarter', label: 'Trimestriel', printLabel: '90 derniers jours', days: 90 },
];

const Reports: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useProfile();
  const { showAlert } = useAppDialog();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [finance, setFinance] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [studySubjects, setStudySubjects] = useState<LawSubject[]>([]);
  const [learnedWords, setLearnedWords] = useState<Word[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [protocolLogs, setProtocolLogs] = useState<ProtocolLog[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [range, setRange] = useState<ReportRange>('month');
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [snapshot, budgetSnapshot] = await Promise.all([
        offlineRepository.analytics.getReportsSnapshot(),
        offlineRepository.finance.getBudgets(),
      ]);
      setMissions(snapshot.missions || []);
      setFinance(snapshot.finance || []);
      setBudgets(budgetSnapshot || []);
      setStudySubjects(snapshot.studySubjects || []);
      setLearnedWords(snapshot.learnedWords || []);
      setWorkouts(snapshot.workouts || []);
      setMetrics(snapshot.metrics || []);
      setProtocolLogs(snapshot.protocolLogs || []);
      setFocusSessions(snapshot.focusSessions || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && fetchData();
    window.addEventListener('focus', fetchData);
    document.addEventListener('visibilitychange', onVisible);
    const id = window.setInterval(() => document.visibilityState === 'visible' && fetchData(), 30000);
    return () => {
      window.removeEventListener('focus', fetchData);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(id);
    };
  }, [fetchData]);

  const selectedRange = REPORT_RANGE_OPTIONS.find((option) => option.value === range) || REPORT_RANGE_OPTIONS[3];
  const days = selectedRange.days;
  const periodLabel = selectedRange.printLabel;
  const reportEmail = profile?.settings_config?.contact?.email || 'user@myflow.app';
  const reportOwner = profile?.username || 'Utilisateur';
  const generatedAt = formatGeneratedAt();

  const periodMissions = useMemo(() => missions.filter((item) => isWithinLastDays(item.completed_at || item.planned_date, days)), [missions, days]);
  const periodFinance = useMemo(() => finance.filter((item) => isWithinLastDays(item.date, days)), [finance, days]);
  const periodSubjects = useMemo(() => studySubjects.filter((item) => isWithinLastDays(item.created_at || item.examDate, days)), [studySubjects, days]);
  const periodWords = useMemo(() => learnedWords.filter((item) => isWithinLastDays(item.learned_at, days)), [learnedWords, days]);
  const periodWorkouts = useMemo(() => workouts.filter((item) => isWithinLastDays(item.date, days)), [workouts, days]);
  const periodMetrics = useMemo(() => metrics.filter((item) => isWithinLastDays(item.date, Math.max(days, 30))), [metrics, days]);
  const periodProtocols = useMemo(() => protocolLogs.filter((item) => isWithinLastDays(item.date, days)), [protocolLogs, days]);
  const periodFocus = useMemo(() => focusSessions.filter((item) => item.status === 'completed' && isWithinLastDays(item.started_at, days)), [focusSessions, days]);

  const quickStats = useMemo(() => {
    const completed = periodMissions.filter((item) => isCompletedMission(item.status)).length;
    const income = periodFinance.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0);
    const expense = periodFinance.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const focusHours = periodFocus.reduce((sum, item) => sum + (item.duration_seconds / 3600), 0);
    return [
      { label: 'Objectifs', val: `${periodMissions.length > 0 ? Math.round((completed / periodMissions.length) * 100) : 0}%`, sub: `${completed}/${periodMissions.length || 0}`, color: 'text-amber-500' },
      { label: 'Concepts', val: periodSubjects.reduce((sum, item) => sum + Math.max(0, Number(item.chaptersDone) || 0), 0) + periodWords.length, sub: periodLabel, color: 'text-blue-500' },
      { label: 'Sport', val: periodWorkouts.length, sub: 'Seances', color: 'text-rose-500' },
      { label: 'Finance', val: formatChartCurrency(income - expense), sub: 'Solde net', color: 'text-emerald-500' },
      { label: 'Focus', val: `${Math.round(focusHours)}h`, sub: periodLabel, color: 'text-purple-500' },
    ];
  }, [periodFinance, periodFocus, periodLabel, periodMissions, periodSubjects, periodWords.length, periodWorkouts.length]);

  const masteryData = useMemo(() => {
    const missionScore = periodMissions.length > 0 ? (periodMissions.filter((item) => isCompletedMission(item.status)).length / periodMissions.length) * 100 : 0;
    const income = periodFinance.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0);
    const expense = periodFinance.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const financeScore = income > 0 ? Math.min(100, Math.max(0, ((income - expense) / income) * 100)) : 50;
    const studyScore = periodSubjects.length > 0 ? periodSubjects.reduce((sum, item) => sum + (Number(item.progress) || 0), 0) / periodSubjects.length : 0;
    const knowledgeScore = Math.min(100, studyScore + Math.min(40, periodWords.length * 4));
    const sportScore = Math.min(100, (periodWorkouts.length / (range === 'month' ? 12 : 3)) * 100);
    const protocolScore = periodProtocols.length > 0 ? periodProtocols.reduce((sum, item) => sum + (item.completion_score || 0), 0) / periodProtocols.length : 0;
    return [
      { subject: 'Discipline', A: missionScore, fullMark: 100 },
      { subject: 'Finance', A: financeScore, fullMark: 100 },
      { subject: 'Savoir', A: knowledgeScore, fullMark: 100 },
      { subject: 'Force', A: sportScore, fullMark: 100 },
      { subject: 'Mental', A: protocolScore, fullMark: 100 },
    ];
  }, [periodFinance, periodMissions, periodProtocols, periodSubjects, periodWords.length, periodWorkouts.length, range]);

  const disciplineCurveData = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().split('T')[0];
    const dayMissions = missions.filter((item) => item.planned_date === key);
    return { date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), planned: dayMissions.length, done: dayMissions.filter((item) => isCompletedMission(item.status)).length };
  }), [missions]);

  const financeFluxData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = new Date().getFullYear();
    return months.map((name, monthIndex) => {
      const monthly = finance.filter((item) => {
        const current = new Date(item.date);
        return current.getFullYear() === year && current.getMonth() === monthIndex;
      });
      return {
        name,
        income: monthly.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0),
        expense: monthly.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
      };
    }).slice(0, new Date().getMonth() + 1);
  }, [finance]);

  const lifeBalanceData = useMemo(() => {
    const studyMinutes = periodSubjects.reduce((sum, item) => sum + Math.max(0, Number(item.chaptersDone) * 20), 0) + (periodWords.length * 8);
    const sportMinutes = periodWorkouts.reduce((sum, item) => sum + Math.max(0, Number(item.duration) || 60), 0);
    const financeMinutes = periodFinance.length * 10;
    const disciplineMinutes = periodMissions.length * 15;
    const mentalMinutes = periodProtocols.length * 12 + Math.round(periodFocus.reduce((sum, item) => sum + (item.duration_seconds / 60), 0) * 0.35);
    return [
      { name: 'Etudes', value: studyMinutes, color: '#3b82f6' },
      { name: 'Sport', value: sportMinutes, color: '#10b981' },
      { name: 'Finance', value: financeMinutes, color: '#f59e0b' },
      { name: 'Discipline', value: disciplineMinutes, color: '#ef4444' },
      { name: 'Mental', value: mentalMinutes, color: '#8b5cf6' },
    ].filter((item) => item.value > 0);
  }, [periodFinance.length, periodFocus, periodMissions.length, periodProtocols.length, periodSubjects, periodWords.length, periodWorkouts]);

  const healthTrendData = useMemo(() => periodMetrics.slice(-10).map((item) => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    weight: item.weight,
  })), [periodMetrics]);

  const consistencyData = useMemo(() => [...protocolLogs].reverse().slice(-14).map((item) => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    score: item.completion_score || 0,
  })), [protocolLogs]);

  const recentTransactions = useMemo(
    () => [...periodFinance].sort((a, b) => (toValidDate(b.date)?.getTime() || 0) - (toValidDate(a.date)?.getTime() || 0)).slice(0, 8),
    [periodFinance]
  );

  const futurePlannedExpenses = useMemo(
    () =>
      [...finance]
        .filter((item) => item.type === 'expense' && isPlannedProvision(item))
        .sort((a, b) => normalizeDateOnly(a.date).localeCompare(normalizeDateOnly(b.date))),
    [finance]
  );

  const futureExpenseStats = useMemo(() => ({
    count: futurePlannedExpenses.length,
    total: futurePlannedExpenses.reduce((sum, item) => sum + item.amount, 0),
  }), [futurePlannedExpenses]);

  const budgetReportRows = useMemo(() => budgets.map((budget) => {
    const spent = finance
      .filter((item) => item.type === 'expense' && !isPlannedProvision(item) && item.category === budget.category)
      .reduce((sum, item) => sum + item.amount, 0);
    const planned = futurePlannedExpenses
      .filter((item) => item.category === budget.category)
      .reduce((sum, item) => sum + item.amount, 0);
    const remaining = budget.limit - spent - planned;

    return {
      ...budget,
      spent,
      planned,
      remaining,
      usage: budget.limit > 0 ? clampPercent(((spent + planned) / budget.limit) * 100) : 0,
    };
  }), [budgets, finance, futurePlannedExpenses]);

  const financeSummary = useMemo(() => {
    const income = periodFinance.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0);
    const expense = periodFinance
      .filter((item) => item.type === 'expense' && !isPlannedProvision(item))
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      income,
      expense,
      net: income - expense,
      currentBudget: Number(profile?.amci_monthly_amount) || 0,
      dailyQuota: Number(profile?.settings_config?.daily_quota_override) || 0,
    };
  }, [periodFinance, profile?.amci_monthly_amount, profile?.settings_config?.daily_quota_override]);

  const courseRows = useMemo(() => studySubjects.map((subject) => {
    const totalStudySeconds = (subject.studySessions || []).reduce((sum, session) => sum + Math.max(0, session.durationSeconds || 0), 0);
    const examDate = subject.examDate ? formatShortDate(subject.examDate) : '--';
    const reminderCount = subject.reminders?.length || 0;
    const scheduleLabel = subject.courseSchedule?.length ? formatWeeklySchedule(subject.courseSchedule) : 'Non planifie';

    return {
      id: subject.id,
      name: subject.name,
      semester: subject.semester,
      professor: subject.professor || '--',
      progress: clampPercent(subject.progress || 0),
      chapters: `${subject.chaptersDone}/${subject.chaptersTotal}`,
      examDate,
      reminderCount,
      scheduleLabel,
      totalStudyHours: Math.round((totalStudySeconds / 3600) * 10) / 10,
      status: subject.status,
    };
  }), [studySubjects]);

  const studySummary = useMemo(() => ({
    modules: studySubjects.length,
    averageProgress: studySubjects.length > 0
      ? clampPercent(studySubjects.reduce((sum, subject) => sum + (Number(subject.progress) || 0), 0) / studySubjects.length)
      : 0,
    examsPlanned: studySubjects.filter((subject) => Boolean(subject.examDate)).length,
    remindersActive: studySubjects.reduce((sum, subject) => sum + (subject.reminders?.length || 0), 0),
  }), [studySubjects]);

  const recentMissions = useMemo(
    () => [...periodMissions]
      .sort((a, b) => (toValidDate(b.completed_at || b.planned_date)?.getTime() || 0) - (toValidDate(a.completed_at || a.planned_date)?.getTime() || 0))
      .slice(0, 6),
    [periodMissions]
  );

  const pdfTemplateHtml = useMemo(() => generatePdfTemplate({
    title: 'Analyses & Bilans',
    subtitle: 'Synthèse complète basée sur l’évolution récente des données.',
    owner: reportOwner,
    email: reportEmail,
    periodLabel,
    generatedAt,
    quickStats: quickStats.map((stat) => ({
      label: stat.label,
      val: stat.val,
      sub: stat.sub,
    })),
    financeSummary: [
      { label: 'Budget de base', value: formatChartCurrency(financeSummary.currentBudget) },
      { label: 'Revenus période', value: `+${formatChartCurrency(financeSummary.income)}`, tone: 'positive' },
      { label: 'Dépenses période', value: `-${formatChartCurrency(financeSummary.expense)}`, tone: 'negative' },
      { label: 'Solde net', value: formatChartCurrency(financeSummary.net) },
      { label: 'Quota journalier perso', value: financeSummary.dailyQuota > 0 ? formatChartCurrency(financeSummary.dailyQuota) : 'Auto' },
      { label: 'Provisions futures', value: formatChartCurrency(futureExpenseStats.total) },
    ],
    studySummary: [
      { label: 'Modules actifs', value: studySummary.modules },
      { label: 'Progression moyenne', value: `${studySummary.averageProgress}%` },
      { label: 'Examens planifiés', value: studySummary.examsPlanned },
      { label: 'Rappels actifs', value: studySummary.remindersActive },
      { label: 'Mots appris', value: periodWords.length },
      { label: 'Sessions focus', value: periodFocus.length },
    ],
    progress: masteryData.map((item) => ({
      label: item.subject,
      value: item.A,
    })),
    balance: lifeBalanceData.map((item) => ({
      label: item.name,
      value: `${item.value} min`,
      color: item.color,
    })),
    tables: [
      {
        title: 'État des budgets',
        subtitle: 'Lecture consolidée entre limites, dépenses déjà exécutées et provisions futures.',
        columns: ['Catégorie', 'Budget', 'Dépense', 'Provision', 'Reste', 'Usage'],
        rows: budgetReportRows.map((item) => [
          item.category,
          formatChartCurrency(item.limit),
          formatChartCurrency(item.spent),
          formatChartCurrency(item.planned),
          formatChartCurrency(item.remaining),
          `${item.usage}%`,
        ]),
        emptyLabel: 'Aucun budget configuré.',
      },
      {
        title: 'État des cours et modules',
        subtitle: 'Vue complète des cours, progression, horaires, rappels et examens.',
        columns: ['Module', 'Semestre', 'Professeur', 'Progression', 'Chapitres', 'Horaire', 'Rappels', 'Examen'],
        rows: courseRows.map((item) => [
          item.name,
          item.semester,
          item.professor,
          `${item.progress}%`,
          item.chapters,
          item.scheduleLabel,
          item.reminderCount,
          item.examDate,
        ]),
        emptyLabel: 'Aucun module disponible.',
      },
      {
        title: 'Détails des transactions',
        subtitle: 'Derniers mouvements financiers détectés sur la période sélectionnée.',
        columns: ['Date', 'Opération', 'Catégorie', 'Type', 'Montant'],
        rows: recentTransactions.map((item) => [
          formatShortDate(item.date),
          item.title,
          item.category,
          item.type === 'deposit' ? 'Revenu' : 'Dépense',
          `${item.type === 'deposit' ? '+' : '-'}${formatChartCurrency(item.amount)}`,
        ]),
        emptyLabel: 'Aucune transaction sur cette période.',
      },
      {
        title: 'Dépenses futures planifiées',
        subtitle: 'Provisions encore en attente d’exécution, synchronisées avec le module Finance.',
        columns: ['Date prévue', 'Opération', 'Catégorie', 'Montant'],
        rows: futurePlannedExpenses.slice(0, 10).map((item) => [
          formatShortDate(item.date),
          item.title,
          item.category,
          `-${formatChartCurrency(item.amount)}`,
        ]),
        emptyLabel: 'Aucune dépense future planifiée.',
      },
      {
        title: 'Suivi des missions',
        subtitle: 'Vision détaillée des missions récentes et de leur statut.',
        columns: ['Mission', 'Catégorie', 'Priorité', 'Statut', 'Date'],
        rows: recentMissions.map((item) => [
          item.title,
          item.category,
          item.priority,
          item.status,
          formatShortDate(item.completed_at || item.planned_date || item.created_at),
        ]),
        emptyLabel: 'Aucune mission récente sur la période.',
      },
    ],
  }), [
    reportOwner,
    reportEmail,
    periodLabel,
    generatedAt,
    quickStats,
    financeSummary,
    futureExpenseStats.total,
    studySummary,
    periodWords.length,
    periodFocus.length,
    masteryData,
    lifeBalanceData,
    budgetReportRows,
    courseRows,
    recentTransactions,
    futurePlannedExpenses,
    recentMissions,
  ]);

  const printFinancePeak = useMemo(
    () => financeFluxData.reduce((max, item) => Math.max(max, item.income, item.expense), 0) || 1,
    [financeFluxData]
  );

  const handleExportPdf = async () => {
    if (exportingPdf) return;

    setExportingPdf(true);
    try {
      await exportHtmlToPdf({
        html: pdfTemplateHtml,
        fileName: `Rapport ${reportOwner} ${selectedRange.label}.pdf`,
        title: `Rapport ${reportOwner}`,
        backgroundColor: '#ffffff',
      });
    } catch (error) {
      await showAlert({
        title: 'Export PDF indisponible',
        message: "Impossible de générer le PDF pour le moment. Réessaie après avoir rechargé la page.",
        tone: 'danger',
      });
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="report-container space-y-8 pb-12">
      <div className="report-screen space-y-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-4xl font-black italic text-[color:var(--text-primary)]">ANALYSES & <span className="font-outfit text-amber-500">BILANS</span></h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Suivi global • {periodLabel} • {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="flex items-center gap-3 report-controls">
            <div className="flex max-w-full overflow-x-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-1 scrollbar-hide">
              {REPORT_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRange(option.value)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase ${
                    range === option.value ? 'bg-amber-500 text-slate-950' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="report-export-button flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[10px] font-black uppercase text-slate-950 shadow-xl transition-all disabled:cursor-wait disabled:opacity-70"
            >
              {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Exporter PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {quickStats.map((stat) => (
            <div key={stat.label} className="glass flex flex-col items-center rounded-3xl p-6 text-center">
              <span className={`text-2xl font-black italic ${stat.color}`}>{stat.val}</span>
              <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">{stat.label}</span>
              <span className="mt-1 text-[7px] font-bold uppercase text-[color:var(--text-muted)]">{stat.sub}</span>
            </div>
          ))}
        </div>

          <div className="glass flex flex-col gap-4 rounded-[2rem] border border-amber-500/15 bg-amber-500/[0.03] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-400">Dépenses futures synchronisées</p>
            <h3 className="mt-2 text-2xl font-black italic text-[color:var(--text-primary)]">{formatCurrencyAmount(futureExpenseStats.total)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              {futureExpenseStats.count > 0
                ? `${futureExpenseStats.count} dépense${futureExpenseStats.count > 1 ? 's' : ''} planifiée${futureExpenseStats.count > 1 ? 's' : ''} encore à exécuter.`
                : 'Aucune dépense future planifiée pour le moment.'}
            </p>
          </div>
          <div className="min-w-[12rem] rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Prochaine sortie</p>
            <p className="mt-2 text-lg font-black text-[color:var(--text-primary)]">
              {futurePlannedExpenses[0] ? formatShortDate(futurePlannedExpenses[0].date) : '--'}
            </p>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              {futurePlannedExpenses[0] ? futurePlannedExpenses[0].title : 'Rien de planifié'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="glass flex min-h-[420px] flex-col rounded-[2.5rem] p-8 lg:col-span-2">
            <h3 className="mb-2 flex items-center gap-3 text-lg font-black uppercase text-[color:var(--text-primary)]"><ShieldCheck size={20} className="text-amber-500" /> Progression globale</h3>
            <p className="mb-8 text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Comparaison des domaines sur {periodLabel}</p>
            <div className="min-h-[300px] flex-1">
              <RadarChartComponent data={masteryData} angleKey="subject" valueKey="A" color="#f59e0b" emptyMessage="Aucune comparaison disponible." fallbackTitle="Progression indisponible" heightClassName="h-[300px]" minHeightClassName="min-h-[300px]" />
            </div>
          </div>

          <div className="glass flex flex-col rounded-[2.5rem] p-8">
            <h3 className="mb-2 flex items-center gap-3 text-lg font-black uppercase text-[color:var(--text-primary)]"><TrendingUp size={20} className="text-blue-500" /> Courbe de discipline</h3>
            <p className="mb-8 text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Prévu vs fait (7 jours)</p>
            <div className="min-h-[250px] flex-1">
              <AreaChartComponent data={disciplineCurveData} xKey="date" emptyMessage="Aucune discipline récente à afficher." fallbackTitle="Discipline indisponible" heightClassName="h-[250px]" minHeightClassName="min-h-[250px]" hideYAxis series={[{ key: 'planned', label: 'Prévu', color: '#3b82f6', opacity: 0.18, strokeWidth: 2 }, { key: 'done', label: 'Fait', color: '#10b981', opacity: 0.28, strokeWidth: 3 }]} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="glass flex min-h-[340px] flex-col rounded-[2.5rem] p-8">
            <h3 className="mb-2 flex items-center gap-3 text-lg font-black uppercase text-[color:var(--text-primary)]"><LucideBarChart size={20} className="text-emerald-500" /> Flux financiers</h3>
            <p className="mb-8 text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Évolution mensuelle revenus / dépenses</p>
            <div className="min-h-[250px] flex-1">
              <BarChartComponent data={financeFluxData} xKey="name" emptyMessage="Aucun flux financier agrégé." fallbackTitle="Flux indisponibles" heightClassName="h-[250px]" minHeightClassName="min-h-[250px]" hideYAxis tooltipValueFormatter={(value) => formatChartCurrency(value)} series={[{ key: 'income', label: 'Revenus', color: '#10b981', radius: [6, 6, 0, 0] }, { key: 'expense', label: 'Dépenses', color: '#ef4444', radius: [6, 6, 0, 0] }]} />
            </div>
          </div>

          <div className="glass flex min-h-[340px] flex-col rounded-[2.5rem] p-8">
            <h3 className="mb-2 flex items-center gap-3 text-lg font-black uppercase text-[color:var(--text-primary)]"><Zap size={20} className="text-purple-500" /> Équilibre de vie</h3>
            <p className="mb-8 text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Répartition de charge sur {periodLabel}</p>
            <div className="flex flex-1 items-center justify-center">
              <PieChartComponent data={lifeBalanceData} dataKey="value" nameKey="name" colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']} emptyMessage="Aucune repartition disponible." fallbackTitle="Equilibre indisponible" heightClassName="h-[250px]" minHeightClassName="min-h-[250px]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="glass rounded-[2rem] border-white/5 bg-[#0f172a]/40 p-6">
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">Évolution corporelle</h4>
            <AreaChartComponent data={healthTrendData} xKey="date" emptyMessage="Aucune mesure corporelle disponible." fallbackTitle="Évolution corporelle indisponible" heightClassName="h-40" minHeightClassName="min-h-40" hideYAxis series={[{ key: 'weight', label: 'Poids', color: '#10b981', opacity: 0.22, strokeWidth: 2 }]} />
          </div>
          <div className="glass rounded-[2rem] border-white/5 bg-[#0f172a]/40 p-6">
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-blue-500">Rigueur protocole</h4>
            <LineChartComponent data={consistencyData} xKey="date" emptyMessage="Aucune mesure de protocole disponible." fallbackTitle="Rigueur indisponible" heightClassName="h-40" minHeightClassName="min-h-40" hideYAxis series={[{ key: 'score', label: 'Score', color: '#3b82f6', type: 'stepAfter', strokeWidth: 3 }]} />
          </div>
        </div>

        <div className="glass relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.02] p-8 sm:p-10">
          <div className="relative z-10">
            <h3 className="mb-5 flex items-center gap-3 text-xl font-black uppercase italic text-white sm:text-2xl"><Activity size={24} className="text-amber-500" /> Synthèse de la période</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">Lecture dynamique</p>
            <h4 className="mt-3 text-[1.85rem] font-black italic leading-[1.05] text-white sm:text-4xl">
              {quickStats[0].val !== '0%' || financeSummary.net !== 0 ? 'Analyse alignée sur les données récentes' : 'Période encore trop vide pour une lecture riche'}
            </h4>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/8 bg-slate-950/35 p-5"><p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">Execution</p><p className="mt-3 text-2xl font-black text-white">{quickStats[0].val}</p><p className="mt-2 text-sm text-slate-400">{quickStats[0].sub} objectifs completes sur {periodLabel}</p></div>
              <div className="rounded-[1.75rem] border border-white/8 bg-slate-950/35 p-5"><p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">Charge</p><p className="mt-3 text-2xl font-black text-white">{quickStats[4].val}</p><p className="mt-2 text-sm text-slate-400">{periodFocus.length} sessions focus completees</p></div>
              <div className="rounded-[1.75rem] border border-white/8 bg-slate-950/35 p-5"><p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500">Finance</p><p className="mt-3 text-2xl font-black text-white">{quickStats[3].val}</p><p className="mt-2 text-sm text-slate-400">{periodFinance.length} transactions sur la periode</p></div>
            </div>
            <div className="mt-6 rounded-[2rem] border border-amber-500/15 bg-slate-950/35 p-5 sm:p-6">
              <div className="flex items-center gap-3"><div className="rounded-xl bg-amber-500/10 p-2 text-amber-400"><Sparkles size={16} /></div><p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-300">Actions recommandees</p></div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-4 text-sm leading-relaxed text-slate-300">{periodMissions.length < 3 ? 'Ajouter plus de missions planifiées pour obtenir une tendance d’exécution fiable.' : 'Conserver une priorité forte par jour pour garder la courbe de discipline lisible.'}</div>
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-4 text-sm leading-relaxed text-slate-300">{periodWorkouts.length === 0 ? 'Aucune séance sport récente: ajoute au moins un bloc court pour rééquilibrer la charge.' : 'Le sport est bien présent: garde une répartition régulière sur la semaine.'}</div>
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-4 text-sm leading-relaxed text-slate-300">{periodFinance.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0) > periodFinance.filter((item) => item.type === 'deposit').reduce((sum, item) => sum + item.amount, 0) ? 'Les sorties depassent les entrees sur la periode: ralentir les depenses variables.' : 'Le flux financier reste sain sur la periode: continuer avec la meme vigilance.'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={printRef} className="report-print">
        <div className="report-print-header">
          <div>
            <p className="report-print-kicker">Rapport Myflow</p>
            <h1>Analyses & Bilans</h1>
            <p className="report-print-subtitle">Synthèse complète basée sur l’évolution récente des données.</p>
          </div>
          <div className="report-print-meta">
            <span><strong>Profil :</strong> {reportOwner}</span>
            <span><strong>Email :</strong> {reportEmail}</span>
            <span><strong>Période :</strong> {periodLabel}</span>
            <span><strong>Généré le :</strong> {generatedAt}</span>
          </div>
        </div>

        <div className="report-print-kpis">
          {quickStats.map((stat) => (
            <div key={`print-${stat.label}`} className="report-print-kpi">
              <span className="report-print-kpi-label">{stat.label}</span>
              <strong className="report-print-kpi-value">{stat.val}</strong>
              <span className="report-print-kpi-sub">{stat.sub}</span>
            </div>
          ))}
        </div>

        <div className="report-print-grid">
          <section className="report-print-card">
            <h2>Vue budgétaire</h2>
            <div className="report-summary-stack">
              <div className="report-summary-item">
                <span>Budget de base</span>
                <strong>{formatChartCurrency(financeSummary.currentBudget)}</strong>
              </div>
              <div className="report-summary-item">
                <span>Revenus période</span>
                <strong className="report-positive">+{formatChartCurrency(financeSummary.income)}</strong>
              </div>
              <div className="report-summary-item">
                <span>Dépenses période</span>
                <strong className="report-negative">-{formatChartCurrency(financeSummary.expense)}</strong>
              </div>
              <div className="report-summary-item">
                <span>Solde net</span>
                <strong>{formatChartCurrency(financeSummary.net)}</strong>
              </div>
              <div className="report-summary-item">
                <span>Quota journalier perso</span>
                <strong>{financeSummary.dailyQuota > 0 ? `${formatChartCurrency(financeSummary.dailyQuota)}` : 'Auto'}</strong>
              </div>
              <div className="report-summary-item">
                <span>Provisions futures</span>
                <strong>{formatChartCurrency(futureExpenseStats.total)}</strong>
              </div>
            </div>
          </section>

          <section className="report-print-card">
            <h2>Vue études</h2>
            <div className="report-summary-stack">
              <div className="report-summary-item">
                <span>Modules actifs</span>
                <strong>{studySummary.modules}</strong>
              </div>
              <div className="report-summary-item">
                <span>Progression moyenne</span>
                <strong>{studySummary.averageProgress}%</strong>
              </div>
              <div className="report-summary-item">
                <span>Examens planifies</span>
                <strong>{studySummary.examsPlanned}</strong>
              </div>
              <div className="report-summary-item">
                <span>Rappels actifs</span>
                <strong>{studySummary.remindersActive}</strong>
              </div>
              <div className="report-summary-item">
                <span>Mots appris</span>
                <strong>{periodWords.length}</strong>
              </div>
              <div className="report-summary-item">
                <span>Focus termine</span>
                <strong>{periodFocus.length}</strong>
              </div>
            </div>
          </section>
        </div>

        <div className="report-print-grid">
          <section className="report-print-card">
            <h2>Progression par domaine</h2>
            <div className="report-progress-list">
              {masteryData.map((item) => (
                <div key={`mastery-${item.subject}`} className="report-progress-row">
                  <div className="report-progress-head">
                    <span>{item.subject}</span>
                    <strong>{clampPercent(item.A)}%</strong>
                  </div>
                  <div className="report-progress-track">
                    <div className="report-progress-fill" style={{ width: `${clampPercent(item.A)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="report-print-card">
            <h2>Repartition de charge</h2>
            <div className="report-balance-list">
              {lifeBalanceData.length > 0 ? lifeBalanceData.map((item) => (
                <div key={`life-${item.name}`} className="report-balance-row">
                  <div className="report-balance-label">
                    <span className="report-balance-dot" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <strong>{item.value} min</strong>
                </div>
              )) : <p className="report-empty-copy">Aucune charge significative sur la periode.</p>}
            </div>
          </section>
        </div>

        <div className="report-print-grid">
          <section className="report-print-card">
            <h2>Flux financiers mensuels</h2>
            <div className="report-finance-bars">
              {financeFluxData.map((item) => (
                <div key={`finance-month-${item.name}`} className="report-finance-row">
                  <span className="report-finance-month">{item.name}</span>
                  <div className="report-finance-bar-group">
                    <div className="report-finance-bar report-finance-bar--income" style={{ width: `${Math.max(6, (item.income / printFinancePeak) * 100)}%` }}>
                      <span>{formatChartCurrency(item.income)}</span>
                    </div>
                    <div className="report-finance-bar report-finance-bar--expense" style={{ width: `${Math.max(6, (item.expense / printFinancePeak) * 100)}%` }}>
                      <span>{formatChartCurrency(item.expense)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="report-print-card">
            <h2>Lecture executive</h2>
            <div className="report-summary-stack">
              <div className="report-summary-item">
                <span>Objectifs completes</span>
                <strong>{quickStats[0].val}</strong>
              </div>
              <div className="report-summary-item">
                <span>Solde financier net</span>
                <strong>{quickStats[3].val}</strong>
              </div>
              <div className="report-summary-item">
                <span>Focus cumule</span>
                <strong>{quickStats[4].val}</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="report-print-card">
          <div className="report-table-head">
            <div>
              <h2>Etat des budgets</h2>
              <p>Lecture consolidée entre limites, depenses deja executees et provisions futures.</p>
            </div>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Categorie</th>
                <th>Budget</th>
                <th>Depense</th>
                <th>Provision</th>
                <th>Reste</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {budgetReportRows.length > 0 ? budgetReportRows.map((item) => (
                <tr key={`budget-${item.category}`}>
                  <td>{item.category}</td>
                  <td>{formatChartCurrency(item.limit)}</td>
                  <td>{formatChartCurrency(item.spent)}</td>
                  <td>{formatChartCurrency(item.planned)}</td>
                  <td className={item.remaining < 0 ? 'report-negative' : ''}>{formatChartCurrency(item.remaining)}</td>
                  <td>{item.usage}%</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="report-empty-row">Aucun budget configure.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="report-print-card">
          <div className="report-table-head">
            <div>
              <h2>Etat des cours et modules</h2>
              <p>Vue complete des cours, progression, horaires, rappels et examens.</p>
            </div>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Semestre</th>
                <th>Professeur</th>
                <th>Progression</th>
                <th>Chapitres</th>
                <th>Horaire</th>
                <th>Rappels</th>
                <th>Examen</th>
              </tr>
            </thead>
            <tbody>
              {courseRows.length > 0 ? courseRows.map((item) => (
                <tr key={`course-${item.id}`}>
                  <td>{item.name}</td>
                  <td>{item.semester}</td>
                  <td>{item.professor}</td>
                  <td>{item.progress}%</td>
                  <td>{item.chapters}</td>
                  <td>{item.scheduleLabel}</td>
                  <td>{item.reminderCount}</td>
                  <td>{item.examDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="report-empty-row">Aucun module disponible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="report-print-card">
          <div className="report-table-head">
            <div>
              <h2>Details des transactions</h2>
              <p>Derniers mouvements financiers detectes sur la periode selectionnee.</p>
            </div>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Operation</th>
                <th>Categorie</th>
                <th>Type</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? recentTransactions.map((item) => (
                <tr key={`tx-${item.id}`}>
                  <td>{formatShortDate(item.date)}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.type === 'deposit' ? 'Revenu' : 'Depense'}</td>
                  <td className={item.type === 'deposit' ? 'report-positive' : 'report-negative'}>
                    {item.type === 'deposit' ? '+' : '-'}{formatChartCurrency(item.amount)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="report-empty-row">Aucune transaction sur cette periode.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="report-print-card">
          <div className="report-table-head">
            <div>
              <h2>Dépenses futures planifiées</h2>
              <p>Provisions encore en attente d'execution, synchronisees avec le module Finance.</p>
            </div>
            <strong>{formatChartCurrency(futureExpenseStats.total)}</strong>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Date prevue</th>
                <th>Operation</th>
                <th>Categorie</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              {futurePlannedExpenses.length > 0 ? futurePlannedExpenses.slice(0, 10).map((item) => (
                <tr key={`future-${item.id}`}>
                  <td>{formatShortDate(item.date)}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td className="report-negative">-{formatChartCurrency(item.amount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="report-empty-row">Aucune dépense future planifiée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="report-print-card">
          <div className="report-table-head">
            <div>
              <h2>Suivi des missions</h2>
              <p>Vision détaillée des missions récentes et de leur statut.</p>
            </div>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Categorie</th>
                <th>Priorite</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentMissions.length > 0 ? recentMissions.map((item) => (
                <tr key={`mission-${item.id}`}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.priority}</td>
                  <td>{item.status}</td>
                  <td>{formatShortDate(item.completed_at || item.planned_date || item.created_at)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="report-empty-row">Aucune mission récente sur la période.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Reports;
