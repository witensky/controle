
import React, { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, Zap, Sparkles, Brain, Trophy } from 'lucide-react';
import { useCreateFocusSession } from '../../features/planning/hooks/usePlanning';

interface FocusOverlayProps {
    onClose: () => void;
    missionId?: string;
    defaultTime?: number; // in minutes
}

const FocusOverlay: React.FC<FocusOverlayProps> = ({ onClose, missionId, defaultTime = 25 }) => {
    const [timeLeft, setTimeLeft] = useState(defaultTime * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionType, setSessionType] = useState<'focus' | 'short_break' | 'long_break'>('focus');
    const createSession = useCreateFocusSession();

    const handleComplete = useCallback(() => {
        setIsActive(false);
        createSession.mutate({
            mission_id: missionId,
            type: sessionType,
            duration_seconds: defaultTime * 60 - timeLeft,
            status: 'completed'
        });

        // Auto-switch to break if it was focus
        if (sessionType === 'focus') {
            setSessionType('short_break');
            setTimeLeft(5 * 60);
        } else {
            setSessionType('focus');
            setTimeLeft(defaultTime * 60);
        }
    }, [createSession, defaultTime, missionId, sessionType, timeLeft]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, handleComplete]);

    const togglePause = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(sessionType === 'focus' ? defaultTime * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[color:var(--overlay)] backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col items-center justify-center p-6">
            <button
                onClick={() => {
                    if (isActive) {
                        createSession.mutate({
                            mission_id: missionId,
                            type: sessionType,
                            duration_seconds: defaultTime * 60 - timeLeft,
                            status: 'interrupted'
                        });
                    }
                    onClose();
                }}
                className="absolute top-10 right-10 p-4 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] transition-all group"
            >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>

            <div className="max-w-md w-full text-center space-y-12">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 bg-amber-500/10 rounded-[2rem] text-amber-500 animate-pulse">
                            <Zap size={40} fill="currentColor" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-[color:var(--text-primary)] italic tracking-tighter uppercase font-outfit">
                        {sessionType === 'focus' ? 'CONCENTRATION' : 'RÉCUPÉRATION'}
                    </h2>
                    <p className="text-[color:var(--text-muted)] text-xs font-black uppercase tracking-[0.4em]">
                        {sessionType === 'focus' ? 'Focus optimal activé' : 'Reprenez des forces pour la suite'}
                    </p>
                </div>

                <div className="relative inline-block">
                    {/* Circular Progress (simplified with text shadow for vibe) */}
                    <div className="text-[120px] md:text-[160px] font-black text-[color:var(--text-primary)] italic tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(2,6,23,0.16)]">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-8">
                    <button
                        onClick={resetTimer}
                        className="p-5 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] transition-all shadow-card"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <button
                        onClick={togglePause}
                        className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-card border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-primary)]"
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                    </button>

                    <button
                        className="p-5 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)] transition-all shadow-card"
                        onClick={() => {
                            setSessionType(sessionType === 'focus' ? 'short_break' : 'focus');
                            setIsActive(false);
                            setTimeLeft(sessionType === 'focus' ? 5 * 60 : defaultTime * 60);
                        }}
                    >
                        <RotateCcw size={24} className="rotate-180" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'DISCIPLINE', icon: Brain, color: 'text-blue-500' },
                        { label: 'MÉMOIRE', icon: Sparkles, color: 'text-amber-500' },
                        { label: 'RÉSULTAT', icon: Trophy, color: 'text-emerald-500' },
                    ].map((item, i) => (
                        <div key={i} className="glass p-4 rounded-2xl flex flex-col items-center gap-2">
                            <item.icon size={16} className={item.color} />
                            <span className="text-[8px] font-black text-[color:var(--text-muted)] uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FocusOverlay;
