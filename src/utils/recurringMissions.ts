import { CreateMissionDTO, Mission, MissionRecurrence } from '../features/discipline/types';

export interface RecurringMissionConfig {
  recurrence: MissionRecurrence;
  recurrenceEndDate?: string;
  parentMissionId?: string;
}

export class RecurringMissionUtils {
  /**
   * Calculate the next occurrence date based on recurrence type
   */
  static getNextOccurrenceDate(
    baseDate: string,
    recurrence: MissionRecurrence
  ): string | null {
    if (recurrence === 'none') return null;

    const base = new Date(baseDate);
    const next = new Date(base);

    switch (recurrence) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'none':
        return null;
    }

    return next.toISOString().split('T')[0];
  }

  /**
   * Check if recurrence should end
   */
  static isRecurrenceActive(
    recurrenceEndDate: string | undefined,
    currentDate = new Date()
  ): boolean {
    if (!recurrenceEndDate) return true;
    return new Date(recurrenceEndDate) >= currentDate;
  }

  /**
   * Generate next mission from a recurring mission template
   */
  static generateNextMission(parentMission: Mission): CreateMissionDTO | null {
    if (!parentMission.recurrence || parentMission.recurrence === 'none') {
      return null;
    }

    if (!this.isRecurrenceActive(parentMission.recurrence_end_date)) {
      return null;
    }

    const nextDate = this.getNextOccurrenceDate(
      parentMission.planned_date || new Date().toISOString().split('T')[0],
      parentMission.recurrence
    );

    if (!nextDate) return null;

    return {
      title: parentMission.title,
      category: parentMission.category,
      priority: parentMission.priority,
      description: parentMission.description,
      deadline: parentMission.deadline,
      energy_required: parentMission.energy_required,
      status: 'Backlog',
      impact_score: parentMission.impact_score,
      planned_date: nextDate,
      estimated_duration: parentMission.estimated_duration,
      recurrence: parentMission.recurrence,
      recurrence_end_date: parentMission.recurrence_end_date,
      parent_mission_id: parentMission.id,
    };
  }

  /**
   * Get recurrence label in French
   */
  static getRecurrenceLabel(recurrence: MissionRecurrence): string {
    const labels: Record<MissionRecurrence, string> = {
      none: 'Une fois',
      daily: 'Quotidienne',
      weekly: 'Hebdomadaire',
      biweekly: 'Bihebdomadaire',
      monthly: 'Mensuelle',
    };
    return labels[recurrence];
  }

  /**
   * Filter out completed recurring missions to see if new ones should be generated
   */
  static shouldGenerateNextOccurrence(mission: Mission): boolean {
    return (
      mission.status === 'Terminé' &&
      !!mission.recurrence &&
      mission.recurrence !== 'none' &&
      this.isRecurrenceActive(mission.recurrence_end_date)
    );
  }
}
