import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Database, Download, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useAppDialog } from '../components/common/AppDialogProvider';
import { offlineRepository } from '../data/offlineRepository';
import { AppView } from '../types';
import { navigateBackWithFallback } from '../router/viewRouter';
import { exportHtmlToPdf } from '../utils/pdfExport';

type DataCollectionKey =
   | 'missions'
   | 'transactions'
   | 'savings'
   | 'subjects'
   | 'words'
   | 'workouts'
   | 'metrics'
   | 'focus_sessions'
   | 'weekly_goals'
   | 'protocol_logs';

type PeriodFilter = 'all' | '7d' | '30d' | '90d' | 'year';

type ManagedDataRecord = {
   id: string;
   collection: DataCollectionKey;
   title: string;
   category: string;
   date: string;
   summary: string;
   raw: Record<string, unknown>;
};

const DATA_COLLECTION_OPTIONS: Array<{ key: 'all' | DataCollectionKey; label: string }> = [
   { key: 'all', label: 'Toutes' },
   { key: 'missions', label: 'Missions' },
   { key: 'transactions', label: 'Transactions' },
   { key: 'savings', label: 'Epargne' },
   { key: 'subjects', label: 'Cours' },
   { key: 'words', label: 'Mots' },
   { key: 'workouts', label: 'Workouts' },
   { key: 'metrics', label: 'Mesures' },
   { key: 'focus_sessions', label: 'Focus' },
   { key: 'weekly_goals', label: 'Obj. Hebdo' },
   { key: 'protocol_logs', label: 'Protocoles' },
];

const formatRecordDate = (value: string) => {
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) {
      return value || 'Sans date';
   }
   return parsed.toLocaleDateString('fr-FR');
};

const matchesPeriod = (value: string, period: PeriodFilter) => {
   if (period === 'all') return true;
   const parsed = new Date(value);
   if (Number.isNaN(parsed.getTime())) return false;

   const now = new Date();
   const thresholds: Record<Exclude<PeriodFilter, 'all'>, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      year: 365,
   };

   return now.getTime() - parsed.getTime() <= thresholds[period] * 24 * 60 * 60 * 1000;
};

const downloadBlob = (filename: string, content: BlobPart, type: string) => {
   const blob = new Blob([content], { type });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = filename;
   link.click();
   URL.revokeObjectURL(url);
};

interface DataCenterProps {
   onNavigate: (view: AppView) => void;
}

