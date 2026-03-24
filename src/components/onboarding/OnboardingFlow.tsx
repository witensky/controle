import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeDollarSign, Briefcase, GraduationCap, Mail, MapPin, Phone, User2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineRepository } from '../../data/offlineRepository';
import { useProfile } from '../../features/profile/hooks/useProfile';

type OnboardingFlowProps = {
  onComplete: () => void;
};

type OnboardingForm = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentBalance: string;
  dailyQuota: string;
  studyDomain: string;
  studyLevel: string;
  institution: string;
  mainGoal: string;
};

const SLIDES = [
  { id: 'identity', eyebrow: 'Identite', title: 'Qui utilise Myflow ?', subtitle: 'On commence par les informations de base pour personnaliser le profil.' },
  { id: 'contact', eyebrow: 'Contact', title: 'Reste joignable', subtitle: 'Ces donnees serviront aux rapports, exports et rappels utiles.' },
  { id: 'finance', eyebrow: 'Finance', title: 'Initialise ton solde', subtitle: 'Le budget de depart alimente les modules finances, quota et projections.' },
  { id: 'studies', eyebrow: 'Etudes', title: 'Definis ton contexte', subtitle: 'Le domaine d etude et l objectif principal rendent les analyses plus pertinentes.' },
] as const;

const inputClassName =
  'w-full rounded-[1.35rem] border border-white/10 bg-slate-950/70 px-4 py-4 text-sm font-semibold text-white outline-none transition-all placeholder:text-slate-600 focus:border-amber-500';

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
      fullName: previous.fullName || profile.username || '',
      email: previous.email || profile.settings_config?.contact?.email || '',
      phone: previous.phone || profile.settings_config?.contact?.phone || '',
      location: previous.location || profile.location || '',
      currentBalance: previous.currentBalance || String(profile.amci_monthly_amount ?? ''),
      dailyQuota: previous.dailyQuota || (profile.settings_config?.daily_quota_override != null ? String(profile.settings_config.daily_quota_override) : ''),
      studyDomain: previous.studyDomain || profile.settings_config?.study?.primaryDomain || '',
      studyLevel: previous.studyLevel || profile.settings_config?.study?.level || '',
      institution: previous.institution || profile.settings_config?.study?.institution || '',
      mainGoal: previous.mainGoal || profile.bio || '',
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
          currentBalance: normalizedBudget,
        },
        daily_quota_override: normalizedDailyQuota,
        study: {
          primaryDomain: form.studyDomain.trim(),
          level: form.studyLevel.trim(),
          institution: form.institution.trim(),
        },
      });

      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-between px-5 py-6 sm:px-6">
        <div>
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-500">Bienvenue</p>
                <h1 className="mt-2 text-[2rem] font-black uppercase italic tracking-[-0.06em] text-white font-outfit">Configuration initiale</h1>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                {currentStep + 1}/{SLIDES.length}
              </div>
            </div>

            <div className="h-2 rounded-full border border-white/5 bg-slate-950/70 p-0.5">
              <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${completionRatio}%` }} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">{SLIDES[currentStep].eyebrow}</p>
            <h2 className="mt-3 text-[1.9rem] font-black uppercase italic leading-[0.92] tracking-[-0.05em] text-white font-outfit">
              {SLIDES[currentStep].title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{SLIDES[currentStep].subtitle}</p>

            <div className="mt-6 space-y-4">
              {SLIDES[currentStep].id === 'identity' ? (
                <>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                        <BadgeDollarSign size={12} /> Solde actuel / budget de depart
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={form.currentBalance}
                        onChange={(event) => handleFieldChange('currentBalance', event.target.value)}
                        placeholder="Ex: 3500"
                        className={inputClassName}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                        <BadgeDollarSign size={12} /> Limite de depense journaliere
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={form.dailyQuota}
                        onChange={(event) => handleFieldChange('dailyQuota', event.target.value)}
                        placeholder="Ex: 150"
                        className={inputClassName}
                      />
                    </label>
                  </div>

                  <div className="rounded-[1.35rem] border border-emerald-500/15 bg-emerald-500/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Impact app</p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
                      Le solde et la limite journaliere alimentent les quotas, projections, burn rate et toutes les analyses budgetaires.
                    </p>
                  </div>
                </>
              ) : null}

              {SLIDES[currentStep].id === 'studies' ? (
                <>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                      <GraduationCap size={12} /> Domaine d etude principal
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
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
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
                className={`h-2.5 rounded-full transition-all ${index === currentStep ? 'w-10 bg-amber-500' : index < currentStep ? 'w-6 bg-amber-500/60' : 'w-2.5 bg-white/10'}`}
                aria-label={`Etape ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep((previous) => Math.max(0, previous - 1))}
              disabled={currentStep === 0 || isSaving}
              className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 text-white transition-all hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={18} />
            </button>

            {currentStep === SLIDES.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isCurrentStepValid || isSaving}
                className="flex-1 rounded-[1.35rem] bg-amber-500 px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-950 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Configuration...' : 'Terminer'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((previous) => Math.min(SLIDES.length - 1, previous + 1))}
                disabled={!isCurrentStepValid}
                className="flex flex-1 items-center justify-center gap-2 rounded-[1.35rem] bg-white px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-950 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
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
