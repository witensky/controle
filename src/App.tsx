import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigation from './components/navigation/AppNavigation';
import QuickActionsFab from './components/navigation/QuickActionsFab';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AppReminderCenter from './components/common/AppReminderCenter';
import { AppDialogProvider } from './components/common/AppDialogProvider';
import { ThemeProvider } from './theme/ThemeProvider';
import DailyRoutineScheduler from './components/settings/DailyRoutineScheduler';
import StudyReminderScheduler from './components/studies/StudyReminderScheduler';
import { dispatchQuickAction, queueQuickAction, quickActionTargetView, QuickActionType } from './lib/quickActions';
import { offlineRepository } from './data/offlineRepository';
import AppRouter from './router/AppRouter';
import { AppView } from './types';
import { getViewFromLocation, syncLocationWithView } from './router/viewRouter';
import { isOnboardingRequired } from './features/profile/utils/onboarding';
import { persistCurrency } from './utils/currency';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const SWIPEABLE_VIEWS: AppView[] = ['FINANCE', 'DISCIPLINE', 'DASHBOARD', 'STUDIES', 'SETTINGS'];
const FAB_HIDDEN_VIEWS = new Set<AppView>(['DATA_CENTER', 'STUDIES', 'SETTINGS', 'ABOUT_APP']);
const SCREEN_SLIDE_VARIANTS: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 42 : direction < 0 ? -42 : 0,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -42 : direction < 0 ? 42 : 0,
  }),
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(() => getViewFromLocation());
  const [isAppReady, setIsAppReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [mobileUiOverride, setMobileUiOverride] = useState({ hideNav: false, hideFab: false });
  const [navDirection, setNavDirection] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const navVisibilityRef = useRef(true);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const showMobileNav = view !== 'DATA_CENTER' && !mobileUiOverride.hideNav;
  const showFab = !FAB_HIDDEN_VIEWS.has(view) && !mobileUiOverride.hideFab;
  const swipeViewIndex = useMemo(() => SWIPEABLE_VIEWS.indexOf(view), [view]);

  useEffect(() => {
    syncLocationWithView(getViewFromLocation(), true);

    const handleHashChange = () => {
      setView(getViewFromLocation());
      setIsNavVisible(true);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const mainDetails = mainRef.current;
    if (!mainDetails) return;

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return;

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const currentScrollY = mainDetails.scrollTop;
        const nextVisible = !(currentScrollY > lastScrollY.current && currentScrollY > 50);

        if (navVisibilityRef.current !== nextVisible) {
          navVisibilityRef.current = nextVisible;
          setIsNavVisible(nextVisible);
        }

        lastScrollY.current = currentScrollY;
        scrollRafRef.current = null;
      });
    };

    mainDetails.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mainDetails.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  useEffect(() => {
    let isMounted = true;

    offlineRepository.bootstrap()
      .then(async () => {
        const profile = await offlineRepository.profile.getProfile();
        if (isMounted) {
          persistCurrency(profile.settings_config?.finance?.currency);
          setNeedsOnboarding(isOnboardingRequired(profile));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAppReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUiOverride = (event: Event) => {
      const customEvent = event as CustomEvent<{ hideNav?: boolean; hideFab?: boolean }>;
      setMobileUiOverride({
        hideNav: Boolean(customEvent.detail?.hideNav),
        hideFab: Boolean(customEvent.detail?.hideFab),
      });
    };

    window.addEventListener('app:mobile-ui-override', handleUiOverride as EventListener);
    return () => window.removeEventListener('app:mobile-ui-override', handleUiOverride as EventListener);
  }, []);

  const handleNavigate = useCallback((nextView: AppView, options?: { replace?: boolean }) => {
    const currentIndex = SWIPEABLE_VIEWS.indexOf(view);
    const nextIndex = SWIPEABLE_VIEWS.indexOf(nextView);
    setNavDirection(currentIndex !== -1 && nextIndex !== -1 ? (nextIndex > currentIndex ? 1 : -1) : 0);
    setView(nextView);
    setIsNavVisible(true);
    navVisibilityRef.current = true;
    syncLocationWithView(nextView, options?.replace);
  }, [view]);

  const navigateBySwipe = useCallback((offset: -1 | 1) => {
    if (swipeViewIndex === -1) return;
    const nextView = SWIPEABLE_VIEWS[swipeViewIndex + offset];
    if (!nextView) return;
    handleNavigate(nextView);
  }, [handleNavigate, swipeViewIndex]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    if (swipeViewIndex === -1) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-disable-view-swipe="true"]')) return;

    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [swipeViewIndex]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLElement>) => {
    if (swipeViewIndex === -1 || !touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) {
      return;
    }

    navigateBySwipe(deltaX < 0 ? 1 : -1);
  }, [navigateBySwipe, swipeViewIndex]);

  const handleQuickAction = useCallback((action: QuickActionType) => {
    const targetView = quickActionTargetView[action];

    queueQuickAction(action);
    handleNavigate(targetView);

    window.setTimeout(() => {
      dispatchQuickAction(action);
    }, 0);
  }, [handleNavigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppDialogProvider>
          <DailyRoutineScheduler />
          <StudyReminderScheduler />
          <AppReminderCenter />
          {!isAppReady ? (
            <div className="flex h-screen items-center justify-center bg-[color:var(--background)]">
              <Loader2 className="animate-spin text-[color:var(--primary)]" size={40} />
            </div>
          ) : needsOnboarding ? (
            <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />
          ) : (
            <div className="app-shell relative flex min-h-[100dvh] flex-col bg-[color:var(--background)] font-outfit text-[color:var(--text)] md:flex-row">
              <AppNavigation
                view={view}
                onNavigate={handleNavigate}
                isNavVisible={showMobileNav && isNavVisible}
                showMobileUi={showMobileNav}
              />

              <main
                ref={mainRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`app-main relative min-h-0 flex-1 overflow-y-auto bg-[color:var(--background)] md:h-screen ${
                  showMobileNav || showFab ? 'pb-[calc(env(safe-area-inset-bottom)+6.5rem)] md:pb-0' : 'pb-0'
                }`}
              >
                <div
                  className={`mx-auto w-full max-w-7xl px-4 pb-4 pt-3 md:px-8 md:py-8 lg:px-10 ${
                    showMobileNav || showFab
                      ? 'pb-[calc(env(safe-area-inset-bottom)+7rem)] md:pb-10'
                      : 'pb-6 md:pb-10'
                  }`}
                >
                  <AnimatePresence mode="wait" custom={navDirection}>
                    <motion.div
                      key={view}
                      custom={navDirection}
                      variants={SCREEN_SLIDE_VARIANTS}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="motion-reduce:transform-none"
                    >
                      <AppRouter view={view} onNavigate={handleNavigate} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>

              {showFab ? <QuickActionsFab onAction={handleQuickAction} /> : null}
            </div>
          )}
        </AppDialogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
