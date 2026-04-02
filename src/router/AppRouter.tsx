import React, { Suspense, lazy, memo } from 'react';
import { AppView } from '../types';
import Dashboard from '../views/Dashboard';

const Finance = lazy(() => import('../views/Finance'));
const Discipline = lazy(() => import('../views/Discipline'));
const Studies = lazy(() => import('../views/Studies'));
const LanguagesView = lazy(() => import('../views/LanguagesView'));
const Bible = lazy(() => import('../views/Bible'));
const Sport = lazy(() => import('../views/Sport'));
const Settings = lazy(() => import('../views/Settings'));
const DataCenter = lazy(() => import('../views/DataCenter'));
const Reports = lazy(() => import('../views/Reports'));
const Profile = lazy(() => import('../views/Profile'));
const AboutApp = lazy(() => import('../views/AboutApp'));

interface AppRouterProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

const AppRouter: React.FC<AppRouterProps> = ({ view, onNavigate }) => {
  if (view === 'DASHBOARD') {
    return <Dashboard onNavigate={onNavigate} />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="ui-card-elevated flex min-w-[14rem] flex-col items-center gap-3 rounded-[1.75rem] px-6 py-7">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[color:var(--tone-warning-border)] border-t-[color:var(--accent)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              Chargement
            </p>
          </div>
        </div>
      }
    >
      {view === 'FINANCE' ? <Finance /> : null}
      {view === 'DISCIPLINE' ? <Discipline /> : null}
      {view === 'STUDIES' ? <Studies /> : null}
      {view === 'SPORT' ? <Sport /> : null}
      {view === 'LANGUAGES' ? <LanguagesView /> : null}
      {view === 'BIBLE' ? <Bible /> : null}
      {view === 'SETTINGS' ? <Settings onNavigate={onNavigate} /> : null}
      {view === 'DATA_CENTER' ? <DataCenter onNavigate={onNavigate} /> : null}
      {view === 'REPORTS' ? <Reports /> : null}
      {view === 'PROFILE' ? <Profile onNavigate={onNavigate} /> : null}
      {view === 'ABOUT_APP' ? <AboutApp /> : null}
    </Suspense>
  );
};

export default memo(AppRouter);
