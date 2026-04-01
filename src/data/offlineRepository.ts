import { clearStore, countStore, deleteRecord, getAllRecords, getRecord, putManyRecords, putRecord, type OfflineStoreName } from '@/data/offlineDb';
import { CreateEntryDTO, JournalEntry } from '@/features/bible/types';
import { CreateMissionDTO, Mission, MissionStatus, UpdateMissionDTO } from '@/features/discipline/types';
import { CategoryBudget, FinanceProfile, SavingsItem, Transaction } from '@/features/finance/types';
import { CreateWordDTO, Word, WordDetail } from '@/features/languages/types';
import { Profile, UpdateProfileDTO } from '@/features/profile/types';
import { BodyMetric, CreateLogDTO, CreateMetricDTO, CreateRoutineDTO, FitnessGoal, WorkoutLog, WorkoutRoutine } from '@/features/sport/types';
import { CreateSubjectDTO, LawSubject, UpdateSubjectDTO } from '@/features/studies/types';
import { DEFAULT_MONTHLY_BUDGET } from '@/utils/financeBudget';
import { computeUpcomingMonthlyResetDate } from '@/utils/financeReset';
import { resolveProfileRankTitle } from '@/utils/profileRank';

export interface WeeklyGoal {
  id: string;
  category: string;
  target_count: number;
  current_count: number;
  week_number: number;
  year: number;
}

export interface CreateGoalDTO {
  category: string;
  target_count: number;
  week_number: number;
  year: number;
}

export interface FocusSession {
  id: string;
  mission_id?: string;
  type: 'focus' | 'short_break' | 'long_break';
  duration_seconds: number;
  status: 'completed' | 'interrupted';
  started_at: string;
}

export interface CreateFocusSessionDTO {
  mission_id?: string;
  type: 'focus' | 'short_break' | 'long_break';
  duration_seconds: number;
  status: 'completed' | 'interrupted';
}

export interface ProtocolLog {
  id: string;
  date: string;
  morning: Record<string, boolean>;
  evening: Record<string, boolean>;
  custom_morning_rituals: string[];
  custom_evening_rituals: string[];
  completion_score: number;
}

interface BibleProgressRecord {
  id: string;
  chapter_id: string;
  created_at: string;
}

interface ReportsSnapshot {
  missions: Mission[];
  finance: Transaction[];
  studySubjects: LawSubject[];
  learnedWords: Word[];
  workouts: WorkoutLog[];
  metrics: BodyMetric[];
  protocolLogs: ProtocolLog[];
  focusSessions: FocusSession[];
  weeklyGoals: WeeklyGoal[];
}

export const LOCAL_PROFILE_ID = 'local-device-profile';

const COLLECTIONS_TO_STORES: Record<string, OfflineStoreName> = {
  missions: 'missions',
  finance_transactions: 'finance_transactions',
  learned_words: 'learned_words',
  study_subjects: 'study_subjects',
};

const DATA_CENTER_STORES: Record<string, OfflineStoreName> = {
  missions: 'missions',
  transactions: 'finance_transactions',
  savings: 'finance_savings',
  subjects: 'study_subjects',
  words: 'learned_words',
  workouts: 'workout_logs',
  metrics: 'body_metrics',
  focus_sessions: 'focus_sessions',
  weekly_goals: 'weekly_goals',
  protocol_logs: 'protocol_logs',
};

const DEFAULT_SETTINGS = {
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
  reportGenerationDay: 'Dimanche',
  precisionLevel: 'High',
  enableAuditLogs: true,
  dataRetentionMonths: 12,
  autoExportCSV: false,
  syncFrequency: 15,
  calculateImpactScore: true,
  trackIdleTime: false,
  performanceGoal: 85,
  benchmarkComparison: true,
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
  themeMode: 'Sombre',
  density: 'Balanced',
  reduceMotion: false,
  showParticles: true,
  accentColor: 'Amber',
  ghostMode: false,
  autoLockDelay: 5,
  devMode: false,
  offlineCache: true,
  amci_recurrence: 'monthly' as const,
  amci_day_of_month: 10,
  daily_quota_override: null as number | null,
};

