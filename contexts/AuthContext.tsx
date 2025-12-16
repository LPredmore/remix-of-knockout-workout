import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../src/integrations/supabase/client';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string | undefined) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !profile) {
        // Return default profile if not found
        setUser({
          id: userId,
          email: email || '',
          rep_min: 10,
          rep_max: 20,
          onboarding_completed_at: null,
          active_routine_id: null,
        });
        return;
      }

      setUser({
        ...profile,
        id: profile.user_id,
        email: email || '',
      });
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id, session.user.email);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchProfile(newSession.user.id, newSession.user.email).finally(() => setLoading(false));
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id, existingSession.user.email).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