const DataCenter: React.FC<DataCenterProps> = ({ onNavigate }) => {
   const queryClient = useQueryClient();
   const { showAlert, showConfirm } = useAppDialog();
   const [loading, setLoading] = useState(true);
   const [records, setRecords] = useState<ManagedDataRecord[]>([]);
   const [collectionFilter, setCollectionFilter] = useState<'all' | DataCollectionKey>('all');
   const [categoryFilter, setCategoryFilter] = useState('all');
   const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

   const loadRecords = async () => {
      setLoading(true);
      try {
         const snapshot = await offlineRepository.settings.getDataCenterSnapshot();
         const nextRecords: ManagedDataRecord[] = [
            ...snapshot.missions.map((mission) => ({
               id: mission.id,
               collection: 'missions' as const,
               title: mission.title,
               category: mission.category || 'Sans categorie',
               date: mission.planned_date || mission.created_at || '',
               summary: `${mission.status} | Priorite ${mission.priority}`,
               raw: mission as unknown as Record<string, unknown>,
            })),
            ...snapshot.transactions.map((transaction) => ({
               id: transaction.id,
               collection: 'transactions' as const,
               title: transaction.title,
               category: transaction.category || transaction.type,
               date: transaction.date || '',
               summary: `${transaction.type} | ${transaction.amount} DH`,
               raw: transaction as unknown as Record<string, unknown>,
            })),
            ...snapshot.savings.map((saving) => ({
               id: saving.id,
               collection: 'savings' as const,
               title: saving.reason,
               category: saving.executed ? 'Executee' : 'Disponible',
               date: saving.date || saving.execution_date || '',
               summary: `${saving.amount} DH`,
               raw: saving as unknown as Record<string, unknown>,
            })),
            ...snapshot.subjects.map((subject) => ({
               id: subject.id,
               collection: 'subjects' as const,
               title: subject.name,
               category: subject.status || subject.semester || 'Cours',
               date: subject.created_at || '',
               summary: `${subject.chaptersDone}/${subject.chaptersTotal} chapitres | ${subject.progress}%`,
               raw: subject as unknown as Record<string, unknown>,
            })),
            ...snapshot.words.map((word) => ({
               id: word.id,
               collection: 'words' as const,
               title: word.word,
               category: word.language || 'Langue',
               date: word.learned_at || '',
               summary: word.translation || word.definition || 'Mot enregistre',
               raw: word as unknown as Record<string, unknown>,
            })),
            ...snapshot.workouts.map((workout) => ({
               id: workout.id,
               collection: 'workouts' as const,
               title: workout.routine_name || 'Workout',
               category: 'Sport',
               date: workout.date || '',
               summary: `${workout.duration || 0} min | ${workout.total_volume || 0} volume`,
               raw: workout as unknown as Record<string, unknown>,
            })),
            ...snapshot.metrics.map((metric) => ({
               id: metric.id,
               collection: 'metrics' as const,
               title: `Mesure ${formatRecordDate(metric.date || '')}`,
               category: 'Corps',
               date: metric.date || '',
               summary: `${metric.weight || 0} kg`,
               raw: metric as unknown as Record<string, unknown>,
            })),
            ...snapshot.focusSessions.map((session) => ({
               id: session.id,
               collection: 'focus_sessions' as const,
               title: session.type,
               category: session.status,
               date: session.started_at || '',
               summary: `${Math.round((session.duration_seconds || 0) / 60)} min`,
               raw: session as unknown as Record<string, unknown>,
            })),
            ...snapshot.weeklyGoals.map((goal) => ({
               id: goal.id,
               collection: 'weekly_goals' as const,
               title: goal.category,
               category: `Semaine ${goal.week_number}`,
               date: `${goal.year}-01-01`,
               summary: `${goal.current_count}/${goal.target_count}`,
               raw: goal as unknown as Record<string, unknown>,
            })),
            ...snapshot.protocolLogs.map((log) => ({
               id: log.id,
               collection: 'protocol_logs' as const,
               title: `Protocole ${formatRecordDate(log.date || '')}`,
               category: 'Rituel',
               date: log.date || '',
               summary: `${log.completion_score || 0}% completion`,
               raw: log as unknown as Record<string, unknown>,
            })),
         ].sort((left, right) => right.date.localeCompare(left.date));

         setRecords(nextRecords);
         return nextRecords;
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      void loadRecords();
   }, []);

   const filteredRecords = useMemo(() => {
      return records.filter((record) => {
         const matchesCollection = collectionFilter === 'all' || record.collection === collectionFilter;
         const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
         const matchesPeriodFilter = matchesPeriod(record.date, periodFilter);
         const normalizedSearch = searchQuery.trim().toLowerCase();
         const matchesSearch =
            normalizedSearch.length === 0 ||
            `${record.title} ${record.category} ${record.summary}`.toLowerCase().includes(normalizedSearch);

         return matchesCollection && matchesCategory && matchesPeriodFilter && matchesSearch;
      });
   }, [categoryFilter, collectionFilter, periodFilter, records, searchQuery]);

   const categoryOptions = useMemo(() => {
      const categories = new Set(
         records
            .filter((record) => collectionFilter === 'all' || record.collection === collectionFilter)
            .map((record) => record.category),
      );
      return ['all', ...Array.from(categories).sort((left, right) => left.localeCompare(right))];
   }, [collectionFilter, records]);

   useEffect(() => {
      setSelectedRecordIds((previous) => previous.filter((id) => filteredRecords.some((record) => record.id === id)));
   }, [filteredRecords]);

   const toggleSelection = (id: string) => {
      setSelectedRecordIds((previous) =>
         previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
      );
   };

   const handleExportJson = (items: ManagedDataRecord[], filename: string) => {
      downloadBlob(filename, JSON.stringify(items.map((item) => item.raw), null, 2), 'application/json');
   };

   const handleExportFullBackup = async () => {
      const items = records.length > 0 ? records : (await loadRecords()) || [];
      handleExportJson(items, `backup-complet-${new Date().toISOString().split('T')[0]}.json`);
   };

   const handleExportPdf = async (items: ManagedDataRecord[]) => {
      try {
         await exportHtmlToPdf({
            fileName: `centre-de-donnees-${new Date().toISOString().split('T')[0]}.pdf`,
            title: 'Centre de données',
            html: `
              <div style="font-family: Arial, sans-serif; color: #0f172a;">
                <h1 style="font-size: 20px; margin-bottom: 4px;">Centre de données</h1>
                <p style="margin-top: 0; color: #475569;">${items.length} élément(s) exporté(s)</p>
                <table style="width:100%; border-collapse:collapse; margin-top:24px;">
                  <thead>
                    <tr>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Collection</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Titre</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Catégorie</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Date</th>
                      <th style="border-bottom:1px solid #e2e8f0; padding:10px 8px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#64748b;">Résumé</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map((record) => `
                      <tr>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.collection}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.title}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.category}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${formatRecordDate(record.date)}</td>
                        <td style="border-bottom:1px solid #e2e8f0; padding:10px 8px; font-size:12px;">${record.summary}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `,
         });
      } catch (error) {
         await showAlert({
            title: 'Export impossible',
            message: "Impossible de générer le PDF.",
            tone: 'danger',
         });
      }
   };

   const deleteRecords = async (items: ManagedDataRecord[]) => {
      if (items.length === 0) return;
      const confirmed = await showConfirm({
         title: 'Supprimer la selection',
         message: `${items.length} element(s) selectionne(s) seront retires definitivement.`,
         confirmLabel: 'Supprimer',
         tone: 'danger',
      });
      if (!confirmed) return;

      const grouped = items.reduce<Record<string, string[]>>((acc, record) => {
         acc[record.collection] = [...(acc[record.collection] || []), record.id];
         return acc;
      }, {});

      await Promise.all(
         Object.entries(grouped).map(([collection, ids]) => offlineRepository.settings.deleteRecords(collection, ids)),
      );

      setSelectedRecordIds((previous) => previous.filter((id) => !items.some((record) => record.id === id)));
      await loadRecords();
      await queryClient.invalidateQueries();
   };

   const handleDeleteSelectedRecords = async () => {
      await deleteRecords(filteredRecords.filter((record) => selectedRecordIds.includes(record.id)));
   };

   const handleReloadLocal = async () => {
      await loadRecords();
      await queryClient.invalidateQueries();
   };

   const handleFlushMissionHistory = async () => {
      const confirmed = await showConfirm({
         title: "Purger l'historique",
         message: "Tout l'historique des missions sera supprime. Cette action est irreversible.",
         confirmLabel: 'Purger',
         tone: 'danger',
      });
      if (!confirmed) return;
      await offlineRepository.settings.clearCollection('missions');
      await loadRecords();
      await queryClient.invalidateQueries();
   };

   return (
      <div className="space-y-8 pb-28 animate-in fade-in duration-500">
         <div className="relative border-b border-[color:var(--border)] pb-8 pt-1">
            <button
               onClick={() => navigateBackWithFallback('SETTINGS')}
               aria-label="Retour réglages"
               className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-primary)] transition-all hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)]"
            >
               <ArrowLeft size={16} />
            </button>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
               <div className="w-full px-10 text-center md:px-0 md:text-left">
                  <div className="mb-3 flex items-center justify-center gap-3 md:justify-start">
                     <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
                        <Database size={16} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Data Center</span>
                  </div>
                  <h2 className="w-full max-w-full truncate text-[1.12rem] font-black uppercase italic leading-none tracking-tight text-[color:var(--text-primary)] sm:text-[1.35rem] md:text-[1.6rem]">
                     Gestion globale des données
                  </h2>
               </div>
               <div className="grid grid-cols-3 gap-2 md:flex md:flex-nowrap md:justify-end md:gap-3">
                  <button
                     onClick={handleExportFullBackup}
                     className="flex items-center justify-center gap-1.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-blue-400 md:gap-2 md:px-5 md:py-4 md:text-[10px] md:tracking-[0.22em]"
                  >
                     <Download size={14} /> Backup JSON
                  </button>
                  <button
                     onClick={handleReloadLocal}
                     className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400 md:gap-2 md:px-5 md:py-4 md:text-[10px] md:tracking-[0.22em]"
                  >
                     <RefreshCw size={14} /> Recharger
                  </button>
                  <button
                     onClick={handleFlushMissionHistory}
                     className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-rose-400 md:gap-2 md:px-5 md:py-4 md:text-[10px] md:tracking-[0.22em]"
                  >
                     <Trash2 size={14} /> Purger missions
                  </button>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
               { label: 'Affiches', value: filteredRecords.length },
               { label: 'Sélection', value: selectedRecordIds.length },
               { label: 'Collections', value: new Set(records.map((record) => record.collection)).size },
               { label: 'Stockage', value: records.length },
            ].map((item) => (
               <div key={item.label} className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-card">
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">{item.label}</p>
                  <p className="mt-3 text-3xl font-black text-[color:var(--text-primary)]">{item.value}</p>
               </div>
            ))}
         </div>

         <div className="glass overflow-hidden rounded-[2rem] shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
               <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-2)] p-5 lg:border-b-0 lg:border-r">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Collection</label>
                        <select
                           value={collectionFilter}
                           onChange={(event) => {
                              setCollectionFilter(event.target.value as 'all' | DataCollectionKey);
                              setCategoryFilter('all');
                           }}
                           className="ui-field w-full rounded-2xl border px-4 py-3 text-[11px] font-black uppercase outline-none"
                        >
                           {DATA_COLLECTION_OPTIONS.map((option) => (
                              <option key={option.key} value={option.key}>
                                 {option.label}
                              </option>
                           ))}
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Catégorie</label>
                        <select
                           value={categoryFilter}
                           onChange={(event) => setCategoryFilter(event.target.value)}
                           className="ui-field w-full rounded-2xl border px-4 py-3 text-[11px] font-black uppercase outline-none"
                        >
                           {categoryOptions.map((option) => (
                              <option key={option} value={option}>
                                 {option === 'all' ? 'Toutes' : option}
                              </option>
                           ))}
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Période</label>
                        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                           {[
                              { key: 'all', label: 'Tout' },
                              { key: '7d', label: '7J' },
                              { key: '30d', label: '30J' },
                              { key: '90d', label: '90J' },
                              { key: 'year', label: '1 an' },
                           ].map((option) => (
                              <button
                                 key={option.key}
                                 onClick={() => setPeriodFilter(option.key as PeriodFilter)}
                                 className={`min-w-[84px] shrink-0 rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    periodFilter === option.key
                                       ? 'bg-[color:var(--text-primary)] text-[color:var(--surface)]'
                                       : 'border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--surface-2)]'
                                 }`}
                              >
                                 {option.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[color:var(--text-muted)]">Recherche</label>
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={(event) => setSearchQuery(event.target.value)}
                           placeholder="Titre, catégorie, résumé"
                           className="ui-field w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                           <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Filtres</p>
                           <p className="mt-2 text-2xl font-black text-[color:var(--text-primary)]">{filteredRecords.length}</p>
                        </div>
                        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                           <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Sélection</p>
                           <p className="mt-2 text-2xl font-black text-[color:var(--text-primary)]">{selectedRecordIds.length}</p>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <button
                           onClick={() => setSelectedRecordIds(filteredRecords.map((record) => record.id))}
                           className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-primary)] transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                           Sélectionner le résultat
                        </button>
                        <button
                           onClick={() => setSelectedRecordIds([])}
                           className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                           Vider la sélection
                        </button>
                        <button
                           onClick={() => handleExportJson(filteredRecords, `export-filtre-${new Date().toISOString().split('T')[0]}.json`)}
                           className="w-full rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-blue-400"
                        >
                           Exporter JSON
                        </button>
                        <button
                           onClick={() => handleExportPdf(filteredRecords)}
                           className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400"
                        >
                           Exporter PDF
                        </button>
                        <button
                           onClick={handleDeleteSelectedRecords}
                           disabled={selectedRecordIds.length === 0}
                           className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-rose-400 disabled:opacity-40"
                        >
                           Supprimer la selection
                        </button>
                     </div>
                  </div>
               </div>

               <div className="min-h-[520px] p-5 sm:p-6">
                  {loading ? (
                     <div className="flex h-full min-h-[520px] items-center justify-center">
                        <Loader2 className="animate-spin text-amber-500" size={28} />
                     </div>
                  ) : filteredRecords.length === 0 ? (
                     <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-2)] px-6 text-center">
                        <Database size={40} className="text-[color:var(--text-muted)]" />
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Aucun résultat</p>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--text-secondary)]">
                           Ajuste les filtres, la période ou la recherche pour afficher des données.
                        </p>
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {filteredRecords.map((record) => {
                           const isSelected = selectedRecordIds.includes(record.id);
                           return (
                              <div
                                 key={`${record.collection}-${record.id}`}
                                 className={`rounded-[1.5rem] border p-4 transition-all ${
                                    isSelected ? 'border-amber-500/30 bg-amber-500/[0.04]' : 'border-[color:var(--border)] bg-[color:var(--surface)]'
                                 }`}
                              >
                                 <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="flex items-start gap-3">
                                       <button
                                          onClick={() => toggleSelection(record.id)}
                                          className={`mt-0.5 h-5 w-5 rounded border ${
                                             isSelected ? 'border-amber-500 bg-amber-500' : 'border-[color:var(--border-strong)] bg-[color:var(--surface-2)]'
                                          }`}
                                       />
                                       <div className="min-w-0">
                                         <div className="flex flex-wrap items-center gap-2">
                                             <span className="rounded-full bg-[color:var(--surface-2)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
                                                {record.collection}
                                             </span>
                                             <span className="rounded-full bg-[color:var(--surface-2)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                                                {record.category}
                                             </span>
                                          </div>
                                          <h4 className="mt-3 text-sm font-black uppercase text-[color:var(--text-primary)]">{record.title}</h4>
                                          <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{record.summary}</p>
                                       </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                       <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                                          {formatRecordDate(record.date)}
                                       </span>
                                       <button
                                          onClick={() => deleteRecords([record])}
                                          className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-rose-400"
                                       >
                                          Supprimer
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default DataCenter;
