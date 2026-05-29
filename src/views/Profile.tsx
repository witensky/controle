import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Award,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Edit3,
    Flame,
    Mail,
    MapPin,
    Phone,
    Settings as SettingsIcon,
    Shield,
    Target,
    Trophy,
    X,
    Zap,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineRepository } from '../data/offlineRepository';
import { useProfile, useUpdateProfile } from '../features/profile/hooks/useProfile';
import { resolveProfileRankTitle } from '../utils/profileRank';
import { cx, uiRecipes } from '../theme/recipes';
import { toneClassNames } from '../theme/tokens';
import ModalShell from '../components/common/ModalShell';

type ProfileView = {
    onNavigate: (view: any) => void;
};

const Profile: React.FC<ProfileView> = ({ onNavigate }) => {
    const { data: profile, isLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const queryClient = useQueryClient();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('fr-FR'));
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [contactSaveState, setContactSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const contactsReadyRef = useRef(false);

    const [editForm, setEditForm] = useState({
        username: '',
        location: '',
        motto: '',
        bio: '',
        avatar_url: '',
        studyDomain: '',
    });

    const [contactForm, setContactForm] = useState({
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!profile) return;

        setEditForm({
            username: profile.username || '',
            location: profile.location || '',
            motto: profile.motto || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || '',
            studyDomain: profile.settings_config?.study?.primaryDomain || '',
        });

        const nextContacts = {
            email: profile.settings_config?.contact?.email || 'user@lifestream.io',
            phone: profile.settings_config?.contact?.phone || '+212 6 XX XX XX XX',
        };

        setContactForm((previous) => (
            previous.email === nextContacts.email && previous.phone === nextContacts.phone
                ? previous
                : nextContacts
        ));

        contactsReadyRef.current = true;
    }, [profile]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!profile || !contactsReadyRef.current) return;

        const storedEmail = profile.settings_config?.contact?.email || 'user@lifestream.io';
        const storedPhone = profile.settings_config?.contact?.phone || '+212 6 XX XX XX XX';

        if (contactForm.email === storedEmail && contactForm.phone === storedPhone) {
            return;
        }

        setContactSaveState('saving');

        const timeout = window.setTimeout(async () => {
            try {
                await offlineRepository.profile.updateSettings({
                    contact: {
                        email: contactForm.email,
                        phone: contactForm.phone,
                    },
                });
                await queryClient.invalidateQueries({ queryKey: ['profile'] });
                setContactSaveState('saved');
                window.setTimeout(() => setContactSaveState('idle'), 1400);
            } catch (error) {
                console.error(error);
                setContactSaveState('error');
            }
        }, 650);

        return () => window.clearTimeout(timeout);
    }, [contactForm, profile, queryClient]);

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setEditForm((previous) => ({ ...previous, avatar_url: result }));
            setIsEditModalOpen(true);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleSave = async () => {
        try {
            await updateProfile.mutateAsync({
                username: editForm.username,
                location: editForm.location,
                motto: editForm.motto,
                bio: editForm.bio,
                avatar_url: editForm.avatar_url,
            });
            await offlineRepository.profile.updateSettings({
                study: {
                    ...(profile?.settings_config?.study || {}),
                    primaryDomain: editForm.studyDomain.trim(),
                },
            });
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleShare = () => {
        const text = `Resume: ${profile?.username} | Niveau ${Math.floor((profile?.total_xp || 0) / 1000) + 1} | Rang: ${resolveProfileRankTitle(profile?.total_xp || 0)}`;
        navigator.clipboard.writeText(text);
        setShowCopySuccess(true);
        window.setTimeout(() => setShowCopySuccess(false), 2000);
    };

    const previewAvatar = editForm.avatar_url || profile?.avatar_url || '';
    const studyDomain = profile?.settings_config?.study?.primaryDomain || 'Domaine non defini';
    const currentXP = profile?.total_xp || 0;
    const currentLevel = Math.floor(currentXP / 1000) + 1;
    const currentRankTitle = resolveProfileRankTitle(currentXP);
    const nextLevelXP = currentLevel * 1000;
    const progress = ((currentXP % 1000) / 1000) * 100;

    const profileStats = useMemo(
        () => [
            { label: 'Discipline', value: '88%', icon: Target, tone: toneClassNames.warning, view: 'DISCIPLINE' },
            { label: 'Finances', value: '92%', icon: Zap, tone: toneClassNames.success, view: 'FINANCE' },
            { label: 'Savoir', value: '74%', icon: Award, tone: toneClassNames.info, view: 'STUDIES' },
            { label: 'Serie', value: '24J', icon: Flame, tone: toneClassNames.danger, view: 'REPORTS' },
        ],
        [],
    );

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--tone-warning-border)] border-t-[color:var(--warning)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-3 pb-24 animate-in fade-in duration-700 md:pt-0">
            <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
            />

            <div className={cx(uiRecipes.cardElevated, 'relative overflow-hidden rounded-[2.25rem] p-5 md:rounded-[2.5rem] md:p-10')}>
                <div className="pointer-events-none absolute right-0 top-0 p-10 text-[color:var(--warning)] opacity-[0.05]">
                    <Shield size={220} />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                    <div className="relative shrink-0">
                        <div className="flex h-28 w-28 rotate-3 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-[color:var(--surface)] bg-[color:var(--accent)] text-4xl font-black text-[#18212d] shadow-premium transition-all duration-500 md:h-36 md:w-36 md:text-6xl">
                            {previewAvatar ? (
                                <img src={previewAvatar} alt="Profil" className="h-full w-full object-cover" />
                            ) : (
                                profile?.username?.charAt(0) || 'U'
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className={cx(uiRecipes.secondaryButton, 'absolute -bottom-2 -right-2 rounded-2xl p-3 text-[#18212d] hover:scale-110 active:scale-95')}
                            aria-label="Choisir une photo"
                        >
                            <Camera size={18} />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="mb-4">
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-[color:var(--heading)] italic md:text-5xl">
                                {profile?.username || 'UTILISATEUR'}
                            </h1>
                        </div>

                        <p className="font-mono text-sm italic text-[color:var(--tone-warning-text)]">
                            "{profile?.motto || 'Discipline, clarte, constance.'}"
                        </p>

                        <div className="mt-5 flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)] md:justify-start">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-[color:var(--tone-warning-text)]" />
                                {profile?.location || 'Casablanca, MA'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={14} className="text-[color:var(--tone-warning-text)]" />
                                {studyDomain}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-[color:var(--tone-warning-text)]" />
                                Membre depuis {new Date(profile?.created_at || Date.now()).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className={cx(uiRecipes.primaryButton, 'flex items-center gap-2 rounded-2xl px-6 py-4')}
                            >
                                <Edit3 size={16} />
                                Editer profil
                            </button>
                            <button
                                onClick={handleShare}
                                className={cx(uiRecipes.secondaryButton, 'relative rounded-2xl px-6 py-4')}
                            >
                                {showCopySuccess ? <CheckCircle2 size={16} className="mx-auto text-[color:var(--success)]" /> : 'Partager'}
                                {showCopySuccess ? (
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--success)] px-3 py-1 text-[8px] font-black text-[#18212d]">
                                        Copie
                                    </span>
                                ) : null}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className={cx(uiRecipes.cardElevated, 'rounded-[2.25rem] p-6 md:rounded-[2.5rem] md:p-8')}>
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-[color:var(--tone-warning-text)]">Mon profil</p>
                                <div className="flex flex-wrap items-baseline gap-3">
                                    <h3 className="text-3xl font-black text-[color:var(--heading)]">{currentRankTitle}</h3>
                                    <span className="text-sm font-black uppercase italic text-[color:var(--tone-warning-text)]">Lv.{currentLevel}</span>
                                </div>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">{currentXP} XP actifs</p>
                            </div>
                            <div className="shrink-0">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-soft md:h-20 md:w-20">
                                    {previewAvatar ? (
                                        <img src={previewAvatar} alt="Profil" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-black uppercase text-[color:var(--heading)] md:text-2xl">
                                            {profile?.username?.charAt(0) || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative h-4 w-full overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 shadow-inner">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent)] shadow-[0_0_15px_rgba(220,156,45,0.25)] transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="mt-4 flex justify-between text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">
                            <span>{currentLevel * 1000 - 1000} XP</span>
                            <span>{1000 - (currentXP % 1000)} XP restants</span>
                            <span>{nextLevelXP} XP</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {profileStats.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => onNavigate(item.view as any)}
                                className={cx(uiRecipes.card, 'flex min-h-[148px] flex-col items-center justify-center gap-3 rounded-[2rem] p-5 text-center shadow-soft transition-all hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] active:scale-95')}
                            >
                                <div className={cx('flex h-12 w-12 items-center justify-center rounded-2xl shadow-soft', item.tone.shell, item.tone.icon)}>
                                    <item.icon size={22} />
                                </div>
                                <div>
                                    <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">{item.label}</p>
                                    <h4 className={cx('text-xl font-black italic', item.tone.text)}>{item.value}</h4>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className={cx(uiRecipes.cardElevated, 'rounded-[2.25rem] p-6 md:rounded-[2.5rem] md:p-7')}>
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.32em] italic text-[color:var(--heading)]">Heure locale</h3>
                            <Clock size={16} className="text-[color:var(--tone-warning-text)]" />
                        </div>
                        <div className="mb-3 text-center text-4xl font-black italic tracking-tighter text-[color:var(--heading)] md:text-5xl">
                            {currentTime}
                        </div>
                        <div className="flex items-center justify-center gap-4 text-[8px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">
                            <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-[color:var(--success)]" /> Latence 14ms</span>
                            <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-[color:var(--success)]" /> Version 1.2.0</span>
                        </div>
                    </div>

                    <div className={cx(uiRecipes.cardElevated, 'rounded-[2.25rem] p-6 md:rounded-[2.5rem] md:p-7')}>
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.32em] italic text-slate-900 dark:text-white">Coordonnees</h3>
                                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">Enregistrement auto</p>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${
                                contactSaveState === 'saving'
                                    ? 'text-amber-500'
                                    : contactSaveState === 'saved'
                                        ? 'text-emerald-500'
                                        : contactSaveState === 'error'
                                            ? 'text-rose-500'
                                            : 'text-slate-500 dark:text-slate-600'
                            }`}>
                                {contactSaveState === 'saving' ? 'Sauvegarde...' : contactSaveState === 'saved' ? 'Enregistre' : contactSaveState === 'error' ? 'Erreur' : 'Local'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-slate-950/40 dark:shadow-none">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-xl bg-white p-3 text-slate-500 shadow-sm dark:bg-slate-900">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">Email personnel</p>
                                        <input
                                            type="email"
                                            value={contactForm.email}
                                            onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                                            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-700"
                                            placeholder="email@exemple.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] dark:border-white/5 dark:bg-slate-950/40 dark:shadow-none">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-xl bg-white p-3 text-slate-500 shadow-sm dark:bg-slate-900">
                                        <Phone size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">Telephone</p>
                                        <input
                                            type="text"
                                            value={contactForm.phone}
                                            onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })}
                                            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-700"
                                            placeholder="+212 6 00 00 00 00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigate('SETTINGS')}
                        className="group flex w-full items-center justify-center gap-4 rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.03] py-5 text-xs font-black uppercase tracking-[0.3em] text-amber-500 shadow-2xl shadow-amber-500/10 transition-all hover:bg-amber-500 hover:text-slate-950"
                    >
                        <SettingsIcon size={20} className="transition-transform group-hover:rotate-12" />
                        Reglages
                    </button>
                </div>
            </div>

            <ModalShell
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Modifier le profil"
                subtitle="Détails"
                icon={<Edit3 size={20} className="text-amber-500" />}
                maxWidthClassName="max-w-xl"
                centered
                footer={
                    <div className="flex flex-col-reverse gap-3 w-full md:flex-row">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 rounded-2xl py-4 text-[10px] font-black uppercase text-slate-500 transition-all hover:text-white"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={updateProfile.isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
                        >
                            {updateProfile.isPending ? 'Sauvegarde locale...' : 'Enregistrer'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <div className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-white/5 bg-slate-950/50 p-5 text-center">
                        <div className="h-24 w-24 overflow-hidden rounded-[1.6rem] border-4 border-slate-950 bg-amber-500 text-3xl font-black text-slate-950 shadow-2xl shadow-amber-500/20">
                            {previewAvatar ? (
                                <img src={previewAvatar} alt="Apercu profil" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    {editForm.username?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Photo de profil</p>
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-950 transition-all hover:bg-slate-200"
                            >
                                <Camera size={15} />
                                Choisir une image
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identifiant</label>
                            <input
                                type="text"
                                value={editForm.username}
                                onChange={(event) => setEditForm({ ...editForm, username: event.target.value })}
                                className="w-full rounded-2xl border border-white/5 bg-slate-950 p-4 text-white font-bold outline-none transition-all focus:border-amber-500/50 shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Localisation</label>
                            <input
                                type="text"
                                value={editForm.location}
                                onChange={(event) => setEditForm({ ...editForm, location: event.target.value })}
                                className="w-full rounded-2xl border border-white/5 bg-slate-950 p-4 text-white font-bold outline-none transition-all focus:border-amber-500/50 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Domaine d'etude</label>
                        <input
                            type="text"
                            value={editForm.studyDomain}
                            onChange={(event) => setEditForm({ ...editForm, studyDomain: event.target.value })}
                            placeholder="Ex: Marketing digital"
                            className="w-full rounded-2xl border border-white/5 bg-slate-950 p-4 text-white font-bold outline-none transition-all focus:border-amber-500/50 shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Devise personnelle</label>
                        <input
                            type="text"
                            value={editForm.motto}
                            onChange={(event) => setEditForm({ ...editForm, motto: event.target.value })}
                            className="w-full rounded-2xl border border-white/5 bg-slate-950 p-4 text-white font-bold outline-none transition-all focus:border-amber-500/50 shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resume biographique</label>
                        <textarea
                            value={editForm.bio}
                            onChange={(event) => setEditForm({ ...editForm, bio: event.target.value })}
                            rows={4}
                            className="w-full resize-none rounded-2xl border border-white/5 bg-slate-950 p-4 text-white font-bold outline-none transition-all focus:border-amber-500/50 shadow-inner"
                        />
                    </div>
                </div>
            </ModalShell>
        </div>
    );
};

export default Profile;
