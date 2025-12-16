import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Dumbbell } from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { user, error } = await db.login(email, password);
        if (error) throw error;
        if (user && !user.onboarding_completed_at) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      } else {
        const { error } = await db.signup(email, password);
        if (error) throw error;
        alert("Check your email for confirmation link, then sign in!");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-brand-900 text-white max-w-md mx-auto relative overflow-hidden">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      
      <div className="mb-8 flex flex-col items-center relative z-10">
        <div className="bg-accent-500 p-4 rounded-full mb-4 glow-accent">
          <Dumbbell size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-glow-accent">KnockOut</h1>
        <p className="text-slate-300 mt-2 text-center">Simplicity builds consistency.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-10">
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm text-center border border-red-500/30">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-brand-800 border border-brand-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-brand-800 border border-brand-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 rounded-lg shadow-lg hover:glow-accent-sm transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
        
        <div className="text-center mt-4">
            <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 text-sm hover:text-accent-400 underline underline-offset-2"
            >
                {isLogin ? "Need an account? Sign Up" : "Have an account? Sign In"}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
