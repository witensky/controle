import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  colorClassName?: string;
  trackClassName?: string;
  heightClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  colorClassName = 'study-progress-fill',
  trackClassName = 'study-progress-track',
  heightClassName = 'h-2',
}) => {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`overflow-hidden rounded-full border border-[color:var(--border)] dark:border-white/6 ${trackClassName} ${heightClassName}`}>
      <motion.div
        className={`h-full rounded-full ${colorClassName}`}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
};

export default ProgressBar;
