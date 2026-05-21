import { useCallback, useState } from 'react';
import { Transaction } from '../types';
import { isPlannedProvision } from '../../../utils/financeProvisions';
import { normalizeDateOnly } from '../../../utils/transactionDates';

export interface TransactionFormState {
  type: 'expense' | 'deposit';
  amount: string;
  title: string;
  categoryValue: string;
  date: string;
  comment: string;
  isPlanningProvision: boolean;
  editingTransaction: Transaction | null;
}

const INITIAL_EXPENSE_CATEGORY = 'Courses';
const INITIAL_DEPOSIT_SOURCE = 'AMCI';
const todayStr = () => new Date().toISOString().split('T')[0];

const INITIAL_STATE: TransactionFormState = {
  type: 'expense',
  amount: '',
  title: '',
  categoryValue: INITIAL_EXPENSE_CATEGORY,
  date: todayStr(),
  comment: '',
  isPlanningProvision: false,
  editingTransaction: null,
};

export interface UseTransactionFormReturn {
  form: TransactionFormState;
  setType: (type: 'expense' | 'deposit') => void;
  setAmount: (v: string) => void;
  setTitle: (v: string) => void;
  setCategoryValue: (v: string) => void;
  setDate: (v: string) => void;
  setComment: (v: string) => void;
  setIsPlanningProvision: (v: boolean) => void;
  openForCreate: (type?: 'expense' | 'deposit') => void;
  openForEdit: (transaction: Transaction) => void;
  reset: () => void;
  isValid: boolean;
  isProvision: boolean;
}

export function useTransactionForm(): UseTransactionFormReturn {
  const [form, setForm] = useState<TransactionFormState>(INITIAL_STATE);

  const setType = useCallback((type: 'expense' | 'deposit') => {
    setForm((prev) => ({
      ...prev,
      type,
      categoryValue: type === 'expense' ? INITIAL_EXPENSE_CATEGORY : INITIAL_DEPOSIT_SOURCE,
      isPlanningProvision: type === 'deposit' ? false : prev.isPlanningProvision,
    }));
  }, []);

  const setAmount = useCallback((amount: string) => setForm((p) => ({ ...p, amount })), []);
  const setTitle = useCallback((title: string) => setForm((p) => ({ ...p, title })), []);
  const setCategoryValue = useCallback((categoryValue: string) => setForm((p) => ({ ...p, categoryValue })), []);
  const setDate = useCallback((date: string) => setForm((p) => ({ ...p, date })), []);
  const setComment = useCallback((comment: string) => setForm((p) => ({ ...p, comment })), []);
  const setIsPlanningProvision = useCallback(
    (isPlanningProvision: boolean) => setForm((p) => ({ ...p, isPlanningProvision })),
    [],
  );

  const reset = useCallback(() => {
    setForm({ ...INITIAL_STATE, date: todayStr() });
  }, []);

  const openForCreate = useCallback((type: 'expense' | 'deposit' = 'expense') => {
    setForm({
      ...INITIAL_STATE,
      date: todayStr(),
      type,
      categoryValue: type === 'expense' ? INITIAL_EXPENSE_CATEGORY : INITIAL_DEPOSIT_SOURCE,
    });
  }, []);

  const openForEdit = useCallback((transaction: Transaction) => {
    setForm({
      type: transaction.type,
      amount: transaction.amount.toString(),
      title: transaction.title,
      categoryValue: transaction.type === 'deposit' ? transaction.source || INITIAL_DEPOSIT_SOURCE : transaction.category,
      date: transaction.date,
      comment: transaction.comment || '',
      isPlanningProvision: isPlannedProvision(transaction),
      editingTransaction: transaction,
    });
  }, []);

  const isValid =
    form.amount.trim().length > 0 &&
    form.title.trim().length > 0 &&
    !Number.isNaN(Number(form.amount)) &&
    Number(form.amount) > 0;

  const isProvision =
    form.type === 'expense' &&
    (form.isPlanningProvision ||
      (form.editingTransaction ? isPlannedProvision(form.editingTransaction) : false) ||
      normalizeDateOnly(form.date) > todayStr());

  return {
    form,
    setType,
    setAmount,
    setTitle,
    setCategoryValue,
    setDate,
    setComment,
    setIsPlanningProvision,
    openForCreate,
    openForEdit,
    reset,
    isValid,
    isProvision,
  };
}
