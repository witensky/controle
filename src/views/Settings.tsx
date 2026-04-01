
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
   Save, CheckCircle2, Cpu, Download, Landmark, Banknote, CalendarDays, Coins, Loader2, AlertCircle, Sparkles, ShieldCheck, Zap, Activity, BrainCircuit, Bell, Database, FileJson, HardDrive, History, Lock, MessageSquare, Radio, RefreshCw, Server, Settings2, Share2, Timer, Trash2, UserCheck, Volume2, BarChart3, Eye, Monitor, Palette, Smartphone, AlertTriangle, Brain, BookOpen, X
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDialog } from '../components/common/AppDialogProvider';
import ThemeToggle from '../components/common/ThemeToggle';
import { offlineRepository } from '../data/offlineRepository';
import { localStore, LOCAL_KEYS } from '../lib/localStorage';
import { requestBrowserNotificationPermission } from '../lib/browserNotifications';
import { AppView } from '../types';
import { DEFAULT_MONTHLY_BUDGET, resolveMonthlyBudget } from '../utils/financeBudget';
import {
   computeUpcomingMonthlyResetDate,
   normalizeCustomResetDate,
   normalizeResetDay,
   resolveFinanceResetDate,
} from '../utils/financeReset';
import { exportHtmlToPdf } from '../utils/pdfExport';
import { cx, uiRecipes } from '../theme/recipes';
import { toneClassNames } from '../theme/tokens';

type DataCollectionKey =
   | 'missions'
   | 'transactions'
   | 'savings'
   | 'subjects'
   | 'words'
   | 'workouts'
   | 'metrics'
   | 'focus_sessions'
   | 'weekly_goals'
   | 'protocol_logs';

type PeriodFilter = 'all' | '7d' | '30d' | '90d' | 'year';

type ManagedDataRecord = {
   id: string;
   collection: DataCollectionKey;
   title: string;
   category: string;
   date: string;
   summary: string;
   raw: Record<string, unknown>;
};

const DATA_COLLECTION_OPTIONS: Array<{ key: 'all' | DataCollectionKey; label: string }> = [
   { key: 'all', label: 'Toutes' },
   { key: 'missions', label: 'Missions' },
   { key: 'transactions', label: 'Transactions' },
   { key: 'savings', label: 'Epargne' },
   { key: 'subjects', label: 'Cours' },
   { key: 'words', label: 'Mots' },
   { key: 'workouts', label: 'Workouts' },
   { key: 'metrics', label: 'Mesures' },
   { key: 'focus_sessions', label: 'Focus' },
   { key: 'weekly_goals', label: 'Obj. Hebdo' },
   { key: 'protocol_logs', label: 'Protocoles' },
];

const formatRecordDate = (value: string) => {
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value || 'Sans date';
   }
   return parsed.toLocaleDateString('fr-FR');
};

const matchesPeriod = (value: string, period: PeriodFilter) => {
   if (period === 'all') return true;
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) return false;

   const now = new Date();
   const thresholds: Record<Exclude<PeriodFilter, 'all'>, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      year: 365,
   };

   const threshold = thresholds[period];
   const diff = now.getTime() - parsed.getTime();
   return diff <= threshold * 24 * 60 * 60 * 1000;
};

const downloadBlob = (filename: string, content: BlobPart, type: string) => {
   const blob = new Blob([content], { type });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = filename;
   link.click();
   URL.revokeObjectURL(url);
};

interface SettingsProps {
   onNavigate: (view: AppView) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
   const queryClient = useQueryClient();
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [saved, setSaved] = useState(false);
   const [reminderNotice, setReminderNotice] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
   const { showAlert, showConfirm } = useAppDialog();
   const saveTimeoutRef = useRef<number | null>(null);
   const savedIndicatorTimeoutRef = useRef<number | null>(null);
   const reminderNoticeTimeoutRef = useRef<number | null>(null);
   const lastPersistedSnapshotRef = useRef('');
   const dataCenterSectionRef = useRef<HTMLDivElement | null>(null);

   // Existing States
   const [amciMonthly, setAmciMonthly] = useState(DEFAULT_MONTHLY_BUDGET);
   const [nextAmciDate, setNextAmciDate] = useState(() => resolveFinanceResetDate({ recurrence: 'monthly', dayOfMonth: 10 }));
   const [userName, setUserName] = useState('');