const DEFAULT_BUDGETS: CategoryBudget[] = [
  { category: 'Courses', limit: 1000 },
  { category: 'Plaisir', limit: 300 },
  { category: 'Transport', limit: 400 },
  { category: 'Loyers', limit: 1200 },
];

const WORD_BANK: Record<string, WordDetail[]> = {
  Anglais: [
    { word: 'Estoppel', phonetic: '/ɪˈstɒp.əl/', definition: 'Principe empêchant une partie de contredire une position admise auparavant.', example: 'The defense relied on estoppel to block the claim.', translation: 'fin de non-recevoir' },
    { word: 'Tortfeasor', phonetic: '/ˈtɔːtˌfiː.zər/', definition: 'Auteur d’un dommage civil engageant sa responsabilité.', example: 'The tortfeasor was ordered to pay damages.', translation: 'auteur du dommage' },
    { word: 'Indemnity', phonetic: '/ɪnˈdem.nə.ti/', definition: 'Garantie de réparation ou d’indemnisation en cas de perte.', example: 'The contract includes an indemnity clause.', translation: 'indemnisation' },
    { word: 'Waiver', phonetic: '/ˈweɪ.vər/', definition: 'Renonciation volontaire à un droit.', example: 'He signed a waiver before the activity.', translation: 'renonciation' },
    { word: 'Subpoena', phonetic: '/səˈpiː.nə/', definition: 'Assignation à comparaître ou à produire des documents.', example: 'The witness received a subpoena.', translation: 'citation à comparaître' },
    { word: 'Breach', phonetic: '/briːtʃ/', definition: 'Violation d’un contrat ou d’une obligation.', example: 'The supplier was sued for breach of contract.', translation: 'violation' },
  ],
  Français: [
    { word: 'Dol', phonetic: '/dɔl/', definition: 'Manœuvre frauduleuse destinée à tromper une partie lors d’un contrat.', example: 'Le contrat a été annulé pour dol.', translation: 'fraud' },
    { word: 'Novation', phonetic: '/nɔ.va.sjɔ̃/', definition: 'Substitution d’une obligation nouvelle à une ancienne.', example: 'La novation a éteint la dette initiale.', translation: 'novation' },
    { word: 'Opposabilité', phonetic: '/ɔ.po.za.bi.li.te/', definition: 'Capacité d’un acte à produire effet à l’égard des tiers.', example: 'La publication conditionne l’opposabilité.', translation: 'enforceability' },
    { word: 'Préemption', phonetic: '/pʁe.ɑ̃p.sjɔ̃/', definition: 'Droit d’acheter par priorité avant tout autre.', example: 'La commune exerce son droit de préemption.', translation: 'pre-emption' },
    { word: 'Cassation', phonetic: '/ka.sa.sjɔ̃/', definition: 'Annulation d’une décision par une juridiction supérieure.', example: 'La cour a prononcé la cassation.', translation: 'quashing' },
  ],
  Espagnol: [
    { word: 'Allanamiento', phonetic: '/a.ʝa.naˈmjen.to/', definition: 'Entrée illégale dans un domicile ou acceptation procédurale selon le contexte.', example: 'Se investigó un allanamiento de morada.', translation: 'violation de domicile' },
    { word: 'Usucapión', phonetic: '/u.su.kaˈpjon/', definition: 'Acquisition d’un bien par possession prolongée.', example: 'La usucapión consolidó la propiedad.', translation: 'prescription acquisitive' },
    { word: 'Finiquito', phonetic: '/fi.niˈki.to/', definition: 'Document soldant définitivement une relation contractuelle.', example: 'Firmó el finiquito laboral.', translation: 'solde de tout compte' },
    { word: 'Agravio', phonetic: '/aˈɣɾa.βjo/', definition: 'Préjudice ou grief invoqué en justice.', example: 'El recurso expone varios agravios.', translation: 'grief' },
    { word: 'Apremio', phonetic: '/aˈpɾe.mjo/', definition: 'Procédure d’exécution forcée.', example: 'La deuda entró en vía de apremio.', translation: 'recouvrement forcé' },
  ],
  Arabe: [
    { word: 'الاختصاص', phonetic: '/al-ikhtisas/', definition: 'Compétence attribuée à une juridiction ou autorité.', example: 'يحدد القانون الاختصاص النوعي للمحكمة.', translation: 'compétence' },
    { word: 'التقادم', phonetic: '/at-taqadum/', definition: 'Extinction ou acquisition d’un droit par l’écoulement du temps.', example: 'سقط الحق بالتقادم.', translation: 'prescription' },
    { word: 'الحجز', phonetic: '/al-hajz/', definition: 'Mesure conservatoire ou d’exécution sur les biens.', example: 'صدر أمر بالحجز التحفظي.', translation: 'saisie' },
    { word: 'التعويض', phonetic: '/at-taʿwid/', definition: 'Réparation pécuniaire d’un dommage.', example: 'حكمت المحكمة بالتعويض.', translation: 'indemnisation' },
    { word: 'الطعن', phonetic: '/at-taʿn/', definition: 'Voie de recours contre une décision.', example: 'تم تقديم الطعن داخل الأجل.', translation: 'recours' },
  ],
};

