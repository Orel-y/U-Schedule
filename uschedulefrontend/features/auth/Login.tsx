
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (u: string, p: string) => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, error, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-50 via-white to-slate-50">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-brand-100/50 p-10 border border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand to-brand-400" />
        
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-brand-100 mx-auto mb-6 p-4 border border-slate-50 overflow-hidden">
            <img 
              src="/hulogo.png" 
              alt="Hawassa University" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hawassa University</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Academic Scheduling Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="e.g. admin_head"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-600 leading-none">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-brand text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-100 hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Authorized Personnel Only • Hawassa, Ethiopia
          </p>
          <div className="mt-4 flex justify-center gap-4 text-[10px] text-slate-400 font-black">
            <span>Demo: head_admin / password</span>
            <span>•</span>
            <span>Demo: viewer_user / password</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