   // Data Stats
   const [dataStats, setDataStats] = useState({
      missions: 0,
      transactions: 0,
      words: 0,
      subjects: 0
   });
   const [dataCenterOpen, setDataCenterOpen] = useState(false);
   const [dataCenterLoading, setDataCenterLoading] = useState(false);
   const [dataCenterRecords, setDataCenterRecords] = useState<ManagedDataRecord[]>([]);
   const [collectionFilter, setCollectionFilter] = useState<'all' | DataCollectionKey>('all');
   const [categoryFilter, setCategoryFilter] = useState('all');
   const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

   // Préférences (Étendues)
   const [options, setOptions] = useState({
      // Gestion des Objectifs
      defaultMissionDuration: 25,
      autoStartNextMission: false,
      strictFocusMode: true,
      breakDuration: 5,
      longBreakFrequency: 4,
      archiveCompletedDelay: 24,
      enablePriorityBoost: true,
      taskLimitDaily: 12,
      autoCategorization: true,
      energyThresholdWarning: 3,

      // Configuration Analytique
      reportGenerationDay: 'Dimanche',
      precisionLevel: 'High',
      enableAuditLogs: true,
      dataRetentionMonths: 12,
      autoExportCSV: false,
      syncFrequency: 15, // minutes
      calculateImpactScore: true,
      trackIdleTime: false,
      performanceGoal: 85,
      benchmarkComparison: true,

      // Communication & Alertes
      systemVolume: 50,
      notificationLevel: 'Critical Only',
      hapticFeedback: true,
      statusReportFrequency: 'Weekly',
      enableVoiceFeedback: false,
      alertOnBudgetOverrun: true,
      ritualReminders: true,
      morningRitualTime: '06:00',
      eveningRitualTime: '22:00',
      terminalLogging: true,

      // Interface & Visuel
      themeMode: 'Sombre', // Sombre, Néon, Minimaliste
      density: 'Balanced', // Compact, Balanced, Spacious
      reduceMotion: false,
      showParticles: true,
      accentColor: 'Amber', // Amber, Blue, Emerald, Rose

      // Sécurité & Système (NOUVEAU)
      ghostMode: false, // Hide values
      autoLockDelay: 5, // minutes
      devMode: false,
      offlineCache: true,

      // Finance (NEW)
      amci_recurrence: 'monthly' as 'monthly' | 'custom',
      amci_day_of_month: 10
   });

   const buildDraftSnapshot = (
      draftUserName = userName,
      draftAmciMonthly = amciMonthly,
      draftNextAmciDate = nextAmciDate,
      draftOptions = options
   ) => JSON.stringify({
      userName: draftUserName,
      amciMonthly: draftAmciMonthly,
      nextAmciDate: draftNextAmciDate,
      options: draftOptions
   });

   const syncProfileCaches = (profile: any) => {
      queryClient.setQueryData(['profile'], profile);
      queryClient.setQueryData(['finance', 'profile'], {
         amci_monthly_amount: profile.amci_monthly_amount,
         next_amci_date: profile.next_amci_date,
         settings_config: profile.settings_config
      });
      localStore.set(LOCAL_KEYS.PROFILE, profile);
   };

   const showSavedIndicator = () => {
      setSaved(true);
      if (savedIndicatorTimeoutRef.current) {
         window.clearTimeout(savedIndicatorTimeoutRef.current);
      }
      savedIndicatorTimeoutRef.current = window.setTimeout(() => setSaved(false), 1800);
   };

   useEffect(() => {
      fetchProfile();
      fetchDataStats();
   }, []);

