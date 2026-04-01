import type { Transaction } from '../features/finance/types';
import { normalizeDateOnly } from './transactionDates';

/**
 * A "provision" is a planned expense that must be executed manually.
 * It must NOT become an executed expense automatically when its date is passed.
 */
export function isPlannedProvision(transaction: Transaction): boolean {
  if (transaction.planned === true) return true;
  if (transaction.planned === false) return false;
  if (transaction.type !== 'expense') return false;

  const dateKey = normalizeDateOnly(transaction.date);
  if (!dateKey) return false;

  // Legacy support: some records carried only `planned_date` before the explicit `planned` flag existed.
  // If `date` differs from the `planned_date`, we assume the provision was executed (date overwritten),
  // and therefore is no longer a planned provision.
  if (transaction.planned_date) {
    const plannedKey = normalizeDateOnly(transaction.planned_date);
    if (plannedKey && plannedKey !== dateKey) return false;
    return true;
  }

  // Heuristic for legacy data: IDs are generated as `tx_<createdMs>_<rand>`.
  // If the record was created BEFORE the scheduled day, we treat it as a planned provision.
  const match = /^tx_(\d+)_/.exec(transaction.id);
  if (!match) return false;

  const createdMs = Number(match[1]);
  if (!Number.isFinite(createdMs)) return false;

  const scheduledMs = new Date(`${dateKey}T00:00:00Z`).getTime();
  if (!Number.isFinite(scheduledMs)) return false;

  return createdMs < scheduledMs;
}
