import React, { useState } from 'react';
import {
  ArrowLeft,
  Cpu,
  Download,
  HeartHandshake,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { APP_LINK_LABELS, APP_LINKS } from '../config/appLinks';
import { navigateBackWithFallback } from '../router/viewRouter';
import { cx, uiRecipes } from '../theme/recipes';
import { toneClassNames } from '../theme/tokens';

const APP_NAME = 'MyFlow';

const pillars = [
  {
    title: 'Pilotage quotidien',
    description:
      "Une interface unique pour suivre tes finances, tes etudes, tes objectifs et tes routines sans changer d'ecran.",
    icon: Cpu,
    tone: toneClassNames.info,
  },
  {
    title: 'Mobile d’abord',
    description:
      'Pensee pour un usage rapide, lisible et tactile sur telephone, avec une navigation fluide et des cartes compactes.',
    icon: Smartphone,
    tone: toneClassNames.warning,
  },
  {
    title: 'Confidentialite locale',
    description:
      'Tes donnees restent gerees localement dans l’application afin de garder un controle simple et direct sur ton espace.',
    icon: Shield,
    tone: toneClassNames.success,
  },
];

const AboutApp: React.FC = () => {
  const [isDownloadStarting, setIsDownloadStarting] = useState(false);

  const handleDownloadClick = () => {
    setIsDownloadStarting(true);
    window.open(APP_LINKS.apk, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => setIsDownloadStarting(false), 1800);
  };

  return (
    <div className="animate-in fade-in space-y-8 pb-28 duration-500">
      <div className="relative border-b border-[color:var(--border)] pb-8 pt-1">
        <button
          onClick={() => navigateBackWithFallback('SETTINGS')}
          aria-label="Retour reglages"
          className={cx(uiRecipes.actionIcon, 'absolute left-0 top-0')}
        >
          <ArrowLeft size={16} />
        </button>

        <div className="mx-auto flex max-w-3xl flex-col items-center px-10 text-center md:px-0">
          <div
            className={cx(
              'mb-3 flex h-12 w-12 items-center justify-center rounded-2xl',
              toneClassNames.warning.shell,
              toneClassNames.warning.icon,
            )}
          >
            <Sparkles size={18} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
            A propos de l&apos;application
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase italic tracking-tight text-[color:var(--heading)] md:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)] md:text-base">
            Un espace personnel pour organiser tes journees, clarifier tes priorites et suivre tes progres avec une
            interface coherente en light et dark mode.
          </p>
        </div>
      </div>

      <div className={cx(uiRecipes.cardElevated, 'overflow-hidden rounded-[2rem] p-6 md:rounded-[2.5rem] md:p-8')}>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className={cx(uiRecipes.card, 'rounded-[1.5rem] p-5')}>
              <div
                className={cx(
                  'flex h-11 w-11 items-center justify-center rounded-2xl',
                  pillar.tone.shell,
                  pillar.tone.icon,
                )}
              >
                <pillar.icon size={18} />
              </div>
              <h2 className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--heading)]">
                {pillar.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <div className={cx(uiRecipes.sectionCard, 'rounded-[2rem] p-6 md:p-7')}>
          <div className="flex items-center gap-3">
            <div
              className={cx(
                'flex h-11 w-11 items-center justify-center rounded-2xl',
                toneClassNames.info.shell,
                toneClassNames.info.icon,
              )}
            >
              <HeartHandshake size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
                Vision
              </p>
              <h2 className="mt-1 text-xl font-black italic text-[color:var(--heading)]">
                Une app de pilotage personnelle simple et solide
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-secondary)]">
            L’objectif de l’app est de rassembler dans un seul environnement les fonctions cles du quotidien : suivi
            budgetaire, objectifs, discipline, etudes et routines. Le tout avec une experience mobile propre, rapide
            et agreable.
          </p>
        </div>

        <div className={cx(uiRecipes.card, 'rounded-[2rem] p-6 md:p-7')}>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
            Informations
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Version
              </p>
              <p className="mt-1 text-base font-black text-[color:var(--heading)]">3.2</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Mode</p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--text-secondary)]">
                Application locale et themable
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Navigation
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--text-secondary)]">
                Accessible depuis les reglages
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadClick}
              className={cx(
                uiRecipes.primaryButton,
                'mt-2 flex w-full items-center justify-center gap-2 rounded-[1.1rem] px-4 py-3',
              )}
            >
              <Download size={16} />
              {isDownloadStarting ? 'Téléchargement en cours...' : APP_LINK_LABELS.apk}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;
