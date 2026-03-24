import { RefObject, useLayoutEffect, useRef, useState } from 'react';

type Size = {
  width: number;
  height: number;
};

export const useChartContainerSize = <T extends HTMLElement>(): {
  ref: RefObject<T>;
  size: Size;
  isReady: boolean;
} => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize((previous) => {
        const next = {
          width: Math.max(0, Math.round(rect.width)),
          height: Math.max(0, Math.round(rect.height)),
        };

        if (previous.width === next.width && previous.height === next.height) {
          return previous;
        }

        return next;
      });
    };

    updateSize();

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(updateSize);
    });
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(element);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    size,
    isReady: size.width > 0 && size.height > 0,
  };
};

export default useChartContainerSize;
