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
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineRepository } from '../../data/offlineRepository';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { cx, uiRecipes } from '../../theme/recipes';
import { toneClassNames } from '../../theme/tokens';
import { DEFAULT_CURRENCY, persistCurrency, resolveCurrency, SUPPORTED_CURRENCIES, type SupportedCurrencyCode } from '../../utils/currency';

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
    eyebrow: '',
    title: 'Qui utilise Myflow ?',
    subtitle: 'On commence par les informations de base pour personnaliser le profil.',
  },
  {
    id: 'contact',
    eyebrow: 'Contact',
    title: 'Reste joignable',
    subtitle: 'Ces donnees serviront aux rapports, exports et rappels utiles.',
  },
  {
    id: 'finance',
    eyebrow: 'Finance',
    title: 'Initialise ton solde',
    subtitle: 'Le budget de depart alimente les modules finances, quota et projections.',
  },
  {
    id: 'studies',
    eyebrow: 'Etudes',
    title: 'Definis ton contexte',
    subtitle: "Le domaine d'etude et l'objectif principal rendent les analyses plus pertinentes.",
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
  if (value == null || Number.isNaN(Number(value)) || Number(value) <= 0) {
    return '';
  }

  return String(value);
};

const inputClassName = cx(uiRecipes.field, 'rounded-[1.35rem] px-4 py-4');

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

    setForm((previous) => ({
      ...previous,
      fullName: previous.fullName || normalizeOnboardingValue(profile.username, DEFAULT_ONBOARDING_NAMES),
      email: previous.email || normalizeOnboardingValue(profile.settings_config?.contact?.email, DEFAULT_ONBOARDING_EMAILS),
      phone: previous.phone || normalizeOnboardingValue(profile.settings_config?.contact?.phone, DEFAULT_ONBOARDING_PHONES),
      location: previous.location || normalizeOnboardingValue(profile.location, DEFAULT_ONBOARDING_LOCATIONS),
      currency:
        previous.currency !== DEFAULT_CURRENCY || !profile.settings_config?.finance?.currency
          ? previous.currency
          : resolveCurrency(profile.settings_config?.finance?.currency),
      currentBalance: previous.currentBalance || normalizePositiveNumberInput(profile.amci_monthly_amount),
      dailyQuota: previous.dailyQuota || normalizePositiveNumberInput(profile.settings_config?.daily_quota_override),
      studyDomain: previous.studyDomain || profile.settings_config?.study?.primaryDomain || '',
      studyLevel: previous.studyLevel || profile.settings_config?.study?.level || '',
      institution: previous.institution || profile.settings_config?.study?.institution || '',
      mainGoal: previous.mainGoal || normalizeOnboardingValue(profile.bio, DEFAULT_ONBOARDING_BIOS),
    }));
  }, [profile]);

  const completionRatio = ((currentStep + 1) / SLIDES.length) * 100;

  const isCurrentStepValid = useMemo(() => {
    switch (SLIDES[currentStep].id) {
      case 'identity':
        return Boolean(form.fullName.trim());
      case 'contact':
        return Boolean(form.email.trim()) && Boolean(form.phone.trim());
      case 'finance':
        return form.currentBalance.trim() !== '';
      case 'studies':
        return Boolean(form.studyDomain.trim()) && Boolean(form.mainGoal.trim());
      default:
        return true;
    }
  }, [currentStep, form]);

  const handleFieldChange = <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

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
        contact: {
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        onboarding: {
          completed: true,
          completed_at: new Date().toISOString(),
        },
        finance: {
          currency: resolveCurrency(form.currency),
          currentBalance: normalizedBudget,
        },
        daily_quota_override: normalizedDailyQuota,
        study: {
          primaryDomain: form.studyDomain.trim(),
          level: form.studyLevel.trim(),
          institution: form.institution.trim(),
        },
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

  return (
    <div className="min-h-[100dvh] bg-[color:var(--background)] text-[color:var(--text)]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-between px-5 py-6 sm:px-6">
        <div>
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--tone-primary-text)]">Bienvenue</p>
                <h1 className="mt-2 font-outfit text-[2rem] font-black uppercase italic tracking-[-0.06em] text-[color:var(--heading)]">
                  Configuration initiale
                </h1>
              </div>
              <div className={cx(uiRecipes.chip, 'px-3 py-1.5')}>
                {currentStep + 1}/{SLIDES.length}
              </div>
            </div>

            <div className="h-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-0.5">
              <div className="h-full rounded-full bg-[color:var(--primary)] transition-all duration-500" style={{ width: `${completionRatio}%` }} />
            </div>
          </div>

          <div className={cx(uiRecipes.panel, 'rounded-[2rem] p-5')}>
            {SLIDES[currentStep].eyebrow ? (
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                {SLIDES[currentStep].eyebrow}
              </p>
            ) : null}
            <h2 className={`font-outfit text-[1.9rem] font-black uppercase italic leading-[0.92] tracking-[-0.05em] text-[color:var(--heading)] ${SLIDES[currentStep].eyebrow ? 'mt-3' : ''}`}>
              {SLIDES[currentStep].title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">{SLIDES[currentStep].subtitle}</p>

            <div className="mt-6 space-y-4">
              {SLIDES[currentStep].id === 'identity' ? (
                <>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      <User2 size={12} /> Nom complet
                    </span>
                    <input
                      value={form.fullName}
                      onChange={(event) => handleFieldChange('fullName', event.target.value)}
                      placeholder="Ex: Ahmed Benali"
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      <MapPin size={12} /> Ville / localisation
                    </span>
                    <input
                      value={form.location}
                      onChange={(event) => handleFieldChange('location', event.target.value)}
                      placeholder="Ex: Casablanca, Maroc"
                      className={inputClassName}
                    />
                  </label>
                </>
              ) : null}

              {SLIDES[currentStep].id === 'contact' ? (
                <>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      <Mail size={12} /> Email
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => handleFieldChange('email', event.target.value)}
                      placeholder="nom@exemple.com"
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      <Phone size={12} /> Telephone
                    </span>
                    <input
                      value={form.phone}
                      onChange={(event) => handleFieldChange('phone', event.target.value)}
                      placeholder="+212 6 00 00 00 00"
                      className={inputClassName}
                    />
                  </label>
                </>
              ) : null}

              {SLIDES[currentStep].id === 'finance' ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                        <BadgeDollarSign size={12} /> Devise principale
                      </span>
                      <select
                        value={form.currency}
                        onChange={(event) => handleFieldChange('currency', resolveCurrency(event.target.value))}
                        className={inputClassName}
                      >
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.label} ({currency.description})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                        <BadgeDollarSign size={12} /> Solde actuel / budget de depart
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={form.currentBalance}
                        onChange={(event) => handleFieldChange('currentBalance', event.target.value)}
                        placeholder={`Ex: 3500 ${form.currency === 'FRANC' ? 'Franc' : form.currency}`}
                        className={inputClassName}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                        <BadgeDollarSign size={12} /> Limite de depense journaliere
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={form.dailyQuota}
                        onChange={(event) => handleFieldChange('dailyQuota', event.target.value)}
                        placeholder={`Ex: 150 ${form.currency === 'FRANC' ? 'Franc' : form.currency}`}
                        className={inputClassName}
                      />
                    </label>
                  </div>

                  <div className={cx('rounded-[1.35rem] border p-4', toneClassNames.success.shell)}>
                    <p className={cx('text-[10px] font-black uppercase tracking-[0.22em]', toneClassNames.success.text)}>Impact app</p>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                      Le solde et la limite journaliere alimentent les quotas, projections, burn rate et toutes les analyses budgetaires.
                    </p>
                  </div>
                </>
              ) : null}

              {SLIDES[currentStep].id === 'studies' ? (
                <>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      <GraduationCap size={12} /> Domaine d'etude principal
                    </span>
                    <input
                      value={form.studyDomain}
                      onChange={(event) => handleFieldChange('studyDomain', event.target.value)}
                      placeholder="Ex: Marketing digital"
                      className={inputClassName}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                        <Briefcase size={12} /> Niveau
                      </span>
                      <input
                        value={form.studyLevel}
                        onChange={(event) => handleFieldChange('studyLevel', event.target.value)}
                        placeholder="Ex: Licence 3"
                        className={inputClassName}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                        <GraduationCap size={12} /> Etablissement
                      </span>
                      <input
                        value={form.institution}
                        onChange={(event) => handleFieldChange('institution', event.target.value)}
                        placeholder="Ex: FSJES"
                        className={inputClassName}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                      <GraduationCap size={12} /> Objectif principal
                    </span>
                    <textarea
                      value={form.mainGoal}
                      onChange={(event) => handleFieldChange('mainGoal', event.target.value)}
                      rows={4}
                      placeholder="Ex: Structurer mes objectifs, suivre mes finances et avancer sur mes etudes chaque semaine."
                      className={`${inputClassName} resize-none`}
                    />
                  </label>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-center gap-2">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                className={`h-2.5 rounded-full transition-all ${index === currentStep ? 'w-10 bg-[color:var(--primary)]' : index < currentStep ? 'w-6 bg-[color:var(--tone-primary-border)]' : 'w-2.5 bg-[color:var(--muted)]'}`}
                aria-label={`Etape ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep((previous) => Math.max(0, previous - 1))}
              disabled={currentStep === 0 || isSaving}
              className={cx(uiRecipes.ghostButton, 'h-14 w-14 rounded-[1.25rem] px-0 py-0')}
            >
              <ArrowLeft size={18} />
            </button>

            {currentStep === SLIDES.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isCurrentStepValid || isSaving}
                className={cx(uiRecipes.primaryButton, 'flex-1 rounded-[1.35rem] px-5 py-4')}
              >
                {isSaving ? 'Configuration...' : 'Terminer'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((previous) => Math.min(SLIDES.length - 1, previous + 1))}
                disabled={!isCurrentStepValid}
                className={cx(uiRecipes.secondaryButton, 'flex flex-1 items-center justify-center gap-2 rounded-[1.35rem] px-5 py-4')}
              >
                Continuer <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
