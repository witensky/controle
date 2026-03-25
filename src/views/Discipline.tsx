
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Zap, ShieldAlert, Dumbbell, Brain, CheckCircle2, Plus, Trash2, ListTodo, History, Target, Clock, ArrowUpRight, Loader2, Moon, Sun, SlidersHorizontal, Star, AlertCircle, PlayCircle, PauseCircle, Timer, RotateCcw, MessageSquare, ShieldCheck, ChevronRight, BarChart3, TrendingUp, MoreVertical, X, Power, Layers, Activity, Calendar as CalendarIcon, FilterX, Database, Award, ClipboardCheck, BookOpen, Heart, Wallet, FileDown, Eye, Sparkles, CheckSquare, Sunrise, Sunset, Play, Square, FastForward, RefreshCcw, Pencil
} from 'lucide-react';
import { useAppDialog } from '../components/common/AppDialogProvider';
import { offlineRepository } from '../data/offlineRepository';
import { QUICK_ACTION_EVENT, QuickActionType } from '../lib/quickActions';
import { Mission, MissionStatus, MissionPriority, MissionCategory, CreateMissionDTO } from '../features/discipline/types';
import { useMissions, useCreateMission, useUpdateMission, useDeleteMission } from '../features/discipline/hooks/useMissions';
import { useProfile } from '../features/profile/hooks/useProfile';
import { DEFAULT_MISSION_CATEGORIES, displayMissionCategoryLabel, resolveStudyDomainLabel } from '../utils/studyDomainLabel';

type RitualDefinition = {
  id: string;
  label: string;
  isDefault?: boolean;
};

const DEFAULT_MORNING_RITUALS: RitualDefinition[] = [
  { id: 'water', label: 'Hydratation (500ml)', isDefault: true },
  { id: 'prayer', label: 'Prière / Silence', isDefault: true },
  { id: 'stretch', label: 'Activation Physique', isDefault: true },
  { id: 'plan', label: 'Revue Planification', isDefault: true },
];

const DEFAULT_EVENING_RITUALS: RitualDefinition[] = [
  { id: 'debrief', label: 'Debrief Journée', isDefault: true },
  { id: 'read', label: 'Lecture (15min)', isDefault: true },
  { id: 'pray', label: 'Prière / Gratitude', isDefault: true },
  { id: 'prep', label: 'Préparation Lendemain', isDefault: true },
];

const buildRitualState = (rituals: RitualDefinition[], source?: Record<string, boolean>) =>
  rituals.reduce<Record<string, boolean>>((acc, ritual) => {
    acc[ritual.id] = source?.[ritual.id] ?? false;
    return acc;
  }, {});

const buildLegacyRituals = (prefix: 'morning' | 'evening', labels: string[] = []): RitualDefinition[] =>
  labels.map((label, index) => ({
    id: `${prefix}_legacy_${index}_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'ritual'}`,
    label,
    isDefault: false,
  }));

