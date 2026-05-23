import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User2,
  CheckCircle2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineRepository } from '../../data/offlineRepository';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { cx } from '../../theme/recipes';
import {
  DEFAULT_CURRENCY,
  persistCurrency,
  resolveCurrency,
  SUPPORTED_CURRENCIES,
  type SupportedCurrencyCode,
} from '../../utils/currency';

type OnboardingFlowProps = {
  onComplete: () => void;
};

type OnboardingForm = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currency: SupportedCurrencyCode;
  currentBalance: string;
  dailyQuota: string;
  studyDomain: string;
  studyLevel: string;
  institution: string;
  mainGoal: string;
};

const SLIDES = [
  {
    id: 'identity',
    step: 1,
    eyebrow: 'Bienvenue',
    title: 'Qui es-tu ?',
    subtitle: 'Commence par les informations de base pour personnaliser ton profil.',
    emoji: '👋',
  },
  {
    id: 'contact',
    step: 2,
    eyebrow: 'Contact',
    title: 'Reste joignable',
    subtitle: 'Utilisés pour les rapports, exports et rappels.',
    emoji: '📬',
  },
  {
    id: 'finance',
    step: 3,
    eyebrow: 'Finances',
    title: 'Ton budget',
    subtitle: 'Le solde de départ alimente tout le module financier.',
    emoji: '💰',
  },
  {
    id: 'studies',
    step: 4,
    eyebrow: 'Études',
    title: 'Ton contexte',
    subtitle: 'Pour des analyses et recommandations plus pertinentes.',
    emoji: '🎯',
  },
] as const;

const DEFAULT_ONBOARDING_NAMES = new Set(['', 'Utilisateur', 'Utilisateur local']);
const DEFAULT_ONBOARDING_EMAILS = new Set(['', 'user@lifestream.io', 'user@myflow.app']);
const DEFAULT_ONBOARDING_PHONES = new Set(['', '+212 6 XX XX XX XX']);
const DEFAULT_ONBOARDING_LOCATIONS = new Set(['', 'Casablanca, MA']);
const DEFAULT_ONBOARDING_BIOS = new Set(['', 'Profil local offline-first.']);

const normalizeOnboardingValue = (value: string | null | undefined, defaults: Set<string>) => {
  const normalized = String(value || '').trim();
  return defaults.has(normalized) ? '' : normalized;
};

const normalizePositiveNumberInput = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(Number(value)) || Number(value) <= 0) return '';
  return String(value);
};

/* ─── Input field ─── */
const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, icon, children, hint }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
      <span className="text-[color:var(--primary)]">{icon}</span>
      {label}
    </label>
    {children}
    {hint ? <p className="ml-1 text-[10px] text-[color:var(--text-muted)]">{hint}</p> : null}
  </div>
);

