import { useRef, useState, type TouchEvent } from 'react';

export function useSwipeDelete(onDelete: () => void, threshold = 80) {
  const startX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);

  const onTouchStart = (event: TouchEvent) => {
    startX.current = event.touches[0].clientX;
    setSwiped(false);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (startX.current === null) return;
    const dx = startX.current - event.touches[0].clientX;
    if (dx > 0) setOffset(Math.min(dx, threshold + 20));
  };

  const onTouchEnd = () => {
    if (offset >= threshold) {
      setSwiped(true);
      window.setTimeout(onDelete, 250);
    }

    setOffset(0);
    startX.current = null;
  };

  return { offset, swiped, onTouchStart, onTouchMove, onTouchEnd };
}