    useEffect(() => {
      return () => {
         if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current);
         }
         if (savedIndicatorTimeoutRef.current) {
            window.clearTimeout(savedIndicatorTimeoutRef.current);
         }
         if (reminderNoticeTimeoutRef.current) {
            window.clearTimeout(reminderNoticeTimeoutRef.current);
         }
      };
   }, []);

   const showReminderNotice = (message: string, tone: 'info' | 'success' | 'error' = 'info') => {
      setReminderNotice({ tone, message });
      if (reminderNoticeTimeoutRef.current) {
         window.clearTimeout(reminderNoticeTimeoutRef.current);
      }
      reminderNoticeTimeoutRef.current = window.setTimeout(() => setReminderNotice(null), 3200);
   };

   const fetchDataStats = async () => {
      const stats = await offlineRepository.analytics.getCounts();
      setDataStats(stats);
   };

   const fetchProfile = async () => {
      setLoading(true);
      try {
         const data = await offlineRepository.profile.getProfile();
         if (data) {
            const nextUserName = data.username || '';
            const nextAmciMonthly = resolveMonthlyBudget(data.amci_monthly_amount);
            const nextAmciDate = resolveFinanceResetDate({
               recurrence: data.settings_config?.amci_recurrence || 'monthly',
               dayOfMonth: data.settings_config?.amci_day_of_month || 10,
               customDate: data.next_amci_date,
            });
            const nextOptions = data.settings_config ? { ...options, ...data.settings_config } : options;

            setUserName(nextUserName);
            setAmciMonthly(nextAmciMonthly);
            setNextAmciDate(nextAmciDate);
            if (data.settings_config) {
               setOptions(nextOptions);
            }
            lastPersistedSnapshotRef.current = buildDraftSnapshot(nextUserName, nextAmciMonthly, nextAmciDate, nextOptions);
            syncProfileCaches(data);
         }
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const persistProfileDraft = async () => {
      const normalizedBudget = Math.max(0, Number(amciMonthly) || 0);
      const normalizedResetDay = normalizeResetDay(Number(options.amci_day_of_month) || 1);
      const nextOptions = {
         ...options,
         amci_day_of_month: normalizedResetDay
      };
      const normalizedNextResetDate = resolveFinanceResetDate({
         recurrence: nextOptions.amci_recurrence,
         dayOfMonth: normalizedResetDay,
         customDate: nextAmciDate,
      });

      const profile = await offlineRepository.profile.updateProfile({
         username: userName,
         amci_monthly_amount: normalizedBudget,
         next_amci_date: normalizedNextResetDate,
         settings_config: nextOptions
      });

      setAmciMonthly(normalizedBudget);
      setNextAmciDate(profile.next_amci_date || normalizedNextResetDate);
      setOptions((previous) => ({ ...previous, ...nextOptions }));
      syncProfileCaches(profile);
      lastPersistedSnapshotRef.current = buildDraftSnapshot(
         profile.username || '',
         Number(profile.amci_monthly_amount) || 0,
         profile.next_amci_date || normalizedNextResetDate,
         profile.settings_config || nextOptions
      );
      showSavedIndicator();
      return profile;
   };

   const handleSave = async () => {
      if (saveTimeoutRef.current) {
         window.clearTimeout(saveTimeoutRef.current);
         saveTimeoutRef.current = null;
      }
      setSaving(true);
      try {
         await persistProfileDraft();
      } catch (err) {
         await showAlert({
            title: 'Sauvegarde impossible',
            message: "Les reglages n'ont pas pu etre sauvegardes. Reessaie dans un instant.",
            tone: 'danger',
         });
      } finally {
         setSaving(false);
      }
   };

   useEffect(() => {
      if (loading) return;

      const snapshot = buildDraftSnapshot();
      if (!lastPersistedSnapshotRef.current) {
         lastPersistedSnapshotRef.current = snapshot;
         return;
      }

      if (snapshot === lastPersistedSnapshotRef.current) {
         return;
      }

      setSaved(false);
      setSaving(true);

      if (saveTimeoutRef.current) {
         window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(async () => {
         try {
            await persistProfileDraft();
         } catch (err) {
            console.error(err);
         } finally {
            setSaving(false);
         }
      }, 450);
   }, [userName, amciMonthly, nextAmciDate, options, loading]);

   const updateOption = (key: string, value: any) => {
      setOptions(prev => ({ ...prev, [key]: value }));
   };

   const handleRitualReminderToggle = async () => {
      const nextActive = !options.ritualReminders;

      if (!nextActive) {
         updateOption('ritualReminders', false);
         showReminderNotice('Rappels quotidiens desactives.', 'info');
         return;
      }

      updateOption('ritualReminders', true);
      const permission = await requestBrowserNotificationPermission();
      if (permission === 'granted') {
         showReminderNotice(`Rappels quotidiens actifs a ${options.morningRitualTime}.`, 'success');
         return;
      }

      if (permission === 'denied') {
         showReminderNotice("Permission de notification refusée. Les rappels resteront visibles dans l’application.", 'info');
         return;
      }

      if (permission === 'unsupported') {
         showReminderNotice("Notifications système indisponibles ici. Les rappels restent dans l’application.", 'info');
         return;
      }

      showReminderNotice("Autorise les notifications pour recevoir les rappels en dehors de l’écran.", 'info');
   };

   const handleBudgetChange = (value: string) => {
      setAmciMonthly(Math.max(0, Number(value) || 0));
   };

   const handleResetModeChange = (mode: 'monthly' | 'custom') => {
      setOptions((prev) => ({ ...prev, amci_recurrence: mode }));

      if (mode === 'monthly') {
         setNextAmciDate(computeUpcomingMonthlyResetDate(options.amci_day_of_month || 10));
         return;
      }

      setNextAmciDate((previous) => normalizeCustomResetDate(previous));
   };

   const handleResetDayChange = (value: string) => {
      const nextDay = normalizeResetDay(Number(value) || 1);
      setOptions((prev) => ({ ...prev, amci_day_of_month: nextDay }));

      if (options.amci_recurrence === 'monthly') {
         setNextAmciDate(computeUpcomingMonthlyResetDate(nextDay));
      }
   };

   const handleCustomResetDateChange = (value: string) => {
      setNextAmciDate(normalizeCustomResetDate(value));
   };

   const handleFlushData = async (table: string) => {
      const confirmed = await showConfirm({
         title: 'Purger la collection',
         message: `La table ${table} sera videe definitivement. Cette action est irreversible.`,
         confirmLabel: 'Purger',
         tone: 'danger',
      });
      if (!confirmed) return;
      await offlineRepository.settings.clearCollection(table);
      fetchDataStats();
   };

   const loadDataCenterRecords = async () => {
      setDataCenterLoading(true);
      try {
         const snapshot = await offlineRepository.settings.getDataCenterSnapshot();
         const nextRecords: ManagedDataRecord[] = [
            ...snapshot.missions.map((mission) => ({
               id: mission.id,
               collection: 'missions' as const,
               title: mission.title,
               category: mission.category || 'Sans categorie',
               date: mission.planned_date || mission.created_at || '',
               summary: `${mission.status} • Priorite ${mission.priority}`,
               raw: mission as unknown as Record<string, unknown>,
            })),
            ...snapshot.transactions.map((transaction) => ({
               id: transaction.id,
               collection: 'transactions' as const,
               title: transaction.title,
               category: transaction.category || transaction.type,
               date: transaction.date || '',
               summary: `${transaction.type} • ${transaction.amount} DH`,
               raw: transaction as unknown as Record<string, unknown>,
            })),
            ...snapshot.savings.map((saving) => ({
               id: saving.id,
               collection: 'savings' as const,
               title: saving.reason,
               category: saving.executed ? 'Executee' : 'Disponible',
               date: saving.date || saving.execution_date || '',
               summary: `${saving.amount} DH`,
               raw: saving as unknown as Record<string, unknown>,
            })),
            ...snapshot.subjects.map((subject) => ({
               id: subject.id,
               collection: 'subjects' as const,
               title: subject.name,
               category: subject.status || subject.semester || 'Cours',
               date: subject.created_at || '',
               summary: `${subject.chaptersDone}/${subject.chaptersTotal} chapitres • ${subject.progress}%`,
               raw: subject as unknown as Record<string, unknown>,
            })),
            ...snapshot.words.map((word) => ({
               id: word.id,
               collection: 'words' as const,
               title: word.word,
               category: word.language || 'Langue',
               date: word.learned_at || '',
               summary: word.translation || word.definition || 'Mot enregistre',
               raw: word as unknown as Record<string, unknown>,
            })),
            ...snapshot.workouts.map((workout) => ({
               id: workout.id,
               collection: 'workouts' as const,
               title: workout.routine_name || 'Workout',
               category: 'Sport',
               date: workout.date || '',
               summary: `${workout.duration || 0} min • ${workout.total_volume || 0} volume`,
               raw: workout as unknown as Record<string, unknown>,
            })),
            ...snapshot.metrics.map((metric) => ({
               id: metric.id,
               collection: 'metrics' as const,
               title: `Mesure ${formatRecordDate(metric.date || '')}`,
               category: 'Corps',
               date: metric.date || '',
               summary: `${metric.weight || 0} kg`,
               raw: metric as unknown as Record<string, unknown>,
            })),
            ...snapshot.focusSessions.map((session) => ({
               id: session.id,
               collection: 'focus_sessions' as const,
               title: session.type,
               category: session.status,
               date: session.started_at || '',
               summary: `${Math.round((session.duration_seconds || 0) / 60)} min`,
               raw: session as unknown as Record<string, unknown>,
            })),
            ...snapshot.weeklyGoals.map((goal) => ({
               id: goal.id,
               collection: 'weekly_goals' as const,
               title: goal.category,
               category: `Semaine ${goal.week_number}`,
               date: `${goal.year}-01-01`,
               summary: `${goal.current_count}/${goal.target_count}`,
               raw: goal as unknown as Record<string, unknown>,
            })),
            ...snapshot.protocolLogs.map((log) => ({
               id: log.id,
               collection: 'protocol_logs' as const,
               title: `Protocole ${formatRecordDate(log.date || '')}`,
               category: 'Rituel',
               date: log.date || '',
               summary: `${log.completion_score || 0}% completion`,
               raw: log as unknown as Record<string, unknown>,
            })),
         ].sort((left, right) => right.date.localeCompare(left.date));

         setDataCenterRecords(nextRecords);
         return nextRecords;
      } finally {
         setDataCenterLoading(false);
      }
   };

   const handleOpenDataCenter = async () => {
      setDataCenterOpen(true);
      await loadDataCenterRecords();
      window.setTimeout(() => {
         dataCenterSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
   };

   const handleExportFullBackup = async () => {
      const records = dataCenterRecords.length > 0 ? dataCenterRecords : (await loadDataCenterRecords()) || [];
      handleExportJson(records, `backup-complet-${new Date().toISOString().split('T')[0]}.json`);
   };

   const handleReloadLocal = async () => {
      await Promise.all([fetchProfile(), fetchDataStats(), loadDataCenterRecords()]);
      await queryClient.invalidateQueries();
   };

   const filteredDataRecords = useMemo(() => {
      return dataCenterRecords.filter((record) => {
         const matchesCollection = collectionFilter === 'all' || record.collection === collectionFilter;
         const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
         const matchesPeriodFilter = matchesPeriod(record.date, periodFilter);
         const normalizedSearch = searchQuery.trim().toLowerCase();
         const matchesSearch =
            normalizedSearch.length === 0 ||
            `${record.title} ${record.category} ${record.summary}`.toLowerCase().includes(normalizedSearch);

         return matchesCollection && matchesCategory && matchesPeriodFilter && matchesSearch;
      });
   }, [categoryFilter, collectionFilter, dataCenterRecords, periodFilter, searchQuery]);

   const categoryOptions = useMemo(() => {
      const categories = new Set(
         dataCenterRecords
            .filter((record) => collectionFilter === 'all' || record.collection === collectionFilter)
            .map((record) => record.category),
      );
      return ['all', ...Array.from(categories).sort((left, right) => left.localeCompare(right))];
   }, [collectionFilter, dataCenterRecords]);

   useEffect(() => {
      setSelectedRecordIds((previous) => previous.filter((id) => filteredDataRecords.some((record) => record.id === id)));
   }, [filteredDataRecords]);

   const handleToggleRecordSelection = (id: string) => {
      setSelectedRecordIds((previous) =>
         previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
      );
   };

   const handleSelectVisibleRecords = () => {
      setSelectedRecordIds(filteredDataRecords.map((record) => record.id));
   };

   const handleClearSelection = () => {
      setSelectedRecordIds([]);
   };

   const handleExportJson = (records: ManagedDataRecord[], filename: string) => {
      downloadBlob(filename, JSON.stringify(records.map((record) => record.raw), null, 2), 'application/json');
   };

   const handleExportPdf = async (records: ManagedDataRecord[]) => {
      try {
         await exportHtmlToPdf({
            fileName: `centre-de-donnees-${new Date().toISOString().split('T')[0]}.pdf`,
            title: 'Centre de données',
            html: `
              <div style="font-family: Arial, sans-serif; color: #0f172a;">
                <h1 style="font-size: 20px; margin-bottom: 4px;">Centre de données</h1>
                <p style="margin-top: 0; color: #475569;">${records.length} élément(s) exporté(s)</p>
                <table style="width:100%; border-collapse:collapse; margin-top:24px;">
                  <thead>
                    <tr>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Collection</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Titre</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Catégorie</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Date</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Résumé</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.map((record) => `
                      <tr>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.collection}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.title}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.category}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${formatRecordDate(record.date)}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.summary}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `,
         });
      } catch (error) {
         void showAlert({
            title: 'Export PDF indisponible',
            message: "Impossible de générer le PDF pour le moment.",
            tone: 'danger',
         });
      }
   };

   const handleDeleteRecords = async (records: ManagedDataRecord[]) => {
      if (records.length === 0) return;
      const confirmed = await showConfirm({
         title: 'Supprimer la sélection',
         message: `Supprimer ${records.length} élément(s) sélectionné(s) ?`,
         confirmLabel: 'Supprimer',
         tone: 'danger',
      });
      if (!confirmed) return;

      const grouped = records
         .reduce<Record<string, string[]>>((acc, record) => {
            acc[record.collection] = [...(acc[record.collection] || []), record.id];
            return acc;
         }, {});

      await Promise.all(
         Object.entries(grouped).map(([collection, ids]) => offlineRepository.settings.deleteRecords(collection, ids)),
      );

      setSelectedRecordIds((previous) => previous.filter((id) => !records.some((record) => record.id === id)));
      await Promise.all([fetchDataStats(), loadDataCenterRecords()]);
      await queryClient.invalidateQueries();
   };

   const handleDeleteSelectedRecords = async () => {
      await handleDeleteRecords(filteredDataRecords.filter((record) => selectedRecordIds.includes(record.id)));
   };

   if (loading) {
      return (
         <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[color:var(--primary)]" size={40} />
         </div>
      );
   }

   const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
      <button
         type="button"
         onClick={onClick}
         aria-pressed={active}
         className={`relative shrink-0 w-12 h-6 rounded-full border p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] ${
            active ? 'border-[color:var(--tone-info-border)] bg-[color:var(--info)]' : 'bg-[color:var(--muted)] border-[color:var(--border)]'
         }`}
      >
         <div
            className={`h-4 w-4 rounded-full bg-[color:var(--surface)] shadow-sm transition-transform duration-200 ${
               active ? 'translate-x-6' : 'translate-x-0'
            }`}
         />
      </button>
   );

   return (
      <div className="space-y-12 pb-32 animate-in fade-in duration-700">
         {/* Header */}
         <div className="border-b border-[color:var(--border)] pb-10">
            <div className="flex items-center gap-3 mb-3">
               <div className={cx('p-2 rounded-lg', toneClassNames.warning.shell, toneClassNames.warning.icon)}><Settings2 size={16} /></div>
               <span className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-[0.2em] font-outfit">PRÉFÉRENCES & SYSTÈME</span>
            </div>
            <div className="flex items-center justify-between gap-4">
               <h2 className="min-w-0 text-4xl md:text-5xl font-black text-[color:var(--text-primary)] tracking-tighter uppercase italic">
                  MES <span className="text-[color:var(--tone-warning-text)] font-outfit">RÉGLAGES</span>
               </h2>
               <div className="shrink-0">
                  <ThemeToggle />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* CENTRE DE DONNÉES */}
            <div className={cx(uiRecipes.cardElevated, 'rounded-[2rem] p-6 md:rounded-[3rem] md:p-10')}>
               <h3 className="text-xl font-black text-[color:var(--text-primary)] uppercase italic mb-8 flex items-center gap-4">
                  <Database size={22} className="text-[color:var(--tone-danger-text)]" /> Gestion des Données
               </h3>
               <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                     { label: 'Missions', count: dataStats.missions, icon: CheckCircle2, color: 'text-emerald-500' },
                     { label: 'Transactions', count: dataStats.transactions, icon: Banknote, color: 'text-amber-500' },
                     { label: 'Concepts', count: dataStats.words, icon: Brain, color: 'text-blue-500' },
                     { label: 'Cours', count: dataStats.subjects, icon: BookOpen, color: 'text-rose-500' },
                  ].map(stat => (
                     <div key={stat.label} className={cx(uiRecipes.card, 'flex flex-col items-center justify-center rounded-2xl p-4')}>
                        <stat.icon size={16} className={`mb-2 ${stat.color}`} />
                        <span className="text-2xl font-black text-[color:var(--text-primary)]">{stat.count}</span>
                        <span className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">{stat.label}</span>
                     </div>
                  ))}
               </div>
               <div className="space-y-4">
                  <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Page dédiée</p>
                     <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
                        Ouvre le Data Center pour filtrer, exporter ou supprimer tes données.
                     </p>
                     <button
                        onClick={() => onNavigate('DATA_CENTER')}
                        className={cx(uiRecipes.primaryButton, 'mt-4 w-full rounded-2xl px-4 py-4')}
                     >
                        Ouvrir la page data center
                     </button>
                  </div>
                  <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                     <div className="flex items-center gap-3">
                        <div className={cx('flex h-10 w-10 items-center justify-center rounded-2xl', toneClassNames.warning.shell, toneClassNames.warning.icon)}>
                           <BarChart3 size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--text-secondary)]">Analyses</p>
                           <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-muted)]">
                              Ouvre les bilans et graphiques avancés depuis les réglages.
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={() => onNavigate('REPORTS')}
                        className={cx(uiRecipes.secondaryButton, 'mt-4 w-full rounded-2xl px-4 py-4')}
                     >
                        Ouvrir analyses
                     </button>
                  </div>
               </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className={cx(uiRecipes.cardElevated, 'rounded-[2rem] p-6 md:rounded-[3rem] md:p-10 lg:col-span-1')}>
               <h3 className="text-xl font-black text-[color:var(--text-primary)] uppercase italic mb-8 flex items-center gap-4">
                  <Radio size={22} className="text-[color:var(--tone-danger-text)]" /> Notifications & Rappels
               </h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between gap-4 p-4 bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)]">
                        <div className="min-w-0 flex-1">
                           <span className="text-[10px] font-black text-[color:var(--text-primary)] uppercase">Rappels quotidiens</span>
                           <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--text-muted)]">
                              Declenche une notification locale chaque jour a l&apos;heure du rituel matin.
                           </p>
                        </div>
                        <Toggle active={options.ritualReminders} onClick={handleRitualReminderToggle} />
                     </div>
                     <div className="flex items-center justify-between gap-4 p-4 bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)]">
                        <div className="min-w-0 flex-1">
                           <span className="text-[10px] font-black text-[color:var(--text-primary)] uppercase">Journal de bord</span>
                           <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--text-muted)]">
                              Affiche le bloc journal sur le dashboard et active le rappel du soir.
                           </p>
                        </div>
                        <Toggle active={options.terminalLogging} onClick={() => updateOption('terminalLogging', !options.terminalLogging)} />
                     </div>
                  <div className="space-y-2 mt-4">
                     <label className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic ml-1">Heure rituel matin</label>
                     <input type="time" value={options.morningRitualTime} onChange={e => updateOption('morningRitualTime', e.target.value)} className="ui-field w-full border rounded-xl p-4 text-xs" />
                  </div>
                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-4 py-3">
                     <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">État actuel</p>
                     <div className="mt-2 space-y-1.5 text-[11px] text-[color:var(--text-secondary)]">
                        <p>Rappel matin : {options.ritualReminders ? `actif à ${options.morningRitualTime}` : 'désactivé'}</p>
                        <p>Journal de bord : {options.terminalLogging ? 'visible sur le dashboard' : 'masque sur le dashboard'}</p>
                     </div>
                  </div>
                  {reminderNotice ? (
                     <div className={`rounded-xl border px-4 py-3 text-[11px] leading-relaxed ${
                        reminderNotice.tone === 'success'
                           ? `${toneClassNames.success.shell} ${toneClassNames.success.text}`
                           : reminderNotice.tone === 'error'
                              ? `${toneClassNames.danger.shell} ${toneClassNames.danger.text}`
                              : 'border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--text-secondary)]'
                     }`}>
                        {reminderNotice.message}
                     </div>
                  ) : null}
               </div>
            </div>

            {/* PARAMÈTRES SYSTÈME */}
            <div className={cx(uiRecipes.cardElevated, 'rounded-[2rem] p-6 md:rounded-[3rem] md:p-10 lg:col-span-2')}>
               <h3 className="text-xl font-black text-[color:var(--text-primary)] uppercase italic mb-8 flex items-center gap-4">
                  <Server size={22} className="text-[color:var(--tone-info-text)]" /> Paramètres Système
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest mb-2 border-b border-[color:var(--border)] pb-2">Gestion des objectifs</h4>
                     {[
                        { label: 'Mode Concentration (Bloquant)', key: 'strictFocusMode' },
                        { label: 'Auto-Catégorisation', key: 'autoCategorization' },
                     ].map(opt => (
                        <div key={opt.key} className="flex justify-between items-center p-4 bg-[color:var(--surface)] rounded-xl border border-[color:var(--border)]">
                           <span className="text-[10px] font-black text-[color:var(--text-primary)] uppercase">{opt.label}</span>
                           <Toggle active={(options as any)[opt.key]} onClick={() => updateOption(opt.key, !(options as any)[opt.key])} />
                        </div>
                     ))}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-[color:var(--text-muted)] uppercase italic">Cycle objectif (min)</label>
                           <input type="number" value={options.defaultMissionDuration} onChange={e => updateOption('defaultMissionDuration', e.target.value)} className="ui-field w-full border rounded-lg p-3 text-xs" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-[color:var(--text-muted)] uppercase italic">Pause (min)</label>
                           <input type="number" value={options.breakDuration} onChange={e => updateOption('breakDuration', e.target.value)} className="ui-field w-full border rounded-lg p-3 text-xs" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-[color:var(--tone-success-text)] uppercase tracking-widest mb-2 border-b border-[color:var(--border)] pb-2">Gestion du budget</h4>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic ml-1">Budget mensuel (DH)</label>
                        <input
                           type="number"
                           value={amciMonthly}
                           onChange={(e) => handleBudgetChange(e.target.value)}
                           className="ui-field w-full border rounded-xl p-4 text-[color:var(--tone-success-text)] font-black outline-none focus:border-[color:var(--success)]"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic ml-1">Mode de reset</label>
                        <div className="flex bg-[color:var(--surface)] p-1 rounded-xl border border-[color:var(--border)]">
                           {[
                              { id: 'monthly', label: 'Cycle Mensuel' },
                              { id: 'custom', label: 'Date Fixe' }
                           ].map(mode => (
                              <button
                                 key={mode.id}
                                 onClick={() => handleResetModeChange(mode.id as 'monthly' | 'custom')}
                                 className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${options.amci_recurrence === mode.id ? 'bg-[color:var(--success)] text-[#18212d] shadow-lg' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'
                                    }`}
                              >
                                 {mode.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     {options.amci_recurrence === 'monthly' ? (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                           <label className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic ml-1">Jour du reset (1-31)</label>
                           <div className="relative">
                              <input
                                 type="number"
                                 min="1" max="31"
                                 value={options.amci_day_of_month || 10}
                                 onChange={(e) => handleResetDayChange(e.target.value)}
                                 className="ui-field w-full border rounded-xl p-4 font-bold outline-none focus:border-[color:var(--success)]"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[color:var(--text-muted)] uppercase">Du Mois</div>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                           <label className="text-[10px] font-black text-[color:var(--text-muted)] uppercase tracking-widest italic ml-1">Prochain versement</label>
                           <input
                              type="date"
                              value={nextAmciDate}
                              min={normalizeCustomResetDate(new Date().toISOString().split('T')[0])}
                              onChange={(e) => handleCustomResetDateChange(e.target.value)}
                               className="ui-field w-full border rounded-xl p-4 font-bold outline-none focus:border-[color:var(--success)]"
                           />
                        </div>
                     )}
                  </div>
               </div>
            </div>

         </div>

            <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-20 pt-4">
               <div className="glass-panel mx-auto max-w-xl rounded-[2rem] p-3 shadow-[0_24px_60px_var(--shadow-strong)] backdrop-blur-xl">
                  <button
                     onClick={handleSave}
                     disabled={saving}
                     className={`flex w-full items-center justify-center gap-4 rounded-[1.5rem] px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${saved ? 'bg-[color:var(--success)] text-[#18212d] shadow-[0_20px_50px_rgba(31,157,105,0.28)]' : 'bg-[color:var(--accent)] text-[#18212d] hover:scale-[1.01] active:scale-[0.99]'}`}
                  >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {saved ? 'ENREGISTRÉ' : 'ENREGISTRER'}
               </button>
            </div>
         </div>

      </div>
   );
};

export default Settings;
