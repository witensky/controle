import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CalendarClock, Plus, X } from 'lucide-react';
import type { StudyReminder } from '../../features/studies/types';
import { STUDY_REMINDER_PRESETS, buildPresetReminder, dedupeReminders } from '../../utils/studyReminders';

interface ReminderPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: StudyReminder[];
  onChange: (reminders: StudyReminder[]) => void;
  onProbeNotifications: () => Promise<void>;
}

const ReminderPopover: React.FC<ReminderPopoverProps> = ({
  isOpen,
  onClose,
  reminders,
  onChange,
  onProbeNotifications,
}) => {
  const [customMinutes, setCustomMinutes] = useState('');
  const [customUnit, setCustomUnit] = useState<'minutes' | 'days'>('minutes');

  const activePresetIds = useMemo(
    () => reminders.filter((reminder) => reminder.type === 'preset').map((reminder) => reminder.id.replace('preset-', '')),
    [reminders],
  );

  const togglePreset = async (presetId: string) => {
    const exists = activePresetIds.includes(presetId);
    const nextReminders = exists
      ? reminders.filter((reminder) => reminder.id !== `preset-${presetId}`)
      : dedupeReminders([...reminders, buildPresetReminder(presetId)!]);

    onChange(nextReminders);
    if (!exists) await onProbeNotifications();
  };

  const addCustomReminder = async () => {
    const rawValue = Math.max(1, Number(customMinutes));
    const nextMinutes = customUnit === 'days' ? rawValue * 1440 : rawValue;
    if (!Number.isFinite(nextMinutes)) return;

    onChange(dedupeReminders([
      ...reminders,
      {
        id: `custom-${nextMinutes}`,
        type: 'custom',
        label: customUnit === 'days' ? `${rawValue} jour${rawValue > 1 ? 's' : ''} avant` : `${rawValue} min avant`,
        offsetMinutes: nextMinutes,
      },
    ]));

    setCustomMinutes('');
    await onProbeNotifications();
  };

  const removeReminder = (reminderId: string) => {
    onChange(reminders.filter((reminder) => reminder.id !== reminderId));
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(calc(100vw-2rem),22rem)] max-w-[22rem] rounded-[1.5rem] border border-white/10 bg-[#081120]/95 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-2xl sm:right-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Rappels intelligents</p>
              <p className="mt-1 text-[11px] text-slate-400">Chaque rappel suit automatiquement les creneaux du module.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">Raccourcis</p>
              <div className="flex flex-wrap gap-1.5">
                {STUDY_REMINDER_PRESETS.map((preset) => {
                  const active = activePresetIds.includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => togglePreset(preset.id)}
                      className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] transition-all ${
                        active
                          ? 'border-amber-400/30 bg-amber-400/12 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                          : 'border-white/8 bg-slate-950/70 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-white/8 bg-slate-950/60 p-3">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
                <CalendarClock size={13} className="text-cyan-300" />
                Personnalise
              </div>
              <div className="mt-2 flex flex-col gap-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,auto,auto]">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={customMinutes}
                    onChange={(event) => setCustomMinutes(event.target.value)}
                    placeholder="Valeur"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#020617] px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400/40"
                  />
                  <select
                    value={customUnit}
                    onChange={(event) => setCustomUnit(event.target.value as 'minutes' | 'days')}
                    className="rounded-xl border border-white/10 bg-[#020617] px-3 py-2.5 text-[9px] font-black uppercase text-white outline-none focus:border-cyan-400/40"
                  >
                    <option value="minutes">Minute(s)</option>
                    <option value="days">Jour(s)</option>
                  </select>
                  <button
                    type="button"
                    onClick={addCustomReminder}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-400 px-3 py-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-950 transition-transform hover:scale-[1.02]"
                  >
                    <Plus size={13} />
                    Ajouter
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Exemple: `10 minutes avant` ou `2 jours avant`.</p>
              </div>
            </div>

            <div className="space-y-2">
              {reminders.length > 0 ? reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">
                    <BellRing size={13} className="text-amber-400" />
                    {reminder.label}
                  </div>
                  <button type="button" onClick={() => removeReminder(reminder.id)} className="text-slate-500 transition-colors hover:text-rose-400">
                    <X size={14} />
                  </button>
                </div>
              )) : (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-[11px] text-slate-500">
                  Aucun rappel programme.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ReminderPopover;