const inputCls =
  'w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3.5 text-sm font-medium text-[color:var(--text)] outline-none transition-all placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--focus-ring)]';

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<OnboardingForm>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    currency: DEFAULT_CURRENCY,
    currentBalance: '',
    dailyQuota: '',
    studyDomain: '',
    studyLevel: '',
    institution: '',
    mainGoal: '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || normalizeOnboardingValue(profile.username, DEFAULT_ONBOARDING_NAMES),
      email: prev.email || normalizeOnboardingValue(profile.settings_config?.contact?.email, DEFAULT_ONBOARDING_EMAILS),
      phone: prev.phone || normalizeOnboardingValue(profile.settings_config?.contact?.phone, DEFAULT_ONBOARDING_PHONES),
      location: prev.location || normalizeOnboardingValue(profile.location, DEFAULT_ONBOARDING_LOCATIONS),
      currency:
        prev.currency !== DEFAULT_CURRENCY || !profile.settings_config?.finance?.currency
          ? prev.currency
          : resolveCurrency(profile.settings_config?.finance?.currency),
      currentBalance: prev.currentBalance || normalizePositiveNumberInput(profile.amci_monthly_amount),
      dailyQuota: prev.dailyQuota || normalizePositiveNumberInput(profile.settings_config?.daily_quota_override),
      studyDomain: prev.studyDomain || profile.settings_config?.study?.primaryDomain || '',
      studyLevel: prev.studyLevel || profile.settings_config?.study?.level || '',
      institution: prev.institution || profile.settings_config?.study?.institution || '',
      mainGoal: prev.mainGoal || normalizeOnboardingValue(profile.bio, DEFAULT_ONBOARDING_BIOS),
    }));
  }, [profile]);

  const isCurrentStepValid = useMemo(() => {
    switch (SLIDES[currentStep].id) {
      case 'identity': return Boolean(form.fullName.trim());
      case 'contact': return Boolean(form.email.trim()) && Boolean(form.phone.trim());
      case 'finance': return form.currentBalance.trim() !== '';
      case 'studies': return Boolean(form.studyDomain.trim()) && Boolean(form.mainGoal.trim());
      default: return true;
    }
  }, [currentStep, form]);

  const set = <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const normalizedBudget = Math.max(0, Number(form.currentBalance) || 0);
    const normalizedDailyQuota = form.dailyQuota.trim() === '' ? null : Math.max(0, Number(form.dailyQuota) || 0);

    setIsSaving(true);
    try {
      await offlineRepository.profile.updateProfile({
        username: form.fullName.trim() || 'Utilisateur',
        location: form.location.trim(),
        amci_monthly_amount: normalizedBudget,
        bio: form.mainGoal.trim(),
      });
      await offlineRepository.profile.updateSettings({
        contact: { email: form.email.trim(), phone: form.phone.trim() },
        onboarding: { completed: true, completed_at: new Date().toISOString() },
        finance: { currency: resolveCurrency(form.currency), currentBalance: normalizedBudget },
        daily_quota_override: normalizedDailyQuota,
        study: { primaryDomain: form.studyDomain.trim(), level: form.studyLevel.trim(), institution: form.institution.trim() },
      });
      persistCurrency(form.currency);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const slide = SLIDES[currentStep];
  const progress = ((currentStep + 1) / SLIDES.length) * 100;

  return (
    <div className="min-h-[100dvh] bg-[color:var(--background)] text-[color:var(--text)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col px-5 py-8 sm:px-6">

        {/* ── Top bar ── */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--primary)]">
              {slide.eyebrow}
            </p>
            <h1 className="mt-1 text-[1.75rem] font-black uppercase italic tracking-tight text-[color:var(--heading)]">
              {slide.title}
            </h1>
          </div>

          {/* Step counter */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-[11px] font-bold text-[color:var(--text-secondary)]">
              {currentStep + 1} / {SLIDES.length}
            </span>
          </div>
        </div>

        {/* ── Progress ── */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { if (i <= currentStep) setCurrentStep(i); }}
                className={cx(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentStep
                    ? 'flex-1 bg-[color:var(--primary)]'
                    : i < currentStep
                    ? 'w-8 bg-[color:var(--primary)] opacity-40'
                    : 'w-8 bg-[color:var(--border-strong)] opacity-30',
                )}
                aria-label={`Étape ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        <p className="mb-6 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          {slide.subtitle}
        </p>

        {/* ── Fields ── */}
        <div className="flex-1 space-y-4">

          {/* STEP 1 — Identity */}
          {slide.id === 'identity' && (
            <>
              <Field label="Nom complet" icon={<User2 size={13} />}>
                <input
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="Ahmed Benali"
                  className={inputCls}
                  autoFocus
                />
              </Field>
              <Field label="Ville" icon={<MapPin size={13} />}>
                <input
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Casablanca, Maroc"
                  className={inputCls}
                />
              </Field>
            </>
          )}

          {/* STEP 2 — Contact */}
          {slide.id === 'contact' && (
            <>
              <Field label="Email" icon={<Mail size={13} />}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="nom@exemple.com"
                  className={inputCls}
                  autoFocus
                />
              </Field>
              <Field label="Téléphone" icon={<Phone size={13} />}>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  className={inputCls}
                />
              </Field>
            </>
          )}

          {/* STEP 3 — Finance */}
          {slide.id === 'finance' && (
            <>
              <Field label="Devise" icon={<BadgeDollarSign size={13} />}>
                <select
                  value={form.currency}
                  onChange={(e) => set('currency', resolveCurrency(e.target.value))}
                  className={inputCls}
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.description} — {c.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Budget mensuel"
                icon={<BadgeDollarSign size={13} />}
                hint="Ton solde de départ. Alimente quotas, projections et alertes."
              >
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={form.currentBalance}
                    onChange={(e) => set('currentBalance', e.target.value)}
                    placeholder="3500"
                    className={cx(inputCls, 'pr-16 text-lg font-bold')}
                    autoFocus
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[color:var(--text-muted)]">
                    {form.currency === 'FRANC' ? 'Franc' : form.currency}
                  </span>
                </div>
              </Field>

              <Field
                label="Limite journalière"
                icon={<BadgeDollarSign size={13} />}
                hint="Optionnel — combien tu peux dépenser par jour."
              >
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={form.dailyQuota}
                    onChange={(e) => set('dailyQuota', e.target.value)}
                    placeholder="150"
                    className={cx(inputCls, 'pr-16')}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[color:var(--text-muted)]">
                    {form.currency === 'FRANC' ? 'Franc' : form.currency}
                  </span>
                </div>
              </Field>
            </>
          )}

          {/* STEP 4 — Studies */}
          {slide.id === 'studies' && (
            <>
              <Field label="Domaine d'étude" icon={<GraduationCap size={13} />}>
                <input
                  value={form.studyDomain}
                  onChange={(e) => set('studyDomain', e.target.value)}
                  placeholder="Marketing digital"
                  className={inputCls}
                  autoFocus
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Niveau" icon={<Briefcase size={13} />}>
                  <input
                    value={form.studyLevel}
                    onChange={(e) => set('studyLevel', e.target.value)}
                    placeholder="Licence 3"
                    className={inputCls}
                  />
                </Field>
                <Field label="Établissement" icon={<GraduationCap size={13} />}>
                  <input
                    value={form.institution}
                    onChange={(e) => set('institution', e.target.value)}
                    placeholder="FSJES"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Objectif principal" icon={<GraduationCap size={13} />}>
                <textarea
                  value={form.mainGoal}
                  onChange={(e) => set('mainGoal', e.target.value)}
                  rows={3}
                  placeholder="Ex: Structurer mes objectifs et avancer chaque semaine."
                  className={cx(inputCls, 'resize-none')}
                />
              </Field>
            </>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="mt-8 flex items-center gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
              disabled={isSaving}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] transition-all hover:border-[color:var(--border-strong)] disabled:opacity-40"
              aria-label="Retour"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className="h-14 w-14 shrink-0" />
          )}

          {currentStep === SLIDES.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isCurrentStepValid || isSaving}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--primary)] text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--primary-foreground)] transition-all disabled:opacity-40 hover:opacity-90 active:scale-[0.98]"
            >
              {isSaving ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <CheckCircle2 size={17} />
              )}
              {isSaving ? 'Enregistrement…' : 'Terminer'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep((p) => Math.min(SLIDES.length - 1, p + 1))}
              disabled={!isCurrentStepValid}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--primary)] text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--primary-foreground)] transition-all disabled:opacity-40 hover:opacity-90 active:scale-[0.98]"
            >
              Continuer
              <ArrowRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingFlow;
