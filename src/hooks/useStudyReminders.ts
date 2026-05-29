import { NotificationService } from '@/lib/NotificationInitializer';
import { LawSubject, StudyReminder, StudyScheduleSlot } from '@/types';
import { useEffect, useRef } from 'react';
import { useSubjects } from '@/features/studies/hooks/useStudies';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
  }
  return hash;
}

export const useStudyReminders = () => {
  const { data: subjects } = useSubjects();
  const scheduledRemindersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!subjects || subjects.length === 0) return;

    const checkAndScheduleReminders = () => {
      const now = new Date();
      const currentDay = now.getDay();

      subjects.forEach((subject: LawSubject) => {
        if (!subject.courseSchedule || subject.courseSchedule.length === 0) return;

        subject.courseSchedule.forEach((slot: StudyScheduleSlot) => {
          // Check if this slot is for today
          if (slot.weekday !== currentDay) return;

          const [slotHours, slotMinutes] = slot.startTime.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(slotHours, slotMinutes, 0, 0);

          // Process reminders
          subject.reminders?.forEach((reminder: StudyReminder) => {
            const reminderId = `${subject.id}-${slot.startTime}-${reminder.id}`;

            // Skip if already scheduled today
            if (scheduledRemindersRef.current.has(reminderId)) return;

            let reminderTime: Date;

            if (reminder.type === 'custom' && reminder.customDateTime) {
              reminderTime = new Date(reminder.customDateTime);
            } else {
              // Calculate reminder time based on offset
              reminderTime = new Date(slotTime.getTime() - reminder.offsetMinutes * 60 * 1000);
            }

            // Check if reminder should be sent within next 1 hour
            const timeDiff = reminderTime.getTime() - now.getTime();
            if (timeDiff > 0 && timeDiff < 60 * 60 * 1000) {
              NotificationService.scheduleNotification({
                id: hashCode(reminderId),
                title: `📚 Cours: ${subject.name}`,
                body: `Votre cours avec ${subject.professor || 'le professeur'} commence à ${slot.startTime}. Préparez vos notes!`,
                scheduleAt: reminderTime,
                actionTypeId: 'study-reminder',
                extra: {
                  subjectId: subject.id,
                  slotStartTime: slot.startTime,
                },
              });

              scheduledRemindersRef.current.add(reminderId);
            }
          });
        });
      });
    };

    // Check immediately
    checkAndScheduleReminders();

    // Check every 30 seconds
    const interval = setInterval(checkAndScheduleReminders, 30 * 1000);

    return () => clearInterval(interval);
  }, [subjects]);

  return { scheduledCount: scheduledRemindersRef.current.size };
};
