import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, Pause, Play, RotateCcw, Trophy, X } from 'lucide-react';
import type { LawSubject, StudySession } from '../../features/studies/types';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';
import Timer from './Timer';
import { getStudyLevelMeta, sumStudySeconds } from '../../utils/studyMode';

interface StudyModeProps {
  subject: LawSubject | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (subjectId: string, session: StudySession) => Promise<void> | void;
}

const StudyMode: React.FC<StudyModeProps> = ({ subject, isOpen, onClose, onSaveSession }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setElapsedSeconds(0);
      setStartedAt(null);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const levelMeta = useMemo(() => getStudyLevelMeta(elapsedSeconds), [elapsedSeconds]);
  const previousSessions = subject?.studySessions || [];
  const totalStudySeconds = sumStudySeconds(previousSessions);
  const totalMinutes = Math.round((totalStudySeconds + elapsedSeconds) / 60);
  const sessionCount = previousSessions.length + (elapsedSeconds > 0 ? 1 : 0);
  const hasProfessor = Boolean(subject?.professor?.trim());

  const handleStartPause = () => {
    if (!startedAt) {
      setStartedAt(new Date());
    }
    setIsRunning((current) => !current);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setStartedAt(null);
  };

  const handleFinish = async () => {
    if (!subject || elapsedSeconds <= 0) {
      handleReset();
      onClose();
      return;
    }

    const session: StudySession = {
      id: `study-${Date.now()}`,
      startedAt: (startedAt || new Date()).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      levelReached: levelMeta.level,
    };

    await onSaveSession(subject.id, session);
    handleReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && subject ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[420] bg-[color:var(--overlay)]/92 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-4 pb-5 pt-4"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[color:var(--tone-info-text)]">Mode revision</p>
                <h3 className="mt-1.5 truncate text-[2rem] font-black uppercase italic leading-none tracking-tight text-[color:var(--heading)] dark:text-white">
                  {subject.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={cx(uiRecipes.chip, 'px-2 py-1 text-[8px] tracking-[0.16em]')}>
                    {subject.semester}
                  </span>
                  {hasProfessor ? (
                    <span className="truncate text-[10px] font-semibold text-[color:var(--text-secondary)]">
                      {subject.professor}
                    </span>
                  ) : null}
                </div>
              </div>
              <button type="button" onClick={onClose} className={cx(uiRecipes.ghostButton, 'min-h-10 rounded-[1.1rem] p-0 h-10 w-10 shrink-0')}>
                <X size={18} />
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.5fr,0.9fr]">
              <div className="space-y-4">
                <Timer
                  elapsedSeconds={elapsedSeconds}
                  level={levelMeta.level}
                  label={levelMeta.label}
                  progressPercent={levelMeta.progressPercent}
                  nextLabel={levelMeta.nextLabel}
                  isRunning={isRunning}
                />

                <div className="grid grid-cols-3 gap-2.5">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartPause}
                    className={cx(
                      uiRecipes.secondaryButton,
                      toneClassNames.info.shell,
                      'border-[color:var(--tone-info-border)] bg-[color:var(--tone-info-surface)] text-[color:var(--tone-info-text)] hover:border-[color:var(--tone-info-border)] hover:bg-[color:var(--tone-info-surface)]/90',
                      'inline-flex min-h-12 gap-2 rounded-[1.25rem] px-3 py-3 text-[10px]',
                    )}
                  >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    <span className="hidden sm:inline">{isRunning ? 'Pause' : 'Demarrer'}</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className={cx(
                      uiRecipes.ghostButton,
                      'border-[color:var(--border-strong)] bg-[color:var(--surface)] text-[color:var(--heading)] hover:bg-[color:var(--surface-elevated)]',
                      'inline-flex min-h-12 gap-2 rounded-[1.25rem] px-3 py-3 text-[10px]',
                    )}
                  >
                    <RotateCcw size={16} />
                    <span className="hidden sm:inline">Reset</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinish}
                    className={cx(
                      uiRecipes.secondaryButton,
                      toneClassNames.success.shell,
                      'border-[color:var(--tone-success-border)] bg-[color:var(--tone-success-surface)] text-[color:var(--tone-success-text)] hover:border-[color:var(--tone-success-border)] hover:bg-[color:var(--tone-success-surface)]/90',
                      'inline-flex min-h-12 gap-2 rounded-[1.25rem] px-3 py-3 text-[10px]',
                    )}
                  >
                    <BookOpenCheck size={16} />
                    <span className="hidden sm:inline">Terminer</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="study-shell rounded-[1.55rem] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Progression globale</p>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="study-metric-shell rounded-[1.15rem] px-3.5 py-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Temps cumule</p>
                      <p className="mt-1.5 text-[1.8rem] font-black italic leading-none text-[color:var(--heading)] dark:text-white">{totalMinutes} min</p>
                    </div>
                    <div className="study-metric-shell rounded-[1.15rem] px-3.5 py-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Sessions</p>
                      <p className="mt-1.5 text-[1.8rem] font-black italic leading-none text-[color:var(--heading)] dark:text-white">{sessionCount}</p>
                    </div>
                    <div className="study-metric-shell rounded-[1.15rem] px-3.5 py-3">
                      <p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--tone-warning-text)]"><Trophy size={12} /> Niveau atteint</p>
                      <p className="mt-1.5 text-[1.8rem] font-black italic leading-none text-[color:var(--heading)] dark:text-white">Niv. {levelMeta.level}</p>
                    </div>
                  </div>
                </div>

                {previousSessions.length > 0 ? (
                  <div className="study-shell rounded-[1.55rem] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Historique recent</p>
                    <div className="mt-3 space-y-2.5">
                      {previousSessions.slice(-3).reverse().map((session) => (
                      <div key={session.id} className="study-metric-shell flex items-center justify-between gap-3 rounded-[1.1rem] px-4 py-3">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--heading)] dark:text-white">
                            {new Date(session.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </p>
                          <p className="mt-1 text-[11px] text-[color:var(--text-secondary)]">{Math.round(session.durationSeconds / 60)} min</p>
                        </div>
                        <span className={cx(uiRecipes.chip, toneClassNames.info.chip)}>
                          Niveau {session.levelReached}
                        </span>
                      </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default StudyMode;
