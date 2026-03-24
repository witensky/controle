type ReportQuickStat = {
  label: string;
  val: string | number;
  sub: string;
};

type ReportSummaryItem = {
  label: string;
  value: string | number;
  tone?: 'default' | 'positive' | 'negative';
};

type ReportProgressItem = {
  label: string;
  value: number;
};

type ReportBalanceItem = {
  label: string;
  value: string;
  color: string;
};

type ReportTable = {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  emptyLabel: string;
};

export type ReportPdfTemplateData = {
  title: string;
  subtitle: string;
  owner: string;
  email: string;
  periodLabel: string;
  generatedAt: string;
  quickStats: ReportQuickStat[];
  financeSummary: ReportSummaryItem[];
  studySummary: ReportSummaryItem[];
  progress: ReportProgressItem[];
  balance: ReportBalanceItem[];
  tables: ReportTable[];
};

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderSummaryItems = (items: ReportSummaryItem[]) =>
  items
    .map((item) => {
      const toneClass =
        item.tone === 'positive' ? 'value positive' : item.tone === 'negative' ? 'value negative' : 'value';

      return `
        <div class="summary-item">
          <span class="label">${escapeHtml(item.label)}</span>
          <strong class="${toneClass}">${escapeHtml(item.value)}</strong>
        </div>
      `;
    })
    .join('');

const renderProgressItems = (items: ReportProgressItem[]) =>
  items
    .map(
      (item) => `
        <div class="progress-item">
          <div class="progress-head">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(`${Math.max(0, Math.min(100, Math.round(item.value)))}%`)}</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${Math.max(0, Math.min(100, Math.round(item.value)))}%"></div>
          </div>
        </div>
      `,
    )
    .join('');

const renderBalanceItems = (items: ReportBalanceItem[]) =>
  items.length > 0
    ? items
        .map(
          (item) => `
            <div class="balance-item">
              <div class="balance-label">
                <span class="balance-dot" style="background:${escapeHtml(item.color)}"></span>
                <span>${escapeHtml(item.label)}</span>
              </div>
              <strong>${escapeHtml(item.value)}</strong>
            </div>
          `,
        )
        .join('')
    : '<p class="empty-copy">Aucune donnée significative sur cette période.</p>';

const renderTable = (table: ReportTable) => {
  const body =
    table.rows.length > 0
      ? table.rows
          .map(
            (row) => `
              <tr>
                ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
              </tr>
            `,
          )
          .join('')
      : `<tr><td colspan="${table.columns.length}" class="empty-row">${escapeHtml(table.emptyLabel)}</td></tr>`;

  return `
    <section class="section-card section-full">
      <div class="section-head">
        <div>
          <h2>${escapeHtml(table.title)}</h2>
          ${table.subtitle ? `<p>${escapeHtml(table.subtitle)}</p>` : ''}
        </div>
      </div>
      <table class="report-table">
        <thead>
          <tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </section>
  `;
};

