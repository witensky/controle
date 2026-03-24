import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  Clock3,
  Shield,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useChartContainerSize from '../../hooks/useChartContainerSize';

type SecurityTone = 'safe' | 'warning' | 'critical';

interface SecurityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModule: () => void;
  budget: number;
  consumed: number;
  future: number;
  current: number;
  projected: number;
  futureCount: number;
  tone: SecurityTone;
}

const formatDh = (value: number) => `${Math.round(value).toLocaleString()} DH`;

const toneMeta: Record<
  SecurityTone,
  {
    badge: string;
    badgeClass: string;
    accentClass: string;
    glowClass: string;
    chartStroke: string;
    chartFillStart: string;
    chartFillEnd: string;
  }
> = {
  safe: {
    badge: 'Zone saine',
    badgeClass: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    accentClass: 'text-emerald-400',
    glowClass: 'shadow-[0_0_80px_rgba(16,185,129,0.18)]',
    chartStroke: '#34d399',
    chartFillStart: 'rgba(52,211,153,0.35)',
    chartFillEnd: 'rgba(52,211,153,0.02)',
  },
  warning: {
    badge: 'Zone sensible',
    badgeClass: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    accentClass: 'text-amber-300',
    glowClass: 'shadow-[0_0_80px_rgba(251,191,36,0.16)]',
    chartStroke: '#fbbf24',
    chartFillStart: 'rgba(251,191,36,0.3)',
    chartFillEnd: 'rgba(251,191,36,0.02)',
  },
  critical: {
    badge: 'Zone critique',
    badgeClass: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
    accentClass: 'text-rose-400',
    glowClass: 'shadow-[0_0_80px_rgba(244,63,94,0.16)]',
    chartStroke: '#fb7185',
    chartFillStart: 'rgba(251,113,133,0.3)',
    chartFillEnd: 'rgba(251,113,133,0.02)',
  },
};

