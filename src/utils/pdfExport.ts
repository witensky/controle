import { Capacitor } from '@capacitor/core';
import type { jsPDF } from 'jspdf';

type ExportElementToPdfOptions = {
  element: HTMLElement;
  fileName: string;
  title?: string;
  backgroundColor?: string;
  marginMm?: number;
};

type ExportHtmlToPdfOptions = {
  html: string;
  fileName: string;
  title?: string;
  widthPx?: number;
  backgroundColor?: string;
};

type ExportToPdfOptions =
  | ({ element: HTMLElement; html?: never } & Omit<ExportElementToPdfOptions, 'element'>)
  | ({ html: string; element?: never; marginMm?: number } & Omit<ExportHtmlToPdfOptions, 'html' | 'widthPx'>);

let pdfDepsPromise: Promise<{
  html2canvas: typeof import('html2canvas').default;
  jsPDFCtor: typeof import('jspdf').jsPDF;
}> | null = null;

const loadPdfDeps = async () => {
  if (!pdfDepsPromise) {
    pdfDepsPromise = Promise.all([import('html2canvas'), import('jspdf')]).then(([html2canvasModule, jspdfModule]) => ({
      html2canvas: html2canvasModule.default,
      jsPDFCtor: jspdfModule.jsPDF,
    }));
  }

  return pdfDepsPromise;
};

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const waitForPaintInWindow = (targetWindow: Window) =>
  new Promise<void>((resolve) => {
    targetWindow.requestAnimationFrame(() => {
      targetWindow.requestAnimationFrame(() => resolve());
    });
  });

const waitForDelay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), ms);
  });

const waitForFonts = async (targetWindow: Window) => {
  const doc = (targetWindow as unknown as { document?: Document }).document;
  const fonts = (doc as unknown as { fonts?: { ready?: Promise<unknown> } })?.fonts;
  if (!fonts?.ready) return;
  try {
    await fonts.ready;
  } catch {
    // ignore font readiness issues
  }
};

