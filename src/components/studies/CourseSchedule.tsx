import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, CalendarDays, ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { StudyReminder, StudyScheduleSlot } from '../../features/studies/types';
import ReminderPopover from './ReminderPopover';
import { createDefaultScheduleSlot, formatWeeklySchedule, WEEKDAY_OPTIONS } from '../../utils/studyReminders';

interface CourseScheduleProps {
  schedule: StudyScheduleSlot[];
  onChange: (schedule: StudyScheduleSlot[]) => void;
  reminders: StudyReminder[];
  onRemindersChange: (reminders: StudyReminder[]) => void;
  onProbeNotifications: () => Promise<void>;
}

const CourseSchedule: React.FC<CourseScheduleProps> = ({
  schedule,
  onChange,
  reminders,
  onRemindersChange,
  onProbeNotifications,
}) => {
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(schedule.length === 0);
  const hasReminders = reminders.length > 0;
  const hasSchedule = schedule.length > 0;

  const scheduleSummary = useMemo(
    () => (hasSchedule ? formatWeeklySchedule(schedule) : 'Aucun créneau défini'),
    [hasSchedule, schedule],
  );

  const helperText = useMemo(() => {
    if (!hasSchedule) return 'Ajoute un ou plusieurs créneaux hebdomadaires pour ce module.';
    if (!hasReminders) return `Planning: ${scheduleSummary}`;
    return `${scheduleSummary} • ${reminders.length} rappel${reminders.length > 1 ? 's' : ''} actif${reminders.length > 1 ? 's' : ''}.`;
  }, [hasReminders, hasSchedule, reminders.length, scheduleSummary]);

  const updateSlot = (slotId: string, updates: Partial<StudyScheduleSlot>) => {
    onChange(schedule.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot)));
  };

  const addSlot = () => {
    onChange([...schedule, createDefaultScheduleSlot()]);
  };

  const removeSlot = (slotId: string) => {
    const nextSchedule = schedule.filter((slot) => slot.id !== slotId);
    onChange(nextSchedule);
    if (nextSchedule.length === 0) {
      onRemindersChange([]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)]">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Horaires du cours</p>
            <p className="mt-1 break-words pr-1 text-sm font-bold leading-snug text-[color:var(--text-primary)]">{scheduleSummary}</p>
            <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">
              {hasSchedule ? `${schedule.length} créneau${schedule.length > 1 ? 'x' : ''} par semaine` : 'Planning récurrent'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-primary)]"
            >
              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={17} />
              </motion.span>
            </button>

            <div className="relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                animate={
                  hasReminders
                    ? { boxShadow: ['0 0 0 rgba(34,211,238,0.16)', '0 0 18px rgba(34,211,238,0.24)', '0 0 0 rgba(34,211,238,0.16)'] }
                    : { boxShadow: '0 0 0 rgba(0,0,0,0)' }
                }
                transition={{ repeat: hasReminders ? Infinity : 0, duration: 2.2 }}
                onClick={() => setIsReminderOpen((current) => !current)}
                disabled={!hasSchedule}
                className={`inline-flex h-10 min-w-[3.2rem] shrink-0 items-center justify-center gap-1.5 rounded-2xl border px-3 text-[9px] font-black uppercase tracking-[0.16em] transition-all ${
                  hasReminders
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                    : 'border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--text-secondary)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)]'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <BellRing size={14} />
                {hasReminders ? (
                  <span className="rounded-full bg-cyan-300 px-1.5 py-0.5 text-[8px] text-slate-950">{reminders.length}</span>
                ) : null}
              </motion.button>

              <ReminderPopover
                isOpen={isReminderOpen}
                onClose={() => setIsReminderOpen(false)}
                reminders={reminders}
                onChange={onRemindersChange}
                onProbeNotifications={onProbeNotifications}
              />
            </div>
          </div>
        </div>

        {isExpanded ? (
          <div className="space-y-3 border-t border-[color:var(--border)] px-4 pb-4 pt-3">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={addSlot}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
              >
                <Plus size={12} />
                Ajouter un créneau
              </button>
            </div>

            <div className="space-y-3">
              {schedule.map((slot) => (
                <div
                  key={slot.id}
                  className="grid grid-cols-1 gap-3 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-2)] p-4 sm:grid-cols-[1fr,0.9fr,0.9fr,auto]"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Jour</span>
                    <div className="relative">
                      <CalendarDays size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                      <select
                        value={slot.weekday}
                        onChange={(event) => updateSlot(slot.id, { weekday: Number(event.target.value) })}
                        className="ui-field w-full rounded-2xl border py-4 pl-11 pr-4 text-xs font-black uppercase outline-none focus:border-cyan-400/40"
                      >
                        {WEEKDAY_OPTIONS.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Début</span>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(event) => updateSlot(slot.id, { startTime: event.target.value })}
                      className="ui-field w-full rounded-2xl border px-4 py-4 text-xs font-black outline-none focus:border-cyan-400/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Fin</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(event) => updateSlot(slot.id, { endTime: event.target.value })}
                      className="ui-field w-full rounded-2xl border px-4 py-4 text-xs font-black outline-none focus:border-cyan-400/40"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="self-end rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4 text-[color:var(--text-muted)] transition-colors hover:text-rose-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <p className="ml-2 text-[11px] text-[color:var(--text-muted)]">{helperText}</p>
    </div>
  );
};

export default CourseSchedule;

