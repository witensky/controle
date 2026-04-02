import { AppView } from '../types';

export const DEFAULT_APP_VIEW: AppView = 'DASHBOARD';

const VIEW_ROUTE_MAP: Record<AppView, string> = {
  DASHBOARD: '/dashboard',
  FINANCE: '/finance',
  DISCIPLINE: '/discipline',
  STUDIES: '/studies',
  LANGUAGES: '/languages',
  BIBLE: '/bible',
  SPORT: '/sport',
  SETTINGS: '/settings',
  DATA_CENTER: '/data-center',
  REPORTS: '/reports',
  PROFILE: '/profile',
  ABOUT_APP: '/about-app',
};

const ROUTE_VIEW_MAP = Object.entries(VIEW_ROUTE_MAP).reduce<Record<string, AppView>>((acc, [view, route]) => {
  acc[route] = view as AppView;
  return acc;
}, {});

const normalizeRoute = (rawRoute: string) => {
  const trimmed = rawRoute.trim();
  if (!trimmed || trimmed === '#') return VIEW_ROUTE_MAP[DEFAULT_APP_VIEW];

  const routeWithoutHash = trimmed.replace(/^#/, '');
  const routeWithoutQuery = routeWithoutHash.split('?')[0].split('&')[0];
  const normalized = routeWithoutQuery.startsWith('/') ? routeWithoutQuery : `/${routeWithoutQuery}`;

  return normalized === '/' ? VIEW_ROUTE_MAP[DEFAULT_APP_VIEW] : normalized;
};

export const getRouteForView = (view: AppView) => VIEW_ROUTE_MAP[view] || VIEW_ROUTE_MAP[DEFAULT_APP_VIEW];

export const getViewFromLocation = (location: Location = window.location): AppView => {
  const route = normalizeRoute(location.hash || location.pathname || '');
  return ROUTE_VIEW_MAP[route] || DEFAULT_APP_VIEW;
};

export const syncLocationWithView = (view: AppView, replace = false) => {
  const nextHash = `#${getRouteForView(view)}`;
  const currentHash = window.location.hash || `#${normalizeRoute(window.location.pathname)}`;

  if (currentHash === nextHash) {
    if (!window.location.hash && replace) {
      window.history.replaceState({ view }, '', nextHash);
    }
    return;
  }

  if (replace) {
    window.history.replaceState({ view }, '', nextHash);
    return;
  }

  window.history.pushState({ view }, '', nextHash);
};

export const navigateBackWithFallback = (fallbackView: AppView = DEFAULT_APP_VIEW) => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  syncLocationWithView(fallbackView, true);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};