const COPYABLE_FORM_VALUE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const UNSUPPORTED_COLOR_PATTERN = /oklch\(|oklab\(|color-mix\(|color\(/i;
const COLOR_LIKE_PROPERTIES = new Set([
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'text-emphasis-color',
  'caret-color',
  'fill',
  'stroke',
]);
const UNSAFE_SHORTHAND_PREFIXES = [
  'background',
  'border',
  'outline',
  'text-decoration',
  'text-emphasis',
  'column-rule',
  'box-shadow',
  'text-shadow',
  'mask',
  '-webkit-mask',
];

let colorCanvasContext: CanvasRenderingContext2D | null = null;

type PdfBlock =
  | { type: 'heading'; text: string; level: number }
  | { type: 'text'; text: string }
  | { type: 'table'; rows: string[][] };

const copyFormValueState = (source: Element, clone: Element) => {
  if (!(source instanceof HTMLElement) || !(clone instanceof HTMLElement)) return;
  if (!COPYABLE_FORM_VALUE_TAGS.has(source.tagName)) return;

  if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
    clone.value = source.value;
    clone.checked = source.checked;
    return;
  }

  if (source instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
    clone.value = source.value;
    return;
  }

  if (source instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
    clone.value = source.value;
  }
};

const createStyleResolver = () => {
  const cache = new Map<string, string>();
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.position = 'fixed';
  probe.style.left = '-99999px';
  probe.style.top = '0';
  probe.style.pointerEvents = 'none';
  probe.style.opacity = '0';
  document.body.appendChild(probe);

  const resolveValue = (property: string, value: string) => {
    const cacheKey = `${property}:${value}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    probe.style.removeProperty(property);
    probe.style.setProperty(property, value);
    const resolved = window.getComputedStyle(probe).getPropertyValue(property).trim() || value;
    probe.style.removeProperty(property);
    cache.set(cacheKey, resolved);
    return resolved;
  };

  const dispose = () => {
    if (probe.parentNode) {
      probe.parentNode.removeChild(probe);
    }
  };

  return { resolveValue, dispose };
};

const getColorCanvasContext = () => {
  if (colorCanvasContext) return colorCanvasContext;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  colorCanvasContext = canvas.getContext('2d');
  return colorCanvasContext;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const parseNumberLike = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const isPercent = trimmed.endsWith('%');
  const value = Number.parseFloat(isPercent ? trimmed.slice(0, -1) : trimmed);
  if (Number.isNaN(value)) return null;
  return { value, isPercent };
};

const oklabToSrgb = (L: number, a: number, b: number) => {
  // Reference: https://bottosson.github.io/posts/oklab/
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toSrgb = (channel: number) => {
    const c = clamp01(channel);
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSrgb(rLin) * 255);
  const g = Math.round(toSrgb(gLin) * 255);
  const bl = Math.round(toSrgb(bLin) * 255);
  return { r, g, b: bl };
};

const tryConvertOklabLikeToRgb = (value: string) => {
  const trimmed = value.trim();
  const match = /^(oklch|oklab)\((.*)\)$/.exec(trimmed);
  if (!match) return null;

  const fn = match[1].toLowerCase();
  const inside = match[2].trim();
  const [mainPart, alphaPart] = inside.split('/').map((part) => part.trim());

  const tokens = mainPart
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const alphaRaw = alphaPart ? parseNumberLike(alphaPart) : null;
  const alpha = alphaRaw ? (alphaRaw.isPercent ? alphaRaw.value / 100 : alphaRaw.value) : 1;
  const safeAlpha = clamp01(alpha);

  if (fn === 'oklab') {
    if (tokens.length < 3) return null;
    const Lraw = parseNumberLike(tokens[0]);
    const araw = parseNumberLike(tokens[1]);
    const braw = parseNumberLike(tokens[2]);
    if (!Lraw || !araw || !braw) return null;

    const L = Lraw.isPercent ? Lraw.value / 100 : Lraw.value;
    const { r, g, b } = oklabToSrgb(L, araw.value, braw.value);
    return safeAlpha < 1 ? `rgba(${r}, ${g}, ${b}, ${safeAlpha})` : `rgb(${r}, ${g}, ${b})`;
  }

  // oklch
  if (tokens.length < 3) return null;
  const Lraw = parseNumberLike(tokens[0]);
  const Craw = parseNumberLike(tokens[1]);
  const Hraw = parseNumberLike(tokens[2]);
  if (!Lraw || !Craw || !Hraw) return null;

  const L = Lraw.isPercent ? Lraw.value / 100 : Lraw.value;
  const C = Craw.value;
  const Hdeg = Hraw.value;
  const Hrad = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(Hrad);
  const b = C * Math.sin(Hrad);

  const { r, g, b: bl } = oklabToSrgb(L, a, b);
  return safeAlpha < 1 ? `rgba(${r}, ${g}, ${bl}, ${safeAlpha})` : `rgb(${r}, ${g}, ${bl})`;
};

const normalizeCssColor = (value: string) => {
  const converted = tryConvertOklabLikeToRgb(value);
  if (converted) return converted;

  const context = getColorCanvasContext();
  if (!context) return value;

  const previous = context.fillStyle;
  try {
    context.fillStyle = '#000000';
    context.fillStyle = value;
    const normalized = String(context.fillStyle || '').trim();
    if (!normalized) return value;
    if (UNSUPPORTED_COLOR_PATTERN.test(normalized)) return '#0f172a';
    return normalized;
  } catch {
    return value;
  } finally {
    context.fillStyle = previous;
  }
};

const sanitizePropertyValue = (
  property: string,
  rawValue: string,
  computed: CSSStyleDeclaration,
  resolveValue: (property: string, value: string) => string,
  safeMode: boolean,
) => {
  if (safeMode) {
    if (property === 'background-image' || property === 'mask-image' || property === '-webkit-mask-image') {
      return 'none';
    }

    if (property === 'filter' || property === 'backdrop-filter') {
      return 'none';
    }

    if (property.includes('shadow')) {
      return 'none';
    }

    if (property.startsWith('transition') || property.startsWith('animation')) {
      return 'none';
    }
  }

  if (!UNSUPPORTED_COLOR_PATTERN.test(rawValue)) {
    return rawValue;
  }

  if (COLOR_LIKE_PROPERTIES.has(property)) {
    return normalizeCssColor(rawValue);
  }

  if (property === 'background') {
    return normalizeCssColor(computed.backgroundColor || '#ffffff');
  }

  if (property === 'background-image' || property === 'mask-image' || property === '-webkit-mask-image') {
    return 'none';
  }

  if (property.includes('shadow')) {
    return 'none';
  }

  if (property.startsWith('border-image')) {
    return 'none';
  }

  if (UNSAFE_SHORTHAND_PREFIXES.some((prefix) => property === prefix || property.startsWith(`${prefix}-`))) {
    return '';
  }

  const resolved = resolveValue(property, rawValue);
  return UNSUPPORTED_COLOR_PATTERN.test(resolved) ? '' : resolved;
};

const applyResolvedInlineStyles = (
  source: Element,
  target: Element,
  resolveValue: (property: string, value: string) => string,
  safeMode: boolean,
) => {
  if (!(target instanceof HTMLElement || target instanceof SVGElement)) return;
  const computed = window.getComputedStyle(source);

  for (let index = 0; index < computed.length; index += 1) {
    const property = computed[index];
    if (!property || property.startsWith('--')) continue;

    const rawValue = computed.getPropertyValue(property);
    if (!rawValue) continue;

    const sanitizedValue = sanitizePropertyValue(property, rawValue, computed, resolveValue, safeMode);

    if (sanitizedValue) {
      target.style.setProperty(property, sanitizedValue, computed.getPropertyPriority(property));
    }
  }

  if (target instanceof HTMLElement) {
    target.className = '';
  } else {
    target.removeAttribute('class');
  }
};

const cloneNodeForPdf = (
  sourceNode: Node,
  resolveValue: (property: string, value: string) => string,
  safeMode: boolean,
): Node => {
  if (sourceNode.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(sourceNode.textContent || '');
  }

  if (!(sourceNode instanceof Element)) {
    return sourceNode.cloneNode(false);
  }

  const clone = sourceNode.cloneNode(false) as Element;
  applyResolvedInlineStyles(sourceNode, clone, resolveValue, safeMode);
  copyFormValueState(sourceNode, clone);

  Array.from(sourceNode.childNodes).forEach((childNode) => {
    clone.appendChild(cloneNodeForPdf(childNode, resolveValue, safeMode));
  });

  return clone;
};

export const sanitizeColorsForExport = (element: HTMLElement, options?: { safeMode?: boolean }) => {
  const { resolveValue, dispose } = createStyleResolver();
  try {
    const clone = cloneNodeForPdf(element, resolveValue, Boolean(options?.safeMode)) as HTMLElement;
    clone.setAttribute('data-pdf-render-root', 'true');
    return clone;
  } finally {
    dispose();
  }
};

const createPdfRenderTarget = (element: HTMLElement, backgroundColor: string) => {
  const clone = sanitizeColorsForExport(element);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.style.position = 'fixed';
  iframe.style.left = '-200vw';
  iframe.style.top = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.opacity = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-1';

  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = iframe.contentDocument;
  if (!frameWindow || !frameDocument) {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    throw new Error('PDF_FRAME_UNAVAILABLE');
  }

  frameDocument.open();
  frameDocument.write('<!doctype html><html><head><meta charset="utf-8" /></head><body></body></html>');
  frameDocument.close();

  frameDocument.documentElement.style.background = backgroundColor;
  frameDocument.body.style.margin = '0';
  frameDocument.body.style.padding = '0';
  frameDocument.body.style.background = backgroundColor;
  frameDocument.body.style.color = '#0f172a';
  frameDocument.body.appendChild(clone);

  const width = Math.max(clone.scrollWidth, clone.clientWidth, element.scrollWidth, element.clientWidth, 794);
  const height = Math.max(clone.scrollHeight, clone.clientHeight, element.scrollHeight, element.clientHeight, 1123);
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;

  const cleanup = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  return { iframe, clone, frameWindow, cleanup };
};

const createPdfRenderTargetInDocument = (element: HTMLElement, backgroundColor: string) => {
  const clone = sanitizeColorsForExport(element, { safeMode: true });
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.position = 'fixed';
  host.style.left = '-200vw';
  host.style.top = '0';
  host.style.pointerEvents = 'none';
  host.style.opacity = '0';
  host.style.border = '0';
  host.style.zIndex = '-1';
  host.style.background = backgroundColor;

  document.body.appendChild(host);
  host.appendChild(clone);

  const width = Math.max(clone.scrollWidth, clone.clientWidth, element.scrollWidth, element.clientWidth, 794);
  const height = Math.max(clone.scrollHeight, clone.clientHeight, element.scrollHeight, element.clientHeight, 1123);
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;

  const cleanup = () => {
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  };

  return { clone, frameWindow: window, cleanup };
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 120) || 'document.pdf';

const normalizePdfText = (value: string) => value.replace(/\s+/g, ' ').trim();

const isMobilePdfEnvironment = () =>
  Capacitor.getPlatform() !== 'web' ||
  (typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent));

const isAndroidWebView = () =>
  Capacitor.getPlatform() !== 'web' ||
  (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent));

const createHostFromHtml = (html: string, backgroundColor: string, widthPx = 794) => {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.position = 'fixed';
  host.style.left = '-200vw';
  host.style.top = '0';
  host.style.width = `${widthPx}px`;
  host.style.padding = '0';
  host.style.background = backgroundColor;
  host.style.zIndex = '-1';
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
};

const extractTableRows = (table: HTMLTableElement) =>
  Array.from(table.querySelectorAll('tr'))
    .map((row) =>
      Array.from(row.querySelectorAll('th, td'))
        .map((cell) => normalizePdfText(cell.textContent || ''))
        .filter(Boolean),
    )
    .filter((row) => row.length > 0);

const hasStructuredChildren = (element: Element) =>
  Array.from(element.children).some((child) =>
    child instanceof HTMLTableElement ||
    /^H[1-6]$/.test(child.tagName) ||
    ['P', 'UL', 'OL', 'LI'].includes(child.tagName),
  );

const extractPdfBlocks = (root: HTMLElement): PdfBlock[] => {
  const blocks: PdfBlock[] = [];

  const visit = (element: Element) => {
    if (element instanceof HTMLTableElement) {
      const rows = extractTableRows(element);
      if (rows.length > 0) {
        blocks.push({ type: 'table', rows });
      }
      return;
    }

    if (/^H[1-6]$/.test(element.tagName)) {
      const text = normalizePdfText(element.textContent || '');
      if (text) {
        blocks.push({ type: 'heading', text, level: Number(element.tagName.slice(1)) || 2 });
      }
      return;
    }

    if (['P', 'LI'].includes(element.tagName)) {
      const text = normalizePdfText(element.textContent || '');
      if (text) {
        blocks.push({ type: 'text', text });
      }
      return;
    }

    if (!hasStructuredChildren(element)) {
      const text = normalizePdfText(element.textContent || '');
      if (text) {
        blocks.push({ type: 'text', text });
        return;
      }
    }

    Array.from(element.children).forEach(visit);
  };

  visit(root);
  return blocks;
};

const renderBlocksToPdf = (pdf: jsPDF, title: string | undefined, blocks: PdfBlock[], marginMm: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginMm * 2;
  let cursorY = marginMm + 4;

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight <= pageHeight - marginMm) return;
    pdf.addPage();
    cursorY = marginMm + 4;
  };

  const writeWrappedText = (text: string, fontSize: number, lineHeight: number, options?: { bold?: boolean }) => {
    const lines = pdf.splitTextToSize(text, usableWidth);
    ensureSpace(lines.length * lineHeight + 4);
    pdf.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    pdf.setFontSize(fontSize);
    pdf.text(lines, marginMm, cursorY);
    cursorY += lines.length * lineHeight + 2;
  };

  if (title) {
    writeWrappedText(title, 18, 7, { bold: true });
    cursorY += 2;
  }

  blocks.forEach((block) => {
    if (block.type === 'heading') {
      const size = block.level <= 2 ? 14 : 12;
      writeWrappedText(block.text, size, 6, { bold: true });
      return;
    }

    if (block.type === 'table') {
      block.rows.forEach((row, rowIndex) => {
        const text = row.join('  |  ');
        writeWrappedText(text, 10, 5, { bold: rowIndex === 0 });
      });
      cursorY += 2;
      return;
    }

    writeWrappedText(block.text, 11, 5.4);
  });
};

const exportStructuredPdf = async ({
  root,
  fileName,
  title,
  marginMm,
  jsPDFCtor,
}: {
  root: HTMLElement;
  fileName: string;
  title?: string;
  marginMm: number;
  jsPDFCtor: typeof import('jspdf').jsPDF;
}) => {
  const pdf = new jsPDFCtor({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const blocks = extractPdfBlocks(root);
  renderBlocksToPdf(pdf, title, blocks, marginMm);
  await savePdf(pdf, fileName, title);
};

const savePdf = async (pdf: jsPDF, fileName: string, title?: string) => {
  const safeName = sanitizeFileName(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
  const blob = pdf.output('blob');
  const file = new File([blob], safeName, { type: 'application/pdf' });

  if (
    Capacitor.getPlatform() !== 'web' &&
    typeof navigator !== 'undefined' &&
    'canShare' in navigator &&
    navigator.canShare?.({ files: [file] })
  ) {
    await navigator.share({
      files: [file],
      title: title || safeName.replace(/\.pdf$/i, ''),
    });
    return;
  }

  pdf.save(safeName);
};

export const exportToPdf = async ({
  element,
  html,
  fileName,
  title,
  backgroundColor = '#ffffff',
  marginMm = 10,
}: ExportToPdfOptions) => {
  await waitForFonts(window);
  await waitForPaint();
  await waitForDelay(220);
  const host = html ? createHostFromHtml(html, backgroundColor, 794) : null;
  const sourceElement = element || host;

  if (!sourceElement) {
    throw new Error('PDF_SOURCE_UNAVAILABLE');
  }

  try {
    const { html2canvas, jsPDFCtor } = await loadPdfDeps();

    const renderViaCanvas = async () => {
      const target = isAndroidWebView()
        ? createPdfRenderTargetInDocument(sourceElement, backgroundColor)
        : createPdfRenderTarget(sourceElement, backgroundColor);

      const { clone, frameWindow, cleanup } = target;
      await waitForFonts(frameWindow);
      await waitForPaintInWindow(frameWindow);
      await new Promise<void>((resolve) => frameWindow.setTimeout(() => resolve(), 140));
      try {
        const canvas = await html2canvas(clone, {
          backgroundColor,
          scale: isAndroidWebView() ? 1.4 : Math.min(2.2, Math.max(1.5, window.devicePixelRatio || 1)),
          useCORS: true,
          logging: false,
          windowWidth: Math.max(clone.scrollWidth, clone.clientWidth, 794),
          windowHeight: Math.max(clone.scrollHeight, clone.clientHeight, 1123),
        });

        const pdf = new jsPDFCtor({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const printableWidth = pageWidth - marginMm * 2;
        const printableHeight = pageHeight - marginMm * 2;
        const renderedHeight = (canvas.height * printableWidth) / canvas.width;
        const imageData = canvas.toDataURL('image/jpeg', 0.94);

        let remainingHeight = renderedHeight;
        let yOffset = marginMm;

        pdf.addImage(imageData, 'JPEG', marginMm, yOffset, printableWidth, renderedHeight, undefined, 'FAST');
        remainingHeight -= printableHeight;

        while (remainingHeight > 0) {
          pdf.addPage();
          yOffset = marginMm - (renderedHeight - remainingHeight);
          pdf.addImage(imageData, 'JPEG', marginMm, yOffset, printableWidth, renderedHeight, undefined, 'FAST');
          remainingHeight -= printableHeight;
        }

        await savePdf(pdf, fileName, title);
      } finally {
        cleanup();
      }
    };

    try {
      await renderViaCanvas();
      return;
    } catch (error) {
      // Fallback for unstable WebView environments when exporting a live element.
      if (isMobilePdfEnvironment() && !html) {
        const safeRoot = sanitizeColorsForExport(sourceElement);
        await exportStructuredPdf({
          root: safeRoot,
          fileName,
          title,
          marginMm,
          jsPDFCtor,
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('PDF export failed', error);
    throw new Error("Impossible de générer le PDF sur cet appareil pour le moment.");
  } finally {
    if (host?.parentNode) {
      host.parentNode.removeChild(host);
    }
  }
};

export const exportElementToPdf = async (options: ExportElementToPdfOptions) => exportToPdf(options);

export const exportHtmlToPdf = async ({
  html,
  fileName,
  title,
  widthPx = 794,
  backgroundColor = '#ffffff',
}: ExportHtmlToPdfOptions) => {
  void widthPx;
  await exportToPdf({
    html,
    fileName,
    title,
    backgroundColor,
  });
};