const AnimatedNumber: React.FC<{
  value: number;
  className?: string;
  suffix?: string;
}> = ({ value, className, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

const ModalContainer: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
}> = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="fixed inset-0 z-[360] bg-slate-950/96 backdrop-blur-xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="h-[100dvh] overflow-y-auto bg-[#020617]"
        >
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-4">
            {children}
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

const SummaryCard: React.FC<{
  projected: number;
  tone: SecurityTone;
}> = ({ projected, tone }) => {
  const meta = toneMeta[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.35 }}
      className={`relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.24),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-4 ${meta.glowClass}`}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">Solde projeté</p>
            <h3 className="mt-2 h-[1.1rem] overflow-hidden whitespace-nowrap text-[1.2rem] font-black uppercase italic leading-[0.9] tracking-[-0.05em] text-white font-outfit">
              Projection financière
            </h3>
          </div>
        </div>

        <div>
          <AnimatedNumber
            value={projected}
            suffix=" DH"
            className={`block text-[2.4rem] font-black italic leading-none tracking-[-0.07em] font-outfit ${meta.accentClass}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const chartTooltipStyle = {
  background: 'rgba(2, 6, 23, 0.96)',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  borderRadius: '14px',
  color: '#e2e8f0',
  fontSize: '12px',
  padding: '10px 12px',
};

const MiniChart: React.FC<{
  budget: number;
  current: number;
  projected: number;
  tone: SecurityTone;
}> = ({ budget, current, projected, tone }) => {
  const meta = toneMeta[tone];
  const { ref, size, isReady } = useChartContainerSize<HTMLDivElement>();
  const data = useMemo(
    () => [
      { label: 'Actif', value: budget },
      { label: 'Actuel', value: current },
      { label: 'Projeté', value: projected },
    ],
    [budget, current, projected],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.36 }}
      className="rounded-[1.2rem] border border-white/8 bg-slate-950/45 p-3.5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">Évolution</p>
          <p className="mt-1 text-xs font-medium text-slate-400">Actif → consommé → projeté</p>
        </div>
        <div className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${meta.badgeClass}`}>
          Live
        </div>
      </div>

      <div ref={ref} className="h-40 w-full min-w-0">
        {isReady ? (
          <ResponsiveContainer width={Math.max(size.width, 1)} height={Math.max(size.height, 1)} minWidth={0} minHeight={1}>
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="security-balance-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={meta.chartFillStart} />
                  <stop offset="100%" stopColor={meta.chartFillEnd} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              />
              <Tooltip
                formatter={(value) => formatDh(Number(value))}
                contentStyle={chartTooltipStyle}
                cursor={{ stroke: 'rgba(148,163,184,0.14)', strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={meta.chartStroke}
                strokeWidth={3}
                fill="url(#security-balance-gradient)"
                activeDot={{ r: 5, fill: meta.chartStroke, stroke: '#020617', strokeWidth: 3 }}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
    </motion.div>
  );
};

const StatCard: React.FC<{
  index: number;
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  tone: 'blue' | 'red' | 'yellow';
  spanTwo?: boolean;
}> = ({ index, icon, label, value, subtext, tone, spanTwo = false }) => {
  const toneStyles = {
    blue: {
      shell: 'border-sky-400/12 bg-[linear-gradient(180deg,rgba(14,165,233,0.12),rgba(2,6,23,0.92))]',
      icon: 'bg-sky-400/12 text-sky-300',
      value: 'text-sky-300',
    },
    red: {
      shell: 'border-rose-400/12 bg-[linear-gradient(180deg,rgba(244,63,94,0.12),rgba(2,6,23,0.92))]',
      icon: 'bg-rose-400/12 text-rose-300',
      value: 'text-rose-400',
    },
    yellow: {
      shell: 'border-amber-400/12 bg-[linear-gradient(180deg,rgba(250,204,21,0.12),rgba(2,6,23,0.92))]',
      icon: 'bg-amber-300/12 text-amber-200',
      value: 'text-amber-300',
    },
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 + index * 0.07, duration: 0.34 }}
      className={`${spanTwo ? 'col-span-2' : ''} rounded-[1.15rem] border p-3.5 transition-all duration-300 active:scale-[0.99] sm:hover:-translate-y-0.5 ${toneStyles.shell}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-[0.9rem] ${toneStyles.icon}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate whitespace-nowrap text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <AnimatedNumber
            value={Math.abs(value)}
            suffix=" DH"
            className={`mt-2 block whitespace-nowrap text-[1.45rem] font-black italic leading-none tracking-[-0.05em] font-outfit ${toneStyles.value}`}
          />
          <p className="mt-2 truncate whitespace-nowrap text-[11px] leading-snug text-slate-500">{subtext}</p>
        </div>
      </div>
    </motion.div>
  );
};

const SecurityDetailModal: React.FC<SecurityDetailModalProps> = ({
  isOpen,
  onClose,
  onOpenModule,
  budget,
  consumed,
  future,
  current,
  projected,
  futureCount,
  tone,
}) => {
  const projectedTone = toneMeta[tone];

  return (
    <ModalContainer isOpen={isOpen}>
      <div className="mb-4 flex items-start gap-3">
        <button
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="min-w-0 flex-1 pt-1"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-500">Détails</p>
          <h2 className="mt-1 text-[2rem] font-black uppercase italic leading-[0.92] tracking-[-0.06em] text-white font-outfit">
            Solde disponible
          </h2>
        </motion.div>
      </div>

      <div className="space-y-3">
        <SummaryCard
          projected={projected}
          tone={tone}
        />

        <MiniChart
          budget={budget}
          current={current}
          projected={projected}
          tone={tone}
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            index={0}
            icon={<Wallet size={18} />}
            label="Budget actif"
            value={budget}
            subtext="Montant disponible au départ"
            tone="blue"
          />
          <StatCard
            index={1}
            icon={<TrendingDown size={18} />}
            label="Consommé"
            value={-consumed}
            subtext="Charges déjà enregistrées"
            tone="red"
          />
          <StatCard
            index={2}
            icon={<Clock3 size={18} />}
            label="À venir"
            value={-future}
            subtext={`${futureCount} charge${futureCount > 1 ? 's' : ''} planifiée${futureCount > 1 ? 's' : ''}`}
            tone="yellow"
            spanTwo
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.34 }}
          className="rounded-[1.2rem] border border-white/10 bg-slate-950/45 p-3.5"
        >
          <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-white/5 bg-slate-950/50 px-3.5 py-3">
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Solde actuel</span>
            <span className="text-base font-black tracking-tight text-white">{formatDh(current)}</span>
          </div>

          <div className={`mt-3 overflow-hidden rounded-[1rem] border p-3.5 ${projectedTone.badgeClass.replace('text-emerald-200', 'text-emerald-200/90').replace('text-amber-100', 'text-amber-100/90').replace('text-rose-100', 'text-rose-100/90')} bg-transparent`}>
            <div className="flex items-end justify-between gap-4">
              <div className="max-w-[10rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">Final projeté</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300/80">
                  Valeur restante après toutes les sorties prévues.
                </p>
              </div>
              <AnimatedNumber
                value={projected}
                suffix=" DH"
                className={`text-[2rem] font-black italic leading-none tracking-[-0.06em] font-outfit ${projectedTone.accentClass}`}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.34 }}
        className="mt-4 border-t border-white/5 pt-4"
      >
        <button
          onClick={onOpenModule}
          className="flex w-full items-center justify-center gap-2 rounded-[1rem] bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 shadow-[0_16px_40px_rgba(255,255,255,0.08)] transition-all hover:bg-emerald-400 active:scale-[0.99]"
        >
          Ouvrir module complet
          <ArrowUpRight size={15} />
        </button>
      </motion.div>
    </ModalContainer>
  );
};

export default SecurityDetailModal;