export const generatePdfTemplate = (data: ReportPdfTemplateData) => `
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .page {
      width: 794px;
      padding: 28px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 18px;
      margin-bottom: 18px;
    }
    .kicker {
      margin: 0 0 8px;
      font-size: 10px;
      line-height: 1.4;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      font-weight: 700;
      color: #f59e0b;
    }
    h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.1;
      font-weight: 800;
      color: #0f172a;
    }
    .subtitle {
      margin: 10px 0 0;
      max-width: 420px;
      font-size: 13px;
      line-height: 1.6;
      color: #475569;
    }
    .meta {
      min-width: 220px;
      padding: 14px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #f8fafc;
    }
    .meta-row {
      margin: 0 0 8px;
      font-size: 11px;
      line-height: 1.5;
      color: #334155;
    }
    .meta-row:last-child { margin-bottom: 0; }
    .stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 18px;
    }
    .stat-card {
      flex: 1 1 140px;
      min-width: 140px;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .stat-label {
      display: block;
      margin-bottom: 8px;
      font-size: 10px;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #64748b;
      font-weight: 700;
    }
    .stat-value {
      display: block;
      font-size: 24px;
      line-height: 1.1;
      font-weight: 800;
      color: #0f172a;
    }
    .stat-sub {
      display: block;
      margin-top: 6px;
      font-size: 11px;
      line-height: 1.5;
      color: #475569;
    }
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    .section-card {
      flex: 1 1 calc(50% - 8px);
      min-width: 0;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #ffffff;
      padding: 18px;
      margin-bottom: 16px;
    }
    .section-full {
      flex: 1 1 100%;
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 14px;
    }
    h2 {
      margin: 0;
      font-size: 16px;
      line-height: 1.3;
      font-weight: 800;
      color: #0f172a;
    }
    .section-head p {
      margin: 6px 0 0;
      font-size: 12px;
      line-height: 1.55;
      color: #64748b;
    }
    .summary-list, .progress-list, .balance-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .summary-item, .balance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 11px 12px;
      border-radius: 12px;
      background: #f8fafc;
    }
    .label {
      font-size: 11px;
      line-height: 1.45;
      color: #64748b;
      font-weight: 700;
    }
    .value {
      font-size: 13px;
      line-height: 1.3;
      color: #0f172a;
      font-weight: 800;
    }
    .value.positive { color: #047857; }
    .value.negative { color: #b91c1c; }
    .progress-item {
      padding: 10px 12px;
      border-radius: 12px;
      background: #f8fafc;
    }
    .progress-head {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 11px;
      line-height: 1.4;
      color: #334155;
      font-weight: 700;
    }
    .progress-track {
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      background: #dbeafe;
    }
    .progress-fill {
      height: 100%;
      border-radius: inherit;
      background: #3b82f6;
    }
    .balance-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      line-height: 1.4;
      color: #334155;
      font-weight: 700;
    }
    .balance-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      display: inline-block;
    }
    .empty-copy, .empty-row {
      text-align: center;
      font-size: 12px;
      line-height: 1.55;
      color: #64748b;
      padding: 18px 12px;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .report-table th {
      padding: 10px 8px;
      border-bottom: 1px solid #dbe4f0;
      text-align: left;
      font-size: 10px;
      line-height: 1.4;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
    }
    .report-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
      line-height: 1.5;
      color: #0f172a;
      vertical-align: top;
      word-break: break-word;
    }
  </style>

  <div class="page">
    <header class="header">
      <div>
        <p class="kicker">Rapport Myflow</p>
        <h1>${escapeHtml(data.title)}</h1>
        <p class="subtitle">${escapeHtml(data.subtitle)}</p>
      </div>
      <div class="meta">
        <p class="meta-row"><strong>Profil :</strong> ${escapeHtml(data.owner)}</p>
        <p class="meta-row"><strong>Email :</strong> ${escapeHtml(data.email)}</p>
        <p class="meta-row"><strong>Période :</strong> ${escapeHtml(data.periodLabel)}</p>
        <p class="meta-row"><strong>Généré le :</strong> ${escapeHtml(data.generatedAt)}</p>
      </div>
    </header>

    <section class="stats-row">
      ${data.quickStats
        .map(
          (stat) => `
            <article class="stat-card">
              <span class="stat-label">${escapeHtml(stat.label)}</span>
              <strong class="stat-value">${escapeHtml(stat.val)}</strong>
              <span class="stat-sub">${escapeHtml(stat.sub)}</span>
            </article>
          `,
        )
        .join('')}
    </section>

    <section class="grid">
      <article class="section-card">
        <div class="section-head">
          <div>
            <h2>Vue budgétaire</h2>
            <p>Lecture consolidée des soldes, quotas et provisions à venir.</p>
          </div>
        </div>
        <div class="summary-list">${renderSummaryItems(data.financeSummary)}</div>
      </article>

      <article class="section-card">
        <div class="section-head">
          <div>
            <h2>Vue études</h2>
            <p>Suivi des modules, examens, rappels et rythme d’apprentissage.</p>
          </div>
        </div>
        <div class="summary-list">${renderSummaryItems(data.studySummary)}</div>
      </article>
    </section>

    <section class="grid">
      <article class="section-card">
        <div class="section-head">
          <div>
            <h2>Progression</h2>
            <p>Lecture rapide des domaines suivis sur la période.</p>
          </div>
        </div>
        <div class="progress-list">${renderProgressItems(data.progress)}</div>
      </article>

      <article class="section-card">
        <div class="section-head">
          <div>
            <h2>Répartition des efforts</h2>
            <p>Vue synthétique de la charge par domaine.</p>
          </div>
        </div>
        <div class="balance-list">${renderBalanceItems(data.balance)}</div>
      </article>
    </section>

    ${data.tables.map(renderTable).join('')}
  </div>
`;
