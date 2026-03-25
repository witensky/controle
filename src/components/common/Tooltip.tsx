import React from 'react';

interface TooltipProps {
    content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => (
    <div className="group relative inline-block">
        <button className="w-4 h-4 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] text-[10px] font-black text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-2)] transition-all cursor-help flex items-center justify-center">
            ?
        </button>
        <div className="glass-panel absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-4 rounded-2xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <p className="text-[10px] text-[color:var(--text-secondary)] leading-relaxed font-medium">{content}</p>
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b border-[color:var(--border)] rotate-45"
              style={{ background: 'var(--panel-bg)' }}
            />
        </div>
    </div>
);
