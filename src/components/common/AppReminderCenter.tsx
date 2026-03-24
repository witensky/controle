import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CheckCircle2, Info, X } from 'lucide-react';
import { APP_REMINDER_EVENT, type AppReminderPayload, type AppReminderTone } from '../../lib/appReminders';

type ReminderItem = AppReminderPayload & {
  id: string;
};

const TONE_STYLES: Record<AppReminderTone, { shell: string; icon: React.ReactNode }> = {
  info: {
    shell: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    icon: <Info size={16} className="text-cyan-300" />,
  },
  success: {
    shell: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    icon: <CheckCircle2 size={16} className="text-emerald-300" />,
  },
  warning: {
    shell: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    icon: <BellRing size={16} className="text-amber-300" />,
  },
};

const AppReminderCenter: React.FC = () => {
  const [items, setItems] = useState<ReminderItem[]>([]);

  useEffect(() => {
    const handleReminder = (event: Event) => {
      const detail = (event as CustomEvent<AppReminderPayload>).detail;
      if (!detail?.title) return;

      const nextItem: ReminderItem = {
        ...detail,
        tone: detail.tone || 'info',
        id: detail.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      setItems((previous) => {
        const withoutDuplicate = previous.filter((item) => item.id !== nextItem.id);
        return [nextItem, ...withoutDuplicate].slice(0, 4);
      });
    };

    window.addEventListener(APP_REMINDER_EVENT, handleReminder as EventListener);
    return () => window.removeEventListener(APP_REMINDER_EVENT, handleReminder as EventListener);
  }, []);

  useEffect(() => {
    if (items.length === 0) return undefined;

    const timers = items.map((item) =>
      window.setTimeout(() => {
        setItems((previous) => previous.filter((entry) => entry.id !== item.id));
      }, 6500),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [items]);

  const renderedItems = useMemo(() => items.slice(0, 4), [items]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[420] flex justify-center px-3 sm:justify-end sm:px-4">
      <div className="flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {renderedItems.map((item) => {
            const tone = TONE_STYLES[item.tone || 'info'];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`pointer-events-auto rounded-[1.25rem] border px-4 py-3 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl ${tone.shell}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{tone.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/80">{item.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems((previous) => previous.filter((entry) => entry.id !== item.id))}
                    className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-white/60 transition-colors hover:text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppReminderCenter;
