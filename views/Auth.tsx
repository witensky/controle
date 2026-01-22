
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2, Info } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && data.session === null) {
          setSuccessMsg("Vérifiez votre boîte mail (spams inclus).");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      <div className="absolute top-[-20%] left-[-15%] w-[70%] h-[70%] bg-amber-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[70%] h-[70%] bg-blue-500/5 blur-[150px] rounded-full" />
      
      <div className="w-full max-w-[420px] glass p-10 md:p-14 rounded-[4rem] text-center border border-white/10 shadow-3xl relative z-10 animate-in zoom-in-95 duration-700">
        
        {/* LOGO JAUNE LIFEFLOW */}
        <div className="mb-12 relative flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-amber-500 mx-auto flex items-center justify-center font-black text-slate-950 text-5xl shadow-2xl shadow-amber-500/40 border-[6px] border-[#020617] rotate-3 hover:rotate-0 transition-transform duration-500 animate-floating">
              JB
            </div>
            <div className="mt-4">
               <span className="text-sm font-black text-white tracking-[0.5em] uppercase italic">LIFEFLOW</span>
            </div>
        </div>
        
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">COMMAND</h1>
          <h1 className="text-5xl font-black text-amber-500 tracking-tighter uppercase italic leading-none">CENTER</h1>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-500 text-[10px] font-black text-left animate-in shake">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg.toUpperCase()}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-500 text-[10px] font-black text-left">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg.toUpperCase()}</span>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-white text-slate-950 py-5 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl mb-8 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin text-amber-500" /> : <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />}
          CONTINUER AVEC GOOGLE
        </button>

        <div className="relative mb-8 flex items-center px-4">
          <div className="flex-1 border-t border-white/5"></div>
          <span className="px-4 text-[8px] font-black uppercase tracking-[0.4em] text-slate-700">OU ACCÈS DIRECT</span>
          <div className="flex-1 border-t border-white/5"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
          <input 
            type="email" 
            placeholder="EMAIL TACTIQUE" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 px-6 text-xs font-bold text-white outline-none focus:border-amber-500/50 transition-all shadow-inner uppercase tracking-widest placeholder:text-slate-800"
          />
          <input 
            type="password" 
            placeholder="NOYAU DE SÉCURITÉ" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#020617] border border-white/5 rounded-2xl py-5 px-6 text-xs font-bold text-white outline-none focus:border-amber-500/50 transition-all shadow-inner uppercase tracking-widest placeholder:text-slate-800"
          />

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl ${
              isSignUp ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-slate-800 text-white border border-white/10'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : isSignUp ? "CRÉER UNITÉ" : "DÉBLOQUER NOYAU"}
          </button>
        </form>

        <button 
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-[9px] text-slate-600 hover:text-amber-500 font-black uppercase tracking-[0.3em] transition-all italic underline underline-offset-4"
        >
          {isSignUp ? "DÉJÀ ENREGISTRÉ ? SE CONNECTER" : "CRÉER UNE NOUVELLE IDENTITÉ"}
        </button>
      </div>
    </div>
  );
};

export default Auth;