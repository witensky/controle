
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && data.session === null) {
          setSuccessMsg("Vérifiez votre boîte mail pour confirmer l'activation (vérifiez les spams).");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setErrorMsg("Email non confirmé. Veuillez cliquer sur le lien envoyé par mail avant de vous connecter.");
          } else if (error.message.includes("Invalid login credentials")) {
            setErrorMsg("Identifiants incorrects. Avez-vous déjà créé votre compte ?");
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || "Échec de la liaison Google.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Background Glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-[#fbbf24]/10 blur-[180px] rounded-full" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-[#3b82f6]/5 blur-[180px] rounded-full" />
      
      <div className="w-full max-w-[440px] glass p-10 md:p-14 rounded-[3.5rem] text-center border border-white/10 shadow-[0_60px_120px_-20px_rgba(0,0,0,1)] relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Logo J&B Style Screenshot */}
        <div className="w-24 h-24 rounded-[2.2rem] bg-[#fbbf24] mx-auto flex items-center justify-center font-black text-slate-950 text-5xl shadow-[0_30px_60px_-15px_rgba(251,191,36,0.6)] mb-10 border-[6px] border-[#020617] transform -rotate-2 hover:rotate-0 transition-all duration-700 select-none">
          J&B
        </div>
        
        <div className="mb-12 space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">REPRENDS LE</h1>
          <h1 className="text-5xl font-black text-[#fbbf24] tracking-tighter uppercase italic leading-none">CONTRÔLE</h1>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-500 text-[11px] font-black text-left animate-in shake duration-500 uppercase">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-500 text-[11px] font-black text-left animate-in fade-in duration-500 uppercase">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Login Button Style Screenshot */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-white text-slate-950 py-5 px-8 rounded-2xl font-black text-[13px] uppercase tracking-[0.1em] hover:bg-slate-50 transition-all hover:scale-[1.03] active:scale-95 shadow-xl group disabled:opacity-50 mb-10"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-125 transition-transform" />
              <span>CONTINUER AVEC GOOGLE</span>
            </>
          )}
        </button>

        {/* Divider Style Screenshot */}
        <div className="relative mb-10 flex items-center">
          <div className="flex-1 border-t border-white/5"></div>
          <span className="px-5 text-[9px] font-black uppercase tracking-[0.5em] text-slate-700 whitespace-nowrap">OU ACCÈS DIRECT</span>
          <div className="flex-1 border-t border-white/5"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#fbbf24] transition-colors" size={16} />
            <input 
              type="email" 
              placeholder="EMAIL" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#020617]/80 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-xs font-black text-white outline-none focus:border-[#fbbf24]/50 transition-all shadow-inner uppercase tracking-widest placeholder:text-slate-800"
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-[#fbbf24] transition-colors" size={16} />
            <input 
              type="password" 
              placeholder="MOT DE PASSE" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#020617]/80 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-xs font-black text-white outline-none focus:border-[#fbbf24]/50 transition-all shadow-inner uppercase tracking-widest placeholder:text-slate-800"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-4 py-5 px-10 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl disabled:opacity-50 ${
              isSignUp ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-[#1e293b]/50 text-white border border-white/10 hover:bg-[#1e293b]'
            }`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isSignUp ? (
              <UserPlus size={20} />
            ) : (
              <LogIn size={20} className="transform scale-x-110" />
            )}
            {isSignUp ? "DÉPLOYER IDENTITÉ" : "DÉBLOQUER NOYAU"}
          </button>
        </form>

        <div className="space-y-6">
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); setSuccessMsg(null); }}
            className="text-[10px] text-slate-600 hover:text-[#fbbf24] font-black uppercase tracking-[0.4em] transition-all italic border-b border-transparent hover:border-amber-500/30 pb-1"
          >
            {isSignUp ? "RETOUR À LA CONNEXION" : "CRÉER UNE NOUVELLE IDENTITÉ"}
          </button>

          {!isSignUp && (
            <div className="flex items-center gap-2 justify-center text-[9px] text-slate-700 font-bold uppercase tracking-widest bg-slate-950/30 p-3 rounded-xl border border-white/5">
              <Info size={12} className="text-amber-500/50" />
              <span>Session persistante activée</span>
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 opacity-5">
           <Sparkles size={14} className="text-[#fbbf24]" />
           <span className="text-[8px] text-white uppercase tracking-[1em] font-black">J&B CORE v3.2</span>
           <Sparkles size={14} className="text-[#fbbf24]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
