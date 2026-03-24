import React from 'react';

interface TooltipProps {
    content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => (
    <div className="group relative inline-block">
        <button className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] font-black hover:bg-slate-600 transition-all cursor-help flex items-center justify-center">
            ?
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-4 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <p className="text-[10px] text-slate-300 leading-relaxed font-medium">{content}</p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-white/10 rotate-45"></div>
        </div>
    </div>
);
