import React, { useEffect, useState } from 'react';
import { AlertCircle, X, ChevronRight, LucideIcon } from 'lucide-react';

export type AlertType = 'warning' | 'critical' | 'info' | 'success';

interface AlertBannerProps {
    type: AlertType;
    message: string;
    icon?: LucideIcon;
    action?: string;
    onAction?: () => void;
    onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
    type,
    message,
    icon: Icon = AlertCircle,
    action,
    onAction,
    onDismiss
}) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        setIsClosing(false);
    }, [type, message]);

    const styles = {
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        critical: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
    };

    const handleDismiss = () => {
        if (!onDismiss || isClosing) return;
        setIsClosing(true);
        window.setTimeout(() => {
            onDismiss();
        }, 220);
    };

    return (
        <div
            className={`w-full rounded-2xl border p-4 flex items-center justify-between transition-all duration-200 ${styles[type]} ${isClosing
                ? 'pointer-events-none translate-y-[-6px] opacity-0 scale-[0.98]'
                : 'animate-in slide-in-from-top-2 fade-in duration-300'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${type === 'critical' ? 'bg-rose-500/20' : 'bg-current opacity-20'}`}>
                    <Icon size={18} className={styles[type].split(' ').pop()} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wide leading-relaxed">
                    {message}
                </p>
            </div>

            <div className="flex items-center gap-4">
                {action && (
                    <button
                        onClick={onAction}
                        className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        {action} <ChevronRight size={12} />
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-white/5 rounded-lg transition-all opacity-50 hover:opacity-100"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};
