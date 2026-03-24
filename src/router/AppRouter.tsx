import React from 'react';
import { AppView } from '../types';
import Dashboard from '../views/Dashboard';
import Finance from '../views/Finance';
import Discipline from '../views/Discipline';
import Studies from '../views/Studies';
import LanguagesView from '../views/LanguagesView';
import Bible from '../views/Bible';
import Sport from '../views/Sport';
import Settings from '../views/Settings';
import DataCenter from '../views/DataCenter';
import Reports from '../views/Reports';
import Profile from '../views/Profile';

interface AppRouterProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

const AppRouter: React.FC<AppRouterProps> = ({ view, onNavigate }) => {
  switch (view) {
    case 'DASHBOARD':
      return <Dashboard onNavigate={onNavigate} />;
    case 'FINANCE':
      return <Finance />;
    case 'DISCIPLINE':
      return <Discipline />;
    case 'STUDIES':
      return <Studies />;
    case 'SPORT':
      return <Sport />;
    case 'LANGUAGES':
      return <LanguagesView />;
    case 'BIBLE':
      return <Bible />;
    case 'SETTINGS':
      return <Settings onNavigate={onNavigate} />;
    case 'DATA_CENTER':
      return <DataCenter onNavigate={onNavigate} />;
    case 'REPORTS':
      return <Reports />;
    case 'PROFILE':
      return <Profile onNavigate={onNavigate} />;
    default:
      return <Dashboard onNavigate={onNavigate} />;
  }
};

export default AppRouter;
