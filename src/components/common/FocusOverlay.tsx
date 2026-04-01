import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Brain, Pause, Play, RotateCcw, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { useCreateFocusSession } from '../../features/planning/hooks/usePlanning';

interface FocusOverlayProps {
  onClose: () => void;
  missionId?: string;
  defaultTime?: number;
}

const FocusOverlay: React.FC<FocusOverlayProps> = ({ onClose, missionId, defaultTime = 25 }) => {
  const [timeLeft, setTimeLeft] = useState(defaultTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const createSession = useCreateFocusSession();

  const isFocusMode = sessionType === 'focus';
  const sessionLabel = isFocusMode ? 'CONCENTRATION' : 'RECUPERATION';
  const sessionSubtitle = isFocusMode ? 'Focus optimal active' : 'Reprenez des forces pour la suite';

  const metrics = useMemo(
    () => [
      { label: 'DISCIPLINE', icon: Brain, iconClassName: 'text-blue-600 dark:text-blue-400' },
      { label: 'MEMOIRE', icon: Sparkles, iconClassName: 'text-amber-500 dark:text-amber-400' },
      { label: 'RESULTAT', icon: Trophy, iconClassName: 'text-emerald-600 dark:text-emerald-400' },
    ],
    [],
  );

  const handleComplete = useCallback(() => {
    setIsActive(false);
    createSession.mutate({
      mission_id: missionId,
      type: sessionType,
      duration_seconds: defaultTime * 60 - timeLeft,
      status: 'completed',
    });

    if (sessionType === 'focus') {
      setSessionType('short_break');
      setTimeLeft(5 * 60);
      return;
    }

    setSessionType('focus');
    setTimeLeft(defaultTime * 60);
  }, [createSession, defaultTime, missionId, sessionType, timeLeft]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((previous) => previous - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [handleComplete, isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (isActive) {
      createSession.mutate({
        mission_id: missionId,
        type: sessionType,
        duration_seconds: defaultTime * 60 - timeLeft,
        status: 'interrupted',
      });
    }

    onClose();
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(isFocusMode ? defaultTime * 60 : 5 * 60);
  };

  const handleSwitchMode = () => {
    setSessionType(isFocusMode ? 'short_break' : 'focus');
    setIsActive(false);
    setTimeLeft(isFocusMode ? 5 * 60 : defaultTime * 60);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.30)] px-6 py-8 backdrop-blur-xl dark:bg-[color:var(--overlay)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(31,157,139,0.14),transparent_42%)] dark:hidden" />

      <button
        type="button"
        onClick={handleClose}
        className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] shadow-[0_14px_34px_var(--shadow)] transition-all hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] dark:bg-[color:var(--muted)]"
      >
        <X size={22} />
      </button>

      <div className="relative z-[1] w-full max-w-md rounded-[2.5rem] border border-[color:var(--border)] bg-gradient-to-b from-[color:var(--surface-elevated)] to-[color:var(--surface)] p-6 text-center shadow-[0_20px_60px_var(--shadow-strong)] dark:border-transparent dark:bg-transparent dark:p-0 dark:shadow-none">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-[color:var(--brand-border)] bg-[color:var(--brand-surface)] text-[color:var(--brand)] shadow-[0_18px_44px_rgba(31,157,139,0.16)] dark:border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-400">
                <Zap size={38} fill="currentColor" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-outfit text-5xl font-black uppercase italic leading-none tracking-[-0.07em] text-[color:var(--text-primary)]">
                {sessionLabel}
              </h2>
              <div className="inline-flex rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-[color:var(--brand-strong)] shadow-[0_10px_20px_rgba(31,157,139,0.12)] dark:border-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-300">
                {sessionSubtitle}
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[color:var(--border)] bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface-muted)] px-6 py-8 shadow-[0_28px_60px_var(--shadow)] backdrop-blur-sm dark:border-white/5 dark:bg-slate-950/25">
            <div className="text-[112px] font-black italic leading-none tracking-[-0.08em] text-[color:var(--text-primary)] drop-shadow-[0_10px_22px_var(--shadow)] dark:drop-shadow-[0_0_30px_rgba(2,6,23,0.16)] sm:text-[148px]">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-20 w-20 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--text-secondary)] shadow-[0_18px_38px_var(--shadow)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text-primary)] dark:bg-[color:var(--muted)] dark:text-[color:var(--text-muted)]"
            >
              <RotateCcw size={24} />
            </button>

            <button
              type="button"
              onClick={() => setIsActive((previous) => !previous)}
              className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--text-on-accent)] shadow-[0_26px_46px_rgba(31,157,139,0.28)] transition-all hover:scale-[1.03] hover:bg-[color:var(--brand-strong)] hover:border-[color:var(--brand-strong)] active:scale-[0.97] dark:border-[color:var(--border)] dark:bg-[color:var(--surface)] dark:text-[color:var(--text-primary)] dark:shadow-card"
            >
              {isActive ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" className="ml-1" />}
            </button>

            <button
              type="button"
              onClick={handleSwitchMode}
              className="flex h-20 w-20 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--text-secondary)] shadow-[0_18px_38px_var(--shadow)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text-primary)] dark:bg-[color:var(--muted)] dark:text-[color:var(--text-muted)]"
            >
              <RotateCcw size={24} className="rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-5 shadow-[0_16px_32px_var(--shadow)] dark:border-white/5 dark:bg-white/[0.03]"
              >
                <div className="flex flex-col items-center gap-2.5">
                  <item.icon size={17} className={item.iconClassName} />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--text-secondary)] dark:text-[color:var(--text-muted)]">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusOverlay;
