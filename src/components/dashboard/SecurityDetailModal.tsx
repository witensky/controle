import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, Clock3, Shield, TrendingDown, Wallet } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useChartContainerSize from '../../hooks/useChartContainerSize';
import { chartToneByIntent, toneClassNames } from '../../theme/tokens';
import { cx, uiRecipes } from '../../theme/recipes';

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

const toneMap = {
  safe: { badge: 'Zone saine', tone: toneClassNames.success, chart: chartToneByIntent.success },
  warning: { badge: 'Zone sensible', tone: toneClassNames.warning, chart: chartToneByIntent.warning },
  critical: { badge: 'Zone critique', tone: toneClassNames.danger, chart: chartToneByIntent.danger },
} as const;

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
  const meta = toneMap[tone];
  const { ref, size, isReady } = useChartContainerSize<HTMLDivElement>();
  const chartData = useMemo(
    () => [
      { label: 'Actif', value: budget },
      { label: 'Actuel', value: current },
      { label: 'Projete', value: projected },
    ],
    [budget, current, projected],
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-0 z-[360] bg-[color:var(--overlay)] backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="h-[100dvh] overflow-y-auto bg-[color:var(--background)]"
          >
            <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-4">
              <div className="mb-4 flex items-start gap-3">
                <button onClick={onClose} className={cx(uiRecipes.ghostButton, 'h-11 w-11 rounded-[1rem] px-0 py-0')}>
                  <ChevronLeft size={20} />
                </button>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--tone-warning-text)]">Details</p>
                  <h2 className="mt-1 text-[2rem] font-black uppercase italic leading-[0.92] tracking-[-0.06em] text-[color:var(--heading)] font-outfit">
                    Solde disponible
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className={cx(uiRecipes.cardElevated, 'relative overflow-hidden p-4')}>
                  <div className={cx('absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl', meta.tone.shell)} />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Solde projete</p>
                        <h3 className="mt-2 text-[1.2rem] font-black uppercase italic leading-[0.9] tracking-[-0.05em] text-[color:var(--heading)] font-outfit">
                          Projection financiere
                        </h3>
                      </div>
                      <div className={cx(uiRecipes.chip, meta.tone.chip)}>{meta.badge}</div>
                    </div>

                    <p className={cx('text-[2.4rem] font-black italic leading-none tracking-[-0.07em] font-outfit', meta.tone.text)}>{formatDh(projected)}</p>
                  </div>
                </div>

                <div className={cx(uiRecipes.cardMuted, 'p-3.5')}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--text-muted)]">Evolution</p>
                      <p className="mt-1 text-xs font-medium text-[color:var(--text-secondary)]">Actif, actuel, projete</p>
                    </div>
                    <div className={cx(uiRecipes.chip, meta.tone.chip)}>Live</div>
                  </div>

                  <div ref={ref} className="h-40 w-full min-w-0">
                    {isReady ? (
                      <ResponsiveContainer width={Math.max(size.width, 1)} height={Math.max(size.height, 1)} minWidth={0} minHeight={1}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                          <defs>
                            <linearGradient id="security-balance-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={meta.chart} stopOpacity={0.34} />
                              <stop offset="100%" stopColor={meta.chart} stopOpacity={0.04} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 11, fontWeight: 700 }} />
                          <YAxis tickLine={false} axisLine={false} width={42} tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 700 }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                          <Tooltip
                            formatter={(value) => formatDh(Number(value))}
                            contentStyle={{
                              background: 'var(--surface-elevated)',
                              border: '1px solid var(--border)',
                              borderRadius: '14px',
                              color: 'var(--heading)',
                              fontSize: '12px',
                              padding: '10px 12px',
                            }}
                            cursor={{ stroke: 'var(--chart-cursor)', strokeDasharray: '4 4' }}
                          />
                          <Area type="monotone" dataKey="value" stroke={meta.chart} strokeWidth={3} fill="url(#security-balance-gradient)" activeDot={{ r: 5, fill: meta.chart, stroke: 'var(--surface-elevated)', strokeWidth: 3 }} isAnimationActive animationDuration={900} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={cx(uiRecipes.metricCard)}>
                    <div className={cx('mb-3 flex h-10 w-10 items-center justify-center rounded-[0.9rem]', toneClassNames.info.shell, toneClassNames.info.icon)}>
                      <Wallet size={18} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Budget actif</p>
                    <p className="mt-2 text-[1.45rem] font-black italic leading-none tracking-[-0.05em] text-[color:var(--heading)]">{formatDh(budget)}</p>
                    <p className="mt-2 text-[11px] text-[color:var(--text-secondary)]">Montant disponible au depart</p>
                  </div>
                  <div className={cx(uiRecipes.metricCard)}>
                    <div className={cx('mb-3 flex h-10 w-10 items-center justify-center rounded-[0.9rem]', toneClassNames.danger.shell, toneClassNames.danger.icon)}>
                      <TrendingDown size={18} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Consomme</p>
                    <p className={cx('mt-2 text-[1.45rem] font-black italic leading-none tracking-[-0.05em]', toneClassNames.danger.text)}>{formatDh(-consumed)}</p>
                    <p className="mt-2 text-[11px] text-[color:var(--text-secondary)]">Charges deja enregistrees</p>
                  </div>
                  <div className={cx(uiRecipes.metricCard, 'col-span-2')}>
                    <div className={cx('mb-3 flex h-10 w-10 items-center justify-center rounded-[0.9rem]', toneClassNames.warning.shell, toneClassNames.warning.icon)}>
                      <Clock3 size={18} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">A venir</p>
                    <p className={cx('mt-2 text-[1.45rem] font-black italic leading-none tracking-[-0.05em]', toneClassNames.warning.text)}>{formatDh(-future)}</p>
                    <p className="mt-2 text-[11px] text-[color:var(--text-secondary)]">{futureCount} charge{futureCount > 1 ? 's' : ''} planifiee{futureCount > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className={cx(uiRecipes.cardMuted, 'p-3.5')}>
                  <div className={cx(uiRecipes.card, 'flex items-center justify-between gap-4 rounded-[1rem] px-3.5 py-3')}>
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Solde actuel</span>
                    <span className="text-base font-black tracking-tight text-[color:var(--heading)]">{formatDh(current)}</span>
                  </div>

                  <div className={cx('mt-3 overflow-hidden rounded-[1rem] border p-3.5', meta.tone.shell)}>
                    <div className="flex items-end justify-between gap-4">
                      <div className="max-w-[10rem]">
                        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--text-muted)]">Final projete</p>
                        <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-secondary)]">Valeur restante apres toutes les sorties prevues.</p>
                      </div>
                      <p className={cx('text-[2rem] font-black italic leading-none tracking-[-0.06em] font-outfit', meta.tone.text)}>{formatDh(projected)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[color:var(--border)] pt-4">
                <button onClick={onOpenModule} className={cx(uiRecipes.primaryButton, 'flex w-full items-center justify-center gap-2 rounded-[1rem] px-4 py-3.5')}>
                  Ouvrir module complet
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SecurityDetailModal;