let bootstrapPromise: Promise<void> | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function todayIso(): string {
  return nowIso().split('T')[0];
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sortByDateDesc<T extends { date?: string; created_at?: string; started_at?: string; learned_at?: string; updated_at?: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const leftValue = left.date ?? left.created_at ?? left.started_at ?? left.learned_at ?? left.updated_at ?? '';
    const rightValue = right.date ?? right.created_at ?? right.started_at ?? right.learned_at ?? right.updated_at ?? '';
    return rightValue.localeCompare(leftValue);
  });
}

function normalizeTransactionType(type: Transaction['type'] | 'income'): Transaction['type'] {
  return type === 'income' ? 'deposit' : type;
}

function isMissionCompleted(status: string): boolean {
  return status === 'Terminé' || status === 'Terminée';
}

function computeProtocolScore(morning: Record<string, boolean>, evening: Record<string, boolean>): number {
  const values = [...Object.values(morning), ...Object.values(evening)];
  if (values.length === 0) {
    return 0;
  }

  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

function computeSubjectStats(dto: CreateSubjectDTO | UpdateSubjectDTO): { progress: number; stressLevel: 'low' | 'medium' | 'high' } {
  const total = Math.max(1, Number(dto.chaptersTotal ?? 1));
  const done = Math.max(0, Number(dto.chaptersDone ?? 0));
  const progress = Math.min(100, Math.round((done / total) * 100));
  const stressLevel = progress < 30 ? 'high' : progress < 70 ? 'medium' : 'low';
  return { progress, stressLevel };
}

function getWeekNumber(date: Date): number {
  const value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  value.setUTCDate(value.getUTCDate() + 4 - (value.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  return Math.ceil((((value.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function pickGeneratedWords(language: string, learnedWords: Word[]): WordDetail[] {
  const pool = WORD_BANK[language] ?? WORD_BANK.Anglais;
  const learnedSet = new Set(learnedWords.map((word) => word.word.toLowerCase()));
  const available = pool.filter((word) => !learnedSet.has(word.word.toLowerCase()));
  return (available.length > 0 ? available : pool).slice(0, 5);
}

async function seedDefaults(): Promise<void> {
  const profile = await getRecord<Profile>('profiles', LOCAL_PROFILE_ID);
  if (!profile) {
    await putRecord<Profile>('profiles', {
      id: LOCAL_PROFILE_ID,
      username: '',
      rank_title: 'Opérateur',
      total_xp: 0,
      total_missions_completed: 0,
      amci_monthly_amount: DEFAULT_MONTHLY_BUDGET,
      next_amci_date: computeUpcomingMonthlyResetDate(DEFAULT_SETTINGS.amci_day_of_month),
      location: '',
      bio: '',
      motto: 'Discipline, clarté, constance.',
      avatar_url: '',
      settings_config: { ...DEFAULT_SETTINGS },
      created_at: nowIso(),
    });
  }

  const existingBudgets = await getAllRecords<CategoryBudget>('finance_budgets');
  if (existingBudgets.length === 0) {
    await putManyRecords('finance_budgets', DEFAULT_BUDGETS);
  }
}

async function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = seedDefaults();
  }

  await bootstrapPromise;
}

async function getProfileRecord(): Promise<Profile> {
  await ensureBootstrapped();
  const profile = await getRecord<Profile>('profiles', LOCAL_PROFILE_ID);
  if (!profile) {
    throw new Error('Offline profile is unavailable.');
  }

  const canonicalRank = resolveProfileRankTitle(profile.total_xp ?? 0);
  if (profile.rank_title !== canonicalRank) {
    const nextProfile = {
      ...profile,
      rank_title: canonicalRank,
    };
    await putRecord('profiles', nextProfile);
    return nextProfile;
  }

  return profile;
}

async function updateProfileRecord(updater: (profile: Profile) => Profile): Promise<Profile> {
  const current = await getProfileRecord();
  const next = updater(current);
  await putRecord('profiles', next);
  return next;
}

export const offlineRepository = {
  async bootstrap() {
    await ensureBootstrapped();
  },

  profile: {
    async getProfile(): Promise<Profile> {
      return getProfileRecord();
    },

    async updateProfile(updates: UpdateProfileDTO & Partial<Profile>): Promise<Profile> {
      return updateProfileRecord((profile) => ({
        ...profile,
        ...updates,
      }));
    },

    async updateSettings(settings: Record<string, unknown>): Promise<Profile> {
      return updateProfileRecord((profile) => ({
        ...profile,
        settings_config: {
          ...(profile.settings_config ?? {}),
          ...settings,
        },
      }));
    },

    async incrementProgress(xpDelta: number, completedDelta = 0): Promise<Profile> {
      return updateProfileRecord((profile) => {
        const totalXp = Math.max(0, (profile.total_xp ?? 0) + xpDelta);

        return {
          ...profile,
          total_xp: totalXp,
          rank_title: resolveProfileRankTitle(totalXp),
          total_missions_completed: (profile.total_missions_completed ?? 0) + completedDelta,
        };
      });
    },

    async getFinanceProfile(): Promise<FinanceProfile> {
      const profile = await getProfileRecord();
      return {
        amci_monthly_amount: profile.amci_monthly_amount,
        next_amci_date: profile.next_amci_date ?? computeUpcomingMonthlyResetDate(DEFAULT_SETTINGS.amci_day_of_month),
        settings_config: profile.settings_config,
      };
    },
  },

  discipline: {
    async getMissions(): Promise<Mission[]> {
      await ensureBootstrapped();
      return sortByDateDesc(await getAllRecords<Mission>('missions'));
    },

    async createMission(mission: CreateMissionDTO): Promise<Mission> {
      await ensureBootstrapped();
      const nextMission: Mission = {
        id: createId('mission'),
        user_id: LOCAL_PROFILE_ID,
        title: mission.title,
        description: mission.description,
        category: mission.category,
        priority: mission.priority,
        status: mission.status,
        deadline: mission.deadline,
        planned_date: mission.planned_date,
        estimated_duration: mission.estimated_duration,
        actual_duration: mission.actual_duration,
        energy_required: mission.energy_required,
        impact_score: mission.impact_score,
        created_at: nowIso(),
      };

      await putRecord('missions', nextMission);
      return nextMission;
    },

    async updateMission(id: string, updates: UpdateMissionDTO): Promise<Mission> {
      await ensureBootstrapped();
      const existing = await getRecord<Mission>('missions', id);
      if (!existing) {
        throw new Error('Mission introuvable.');
      }

      const nextStatus = updates.status ?? existing.status;
      const completed = isMissionCompleted(nextStatus);
      const nextMission: Mission = {
        ...existing,
        ...updates,
        status: nextStatus as MissionStatus,
        completed_at: completed ? (updates.completed_at ?? existing.completed_at ?? nowIso()) : updates.completed_at ?? existing.completed_at,
      };

      await putRecord('missions', nextMission);
      return nextMission;
    },

    async deleteMission(id: string): Promise<void> {
      await ensureBootstrapped();
      await deleteRecord('missions', id);
    },

    async getTodayProtocolLog(): Promise<ProtocolLog | null> {
      await ensureBootstrapped();
      return getRecord<ProtocolLog>('protocol_logs', `protocol_${todayIso()}`);
    },

    async saveProtocolLog(payload: Omit<ProtocolLog, 'id' | 'completion_score'> & { completion_score?: number }): Promise<ProtocolLog> {
      await ensureBootstrapped();
      const record: ProtocolLog = {
        id: `protocol_${payload.date}`,
        ...payload,
        completion_score: payload.completion_score ?? computeProtocolScore(payload.morning, payload.evening),
      };

      await putRecord('protocol_logs', record);
      return record;
    },

    async listProtocolLogs(limit = 30): Promise<ProtocolLog[]> {
      await ensureBootstrapped();
      return sortByDateDesc(await getAllRecords<ProtocolLog>('protocol_logs')).slice(0, limit);
    },
  },

  finance: {
    async getTransactions(): Promise<Transaction[]> {
      await ensureBootstrapped();
      return sortByDateDesc(await getAllRecords<Transaction>('finance_transactions')).map((transaction) => ({
        ...transaction,
        type: normalizeTransactionType(transaction.type),
      }));
    },

    async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id'>): Promise<Transaction> {
      await ensureBootstrapped();
      const created: Transaction = {
        ...transaction,
        id: createId('tx'),
        user_id: LOCAL_PROFILE_ID,
        type: normalizeTransactionType(transaction.type),
      };

      await putRecord('finance_transactions', created);
      return created;
    },

    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
      await ensureBootstrapped();
      const existing = await getRecord<Transaction>('finance_transactions', id);
      if (!existing) {
        throw new Error('Transaction introuvable.');
      }

      const nextTransaction: Transaction = {
        ...existing,
        ...updates,
        type: normalizeTransactionType(updates.type ?? existing.type),
      };

      await putRecord('finance_transactions', nextTransaction);
      return nextTransaction;
    },

    async deleteTransaction(id: string): Promise<void> {
      await ensureBootstrapped();
      await deleteRecord('finance_transactions', id);
    },

    async getBudgets(): Promise<CategoryBudget[]> {
      await ensureBootstrapped();
      const budgets = await getAllRecords<CategoryBudget>('finance_budgets');
      return [...budgets].sort((left, right) => left.category.localeCompare(right.category));
    },

    async updateBudgets(budgets: CategoryBudget[]): Promise<CategoryBudget[]> {
      await ensureBootstrapped();
      const uniqueBudgets = Array.from(
        new Map(
          budgets
            .filter((budget) => budget.category.trim() !== '')
            .map((budget) => [budget.category, { category: budget.category, limit: Number(budget.limit) || 0 }]),
        ).values(),
      );

      await clearStore('finance_budgets');
      await putManyRecords('finance_budgets', uniqueBudgets);
      return uniqueBudgets;
    },

    async getSavings(): Promise<SavingsItem[]> {
      await ensureBootstrapped();
      return sortByDateDesc(await getAllRecords<SavingsItem>('finance_savings'));
    },

    async createSavings(savings: Omit<SavingsItem, 'id'>): Promise<SavingsItem> {
      await ensureBootstrapped();
      const created: SavingsItem = {
        ...savings,
        id: createId('saving'),
        executed: savings.executed ?? false,
      };

      await putRecord('finance_savings', created);
      return created;
    },

    async updateSavings(id: string, updates: Partial<SavingsItem>): Promise<SavingsItem> {
      await ensureBootstrapped();
      const existing = await getRecord<SavingsItem>('finance_savings', id);
      if (!existing) {
        throw new Error('Réserve introuvable.');
      }

      const nextSaving: SavingsItem = {
        ...existing,
        ...updates,
      };

      await putRecord('finance_savings', nextSaving);
      return nextSaving;
    },

    async deleteSavings(id: string): Promise<void> {
      await ensureBootstrapped();
      await deleteRecord('finance_savings', id);
    },

    async executeSaving(savingId: string, amount: number, reason: string): Promise<void> {
      await ensureBootstrapped();
      const saving = await getRecord<SavingsItem>('finance_savings', savingId);
      if (!saving) {
        throw new Error('Réserve introuvable.');
      }

      await this.createTransaction({
        date: todayIso(),
        title: reason,
        category: 'Épargne',
        amount,
        type: 'expense',
        comment: 'Exécution de réserve d’épargne',
        source: 'savings_execution',
      });

      await this.updateSavings(savingId, {
        executed: true,
        execution_date: todayIso(),
      });
    },
  },

  studies: {
    async getSubjects(): Promise<LawSubject[]> {
      await ensureBootstrapped();
      return sortByDateDesc(await getAllRecords<LawSubject>('study_subjects'));
    },

    async createSubject(subject: CreateSubjectDTO): Promise<LawSubject> {
      await ensureBootstrapped();
      const stats = computeSubjectStats(subject);
      const created: LawSubject = {
        id: createId('subject'),
        user_id: LOCAL_PROFILE_ID,
        name: subject.name,
        semester: subject.semester,
        professor: subject.professor ?? null,
        status: subject.status,
        chaptersTotal: subject.chaptersTotal,
        chaptersDone: subject.chaptersDone,
        examDate: subject.examDate ?? null,
        ects: subject.ects,
        notes: subject.notes ?? null,
        courseDateTime: subject.courseDateTime ?? null,
        courseSchedule: subject.courseSchedule ?? [],
        reminders: subject.reminders ?? [],
        studySessions: subject.studySessions ?? [],
        created_at: nowIso(),
        ...stats,
      };

      await putRecord('study_subjects', created);
      return created;
    },

    async updateSubject(id: string, updates: UpdateSubjectDTO): Promise<LawSubject> {
      await ensureBootstrapped();
      const existing = await getRecord<LawSubject>('study_subjects', id);
      if (!existing) {
        throw new Error('Matière introuvable.');
      }

      const merged = {
        ...existing,
        ...updates,
      };
      const stats = computeSubjectStats(merged);
      const nextSubject: LawSubject = {
        ...merged,
        ...stats,
        professor: merged.professor ?? null,
        examDate: merged.examDate ?? null,
        notes: merged.notes ?? null,
        courseDateTime: merged.courseDateTime ?? null,
        courseSchedule: merged.courseSchedule ?? [],
        reminders: merged.reminders ?? [],
        studySessions: merged.studySessions ?? [],
      };

      await putRecord('study_subjects', nextSubject);
      return nextSubject;
    },

    async deleteSubject(id: string): Promise<void> {
      await ensureBootstrapped();
      await deleteRecord('study_subjects', id);
    },
  },

  languages: {
    async getLearnedWords(language: string): Promise<Word[]> {
      await ensureBootstrapped();
      return sortByDateDesc(
        (await getAllRecords<Word>('learned_words')).filter((word) => word.language === language),
      );
    },

    async markAsLearned(word: CreateWordDTO): Promise<Word> {
      await ensureBootstrapped();
      const created: Word = {
        ...word,
        id: createId('word'),
        learned_at: nowIso(),
      };

      await putRecord('learned_words', created);
      return created;
    },

    async generateWords(language: string): Promise<WordDetail[]> {
      await ensureBootstrapped();
      const learnedWords = await this.getLearnedWords(language);
      return pickGeneratedWords(language, learnedWords);
    },
  },

  bible: {
    async getEntries(): Promise<JournalEntry[]> {
      await ensureBootstrapped();
      return sortByDateDesc(await getAllRecords<JournalEntry>('journal_entries'));
    },

    async getProgress(): Promise<string[]> {
      await ensureBootstrapped();
      const progress = await getAllRecords<BibleProgressRecord>('bible_progress');
      return progress.map((entry) => entry.chapter_id);
    },

    async markChapterRead(chapterId: string): Promise<void> {
      await ensureBootstrapped();
      await putRecord('bible_progress', {
        id: chapterId,
        chapter_id: chapterId,
        created_at: nowIso(),
      } satisfies BibleProgressRecord);
    },

    async markChapterUnread(chapterId: string): Promise<void> {
      await ensureBootstrapped();
      await deleteRecord('bible_progress', chapterId);
    },

    async createEntry(entry: CreateEntryDTO): Promise<JournalEntry> {
      await ensureBootstrapped();
      const created: JournalEntry = {
        id: createId('journal'),
        user_id: LOCAL_PROFILE_ID,
        content: entry.content,
        tags: entry.tags,
        mood: entry.mood,
        created_at: nowIso(),
      };

      await putRecord('journal_entries', created);
      return created;
    },
  },

  planning: {
    async getWeeklyGoals(): Promise<WeeklyGoal[]> {
      await ensureBootstrapped();
      const now = new Date();
      const year = now.getFullYear();
      const weekNumber = getWeekNumber(now);
      const goals = await getAllRecords<WeeklyGoal>('weekly_goals');
      return goals.filter((goal) => goal.year === year && goal.week_number === weekNumber);
    },

    async createGoal(dto: CreateGoalDTO): Promise<WeeklyGoal> {
      await ensureBootstrapped();
      const created: WeeklyGoal = {
        id: `${dto.year}_${dto.week_number}_${dto.category}`,
        ...dto,
        current_count: 0,
      };

      await putRecord('weekly_goals', created);
      return created;
    },

    async updateGoalProgress(id: string, currentCount: number): Promise<WeeklyGoal> {
      await ensureBootstrapped();
      const existing = await getRecord<WeeklyGoal>('weekly_goals', id);
      if (!existing) {
        throw new Error('Objectif hebdomadaire introuvable.');
      }

      const nextGoal: WeeklyGoal = {
        ...existing,
        current_count: currentCount,
      };

      await putRecord('weekly_goals', nextGoal);
      return nextGoal;
    },

    async getFocusSessions(limit = 10): Promise<FocusSession[]> {
      await ensureBootstrapped();
      return sortByDateDesc(await getAllRecords<FocusSession>('focus_sessions')).slice(0, limit);
    },

    async createFocusSession(dto: CreateFocusSessionDTO): Promise<FocusSession> {
      await ensureBootstrapped();
      const created: FocusSession = {
        id: createId('focus'),
        ...dto,
        started_at: nowIso(),
      };

      await putRecord('focus_sessions', created);
      return created;
    },
  },

  sport: {
    async getSportData(): Promise<{ routines: WorkoutRoutine[]; logs: WorkoutLog[]; metrics: BodyMetric[]; goals: FitnessGoal[] }> {
      await ensureBootstrapped();
      const [routines, logs, metrics, goals] = await Promise.all([
        getAllRecords<WorkoutRoutine>('workout_routines'),
        getAllRecords<WorkoutLog>('workout_logs'),
        getAllRecords<BodyMetric>('body_metrics'),
        getAllRecords<FitnessGoal>('fitness_goals'),
      ]);

      return {
        routines: sortByDateDesc(routines),
        logs: sortByDateDesc(logs).slice(0, 60),
        metrics: sortByDateDesc(metrics).slice(0, 30),
        goals,
      };
    },

    async saveRoutine(routine: CreateRoutineDTO, id?: string): Promise<WorkoutRoutine> {
      await ensureBootstrapped();
      const existing = id ? await getRecord<WorkoutRoutine>('workout_routines', id) : null;
      const createdAt = existing?.created_at ?? nowIso();
      const nextRoutine: WorkoutRoutine = {
        id: existing?.id ?? createId('routine'),
        user_id: LOCAL_PROFILE_ID,
        name: routine.name,
        description: existing?.description,
        exercises: routine.exercises,
        tags: routine.tags,
        notes: routine.notes,
        created_at: createdAt,
        updated_at: nowIso(),
      };

      await putRecord('workout_routines', nextRoutine);
      return nextRoutine;
    },

    async deleteRoutine(id: string): Promise<void> {
      await ensureBootstrapped();
      await deleteRecord('workout_routines', id);
    },

    async saveLog(log: CreateLogDTO): Promise<WorkoutLog> {
      await ensureBootstrapped();
      const created: WorkoutLog = {
        id: createId('workout_log'),
        user_id: LOCAL_PROFILE_ID,
        ...log,
        xp_earned: 150,
      };

      await putRecord('workout_logs', created);
      await offlineRepository.profile.incrementProgress(created.xp_earned ?? 0, 0);
      return created;
    },

    async addMetric(metric: CreateMetricDTO): Promise<BodyMetric> {
      await ensureBootstrapped();
      const created: BodyMetric = {
        id: createId('metric'),
        user_id: LOCAL_PROFILE_ID,
        ...metric,
      };

      await putRecord('body_metrics', created);
      return created;
    },

    async upsertGoal(goal: Omit<FitnessGoal, 'id' | 'user_id'> & { id?: string }): Promise<FitnessGoal> {
      await ensureBootstrapped();
      const nextGoal: FitnessGoal = {
        ...goal,
        id: goal.id ?? createId('fitness_goal'),
        user_id: LOCAL_PROFILE_ID,
      };

      await putRecord('fitness_goals', nextGoal);
      return nextGoal;
    },

    async deleteGoal(id: string): Promise<void> {
      await ensureBootstrapped();
      await deleteRecord('fitness_goals', id);
    },
  },

  analytics: {
    async getCounts(): Promise<{ missions: number; transactions: number; words: number; subjects: number }> {
      await ensureBootstrapped();
      const [missions, transactions, words, subjects] = await Promise.all([
        countStore('missions'),
        countStore('finance_transactions'),
        countStore('learned_words'),
        countStore('study_subjects'),
      ]);

      return { missions, transactions, words, subjects };
    },

    async getReportsSnapshot(): Promise<ReportsSnapshot> {
      await ensureBootstrapped();
      const [missions, finance, studySubjects, learnedWords, workouts, metrics, protocolLogs, focusSessions, weeklyGoals] = await Promise.all([
        getAllRecords<Mission>('missions'),
        getAllRecords<Transaction>('finance_transactions'),
        getAllRecords<LawSubject>('study_subjects'),
        getAllRecords<Word>('learned_words'),
        getAllRecords<WorkoutLog>('workout_logs'),
        getAllRecords<BodyMetric>('body_metrics'),
        getAllRecords<ProtocolLog>('protocol_logs'),
        getAllRecords<FocusSession>('focus_sessions'),
        getAllRecords<WeeklyGoal>('weekly_goals'),
      ]);

      return {
        missions,
        finance: finance.map((transaction) => ({
          ...transaction,
          type: normalizeTransactionType(transaction.type),
        })),
        studySubjects,
        learnedWords,
        workouts,
        metrics,
        protocolLogs,
        focusSessions,
        weeklyGoals,
      };
    },
  },

  settings: {
    async getDataCenterSnapshot() {
      await ensureBootstrapped();
      const [
        missions,
        transactions,
        savings,
        subjects,
        words,
        workouts,
        metrics,
        focusSessions,
        weeklyGoals,
        protocolLogs,
      ] = await Promise.all([
        getAllRecords<Mission>('missions'),
        getAllRecords<Transaction>('finance_transactions'),
        getAllRecords<SavingsItem>('finance_savings'),
        getAllRecords<LawSubject>('study_subjects'),
        getAllRecords<Word>('learned_words'),
        getAllRecords<WorkoutLog>('workout_logs'),
        getAllRecords<BodyMetric>('body_metrics'),
        getAllRecords<FocusSession>('focus_sessions'),
        getAllRecords<WeeklyGoal>('weekly_goals'),
        getAllRecords<ProtocolLog>('protocol_logs'),
      ]);

      return {
        missions,
        transactions: transactions.map((transaction) => ({
          ...transaction,
          type: normalizeTransactionType(transaction.type),
        })),
        savings,
        subjects,
        words,
        workouts,
        metrics,
        focusSessions,
        weeklyGoals,
        protocolLogs,
      };
    },

    async deleteRecords(collection: string, ids: string[]): Promise<void> {
      await ensureBootstrapped();
      const store = DATA_CENTER_STORES[collection];
      if (!store) {
        throw new Error(`Collection locale inconnue: ${collection}`);
      }

      await Promise.all(ids.map((id) => deleteRecord(store, id)));
    },

    async clearCollection(table: string): Promise<void> {
      await ensureBootstrapped();
      const store = COLLECTIONS_TO_STORES[table];
      if (!store) {
        throw new Error(`Collection locale inconnue: ${table}`);
      }

      await clearStore(store);
    },
  },
};
