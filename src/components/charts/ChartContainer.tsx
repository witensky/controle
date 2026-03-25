import React from 'react';

interface ChartContainerProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  controls?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  icon,
  controls,
  className = '',
  children,
}) => (
  <div className={`glass overflow-hidden rounded-[2rem] p-5 shadow-card sm:p-6 ${className}`.trim()}>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {icon ? <span className="shrink-0">{icon}</span> : null}
          <h3 className="truncate text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-primary)]">{title}</h3>
        </div>
        {subtitle ? (
          <p className="mt-2 pl-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-muted)] sm:pl-8">
            {subtitle}
          </p>
        ) : null}
      </div>

      {controls ? <div className="shrink-0">{controls}</div> : null}
    </div>

    {children}
  </div>
);

export default ChartContainer;
