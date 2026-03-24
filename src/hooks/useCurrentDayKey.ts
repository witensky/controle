import { useEffect, useState } from 'react';

const formatLocalDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useCurrentDayKey = () => {
  const [dayKey, setDayKey] = useState(() => formatLocalDayKey(new Date()));

  useEffect(() => {
    let timerId: number | undefined;

    const refreshDayKey = () => {
      setDayKey(formatLocalDayKey(new Date()));
    };

    const scheduleNextRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = Math.max(1000, nextMidnight.getTime() - now.getTime() + 250);

      timerId = window.setTimeout(() => {
        refreshDayKey();
        scheduleNextRefresh();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshDayKey();
      }
    };

    const handleWindowFocus = () => {
      refreshDayKey();
    };

    scheduleNextRefresh();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return dayKey;
};