const Discipline: React.FC = () => {
  // Renaming to match previous code usage or updating usage
  const { data: missionsRaw, isLoading: missionsLoading, refetch } = useMissions();
  const { data: profile } = useProfile();
  const createMission = useCreateMission();
  const updateMission = useUpdateMission();
  const deleteMission = useDeleteMission();

  const missions = missionsRaw || [];
  const loading = missionsLoading;
  const studyDomainLabel = resolveStudyDomainLabel(profile?.settings_config?.study?.primaryDomain);
  const missionCategories: MissionCategory[] = DEFAULT_MISSION_CATEGORIES;

  const [activeTab, setActiveTab] = useState<'planner' | 'rituals' | 'history'>('planner');

  // Mission Creation State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MissionCategory>('Admin');
  const [priority, setPriority] = useState<MissionPriority>('medium');
  const [isSaving, setIsSaving] = useState(false);
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<MissionCategory | 'All'>('All');

  const [morningCatalog, setMorningCatalog] = useState<RitualDefinition[]>(DEFAULT_MORNING_RITUALS);
  const [eveningCatalog, setEveningCatalog] = useState<RitualDefinition[]>(DEFAULT_EVENING_RITUALS);
  const [newMorningRitual, setNewMorningRitual] = useState('');
  const [newEveningRitual, setNewEveningRitual] = useState('');
  const [protocolHistory, setProtocolHistory] = useState<any[]>([]);
  const [protocolLoading, setProtocolLoading] = useState(false);

  // Rituals State
  const [morningRituals, setMorningRituals] = useState<Record<string, boolean>>(buildRitualState(DEFAULT_MORNING_RITUALS));
  const [eveningRituals, setEveningRituals] = useState<Record<string, boolean>>(buildRitualState(DEFAULT_EVENING_RITUALS));
  const [lastSyncDate, setLastSyncDate] = useState(new Date().toISOString().split('T')[0]);
  const [ritualActionsTarget, setRitualActionsTarget] = useState<{ period: 'morning' | 'evening'; ritualId: string } | null>(null);
  const longPressTimeoutRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  // Mission Editing State
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MissionCategory>('Admin');
  const [editPriority, setEditPriority] = useState<MissionPriority>('medium');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editEnergy, setEditEnergy] = useState<1 | 2 | 3>(2);
  const [showAdvancedCreate, setShowAdvancedCreate] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newEnergy, setNewEnergy] = useState<1 | 2 | 3>(2);

  // Notification State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const { showConfirm, showPrompt } = useAppDialog();

  // Timer & Focus
  const [focusMission, setFocusMission] = useState<Mission | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showTimerFullscreen, setShowTimerFullscreen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Feedback Modal
  const [showFeedback, setShowFeedback] = useState<Mission | null>(null);
  const [feedbackDiff, setFeedbackDiff] = useState<'facile' | 'normal' | 'difficile'>('normal');
  const [energyAfter, setEnergyAfter] = useState(5);
  const [startMissionModal, setStartMissionModal] = useState<Mission | null>(null);
  const [startDurationMinutes, setStartDurationMinutes] = useState(
    Math.max(5, Number(profile?.settings_config?.defaultMissionDuration) || 25)
  );

  useEffect(() => {
    fetchPersistedState();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refetch]);

  // fetchMissions removed.

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProtocolLog = async (
    morning: Record<string, boolean>,
    evening: Record<string, boolean>,
    morningItems: RitualDefinition[] = morningCatalog,
    eveningItems: RitualDefinition[] = eveningCatalog
  ) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await offlineRepository.discipline.saveProtocolLog({
        date: today,
        morning,
        evening,
        custom_morning_rituals: morningItems.filter(item => !item.isDefault).map(item => item.label),
        custom_evening_rituals: eveningItems.filter(item => !item.isDefault).map(item => item.label),
      });
    } catch (err) { console.error('Protocol save error:', err); }
  };

  const fetchProtocolHistory = async () => {
    setProtocolLoading(true);
    try {
      const data = await offlineRepository.discipline.listProtocolLogs(30);
      setProtocolHistory(data || []);
    } catch (err) { console.error(err); } finally { setProtocolLoading(false); }
  };

  const fetchPersistedState = async () => {
    try {
      const profile = await offlineRepository.profile.getProfile();
      const savedCatalog = profile?.settings_config?.ritualCatalog || {};
      const log = await offlineRepository.discipline.getTodayProtocolLog();
      const resolvedMorningCatalog = Array.isArray(savedCatalog.morning) && savedCatalog.morning.length > 0
        ? savedCatalog.morning
        : [...DEFAULT_MORNING_RITUALS, ...buildLegacyRituals('morning', log?.custom_morning_rituals || [])];
      const resolvedEveningCatalog = Array.isArray(savedCatalog.evening) && savedCatalog.evening.length > 0
        ? savedCatalog.evening
        : [...DEFAULT_EVENING_RITUALS, ...buildLegacyRituals('evening', log?.custom_evening_rituals || [])];

      setMorningCatalog(resolvedMorningCatalog);
      setEveningCatalog(resolvedEveningCatalog);

      if (log) {
        setMorningRituals(buildRitualState(resolvedMorningCatalog, log.morning));
        setEveningRituals(buildRitualState(resolvedEveningCatalog, log.evening));
      } else {
        setMorningRituals(buildRitualState(resolvedMorningCatalog));
        setEveningRituals(buildRitualState(resolvedEveningCatalog));
      }
    } catch (err) { console.error('Sync Error:', err); }
  };

  const persistState = async (updates: any) => {
    try {
      await offlineRepository.profile.updateSettings(updates);
    } catch (err) { console.error("Persist Error:", err); }
  };

  useEffect(() => {
    // Auto-persist rituals to protocol_logs
    saveProtocolLog(morningRituals, eveningRituals, morningCatalog, eveningCatalog);
  }, [morningRituals, eveningRituals, morningCatalog, eveningCatalog]);

  useEffect(() => {
    persistState({
      ritualCatalog: {
        morning: morningCatalog,
        evening: eveningCatalog,
      },
    });
  }, [morningCatalog, eveningCatalog]);

  useEffect(() => {
    if (missions.length > 0 && !focusMission) {
      const recoverTimer = async () => {
        const profile = await offlineRepository.profile.getProfile();
        const config = profile?.settings_config || {};
        if (config.timer && config.timer.last_focus_mission_id && config.timer.last_time_left > 0) {
          const m = missions.find(mission => mission.id === config.timer.last_focus_mission_id);
          if (m && m.status === 'En cours') {
            setFocusMission(m);
            setTimeLeft(config.timer.last_time_left);
            setShowTimer(true);
          }
        }
      };
      recoverTimer();
    }
  }, [missions]);

  useEffect(() => {
    const handleQuickAction = (event: Event) => {
      const action = (event as CustomEvent<{ action: QuickActionType }>).detail?.action;

      if (action !== 'add-mission') return;

      setActiveTab('planner');
      setShowAdvancedCreate(true);

      window.setTimeout(() => {
        const titleInput = document.getElementById('discipline-mission-title') as HTMLInputElement | null;
        titleInput?.focus();
      }, 120);
    };

    window.addEventListener(QUICK_ACTION_EVENT, handleQuickAction as EventListener);
    return () => window.removeEventListener(QUICK_ACTION_EVENT, handleQuickAction as EventListener);
  }, []);

  useEffect(() => {
    if (!startMissionModal) {
      setStartDurationMinutes(Math.max(5, Number(profile?.settings_config?.defaultMissionDuration) || 25));
    }
  }, [profile?.settings_config?.defaultMissionDuration, startMissionModal]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev % 30 === 0) { // Persist every 30s to avoid spam but stay fresh
            persistState({ timer: { last_focus_mission_id: focusMission?.id, last_time_left: prev - 1 } });
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowTimer(false);
      setShowTimerFullscreen(false);
      persistState({ timer: null });
      if (focusMission) setShowFeedback(focusMission);
    }
    // No explicit useEffect for fetching needed with React Query
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timeLeft, focusMission]);

  // Removed fetchMissions as it's replaced by useMissions hook


  const handleCreateMission = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await createMission.mutateAsync({
        title: title.toUpperCase(),
        category,
        priority,
        description: newDescription,
        deadline: newDeadline || undefined,
        energy_required: newEnergy,
        status: 'Planifiée', // Default status for new missions
        impact_score: priority === 'critical' ? 100 : priority === 'high' ? 50 : 20, // Default impact score
        planned_date: new Date().toISOString().split('T')[0] // Default planned date
      });

      setTitle('');
      setNewDescription('');
      setNewDeadline('');
      setNewEnergy(2);
      setShowAdvancedCreate(false);
      showToast("Tâche Ajoutée");
      // No explicit fetchMissions() needed, mutation handles invalidation
    } catch (err) { console.error(err); showToast("Echec Initialisation", "error"); } finally { setIsSaving(false); }
  };

  const handleUpdateMission = async () => {
    if (!editingMission || !editTitle.trim()) return;
    setIsSaving(true);
    try {
      await updateMission.mutateAsync({
        id: editingMission.id,
        updates: {
          title: editTitle.toUpperCase(),
          category: editCategory,
          priority: editPriority,
          description: editDescription,
          deadline: editDeadline || undefined,
          energy_required: editEnergy
        }
      });

      showToast("Paramètres Mis à Jour");
      setEditingMission(null);
      // No explicit fetchMissions() needed, mutation handles invalidation
    } catch (err) { console.error(err); showToast("Echec Mise à Jour", "error"); } finally { setIsSaving(false); }
  };

  const updateMissionStatus = async (id: string, status: MissionStatus, feedback?: any, durationMinutes?: number) => {
    try {
      const updates: any = { status };
      if (feedback) {
        updates.feedback_difficulty = feedback.difficulty;
        updates.feedback_energy_after = feedback.energy;
      }
      await updateMission.mutateAsync({ id, updates });

      if (status === 'Terminé') {
        if (focusMission?.id === id) {
          setIsTimerRunning(false);
          setShowTimer(false);
          setShowTimerFullscreen(false);
          setFocusMission(null);
          persistState({ timer: null });
        }
        showToast("Mission Complétée");
        await offlineRepository.profile.incrementProgress(50, 1);
      } else if (status === 'En cours') {
        // Start timer automatically if moved to active
        const mission = missions.find(m => m.id === id);
        if (mission) {
          setFocusMission(mission);
          setTimeLeft(Math.max(5, durationMinutes || Number(profile?.settings_config?.defaultMissionDuration) || 25) * 60);
          setIsTimerRunning(true);
          setShowTimer(true);
          setShowTimerFullscreen(false);
          showToast("Tâche Démarrée");
        }
      } else if (status === 'Planifiée') {
        // Pause timer if focused
        if (focusMission?.id === id) {
          setIsTimerRunning(false);
          setShowTimer(false);
          setShowTimerFullscreen(false);
          setFocusMission(null);
        }
        showToast("TÂCHE Suspendue", "info");
      }

      // No explicit fetchMissions() needed, mutation handles invalidation
    } catch (err) { console.error(err); showToast("Echec Transmission", "error"); }
  };

  const handleStartMission = async () => {
    if (!startMissionModal) return;

    const safeDuration = Math.max(5, Math.min(240, Number(startDurationMinutes) || 25));
    await updateMissionStatus(startMissionModal.id, 'En cours', undefined, safeDuration);
    setStartMissionModal(null);
  };

  const toggleRitual = (period: 'morning' | 'evening', ritualId: string) => {
    setRitualActionsTarget(previous => previous?.ritualId === ritualId && previous.period === period ? null : previous);

    if (period === 'morning') {
      setMorningRituals(previous => ({ ...previous, [ritualId]: !previous[ritualId] }));
      return;
    }

    setEveningRituals(previous => ({ ...previous, [ritualId]: !previous[ritualId] }));
  };

  const startRitualLongPress = (period: 'morning' | 'evening', ritualId: string) => {
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
    }

    longPressTriggeredRef.current = false;
    longPressTimeoutRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setRitualActionsTarget(previous => previous?.ritualId === ritualId && previous.period === period ? null : { period, ritualId });
    }, 450);
  };

  const clearRitualLongPress = () => {
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleRitualClick = (period: 'morning' | 'evening', ritualId: string) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    toggleRitual(period, ritualId);
  };

  const addRitual = (period: 'morning' | 'evening') => {
    const rawLabel = period === 'morning' ? newMorningRitual : newEveningRitual;
    const label = rawLabel.trim();

    if (!label) {
      return;
    }

    const ritual: RitualDefinition = {
      id: `${period}_custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label,
      isDefault: false,
    };

    if (period === 'morning') {
      setMorningCatalog(previous => [...previous, ritual]);
      setMorningRituals(previous => ({ ...previous, [ritual.id]: false }));
      setNewMorningRitual('');
      return;
    }

    setEveningCatalog(previous => [...previous, ritual]);
    setEveningRituals(previous => ({ ...previous, [ritual.id]: false }));
    setNewEveningRitual('');
  };

  const editRitual = async (period: 'morning' | 'evening', ritualId: string, currentLabel: string) => {
    const nextLabel = (await showPrompt({
      title: 'Modifier le rituel',
      message: 'Entre le nouveau libelle du rituel.',
      initialValue: currentLabel,
      placeholder: 'Nom du rituel',
      confirmLabel: 'Enregistrer',
    }))?.trim();

    if (!nextLabel || nextLabel === currentLabel) {
      return;
    }

    if (period === 'morning') {
      setMorningCatalog(previous => previous.map(ritual => ritual.id === ritualId ? { ...ritual, label: nextLabel } : ritual));
      return;
    }

    setEveningCatalog(previous => previous.map(ritual => ritual.id === ritualId ? { ...ritual, label: nextLabel } : ritual));
  };

  const deleteRitual = async (period: 'morning' | 'evening', ritualId: string) => {
    const confirmed = await showConfirm({
      title: 'Supprimer le rituel',
      message: 'Ce rituel sera retire de votre routine.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    });
    if (!confirmed) {
      return;
    }

    if (period === 'morning') {
      setRitualActionsTarget(null);
      setMorningCatalog(previous => previous.filter(ritual => ritual.id !== ritualId));
      setMorningRituals(previous => {
        const updated = { ...previous };
        delete updated[ritualId];
        return updated;
      });
      return;
    }

    setRitualActionsTarget(null);
    setEveningCatalog(previous => previous.filter(ritual => ritual.id !== ritualId));
    setEveningRituals(previous => {
      const updated = { ...previous };
      delete updated[ritualId];
      return updated;
    });
  };

  const deleteMissionHandler = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Supprimer la mission',
      message: 'Cette mission sera retiree de votre discipline.',
      confirmLabel: 'Supprimer',
      tone: 'danger',
    });
    if (confirmed) {
      try {
        await deleteMission.mutateAsync(id);
        showToast("TÂCHE Annulée", "info");
      } catch (err) {
        console.error(err);
        showToast("Echec Suppression", "error");
      }
    }
  };

  const filteredMissions = useMemo(() => missions.filter(m => categoryFilter === 'All' || m.category === categoryFilter), [missions, categoryFilter]);
  const activeMissions = useMemo(() => filteredMissions.filter(m => m.status === 'En cours'), [filteredMissions]);
  const pendingMissions = useMemo(() => filteredMissions.filter(m => m.status === 'Planifiée'), [filteredMissions]);
  const completedMissions = useMemo(() => filteredMissions.filter(m => m.status === 'Terminé'), [filteredMissions]);

  const stats = useMemo(() => {
    const total = missions.length || 1;
    const completed = missions.filter(m => m.status === 'Terminé').length;
    return { score: Math.round((completed / total) * 100), pending: missions.filter(m => m.status !== 'Terminé').length };
  }, [missions]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-4 pb-44 animate-in fade-in duration-700 min-h-screen bg-[color:var(--app-bg)]">

      {/* --- HUD HEADER --- */}
      <div className="sticky top-0 z-30 bg-[color:var(--card)] backdrop-blur-xl border-b border-[color:var(--border)] py-4 px-2 md:px-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <ShieldCheck size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[color:var(--text-primary)] tracking-tighter uppercase italic font-outfit">MES <span className="text-amber-500">OBJECTIFS</span></h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-1.5 w-24 bg-[color:var(--border)] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${stats.score}%` }} />
                </div>
                <span className="text-[9px] font-bold text-[color:var(--text-muted)] uppercase tracking-widest">{stats.score}% accompli</span>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex p-1 bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl shadow-card w-full md:w-auto overflow-x-auto custom-scrollbar no-scrollbar">
            {[
              { id: 'planner', label: 'OBJECTIFS', icon: ListTodo },
              { id: 'rituals', label: 'ROUTINES', icon: Zap },
              { id: 'history', label: 'HISTORIQUE', icon: History }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-fit ${activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--muted)]'
                  }`}
              >
                <tab.icon size={13} strokeWidth={3} className="shrink-0" /> <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* === PLANNER VIEW === */}
        {activeTab === 'planner' && (
          <div className="space-y-12">

            {/* 1. QUICK CAPTURE BAR */}
            <div className="relative group animate-in slide-in-from-top-4 duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative glass rounded-[2rem] p-4 sm:p-6 shadow-2xl flex flex-col gap-4 sm:gap-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <input
                      id="discipline-mission-title"
                      type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ajouter un objectif"
                      className="w-full min-w-0 bg-transparent border-none outline-none font-black text-base sm:text-lg uppercase tracking-tight text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] placeholder:text-xs sm:placeholder:text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && !showAdvancedCreate && handleCreateMission()}
                    />
                  </div>
                  <button
                    onClick={() => setShowAdvancedCreate(!showAdvancedCreate)}
                    className={`mt-0.5 h-11 w-11 rounded-xl border transition-all shrink-0 flex items-center justify-center ${
                      showAdvancedCreate
                        ? 'border-[color:var(--border-strong)] bg-[color:var(--muted)] text-[color:var(--text-primary)] shadow-card'
                        : 'border-[color:var(--border)] text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--muted)]'
                    }`}
                    aria-label="Afficher les options avancées"
                  >
                    <SlidersHorizontal size={18} />
                  </button>
                </div>

                {/* ADVANCED FIELDS */}
                {showAdvancedCreate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 pt-2 border-t border-[color:var(--border)]">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest pl-1">DESCRIPTION / NOTES</label>
                      <input
                        type="text" value={newDescription} onChange={e => setNewDescription(e.target.value)}
                        placeholder="Informations complémentaires..."
                        className="w-full ui-field rounded-xl border px-4 py-3 text-xs font-medium outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest pl-1">DEADLINE</label>
                      <input
                        type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                        className="w-full ui-field rounded-xl border px-4 py-3 text-xs font-medium outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[9px] font-black text-[color:var(--text-muted)] uppercase tracking-widest pl-1">EFFORT REQUIS</label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(e => (
                            <button
                              key={e}
                              onClick={() => setNewEnergy(e as 1 | 2 | 3)}
                              className={`flex-1 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                                newEnergy === e
                                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                                  : 'bg-[color:var(--surface-2)] border-[color:var(--border)] text-[color:var(--text-muted)] hover:bg-[color:var(--muted)] hover:text-[color:var(--text-primary)]'
                              }`}
                            >
                              {e === 1 ? 'LÉGER' : e === 2 ? 'MODÉRÉ' : 'INTENSE'}
                            </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-4 items-end pt-1">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                    <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full min-w-0 ui-field rounded-xl border py-3 px-3 sm:px-4 text-[10px] font-black uppercase outline-none focus:border-amber-500">
                      {missionCategories.map(c => <option key={c} value={c}>{displayMissionCategoryLabel(c, studyDomainLabel)}</option>)}
                    </select>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full min-w-0 ui-field rounded-xl border py-3 px-3 sm:px-4 text-[10px] font-black uppercase outline-none focus:border-amber-500">
                      <option value="medium">STANDARD</option>
                      <option value="high">HIGH</option>
                      <option value="critical">CRITICAL</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCreateMission}
                    disabled={isSaving || !title.trim()}
                    className="w-full sm:w-auto sm:min-w-[168px] px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-primary)] hover:bg-amber-500 hover:border-amber-500 hover:text-slate-950"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />}
                    AJOUTER
                  </button>
                </div>
              </div>

            </div>

            {/* 2. ACTIVE TÂCHES ZONE */}
            {activeMissions.length > 0 && (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em]">OBJECTIFS EN COURS</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMissions.map(mission => (
                    // ACTIVE CARD
                    <div key={mission.id} className="relative glass overflow-hidden border border-amber-500/30 rounded-2xl p-6 shadow-card group">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={80} className="text-amber-500" /></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-500/20">{displayMissionCategoryLabel(mission.category, studyDomainLabel)}</span>
                          {mission.id === focusMission?.id && <div className="flex items-center gap-2 text-rose-500 animate-pulse font-mono font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>}
                        </div>
                        <h4 className="text-lg md:text-xl font-black text-[color:var(--text-primary)] italic uppercase mb-6 leading-tight">{mission.title}</h4>
                        <div className="flex gap-3">
                          <button onClick={() => updateMissionStatus(mission.id, 'Terminé')} className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-lg">
                            <CheckCircle2 size={14} /> TERMINER
                          </button>
                          <button onClick={() => {
                            setEditingMission(mission);
                            setEditTitle(mission.title);
                            setEditCategory(mission.category);
                            setEditPriority(mission.priority);
                            setEditDescription(mission.description || '');
                            setEditDeadline(mission.deadline || '');
                            setEditEnergy(mission.energy_required || 2);
                          }} className="px-4 py-3 bg-slate-900 text-slate-400 border border-white/10 rounded-xl hover:text-white transition-colors">
                            <MoreVertical size={18} />
                          </button>
                          <button onClick={() => updateMissionStatus(mission.id, 'Planifiée')} className="px-4 py-3 bg-slate-900 text-slate-400 border border-white/10 rounded-xl hover:text-white transition-colors">
                            <PauseCircle size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TACTICAL QUEUE ZONE */}
            <div className="animate-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="flex items-center justify-between mb-4 border-b border-[color:var(--border)] pb-2 dark:border-white/5">
                <h3 className="text-xs font-black text-[color:var(--text-muted)] uppercase tracking-[0.2em]">LISTE ({pendingMissions.length})</h3>
              </div>

              {pendingMissions.length === 0 ? (
                <div className="py-12 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] flex flex-col items-center justify-center text-[color:var(--text-muted)] shadow-card dark:bg-transparent dark:border-white/10 dark:text-slate-600">
                  <Target size={32} className="mb-4 opacity-50" />
                  <p className="text-[10px] uppercase tracking-widest font-bold">AUCUN OBJECTIF PLANIFIÉ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {pendingMissions.map(mission => (
                    // QUEUE CARD
                    <div key={mission.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 transition-all hover:translate-x-1 hover:border-[color:var(--border-strong)] dark:border-white/5 dark:bg-[#0b1121] dark:hover:border-white/10 dark:hover:bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-12 rounded-full ${mission.priority === 'critical' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : mission.priority === 'high' ? 'bg-orange-500' : 'bg-slate-700'}`} />
                        <div>
                          <h4 className="text-sm font-bold text-[color:var(--text-primary)] uppercase tracking-tight transition-colors dark:text-slate-200 dark:group-hover:text-white">{mission.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[color:var(--surface-2)] text-[color:var(--text-muted)] dark:bg-slate-900 dark:text-slate-600">{displayMissionCategoryLabel(mission.category, studyDomainLabel)}</span>
                            {mission.priority === 'critical' && <span className="text-[8px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1"><AlertCircle size={8} /> CRITIQUE</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-all duration-300">
                        <button onClick={() => { setEditingMission(mission); setEditTitle(mission.title); setEditCategory(mission.category); setEditPriority(mission.priority); }} className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/5">
                          <MoreVertical size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setStartMissionModal(mission);
                            setStartDurationMinutes(Math.max(5, Number(profile?.settings_config?.defaultMissionDuration) || 25));
                          }}
                          className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all border border-blue-500/20"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                        <button onClick={() => updateMissionStatus(mission.id, 'Terminé')} className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 flex items-center justify-center transition-all border border-emerald-500/20">
                          <CheckCircle2 size={16} />
                        </button>
                        <button onClick={() => deleteMissionHandler(mission.id)} className="w-10 h-10 md:w-8 md:h-8 rounded-lg text-slate-600 hover:text-rose-500 flex items-center justify-center transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. COMPLETED LOG (Collapsible Concept - Just recent 3 for now) */}
            {completedMissions.length > 0 && (
              <div className="pt-8 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">RÉCEMMENT TERMINÉS</h3>
                <div className="space-y-2">
                  {completedMissions.slice(0, 3).map(mission => (
                    <div key={mission.id} className="flex items-center justify-between text-slate-500 text-xs uppercase font-bold">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={12} className="text-emerald-500" />
                        <span className="line-through decoration-slate-700">{mission.title}</span>
                      </div>
                      <span className="text-[8px] tracking-widest opacity-50">+{mission.impact_score}XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* === RITUALS VIEW === */}
        {activeTab === 'rituals' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MORNING */}
              <div className="glass group rounded-[2rem] p-5 md:p-6 relative overflow-hidden hover:border-amber-500/30 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Sunrise size={120} className="text-amber-500" /></div>
                <h3 className="text-xl font-black text-[color:var(--text-primary)] italic uppercase tracking-tighter mb-5 flex items-center gap-3"><Sunrise className="text-amber-500" /> Matin (Routine)</h3>
                <div className="space-y-2.5 relative z-10">
                  {morningCatalog.map(item => (
                    <div key={item.id} className="space-y-2">
                      <button
                        onMouseDown={() => startRitualLongPress('morning', item.id)}
                        onMouseUp={clearRitualLongPress}
                        onMouseLeave={clearRitualLongPress}
                        onTouchStart={() => startRitualLongPress('morning', item.id)}
                        onTouchEnd={clearRitualLongPress}
                        onTouchCancel={clearRitualLongPress}
                        onContextMenu={(event) => event.preventDefault()}
                        onClick={() => handleRitualClick('morning', item.id)}
                        className={`w-full px-4 py-3.5 rounded-xl border flex items-center justify-between transition-all ${morningRituals[item.id] ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--text-secondary)] hover:border-[color:var(--border-strong)]'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-left">{item.label}</span>
                        {morningRituals[item.id] ? <CheckSquare size={16} /> : <div className="w-4 h-4 border-2 border-[color:var(--border-strong)] rounded-md shrink-0" />}
                      </button>
                      {ritualActionsTarget?.period === 'morning' && ritualActionsTarget.ritualId === item.id && (
                        <div className="flex justify-end gap-2 animate-in fade-in zoom-in-95 duration-200">
                          <button onClick={() => editRitual('morning', item.id, item.label)} className="h-10 px-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-secondary)] hover:text-amber-600 hover:border-amber-500/30 transition-colors flex items-center justify-center gap-2">
                            <Pencil size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Modifier</span>
                          </button>
                          <button onClick={() => deleteRitual('morning', item.id)} className="h-10 px-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-secondary)] hover:text-rose-500 hover:border-rose-500/30 transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Supprimer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newMorningRitual}
                      onChange={e => setNewMorningRitual(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addRitual('morning')}
                      placeholder="+ Ajouter ritual..."
                      className="ui-field flex-1 rounded-xl border border-dashed px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-amber-500/40"
                    />
                    <button onClick={() => addRitual('morning')} className="px-4 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* EVENING */}
              <div className="glass group rounded-[2rem] p-5 md:p-6 relative overflow-hidden hover:border-blue-500/30 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Sunset size={120} className="text-blue-500" /></div>
                <h3 className="text-xl font-black text-[color:var(--text-primary)] italic uppercase tracking-tighter mb-5 flex items-center gap-3"><Sunset className="text-blue-500" /> Soir (Decompr)</h3>
                <div className="space-y-2.5 relative z-10">
                  {eveningCatalog.map(item => (
                    <div key={item.id} className="space-y-2">
                      <button
                        onMouseDown={() => startRitualLongPress('evening', item.id)}
                        onMouseUp={clearRitualLongPress}
                        onMouseLeave={clearRitualLongPress}
                        onTouchStart={() => startRitualLongPress('evening', item.id)}
                        onTouchEnd={clearRitualLongPress}
                        onTouchCancel={clearRitualLongPress}
                        onContextMenu={(event) => event.preventDefault()}
                        onClick={() => handleRitualClick('evening', item.id)}
                        className={`w-full px-4 py-3.5 rounded-xl border flex items-center justify-between transition-all ${eveningRituals[item.id] ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--text-secondary)] hover:border-[color:var(--border-strong)]'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-left">{item.label}</span>
                        {eveningRituals[item.id] ? <CheckSquare size={16} /> : <div className="w-4 h-4 border-2 border-[color:var(--border-strong)] rounded-md shrink-0" />}
                      </button>
                      {ritualActionsTarget?.period === 'evening' && ritualActionsTarget.ritualId === item.id && (
                        <div className="flex justify-end gap-2 animate-in fade-in zoom-in-95 duration-200">
                          <button onClick={() => editRitual('evening', item.id, item.label)} className="h-10 px-4 rounded-xl border border-white/5 bg-slate-950/70 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-colors flex items-center justify-center gap-2">
                            <Pencil size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Modifier</span>
                          </button>
                          <button onClick={() => deleteRitual('evening', item.id)} className="h-10 px-4 rounded-xl border border-white/5 bg-slate-950/70 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Supprimer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newEveningRitual}
                      onChange={e => setNewEveningRitual(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addRitual('evening')}
                      placeholder="+ Ajouter ritual..."
                      className="flex-1 bg-slate-950 border border-dashed border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white uppercase outline-none focus:border-blue-500/40 placeholder:text-slate-700"
                    />
                    <button onClick={() => addRitual('evening')} className="px-4 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PROTOCOL HISTORY */}
            <div className="bg-[#0b1121] border border-white/5 rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2"><History size={14} className="text-slate-500" /> Historique Protocole</h3>
                <button onClick={fetchProtocolHistory} className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                  {protocolLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Actualiser
                </button>
              </div>
              {protocolHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-700">
                  <p className="text-[10px] font-black uppercase tracking-widest">Cliquer sur Actualiser pour charger l'historique</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {protocolHistory.map((log) => {
                    const morningKeys = Object.values(log.morning || {});
                    const eveningKeys = Object.values(log.evening || {});
                    const total = morningKeys.length + eveningKeys.length;
                    const done = [...morningKeys, ...eveningKeys].filter(Boolean).length;
                    const score = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center">
                            <CalendarIcon size={14} className="text-slate-600" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-1.5 w-24 bg-slate-900 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className={`text-[9px] font-black uppercase ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{score}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === HISTORY VIEW === */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-[#0b1121] p-8 rounded-3xl border border-white/5 shadow-2xl">
              <div>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{stats.score}%</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Taux de Complétion Global</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
                  <Award size={32} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 pl-2">JOURNAL DES OBJECTIFS</h3>
              {completedMissions.map(mission => (
                <div key={mission.id} className="flex items-center justify-between p-5 bg-[#0b1121] border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase line-through decoration-slate-700 group-hover:text-slate-200 transition-colors">{mission.title}</h4>
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest">{new Date(mission.completed_at || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black bg-slate-900 px-3 py-1 rounded-full text-slate-500 uppercase border border-white/5">{displayMissionCategoryLabel(mission.category, studyDomainLabel)}</span>
                </div>
              ))}
              {completedMissions.length === 0 && <p className="text-center text-slate-600 py-10 text-xs uppercase tracking-widest">Historique vide</p>}
            </div>
          </div>
        )}
      </div>

      {/* MODALS & OVERLAYS */}

      {startMissionModal && (
        <div className="fixed inset-0 z-[520] flex items-center justify-center bg-slate-950/92 p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-[#111a30] shadow-[0_30px_120px_rgba(2,6,23,0.75)]">
            <div className="border-b border-white/5 px-5 pb-5 pt-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/10 px-3 py-1.5">
                <Timer size={12} className="text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.28em] text-blue-300">Duree focus</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.8rem] font-black uppercase italic leading-none tracking-[-0.04em] text-white font-outfit">
                    Demarrer
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Definis la duree de travail pour <span className="font-black text-white">{startMissionModal.title}</span>.
                  </p>
                </div>
                <button
                  onClick={() => setStartMissionModal(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500 transition-all hover:border-white/20 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid grid-cols-4 gap-2">
                {[15, 25, 45, 60].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setStartDurationMinutes(minutes)}
                    className={`rounded-xl border px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                      startDurationMinutes === minutes
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>

              <div className="rounded-[1.4rem] border border-white/5 bg-slate-950/50 p-4">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Duree personnalisee
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={startDurationMinutes}
                    onChange={(event) => setStartDurationMinutes(Math.max(5, Number(event.target.value) || 5))}
                    className="ui-field w-full rounded-2xl border px-4 py-3 text-base font-black outline-none transition-all focus:border-blue-500/40"
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">min</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <button
                  type="button"
                  onClick={handleStartMission}
                  className="flex items-center justify-center gap-2 rounded-[1.25rem] bg-blue-600 px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all hover:bg-blue-500"
                >
                  <PlayCircle size={16} />
                  Lancer la session
                </button>
                <button
                  type="button"
                  onClick={() => setStartMissionModal(null)}
                  className="rounded-[1.1rem] border border-white/10 bg-white/5 px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 transition-all hover:border-white/20 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. TIMER OVERLAY (If active) */}
      {showTimer && focusMission && (
        <div className="fixed bottom-[8.2rem] left-1/2 z-40 w-[calc(100%-2.5rem)] max-w-[248px] -translate-x-1/2 animate-in slide-in-from-bottom-20 fade-in duration-500">
          <div className="overflow-hidden rounded-[1.1rem] border border-amber-500/25 bg-slate-900/92 backdrop-blur-2xl shadow-[0_18px_40px_rgba(2,6,23,0.4)]">
            <div className="flex items-start justify-between gap-2 border-b border-white/5 px-3 pb-2 pt-2.5">
              <div className="min-w-0">
                <span className="text-[7px] font-black uppercase tracking-[0.18em] text-amber-500">Session active</span>
                <p className="mt-0.5 truncate text-[10px] font-black uppercase tracking-[0.08em] text-slate-300">
                  {focusMission.title}
                </p>
              </div>
              <button
                onClick={() => setShowTimer(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 transition-all hover:border-white/20 hover:text-white"
                aria-label="Masquer le timer"
              >
                <X size={13} />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setShowTimerFullscreen(true)}
                className="relative flex-1 overflow-hidden rounded-[0.95rem] border border-white/8 bg-[#0b1121] px-3 py-2 text-left transition-all hover:border-amber-500/30"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(245,158,11,0.2),transparent_42%)]" />
                <div className="relative flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-[0.16em] text-slate-500">Temps restant</p>
                    <div className="mt-0.5 text-[1.55rem] font-black leading-none text-white font-mono">
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                  </div>
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-amber-300">
                    {isTimerRunning ? 'En cours' : 'Pause'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                aria-label={isTimerRunning ? 'Mettre en pause' : 'Reprendre'}
              >
                {isTimerRunning ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTimerFullscreen && focusMission && (
        <div className="fixed inset-0 z-[530] flex items-center justify-center bg-slate-950/94 p-4 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[#0b1121] shadow-[0_30px_120px_rgba(2,6,23,0.7)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />

            <button
              onClick={() => setShowTimerFullscreen(false)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500 transition-all hover:border-white/20 hover:text-white"
              aria-label="Fermer le mode plein ecran"
            >
              <X size={18} />
            </button>

            <div className="px-6 pb-6 pt-7 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500">Session active</p>
              <h3 className="mt-3 truncate text-xl font-black uppercase tracking-tight text-white">
                {focusMission.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500">Mode focus plein ecran</p>

              <div className="mt-8 rounded-[1.75rem] border border-white/8 bg-slate-950/65 px-6 py-8">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Temps restant</p>
                <div className="mt-3 text-[4rem] font-black leading-none tracking-[-0.06em] text-white font-mono sm:text-[4.5rem]">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
                <div className="mt-4 inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
                  {isTimerRunning ? 'En cours' : 'En pause'}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="flex h-14 min-w-[124px] items-center justify-center gap-2 rounded-[1.2rem] bg-amber-500 px-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 transition-all hover:scale-[1.02]"
                >
                  {isTimerRunning ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                  {isTimerRunning ? 'Pause' : 'Reprendre'}
                </button>
                <button
                  onClick={() => setShowTimerFullscreen(false)}
                  className="flex h-14 min-w-[110px] items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/5 px-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 transition-all hover:border-white/20 hover:text-white"
                >
                  Reduire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FEEDBACK MODAL */}
      {showFeedback && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in zoom-in-95">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] p-8 text-center shadow-3xl">
            <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-8">
              <ClipboardCheck size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2 font-outfit">OBJECTIF ATTEINT</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Rapport de fin d'objectif</p>

            <div className="bg-[#0b1121] rounded-3xl p-6 border border-white/5 space-y-6 mb-8">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 text-left pl-1">DIFFICULTÉ RESSENTIE</p>
                <div className="flex gap-2">
                  {(['facile', 'normal', 'difficile'] as const).map(d => (
                    <button key={d} onClick={() => setFeedbackDiff(d)} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${feedbackDiff === d ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-slate-900 text-slate-600 border-white/5 hover:bg-white/5'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-3 pl-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ÉNERGIE RESTANTE</p>
                  <span className="text-[9px] font-black text-amber-500">{energyAfter}/10</span>
                </div>
                <input type="range" min="1" max="10" value={energyAfter} onChange={e => setEnergyAfter(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-500 appearance-none cursor-pointer" />
              </div>
            </div>

            <button
              onClick={() => { updateMissionStatus(showFeedback.id, 'Terminé', { difficulty: feedbackDiff, energy: energyAfter }); setShowFeedback(null); setFocusMission(null); }}
              className="w-full py-5 bg-amber-500 text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all font-outfit mt-4 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} strokeWidth={3} /> CONFIRMER & TERMINER
            </button>
          </div>
        </div>
      )}

      {/* 3. EDIT MISSION MODAL */}
      {editingMission && (
        <div className="fixed inset-0 z-[600] overflow-y-auto bg-slate-950/92 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111a30] shadow-[0_30px_120px_rgba(2,6,23,0.75)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
              <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />

              <button
                onClick={() => setEditingMission(null)}
                className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-500 transition-all hover:border-white/20 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="border-b border-white/5 px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/10 px-3 py-1.5">
                  <Target size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-300">Edition mission</span>
                </div>
                <h3 className="pr-14 text-[2rem] leading-none font-black uppercase italic tracking-[-0.04em] text-white font-outfit sm:text-[2.4rem]">
                  Modifier <span className="text-amber-500">l'objectif</span>
                </h3>
              </div>

              <div className="space-y-5 px-5 py-5 sm:px-8 sm:py-7">
                <div className="rounded-[1.5rem] border border-white/5 bg-slate-950/45 p-4 sm:p-5">
                  <div className="space-y-2">
                    <label className="pl-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Titre de la tache</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Nom de l'objectif"
                      className="ui-field w-full rounded-2xl border px-4 py-4 text-base font-black outline-none transition-all focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/5 bg-slate-950/45 p-4 sm:p-5">
                    <div className="space-y-2">
                      <label className="pl-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Categorie</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="ui-field w-full rounded-2xl border px-4 py-4 text-[15px] font-black uppercase outline-none transition-all focus:border-amber-500/40"
                      >
                        {missionCategories.map(c => <option key={c} value={c}>{displayMissionCategoryLabel(c, studyDomainLabel)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/5 bg-slate-950/45 p-4 sm:p-5">
                    <div className="space-y-2">
                      <label className="pl-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Priorite</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as any)}
                        className="ui-field w-full rounded-2xl border px-4 py-4 text-[15px] font-black uppercase outline-none transition-all focus:border-amber-500/40"
                      >
                        <option value="low">LOW</option>
                        <option value="medium">MEDIUM</option>
                        <option value="high">HIGH</option>
                        <option value="critical">CRITICAL</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/5 bg-slate-950/45 p-4 sm:p-5">
                  <div className="space-y-2">
                    <label className="pl-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Informations complementaires</label>
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Ajoute un contexte utile, le resultat attendu ou quelques details d'execution..."
                      className="ui-field min-h-[118px] w-full rounded-2xl border px-4 py-4 text-sm font-medium leading-relaxed outline-none transition-all focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/5 bg-slate-950/45 p-4 sm:p-5">
                    <div className="space-y-2">
                      <label className="pl-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Deadline</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={e => setEditDeadline(e.target.value)}
                          className="ui-field w-full rounded-2xl border px-4 py-4 pr-11 text-sm font-black uppercase outline-none transition-all focus:border-amber-500/40"
                        />
                        <CalendarIcon size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/5 bg-slate-950/45 p-4 sm:p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className="pl-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Charge energetique</label>
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
                          Niveau {editEnergy}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-1.5">
                        {[1, 2, 3].map(e => (
                          <button
                            key={e}
                            onClick={() => setEditEnergy(e as 1 | 2 | 3)}
                            className={`rounded-xl py-3 text-[11px] font-black transition-all ${
                              editEnergy === e
                                ? 'bg-amber-500 text-slate-950 shadow-[0_12px_30px_rgba(245,158,11,0.22)]'
                                : 'text-slate-500 hover:text-white'
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <button
                    onClick={handleUpdateMission}
                    disabled={isSaving || !editTitle.trim()}
                    className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-white px-5 py-4 text-[10px] font-black uppercase tracking-[0.32em] text-slate-950 transition-all hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Confirmer les modifications
                  </button>

                  <button
                    onClick={() => setEditingMission(null)}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 transition-all hover:border-white/20 hover:text-white"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-10 fade-in duration-500">
          <div className={`px-8 py-4 rounded-full border shadow-2xl flex items-center gap-4 backdrop-blur-xl ${toast.type === 'error' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' :
            toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
              'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-bold'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> :
              toast.type === 'error' ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
            <span className="text-[10px] uppercase tracking-[0.3em] font-black">{toast.message}</span>
          </div>
        </div>
      )}

      {/* STATIC BOTTOM BAR */}
      <div className="w-full max-w-3xl mx-auto mt-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
        <div className="flex justify-center flex-col items-center gap-2">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

    </div>
  );
};

export default Discipline;
