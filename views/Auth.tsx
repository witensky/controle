
import React from 'react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-slate-500/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md glass p-10 rounded-[2rem] text-center border border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 rounded-3xl bg-amber-500 mx-auto flex items-center justify-center font-extrabold text-slate-950 text-5xl shadow-2xl shadow-amber-500/30 mb-8 border-4 border-slate-950 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          J&B
        </div>
        
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
          REPRENDS LE <span className="text-amber-500 italic">CONTRÔLE</span>
        </h1>
        <p className="text-slate-400 text-sm mb-12 uppercase tracking-[0.2em] font-medium opacity-80">
          Excellence • Discipline • Succès
        </p>

        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-4 bg-white text-slate-950 py-4 px-6 rounded-2xl font-bold hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-95 shadow-lg group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-125 transition-transform" />
          <span className="uppercase tracking-wider">Continuer avec Google</span>
        </button>

        <p className="mt-12 text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
          Réservé aux esprits disciplinés.<br/>
          Propulsé par la volonté d'exceller.
        </p>
      </div>
    </div>
  );
};

export default Auth;
