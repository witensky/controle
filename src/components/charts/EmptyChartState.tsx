import React from 'react';

interface EmptyChartStateProps {
  message: string;
  minHeightClassName?: string;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  message,
  minHeightClassName = 'min-h-[220px]',
}) => (
  <div
    className={`flex items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/25 px-6 text-center ${minHeightClassName}`}
  >
    <p className="max-w-[260px] text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
      {message}
    </p>
  </div>
);

export default EmptyChartState;
